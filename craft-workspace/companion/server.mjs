import http from "node:http";
import path from "node:path";
import { spawn } from "node:child_process";
import { access, realpath, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { randomBytes, timingSafeEqual } from "node:crypto";
import { once } from "node:events";
import { pathToFileURL } from "node:url";

const VERSION = "0.1.0";
const HOST = "127.0.0.1";
const PORT = Number(process.env.CRAFT_COMPANION_PORT || 4174);
const MAX_BODY = 64 * 1024;
const MAX_RPC_LINE = 16 * 1024 * 1024;
const SESSION_MS = 30 * 60 * 1000;
const READ_TOOLS = new Set(["command_list", "doc_inspect", "render_preview", "doc_render_preview", "session_list", "doc_open"]);
const CLIENT_INFO = { name: "craft-workspace-companion", version: VERSION };
const MODERN_META = {
  "io.modelcontextprotocol/protocolVersion": "2026-07-28",
  "io.modelcontextprotocol/clientInfo": CLIENT_INFO,
  "io.modelcontextprotocol/clientCapabilities": {}
};

function parseOrigins(raw) {
  return new Set(String(raw || [
    "https://craft-workspace.vercel.app",
    "https://craft-workspace-damien-a18e.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:4173"
  ].join(",")).split(",").map(function (x) { return x.trim(); }).filter(Boolean));
}
const ALLOWED_ORIGINS = parseOrigins(process.env.CRAFT_ALLOWED_ORIGINS);
const PAIRING_CODE = process.env.CRAFT_PAIRING_CODE || randomBytes(6).toString("hex").toUpperCase();
const sessions = new Map();
const pairAttempts = new Map();
let mcpClient = null;
let resolvedConfig = null;

export function isAllowedOrigin(origin, allowlist = ALLOWED_ORIGINS) {
  return typeof origin === "string" && allowlist.has(origin);
}
export function isWithinRoot(root, candidate) {
  const resolvedRoot = path.resolve(root);
  const resolvedCandidate = path.resolve(candidate);
  const relative = path.relative(resolvedRoot, resolvedCandidate);
  return relative === "" || (relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative));
}
export function safeRelativePath(input) {
  if (typeof input !== "string" || !input.trim() || input.includes("\0")) throw new Error("Choose a relative file path inside the approved folder.");
  if (path.isAbsolute(input) || /^[a-zA-Z]:[\\/]/.test(input) || input.startsWith("\\\\")) throw new Error("Absolute paths are not accepted; enter a path relative to the approved folder.");
  return input;
}
export function buildMcpArgs(readRoot, writeRoot = "") {
  const args = ["mcp", "--automation-read-root", readRoot];
  if (writeRoot) args.push("--automation-write-root", writeRoot);
  return args;
}

function createError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}
function allowedHost(hostHeader, port = PORT) {
  return hostHeader === "127.0.0.1:" + port || hostHeader === "localhost:" + port;
}
function sameCode(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const aa = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}
function sendJson(res, status, payload) {
  const data = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(data),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(data);
}
function applyCors(req, res, allowlist = ALLOWED_ORIGINS) {
  const origin = req.headers.origin;
  if (!isAllowedOrigin(origin, allowlist)) throw createError("This browser origin is not approved for the local companion.", 403);
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.setHeader("Access-Control-Max-Age", "300");
  if (req.headers["access-control-request-private-network"] === "true") {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
}
async function readJson(req) {
  const type = String(req.headers["content-type"] || "").toLowerCase();
  if (!type.startsWith("application/json")) throw createError("Content-Type must be application/json.", 415);
  const parts = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw createError("Request body is too large.", 413);
    parts.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(parts).toString("utf8")); }
  catch { throw createError("Request body must be valid JSON."); }
}
function getBearer(req) {
  const value = String(req.headers.authorization || "");
  if (!value.startsWith("Bearer ")) return "";
  return value.slice(7);
}
function requireSession(req, activeSessions = sessions) {
  const token = getBearer(req);
  const expiry = activeSessions.get(token);
  if (!token || !expiry || expiry <= Date.now()) {
    if (token) activeSessions.delete(token);
    throw createError("This browser is not paired. Pair again from the workspace.", 401);
  }
  activeSessions.set(token, expiry);
}
function recordPairFailure(address) {
  const now = Date.now();
  const existing = pairAttempts.get(address) || [];
  const recent = existing.filter(function (t) { return now - t < 60_000; });
  recent.push(now);
  pairAttempts.set(address, recent);
  return recent.length;
}
async function loadConfig() {
  const rawRead = String(process.env.CRAFT_PHOTOCRAFT_READ_ROOT || "").trim();
  if (!rawRead) throw new Error("CRAFT_PHOTOCRAFT_READ_ROOT is required. Use a dedicated folder containing only files you approve for this companion.");
  const readRoot = await realpath(path.resolve(rawRead));
  if (!(await stat(readRoot)).isDirectory()) throw new Error("The PhotoCraft read root must be an existing folder.");
  await access(readRoot, fsConstants.R_OK);
  const rawWrite = String(process.env.CRAFT_PHOTOCRAFT_WRITE_ROOT || "").trim();
  let writeRoot = "";
  if (rawWrite) {
    writeRoot = await realpath(path.resolve(rawWrite));
    if (!(await stat(writeRoot)).isDirectory()) throw new Error("The PhotoCraft write root must be an existing folder.");
    await access(writeRoot, fsConstants.W_OK);
  }
  const configuredCli = String(process.env.CRAFT_PHOTOCRAFT_CLI || "").trim();
  const defaultCli = process.platform === "win32"
    ? "C:\\Program Files\\PhotoCraft\\photocraft-cli.exe"
    : "photocraft-cli";
  const cliPath = configuredCli || defaultCli;
  if (path.isAbsolute(cliPath)) await access(cliPath, fsConstants.X_OK).catch(async function () {
    // Windows executables may not report POSIX X_OK through every filesystem provider.
    if (process.platform !== "win32") throw new Error("PhotoCraft CLI was not found at CRAFT_PHOTOCRAFT_CLI.");
    await access(cliPath, fsConstants.R_OK);
  });
  if (!path.isAbsolute(cliPath) && cliPath !== "photocraft-cli") throw new Error("Set CRAFT_PHOTOCRAFT_CLI to a full executable path.");
  return { readRoot, writeRoot, cliPath };
}

class McpStdioClient {
  constructor(config) {
    this.config = config;
    this.child = null;
    this.outputBuffer = "";
    this.pending = new Map();
    this.nextId = 1;
    this.protocol = "";
    this.starting = null;
    this.tools = null;
  }
  async start() {
    if (this.child && this.child.exitCode === null) return;
    if (this.starting) return this.starting;
    this.starting = this._start();
    try { await this.starting; }
    finally { this.starting = null; }
  }
  async _start() {
    const childEnv = {};
    for (const key of [
      "PATH", "SYSTEMROOT", "WINDIR", "TEMP", "TMP", "HOME", "USERPROFILE",
      "APPDATA", "LOCALAPPDATA", "LANG", "LC_ALL"
    ]) if (process.env[key]) childEnv[key] = process.env[key];

    const child = spawn(this.config.cliPath, buildMcpArgs(this.config.readRoot, this.config.writeRoot), {
      cwd: this.config.readRoot,
      env: childEnv,
      shell: false,
      windowsHide: true,
      stdio: ["pipe", "pipe", "pipe"]
    });
    this.child = child;
    this.outputBuffer = "";
    child.stdout.setEncoding("utf8");
    child.stdout.on("data", (chunk) => this._onData(chunk));
    child.stderr.on("data", () => { /* Never echo app content or credentials into browser-visible logs. */ });
    child.on("error", (error) => this._failAll(new Error("Could not start PhotoCraft CLI: " + error.message)));
    child.on("exit", (code) => {
      this._failAll(new Error("PhotoCraft CLI exited (" + String(code) + "). Restart the companion or check the local PhotoCraft install."));
      this.child = null;
      this.tools = null;
      this.protocol = "";
    });
    await once(child, "spawn");
    try {
      await this._rpc("server/discover", { _meta: MODERN_META }, true, 8000);
      this.protocol = "2026-07-28";
    } catch (error) {
      if (!/method not found|unknown method|unsupported method|not implemented/i.test(String(error.message))) {
        child.kill();
        throw error;
      }
      const initialized = await this._rpc("initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: CLIENT_INFO
      }, false, 8000);
      this.protocol = initialized.protocolVersion || "2025-11-25";
      this._notify("notifications/initialized", {});
    }
    this.tools = null;
  }
  _onData(chunk) {
    this.outputBuffer += chunk;
    if (Buffer.byteLength(this.outputBuffer) > MAX_RPC_LINE * 2) {
      this._failAll(new Error("PhotoCraft sent an oversized response; connection closed."));
      if (this.child) this.child.kill();
      return;
    }
    let pos;
    while ((pos = this.outputBuffer.indexOf("\n")) >= 0) {
      const line = this.outputBuffer.slice(0, pos);
      this.outputBuffer = this.outputBuffer.slice(pos + 1);
      if (!line.trim()) continue;
      if (Buffer.byteLength(line) > MAX_RPC_LINE) {
        this._failAll(new Error("PhotoCraft response exceeded the size limit."));
        if (this.child) this.child.kill();
        return;
      }
      let message;
      try { message = JSON.parse(line); } catch {
        this._failAll(new Error("PhotoCraft returned an invalid MCP response."));
        if (this.child) this.child.kill();
        return;
      }
      const pending = this.pending.get(String(message.id));
      if (!pending) continue;
      this.pending.delete(String(message.id));
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(String(message.error.message || "PhotoCraft MCP request failed.")));
      else pending.resolve(message.result || {});
    }
  }
  _failAll(error) {
    for (const pending of this.pending.values()) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    this.pending.clear();
  }
  _rpc(method, params = {}, modern = Boolean(this.protocol === "2026-07-28"), timeoutMs = 60_000) {
    if (!this.child || this.child.exitCode !== null || !this.child.stdin.writable) return Promise.reject(new Error("PhotoCraft MCP process is not running."));
    const id = this.nextId++;
    const key = String(id);
    const payloadParams = { ...params };
    if (modern) payloadParams._meta = MODERN_META;
    const message = { jsonrpc: "2.0", id, method, params: payloadParams };
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(key);
        reject(new Error("PhotoCraft MCP request timed out. Check its local process before retrying."));
      }, timeoutMs);
      this.pending.set(key, { resolve, reject, timer });
      this.child.stdin.write(JSON.stringify(message) + "\n", (error) => {
        if (!error) return;
        this.pending.delete(key);
        clearTimeout(timer);
        reject(error);
      });
    });
  }
  _notify(method, params = {}) {
    if (this.child && this.child.stdin.writable) this.child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method, params }) + "\n");
  }
  async listTools() {
    await this.start();
    if (!this.tools) {
      const result = await this._rpc("tools/list", {}, this.protocol === "2026-07-28");
      this.tools = Array.isArray(result.tools) ? result.tools : [];
    }
    return this.tools;
  }
  async callSafeTool(name, args = {}) {
    if (!READ_TOOLS.has(name)) throw createError("That PhotoCraft capability is not enabled in the workspace companion.", 403);
    const tools = await this.listTools();
    if (!tools.some((tool) => tool.name === name)) throw createError("The connected PhotoCraft CLI does not advertise this capability.", 501);
    const result = await this._rpc("tools/call", { name, arguments: args }, this.protocol === "2026-07-28");
    if (result.isError) throw createError("PhotoCraft reported that the requested operation failed.", 422);
    return result;
  }
  close() {
    this._failAll(new Error("Companion is shutting down."));
    if (this.child && this.child.exitCode === null) this.child.kill();
    this.child = null;
    this.tools = null;
  }
}

async function resolveReadFile(config, relativeInput) {
  const safe = safeRelativePath(relativeInput);
  const candidate = path.resolve(config.readRoot, safe);
  if (!isWithinRoot(config.readRoot, candidate) || candidate === config.readRoot) throw createError("The requested file is outside the approved read folder.", 403);
  let actual;
  try { actual = await realpath(candidate); }
  catch { throw createError("That file does not exist inside the approved folder."); }
  if (!isWithinRoot(config.readRoot, actual) || actual === config.readRoot) throw createError("The selected path resolves outside the approved read folder.", 403);
  if (!(await stat(actual)).isFile()) throw createError("Choose a file, not a folder.");
  return actual;
}

export function createCompanionServer(config, opts = {}) {
  const allowed = opts.allowedOrigins || ALLOWED_ORIGINS;
  const sessionsLocal = opts.sessions || sessions;
  const code = opts.pairingCode || PAIRING_CODE;
  const getClient = opts.getClient || function () {
    if (!mcpClient) mcpClient = new McpStdioClient(config);
    return mcpClient;
  };
  const server = http.createServer(async function (req, res) {
    try {
      if (!allowedHost(req.headers.host, opts.port || PORT)) throw createError("Only the configured loopback host is accepted.", 403);
      applyCors(req, res, allowed);
      if (req.method === "OPTIONS") {
        res.writeHead(204, { "Cache-Control": "no-store" });
        return res.end();
      }
      const url = new URL(req.url || "/", "http://127.0.0.1:" + PORT);
      if (req.method === "GET" && url.pathname === "/api/health") {
        const healthToken = getBearer(req);
        const expiry = sessionsLocal.get(healthToken);
        if (expiry && expiry <= Date.now()) sessionsLocal.delete(healthToken);
        return sendJson(res, 200, {
          ok: true,
          companionVersion: VERSION,
          service: "PhotoCraft local companion",
          paired: Boolean(expiry && expiry > Date.now()),
          cliConfigured: Boolean(config.cliPath),
          readRootConfigured: Boolean(config.readRoot),
          writeRootConfigured: Boolean(config.writeRoot),
          operations: ["tools", "open", "inspect", "preview"]
        });
      }
      if (req.method !== "POST") throw createError("Method not allowed.", 405);
      const body = await readJson(req);
      if (url.pathname === "/api/pair") {
        const address = req.socket.remoteAddress || "loopback";
        if (recordPairFailure(address) > 5) throw createError("Too many pairing attempts. Wait one minute and try again.", 429);
        if (!sameCode(body.code, code)) throw createError("Pairing code did not match. Read the code printed by the local companion.", 401);
        const token = randomBytes(32).toString("base64url");
        sessionsLocal.set(token, Date.now() + SESSION_MS);
        return sendJson(res, 200, { ok: true, token, expiresInSeconds: SESSION_MS / 1000 });
      }
      requireSession(req, sessionsLocal);
      const client = getClient();
      if (url.pathname === "/api/photocraft/tools") {
        const tools = await client.listTools();
        return sendJson(res, 200, {
          ok: true,
          protocol: client.protocol,
          tools: tools.filter((t) => READ_TOOLS.has(t.name)).map((t) => ({
            name: t.name,
            description: String(t.description || "").slice(0, 500),
            inputSchema: t.inputSchema || { type: "object", properties: {} }
          }))
        });
      }
      if (url.pathname === "/api/photocraft/open") {
        const filePath = await resolveReadFile(config, body.path);
        const result = await client.callSafeTool("doc_open", { path: filePath }).catch((error) => {
          // Opening is deliberately allowlisted as a user-initiated read inside the sandbox root.
          if (/not enabled|does not advertise/.test(error.message)) throw error;
          throw error;
        });
        return sendJson(res, 200, { ok: true, result });
      }
      if (url.pathname === "/api/photocraft/inspect") {
        const result = await client.callSafeTool("doc_inspect", {});
        return sendJson(res, 200, { ok: true, result });
      }
      if (url.pathname === "/api/photocraft/preview") {
        const result = await client.callSafeTool("render_preview", { max_side: 1200 });
        return sendJson(res, 200, { ok: true, result });
      }
      throw createError("Unknown endpoint.", 404);
    } catch (error) {
      sendJson(res, Number(error.status) || 500, {
        ok: false,
        error: error.status ? error.message : "The local companion could not complete that request."
      });
    }
  });
  return server;
}

async function main() {
  const config = await loadConfig();
  resolvedConfig = config;
  const server = createCompanionServer(config);
  server.listen(PORT, HOST, function () {
    console.log("Craft Workspace local companion " + VERSION);
    console.log("Listening only on http://" + HOST + ":" + PORT);
    console.log("PhotoCraft read access is limited to the configured folder; write access: " + (config.writeRoot ? "configured but not exposed by this pilot" : "disabled"));
    console.log("One-time browser pairing code: " + PAIRING_CODE);
    console.log("Pairing code is local-only. Do not paste it into chat, a website, or a source file.");
  });
  const shutdown = function () {
    if (mcpClient) mcpClient.close();
    server.close(function () { process.exit(0); });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}
const invokedAsScript = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedAsScript) {
  main().catch(function (error) {
    console.error("Craft Workspace companion could not start: " + error.message);
    process.exitCode = 1;
  });
}

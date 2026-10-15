import test from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { isAllowedOrigin, isWithinRoot, safeRelativePath, buildMcpArgs } from "./server.mjs";

test("accepts only explicitly configured origins", () => {
  const origins = new Set(["https://craft-workspace.vercel.app", "http://localhost:5173"]);
  assert.equal(isAllowedOrigin("https://craft-workspace.vercel.app", origins), true);
  assert.equal(isAllowedOrigin("http://evil.example", origins), false);
  assert.equal(isAllowedOrigin(undefined, origins), false);
});

test("root boundary compares complete path segments", () => {
  const root = path.resolve("/tmp/craft-approved");
  assert.equal(isWithinRoot(root, path.join(root, "image.psd")), true);
  assert.equal(isWithinRoot(root, path.join(root, "sub", "image.psd")), true);
  assert.equal(isWithinRoot(root, path.resolve("/tmp/craft-approved-escape", "x.psd")), false);
  assert.equal(isWithinRoot(root, path.resolve(root, "..", "private.psd")), false);
});

test("relative path checker refuses absolute and traversal paths", () => {
  assert.equal(safeRelativePath("photo.psd"), "photo.psd");
  assert.equal(safeRelativePath("campaign/input.psd"), "campaign/input.psd");
  assert.throws(() => safeRelativePath("../secret.psd"));
  assert.throws(() => safeRelativePath("C:\\\\private\\\\secret.psd"));
  assert.throws(() => safeRelativePath("/etc/passwd"));
});

test("MCP CLI is invoked with only explicit roots and no shell argument", () => {
  assert.deepEqual(buildMcpArgs("/approved"), ["mcp", "--automation-read-root", "/approved"]);
  assert.deepEqual(buildMcpArgs("/approved", "/approved/out"), ["mcp", "--automation-read-root", "/approved", "--automation-write-root", "/approved/out"]);
});


import os from "node:os";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { createCompanionServer } from "./server.mjs";

test("local API requires a listed origin, pairing, and an in-root file path", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "craft-companion-test-"));
  await writeFile(path.join(root, "sample.psd"), "test-only-not-a-real-PSD");
  const sessions = new Map();
  const allowedOrigins = new Set(["https://craft-workspace.vercel.app"]);
  const toolCalls = [];
  const fakeClient = {
    protocol: "2026-07-28",
    async listTools() {
      return [
        { name: "doc_open", description: "Open selected file", inputSchema: { type: "object" } },
        { name: "doc_inspect", description: "Inspect current document", inputSchema: { type: "object" } },
        { name: "render_preview", description: "Render preview", inputSchema: { type: "object" } },
        { name: "command_run", description: "Not exposed", inputSchema: { type: "object" } }
      ];
    },
    async callSafeTool(name, args) {
      toolCalls.push({ name, args });
      return { content: [{ type: "text", text: name }] };
    }
  };
  const opts = {
    port: 0,
    allowedOrigins,
    sessions,
    pairingCode: "ABCDEF123456",
    getClient: () => fakeClient
  };
  const server = createCompanionServer({ readRoot: root, writeRoot: "", cliPath: "fake-executable" }, opts);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  opts.port = server.address().port;
  t.after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await rm(root, { recursive: true, force: true });
  });
  const base = "http://127.0.0.1:" + opts.port;
  const allowedHeaders = { Origin: "https://craft-workspace.vercel.app" };

  const denied = await fetch(base + "/api/health", { headers: { Origin: "https://not-approved.example" } });
  assert.equal(denied.status, 403);

  const health = await fetch(base + "/api/health", { headers: allowedHeaders });
  assert.equal(health.status, 200);
  assert.equal((await health.json()).readRootConfigured, true);

  const badPair = await fetch(base + "/api/pair", {
    method: "POST",
    headers: { ...allowedHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ code: "wrong-code" })
  });
  assert.equal(badPair.status, 401);

  const pairingResponse = await fetch(base + "/api/pair", {
    method: "POST",
    headers: { ...allowedHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ code: "ABCDEF123456" })
  });
  assert.equal(pairingResponse.status, 200);
  const paired = await pairingResponse.json();
  assert.ok(paired.token);
  const authHeaders = { ...allowedHeaders, Authorization: "Bearer " + paired.token, "Content-Type": "application/json" };

  const opened = await fetch(base + "/api/photocraft/open", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ path: "sample.psd" })
  });
  assert.equal(opened.status, 200);
  assert.equal(toolCalls[0].name, "doc_open");
  assert.equal(toolCalls[0].args.path, path.join(root, "sample.psd"));

  const traversal = await fetch(base + "/api/photocraft/open", {
    method: "POST", headers: authHeaders, body: JSON.stringify({ path: "../outside.psd" })
  });
  assert.equal(traversal.status, 400);

  const toolList = await fetch(base + "/api/photocraft/tools", {
    method: "POST", headers: authHeaders, body: "{}"
  });
  assert.equal(toolList.status, 200);
  const exposedTools = (await toolList.json()).tools.map((item) => item.name);
  assert.deepEqual(exposedTools.sort(), ["command_list", "doc_inspect", "doc_render_preview", "doc_open", "render_preview", "session_list"].filter((item, i, arr) => arr.indexOf(item) === i).filter((name) => ["doc_open", "doc_inspect", "render_preview"].includes(name)).sort());

  const inspect = await fetch(base + "/api/photocraft/inspect", {
    method: "POST", headers: authHeaders, body: "{}"
  });
  assert.equal(inspect.status, 200);
  assert.equal(toolCalls.some((item) => item.name === "doc_inspect"), true);
  assert.equal(toolCalls.some((item) => item.name === "command_run"), false);
});

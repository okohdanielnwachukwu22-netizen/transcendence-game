import type { CompanionHealth, CompanionResult, CompanionTool } from "../types";
import type { AdapterDescriptor, CapabilityDefinition } from "./types";

export const PHOTOCRAFT_CAPABILITIES: readonly CapabilityDefinition[] = [
  { id: "photocraft.health", label: "Check local companion", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
  { id: "photocraft.pair", label: "Pair this browser tab", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
  { id: "photocraft.capabilities.list", label: "List approved capabilities", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
  { id: "photocraft.document.open", label: "Open a file in the approved read folder", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
  { id: "photocraft.document.inspect", label: "Inspect the active document", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
  { id: "photocraft.document.preview", label: "Render a document preview", effect: "read", localOnly: true, userInitiated: true, confirmationRequired: false },
] as const;

export const PHOTOCRAFT_ADAPTER_DESCRIPTOR: AdapterDescriptor = {
  repository: "photocraft",
  displayName: "PhotoCraft",
  phase: "scaffolded",
  capabilities: PHOTOCRAFT_CAPABILITIES,
  notes: "Local HTTP/MCP adapter scaffold. It is not marked native-tested or integrated-and-verified until it passes a real Windows PhotoCraft smoke test.",
};

type CompanionEnvelope<T> = { ok: true } & T;
type PairingResult = { token: string; expiresInSeconds: number };
type ToolListResult = { tools: CompanionTool[]; protocol: string };

export class PhotoCraftLocalAdapter {
  readonly descriptor = PHOTOCRAFT_ADAPTER_DESCRIPTOR;

  constructor(private readonly baseUrl = "http://127.0.0.1:4174") {}

  private async request<T>(
    endpoint: string,
    method: "GET" | "POST",
    body?: unknown,
    token?: string,
  ): Promise<T> {
    const headers: Record<string, string> = {};
    if (method === "POST") headers["Content-Type"] = "application/json";
    if (token) headers.Authorization = "Bearer " + token;
    let response: Response;
    try {
      response = await fetch(this.baseUrl + endpoint, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        mode: "cors",
      });
    } catch {
      throw new Error("The local companion could not be reached. Start companion/start-windows.ps1 on the PC that has PhotoCraft installed, then check the companion configuration.");
    }
    let payload: { ok?: boolean; error?: string };
    try { payload = await response.json() as { ok?: boolean; error?: string }; }
    catch { throw new Error("The local companion returned a response the workspace could not read."); }
    if (!response.ok || payload.ok === false) {
      throw new Error(payload.error || ("Local companion request failed (" + response.status + ")."));
    }
    return payload as T;
  }

  health(token?: string): Promise<CompanionHealth> {
    return this.request<CompanionHealth>("/api/health", "GET", undefined, token);
  }

  pair(code: string): Promise<PairingResult> {
    const cleaned = code.trim();
    if (!cleaned) return Promise.reject(new Error("Enter the one-time code printed in the local companion terminal."));
    return this.request<PairingResult>("/api/pair", "POST", { code: cleaned });
  }

  listCapabilities(token: string): Promise<ToolListResult> {
    return this.request<ToolListResult>("/api/photocraft/tools", "POST", {}, token);
  }

  openRelativeFile(token: string, relativePath: string): Promise<CompanionResult> {
    const cleaned = relativePath.trim();
    if (!cleaned) return Promise.reject(new Error("Enter a file path relative to the approved input folder."));
    return this.request<CompanionResult>("/api/photocraft/open", "POST", { path: cleaned }, token);
  }

  inspectActiveDocument(token: string): Promise<CompanionResult> {
    return this.request<CompanionResult>("/api/photocraft/inspect", "POST", {}, token);
  }

  renderActivePreview(token: string): Promise<CompanionResult> {
    return this.request<CompanionResult>("/api/photocraft/preview", "POST", {}, token);
  }
}

export const photocraftAdapter = new PhotoCraftLocalAdapter();

export type Theme = "dark" | "light";
export type Page =
  | "Home"
  | "Projects"
  | "Files"
  | "Applications"
  | "AI Workspace"
  | "Activity"
  | "Diagnostics"
  | "Settings";

export type AuditStatus =
  | "Not inspected"
  | "Inspected"
  | "Build attempted"
  | "Build passed"
  | "Smoke test passed"
  | "Integration in progress"
  | "Integrated and verified"
  | "Blocked"
  | "Unsupported in current environment";

export type RegisteredApp = {
  name: string;
  description: string;
  repo: string;
  icon: string;
  group: string;
  kind: "creative" | "support";
  status: AuditStatus;
  launchUrl?: string;
  launchState?: "web" | "official-page" | "coming-soon";
};

export type WorkspaceProject = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
};

export type ActivityEntry = {
  id: string;
  action: string;
  detail: string;
  createdAt: string;
};

export type CompanionTool = {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
};

export type CompanionHealth = {
  ok: boolean;
  paired: boolean;
  companionVersion: string;
  service: string;
  cliConfigured: boolean;
  readRootConfigured: boolean;
  writeRootConfigured: boolean;
  operations: string[];
};

export type CompanionResult = {
  ok: boolean;
  result?: {
    content?: Array<{ type?: string; text?: string; data?: string; mimeType?: string }>;
    structuredContent?: unknown;
    [key: string]: unknown;
  };
  tools?: CompanionTool[];
  protocol?: string;
  token?: string;
  expiresInSeconds?: number;
  error?: string;
};

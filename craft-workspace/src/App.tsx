import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_REPOSITORIES, AUDIT_STATUSES, CREATIVE_APPS } from "./registry";
import { photocraftAdapter } from "./adapters/photocraft";
import {
  loadActivity,
  loadAuditStatuses,
  loadProjects,
  loadTheme,
  makeId,
  writeLocal,
} from "./storage";
import type {
  ActivityEntry,
  AuditStatus,
  CompanionHealth,
  CompanionResult,
  CompanionTool,
  Page,
  RegisteredApp,
  Theme,
  WorkspaceProject,
} from "./types";

type ModalState =
  | { type: "new-project" }
  | { type: "rename-project"; project: WorkspaceProject }
  | { type: "project-options"; project: WorkspaceProject }
  | { type: "application"; app: RegisteredApp }
  | { type: "image-preview"; file: File; url: string }
  | { type: "help" }
  | { type: "clear-data" }
  | { type: "profile" }
  | null;

type ActivityAction = { action: string; detail?: string };

const NAV_SECTIONS: Array<{ label: string; items: Array<{ page: Page; icon: string }> }> = [
  { label: "Workspace", items: [
    { page: "Home", icon: "⌂" },
    { page: "Projects", icon: "▱" },
    { page: "Files", icon: "▤" },
    { page: "Applications", icon: "▦" },
  ] },
  { label: "Manage", items: [
    { page: "AI Workspace", icon: "◈" },
    { page: "Activity", icon: "◷" },
    { page: "Diagnostics", icon: "⌘" },
  ] },
];

const PAGE_DESCRIPTIONS: Record<Exclude<Page, "Home">, { eyebrow: string; title: string; description: string }> = {
  Projects: { eyebrow: "WORKSPACE / 02", title: "Projects", description: "Create and organise project notes. Names and notes are saved in this browser on this device." },
  Files: { eyebrow: "WORKSPACE / 03", title: "Files", description: "Choose files from your device to inspect them. The browser accesses only the files you select; nothing is automatically uploaded." },
  Applications: { eyebrow: "LIBRARY / 01", title: "Applications", description: "Browse the 14 creative tools named in your brief. A catalogue entry does not mean the application is installed, built, or connected." },
  "AI Workspace": { eyebrow: "INTELLIGENCE / 04", title: "AI Workspace", description: "A local PhotoCraft connection can be paired by you when the optional helper is running on your PC. Cloud AI is not configured." },
  Activity: { eyebrow: "SYSTEM / 05", title: "Activity", description: "Actions actually taken in this browser. No sample jobs or fabricated success records." },
  Diagnostics: { eyebrow: "SYSTEM / 06", title: "Diagnostics & audit", description: "Track source review for the 21 repositories in your brief. Changing an audit label is a tracking action, not a build or test." },
  Settings: { eyebrow: "PREFERENCES / 07", title: "Settings", description: "Appearance and local workspace data. Security-sensitive services remain disabled until they are implemented and configured." },
};

function readSessionToken(): string {
  try { return window.sessionStorage.getItem("craft-workspace-companion-token") || ""; }
  catch { return ""; }
}

function formatBytes(value: number): string {
  if (value < 1024) return value + " B";
  if (value < 1024 * 1024) return (value / 1024).toFixed(1) + " KB";
  return (value / 1024 / 1024).toFixed(1) + " MB";
}

function PageHeading({ page }: { page: Exclude<Page, "Home"> }) {
  const meta = PAGE_DESCRIPTIONS[page];
  return <div className="page-heading">
    <div className="eyebrow">{meta.eyebrow}</div>
    <h1>{meta.title}</h1>
    <p>{meta.description}</p>
  </div>;
}

function StatusLabel({ children }: { children: React.ReactNode }) {
  return <span className="status-label"><i />{children}</span>;
}

function WorkspaceModal({
  modal,
  onClose,
  children,
}: {
  modal: Exclude<ModalState, null>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={modal.type.replaceAll("-", " ")}>
      {children}
    </div>
  </div>;
}

export default function App() {
  const [page, setPage] = useState<Page>("Home");
  const [theme, setTheme] = useState<Theme>(loadTheme);
  const [projects, setProjects] = useState<WorkspaceProject[]>(loadProjects);
  const [activity, setActivity] = useState<ActivityEntry[]>(loadActivity);
  const [auditStatuses, setAuditStatuses] = useState<Record<string, AuditStatus>>(loadAuditStatuses);
  const [files, setFiles] = useState<File[]>([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [paletteQuery, setPaletteQuery] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [renameName, setRenameName] = useState("");
  const [toast, setToast] = useState("");
  const [companionToken, setCompanionToken] = useState(readSessionToken);
  const [pairCode, setPairCode] = useState("");
  const [companionHealth, setCompanionHealth] = useState<CompanionHealth | null>(null);
  const [companionTools, setCompanionTools] = useState<CompanionTool[]>([]);
  const [companionBusy, setCompanionBusy] = useState(false);
  const [companionMessage, setCompanionMessage] = useState("");
  const [photoPath, setPhotoPath] = useState("");
  const [photoOutput, setPhotoOutput] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [profileName, setProfileName] = useState(() => { try { return localStorage.getItem("craft-workspace-profile-name") || "Workspace owner"; } catch { return "Workspace owner"; } });
  const [profileEmail, setProfileEmail] = useState(() => { try { return localStorage.getItem("craft-workspace-profile-email") || ""; } catch { return ""; } });
  const [profileNameDraft, setProfileNameDraft] = useState(profileName);
  const [profileEmailDraft, setProfileEmailDraft] = useState(profileEmail);
  const filePickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => { writeLocal("theme", theme); }, [theme]);
  useEffect(() => { writeLocal("projects", projects); }, [projects]);
  useEffect(() => { writeLocal("activity", activity); }, [activity]);
  useEffect(() => { writeLocal("repoStatuses", auditStatuses); }, [auditStatuses]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (modal?.type !== "image-preview") return;
    return () => URL.revokeObjectURL(modal.url);
  }, [modal]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
        setPaletteQuery("");
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setModal(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const recordActivity = ({ action, detail = "" }: ActivityAction) => {
    const entry: ActivityEntry = { id: makeId(), action, detail, createdAt: new Date().toISOString() };
    setActivity((current) => [entry, ...current].slice(0, 100));
  };
  const notify = (message: string) => setToast(message);
  const navigate = (next: Page) => { setPage(next); setSearch(""); setPaletteOpen(false); };
  const toggleTheme = () => setTheme((current) => current === "dark" ? "light" : "dark");

  const createProject = () => {
    const name = projectName.trim();
    if (!name) return;
    if (projects.some((item) => item.name.toLowerCase() === name.toLowerCase())) {
      notify("A project with that name already exists.");
      return;
    }
    const project: WorkspaceProject = {
      id: makeId(),
      name,
      description: projectDescription.trim(),
      createdAt: new Date().toISOString(),
    };
    setProjects((current) => [...current, project]);
    recordActivity({ action: "Created project", detail: name });
    setModal(null);
    navigate("Projects");
    notify("Project created and saved in this browser.");
  };

  const beginRename = (project: WorkspaceProject) => {
    setRenameName(project.name);
    setModal({ type: "rename-project", project });
  };
  const saveRename = (project: WorkspaceProject) => {
    const name = renameName.trim();
    if (!name) return;
    if (projects.some((item) => item.id !== project.id && item.name.toLowerCase() === name.toLowerCase())) {
      notify("A project with that name already exists.");
      return;
    }
    setProjects((current) => current.map((item) => item.id === project.id ? { ...item, name } : item));
    recordActivity({ action: "Renamed project", detail: project.name + " → " + name });
    setModal(null);
    notify("Project name updated.");
  };
  const deleteProject = (project: WorkspaceProject) => {
    if (!window.confirm("Delete project “" + project.name + "”? This cannot be undone.")) return;
    setProjects((current) => current.filter((item) => item.id !== project.id));
    recordActivity({ action: "Deleted project", detail: project.name });
    setModal(null);
    notify("Project deleted.");
  };
  const clearLocalData = () => {
    setProjects([]);
    setActivity([]);
    setAuditStatuses({});
    setFiles([]);
    writeLocal("projects", []);
    writeLocal("activity", []);
    writeLocal("repoStatuses", {});
    setModal(null);
    notify("Local workspace records cleared.");
  };

  const filteredApps = useMemo(
    () => CREATIVE_APPS.filter((item) => (item.name + " " + item.description + " " + item.group).toLowerCase().includes(search.toLowerCase())),
    [search],
  );
  const appGroups = useMemo(() => Array.from(new Set(filteredApps.map((item) => item.group))), [filteredApps]);
  const filteredProjects = projects.filter((item) => (item.name + " " + item.description).toLowerCase().includes(search.toLowerCase()));
  const filteredRepos = ALL_REPOSITORIES.filter((item) => (item.name + " " + item.repo + " " + item.description).toLowerCase().includes(search.toLowerCase()));
  const filteredPalettePages = (["Home", "Projects", "Files", "Applications", "AI Workspace", "Activity", "Diagnostics", "Settings"] as Page[])
    .filter((item) => item.toLowerCase().includes(paletteQuery.toLowerCase()));
  const filteredPaletteApps = CREATIVE_APPS
    .filter((item) => (item.name + " " + item.description).toLowerCase().includes(paletteQuery.toLowerCase()))
    .slice(0, 7);
  const updatedStatuses = ALL_REPOSITORIES.filter((item) => auditStatuses[item.repo] && auditStatuses[item.repo] !== "Not inspected").length;
  const verifiedStatuses = ALL_REPOSITORIES.filter((item) => auditStatuses[item.repo] === "Integrated and verified").length;

  const selectedFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = Array.from(event.currentTarget.files || []);
    if (!chosen.length) return;
    setFiles((current) => {
      const next = [...current];
      for (const file of chosen) {
        if (!next.some((old) => old.name === file.name && old.size === file.size && old.lastModified === file.lastModified)) next.push(file);
      }
      return next;
    });
    recordActivity({ action: "Selected local files", detail: chosen.map((file) => file.name).join(", ") });
    notify(chosen.length + " file(s) selected. No upload occurred.");
    event.currentTarget.value = "";
  };
  const openSelectedFile = (file: File) => {
    if (file.type.startsWith("image/")) {
      setModal({ type: "image-preview", file, url: URL.createObjectURL(file) });
    } else {
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 5000);
      notify("Opened the selected file using the browser.");
    }
    recordActivity({ action: "Opened selected file", detail: file.name });
  };

  const checkCompanion = async () => {
    setCompanionBusy(true);
    setCompanionMessage("Checking the local-only companion…");
    try {
      const health = await photocraftAdapter.health(companionToken || undefined);
      setCompanionHealth(health);
      setCompanionMessage(health.readRootConfigured
        ? "The local companion responded. Its approved file folder is configured."
        : "The companion responded, but no approved input folder is configured.");
      recordActivity({ action: "Checked local companion", detail: "Health endpoint responded; no native app operation was run." });
    } catch (error) {
      setCompanionHealth(null);
      setCompanionMessage(error instanceof Error ? error.message : "The local companion could not be checked.");
    } finally { setCompanionBusy(false); }
  };
  const pairCompanion = async () => {
    if (!pairCode.trim()) {
      setCompanionMessage("Enter the one-time code printed in the local companion terminal.");
      return;
    }
    setCompanionBusy(true);
    setCompanionMessage("Pairing this browser tab…");
    try {
      const result = await photocraftAdapter.pair(pairCode.trim());
      if (!result.token) throw new Error("The companion did not return a pairing token.");
      window.sessionStorage.setItem("craft-workspace-companion-token", result.token);
      setCompanionToken(result.token);
      setPairCode("");
      const resultHealth = await photocraftAdapter.health(result.token);
      setCompanionHealth(resultHealth);
      setCompanionMessage("This browser tab is paired for 30 minutes. Native operations remain limited by the local allowlist.");
      recordActivity({ action: "Paired local companion", detail: "Short-lived token stored in this tab's session storage only." });
    } catch (error) {
      setCompanionMessage(error instanceof Error ? error.message : "Could not pair the local companion.");
    } finally { setCompanionBusy(false); }
  };
  const disconnectCompanion = () => {
    try { window.sessionStorage.removeItem("craft-workspace-companion-token"); } catch { /* Ignore unavailable storage. */ }
    setCompanionToken("");
    setCompanionHealth(null);
    setCompanionTools([]);
    setPhotoOutput("");
    setPhotoPreview("");
    setCompanionMessage("This browser tab is disconnected from the local companion.");
    recordActivity({ action: "Disconnected local companion", detail: "Removed this tab's temporary pairing token." });
  };
  const discoverPhotoTools = async () => {
    setCompanionBusy(true);
    setCompanionMessage("Starting PhotoCraft CLI and discovering allowed MCP capabilities…");
    try {
      const result = await photocraftAdapter.listCapabilities(companionToken);
      setCompanionTools(result.tools || []);
      setCompanionMessage("PhotoCraft MCP responded using protocol " + (result.protocol || "negotiated") + ". Only read/inspect/preview tools are listed.");
      recordActivity({ action: "Discovered PhotoCraft capabilities", detail: (result.tools || []).map((tool) => tool.name).join(", ") || "No allowlisted tools advertised." });
    } catch (error) {
      setCompanionMessage(error instanceof Error ? error.message : "Could not discover PhotoCraft capabilities.");
    } finally { setCompanionBusy(false); }
  };
  const parsePhotoResult = (payload: CompanionResult) => {
    const result = (payload.result || {}) as NonNullable<CompanionResult["result"]>;
    const content = Array.isArray(result.content) ? result.content : [];
    const imagePart = content.find((item) => item.type === "image" && item.data);
    setPhotoPreview(imagePart ? "data:" + (imagePart.mimeType || "image/png") + ";base64," + imagePart.data : "");
    const textContent = content.filter((item) => item.type === "text" && item.text).map((item) => item.text as string);
    const structured = result.structuredContent;
    const output = textContent.length ? textContent.join("\n") : structured ? JSON.stringify(structured, null, 2) : JSON.stringify(result, null, 2);
    setPhotoOutput(String(output || "No output returned.").slice(0, 12000));
  };
  const openPhotoFile = async () => {
    if (!photoPath.trim()) {
      setCompanionMessage("Enter a file path relative to the approved input folder.");
      return;
    }
    setCompanionBusy(true);
    setCompanionMessage("Opening the file inside the approved read folder…");
    try {
      const result = await photocraftAdapter.openRelativeFile(companionToken, photoPath.trim());
      parsePhotoResult(result);
      setCompanionMessage("PhotoCraft accepted the file-open request. Inspect or preview it next.");
      recordActivity({ action: "Opened PhotoCraft source file", detail: photoPath.trim() });
    } catch (error) {
      setCompanionMessage(error instanceof Error ? error.message : "PhotoCraft could not open this file.");
    } finally { setCompanionBusy(false); }
  };
  const inspectPhotoDocument = async () => {
    setCompanionBusy(true);
    setCompanionMessage("Inspecting the active PhotoCraft document…");
    try {
      const result = await photocraftAdapter.inspectActiveDocument(companionToken);
      parsePhotoResult(result);
      setCompanionMessage("Document inspection returned. No edit or save operation was requested.");
      recordActivity({ action: "Inspected PhotoCraft document", detail: "Read-only inspection requested." });
    } catch (error) {
      setCompanionMessage(error instanceof Error ? error.message : "PhotoCraft document inspection failed.");
    } finally { setCompanionBusy(false); }
  };
  const previewPhotoDocument = async () => {
    setCompanionBusy(true);
    setCompanionMessage("Rendering a read-only PhotoCraft preview…");
    try {
      const result = await photocraftAdapter.renderActivePreview(companionToken);
      parsePhotoResult(result);
      setCompanionMessage(result.result?.content?.some((item) => item.type === "image")
        ? "PhotoCraft returned a preview image."
        : "PhotoCraft returned a preview response; see details below.");
      recordActivity({ action: "Rendered PhotoCraft preview", detail: "Read-only preview requested with a maximum side of 1200 px." });
    } catch (error) {
      setCompanionMessage(error instanceof Error ? error.message : "PhotoCraft preview failed.");
    } finally { setCompanionBusy(false); }
  };

  const openNewProject = () => {
    setProjectName("");
    setProjectDescription("");
    setModal({ type: "new-project" });
  };

  const projectRows = (items: WorkspaceProject[]) => items.map((project) => (
    <div className="project-row" key={project.id}>
      <div className="project-thumb">▱</div>
      <div className="project-info"><b>{project.name}</b><small>Saved in this browser · {new Date(project.createdAt).toLocaleDateString()}</small></div>
      <span className="project-state">{project.description || "Workspace project"}</span>
      <button className="icon-button" title="Rename" aria-label={"Rename " + project.name} onClick={() => beginRename(project)}>✎</button>
      <button className="icon-button" title="Project options" aria-label={"Options for " + project.name} onClick={() => setModal({ type: "project-options", project })}>···</button>
    </div>
  ));

  const renderHome = () => <div>
    <div className="eyebrow"><span className="live-dot" /> CREATIVE ENVIRONMENT <span className="eyebrow-line" /></div>
    <div className="hero">
      <div>
        <h1>Make room for<br /><em>good work.</em></h1>
        <p>Your creative tools, project notes, and selected files — together in a considered workspace. Workspace metadata is saved in this browser until a secure shared-storage service is configured.</p>
        <div className="hero-actions">
          <button className="primary" onClick={openNewProject}>＋ New project</button>
          <button className="secondary" onClick={() => navigate("Applications")}>Explore applications ↗</button>
        </div>
      </div>
      <div className="hero-art" aria-label="Abstract creative composition" role="img">
        <div className="frame frame-back"><div className="sun" /><div className="hill hill-one" /><div className="hill hill-two" /></div>
        <div className="frame frame-front"><div className="art-grid" /><div className="art-shape" /></div>
        <div className="art-caption"><span>WORKSPACE STUDY</span><b>Form / 001</b></div>
      </div>
    </div>
    <section className="section">
      <div className="section-head"><div><span className="section-index">01</span><h2>Pick up where you left off</h2></div><button className="text-button" onClick={() => navigate("Projects")}>All projects ↗</button></div>
      {projects.length
        ? <div className="project-list">{projectRows(projects.slice(-4).reverse())}</div>
        : <div className="empty-row"><div className="empty-icon">▱</div><div><b>Your workspace is ready for a first project.</b><p>Create a project to keep related notes and work together.</p></div><button className="outline" onClick={openNewProject}>Create project ＋</button></div>}
    </section>
    <section className="section" style={{ border: 0 }}>
      <div className="section-head"><div><span className="section-index">02</span><h2>Creative applications</h2></div><button className="text-button" onClick={() => navigate("Applications")}>Browse library ↗</button></div>
      <div className="apps-shortcuts">{CREATIVE_APPS.slice(0, 6).map((item) => <button className="app-shortcut" key={item.repo} onClick={() => setModal({ type: "application", app: item })}><div className="app-glyph">{item.icon}</div><span>{item.name}</span><small>{item.group}</small></button>)}</div>
    </section>
    <div className="bottom-status">
      <div><span className="status-ring" /> Local companion <b>{companionHealth?.paired ? "Paired" : "Not connected"}</b></div>
      <div><span className="status-ring" /> AI providers <b>Not configured</b></div>
      <button onClick={() => navigate("Diagnostics")}>View diagnostics ↗</button>
    </div>
  </div>;

  const renderApplications = () => <div>
    <PageHeading page="Applications" />
    <div className="library-tools">
      <div className="inline-search"><span>⌕</span><input aria-label="Find an application" placeholder="Find an application" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
      <span>{filteredApps.length} creative applications</span>
    </div>
    {appGroups.map((group) => {
      const groupApps = filteredApps.filter((item) => item.group === group);
      return <section className="library-group" key={group}>
        <div className="group-title">{group}<span>{String(groupApps.length).padStart(2, "0")}</span></div>
        {groupApps.map((item) => <button className="library-row" key={item.repo} onClick={() => setModal({ type: "application", app: item })}>
          <div className="app-glyph">{item.icon}</div>
          <div className="library-info"><b>{item.name}</b><small>{item.description}</small></div>
          <StatusLabel>{auditStatuses[item.repo] || item.status}</StatusLabel><span>↗</span>
        </button>)}
      </section>;
    })}
    {!filteredApps.length && <div className="notice">No applications match that search.</div>}
  </div>;

  const renderProjects = () => <div>
    <PageHeading page="Projects" />
    <div className="section-head page-top"><div><h2>Your projects · {projects.length}</h2></div><button className="primary" onClick={openNewProject}>＋ New project</button></div>
    <div className="library-tools"><div className="inline-search"><span>⌕</span><input aria-label="Find a project" placeholder="Find a project" value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>
    {filteredProjects.length ? <div className="project-list">{projectRows(filteredProjects)}</div> :
      <div className="empty-large"><div className="large-icon">▱</div><h3>{projects.length ? "No matching projects" : "No projects yet"}</h3><p>{projects.length ? "Try another search." : "Create your first project to keep notes and related work together."}</p><button className="primary" onClick={openNewProject}>＋ Create project</button></div>}
  </div>;

  const renderFiles = () => <div>
    <PageHeading page="Files" />
    <div className="section-head page-top"><div><h2>Selected files</h2><p style={{ fontSize: 11, color: "var(--muted)", margin: "4px 0" }}>{files.length} file{files.length === 1 ? "" : "s"} selected in this session</p></div><button className="primary" onClick={() => filePickerRef.current?.click()}>＋ Add files</button></div>
    <input className="hide" ref={filePickerRef} type="file" multiple onChange={selectedFiles} />
    <div className="file-list">{files.map((file, index) => <div className="file-row" key={file.name + ":" + file.size + ":" + file.lastModified}>
      <div className="project-thumb">{file.type.startsWith("image/") ? "▧" : file.type === "application/pdf" ? "▤" : "↧"}</div>
      <div className="file-info"><b>{file.name}</b><small>{file.type || "Unknown file type"} · {formatBytes(file.size)}</small></div>
      <button className="secondary" style={{ minHeight: 29 }} onClick={() => openSelectedFile(file)}>Open</button>
      <button className="icon-button" aria-label={"Remove " + file.name} onClick={() => { setFiles((current) => current.filter((_, i) => i !== index)); recordActivity({ action: "Removed selected file", detail: file.name }); }}>×</button>
    </div>)}</div>
    {!files.length && <div className="empty-large"><div className="large-icon">▤</div><h3>No files selected</h3><p>Use “Add files” to choose local files. The browser accesses only the files you select.</p><button className="primary" onClick={() => filePickerRef.current?.click()}>＋ Add files</button></div>}
    <p style={{ fontSize: 10, color: "var(--quiet)", lineHeight: 1.7, marginTop: 16 }}>File selections last for this browser session only. The PhotoCraft companion uses a separate locally approved folder. Persistent shared assets need a verified storage layer and explicit configuration.</p>
  </div>;

  const renderAI = () => {
    const status = companionHealth ? companionHealth.paired ? "Paired in this browser tab" : companionHealth.readRootConfigured ? "Companion reachable" : "Companion needs folder setup" : "Not checked";
    return <div>
      <PageHeading page="AI Workspace" />
      <div className="ai-panel">
        <div className="ai-panel-head"><div className="app-glyph">⌘</div><div><b>Local companion · PhotoCraft pilot</b><small>Loopback only · explicit folder boundary · short-lived pairing</small></div><StatusLabel>{status}</StatusLabel></div>
        <div className="companion-content">
          <div className="companion-actions"><button className="primary" disabled={companionBusy} onClick={() => void checkCompanion()}>Check local companion</button>{!companionToken && <span className="muted-note">Runs on this PC only after you start the helper.</span>}</div>
          {!companionToken ? <div className="pair-form">
            <label htmlFor="pairCode">One-time pairing code</label>
            <input id="pairCode" autoComplete="off" spellCheck={false} placeholder="Enter the code shown by the local companion" value={pairCode} onChange={(event) => setPairCode(event.target.value)} />
            <button className="primary" disabled={companionBusy} onClick={() => void pairCompanion()}>Pair this browser tab</button>
          </div> : <>
            <div className="companion-actions"><button className="secondary" disabled={companionBusy} onClick={() => void discoverPhotoTools()}>Discover PhotoCraft capabilities</button><button className="secondary" onClick={disconnectCompanion}>Disconnect this tab</button></div>
            <div className="companion-work">
              <label htmlFor="photoPath">File path relative to the approved input folder</label>
              <div className="companion-path"><input id="photoPath" placeholder="sample.psd" value={photoPath} onChange={(event) => setPhotoPath(event.target.value)} /><button className="secondary" disabled={companionBusy} onClick={() => void openPhotoFile()}>Open file</button></div>
              <div className="companion-actions"><button className="secondary" disabled={companionBusy} onClick={() => void inspectPhotoDocument()}>Inspect active document</button><button className="secondary" disabled={companionBusy} onClick={() => void previewPhotoDocument()}>Render preview</button></div>
              {!!companionTools.length && <div className="tool-pills">{companionTools.map((tool) => <span key={tool.name} title={tool.description || ""}>{tool.name}</span>)}</div>}
              {!!photoPreview && <div className="preview-box"><img alt="PhotoCraft preview returned by the local companion" src={photoPreview} /></div>}
              {!!photoOutput && <pre className="result-block">{photoOutput}</pre>}
            </div>
          </>}
          {!!companionMessage && <div className="notice" role="status">{companionMessage}</div>}
        </div>
      </div>
      <div className="ai-panel">
        <div className="ai-panel-head"><div className="app-glyph">◈</div><div><b>Cloud AI</b><small>Provider and privacy configuration</small></div><StatusLabel>Not configured</StatusLabel></div>
        <div className="provider-options"><div><b>Cloud providers</b><p>Not connected. Project content is not uploaded to a model from this workspace.</p><span>Not configured</span></div><div><b>Local model</b><p>No model endpoint is configured. This is separate from the PhotoCraft desktop companion.</p><span>Not connected</span></div></div>
      </div>
      <div className="notice">ⓘ The PhotoCraft pilot exposes only file-open, inspect and preview operations inside the approved input folder. Editing, save/export, arbitrary shell execution and automatic uploads are not enabled.</div>
    </div>;
  };

  const renderActivity = () => <div>
    <PageHeading page="Activity" />
    {activity.length ? <div className="diagnostic-table">{activity.map((entry) => <div className="diagnostic-row" key={entry.id}><div><b>{entry.action}</b><small>{entry.detail}</small></div><span className="status-text">{new Date(entry.createdAt).toLocaleString()}</span></div>)}</div> :
      <div className="empty-large"><div className="large-icon">◷</div><h3>No activity recorded</h3><p>Create a project, select a file, or explore the application library to record activity.</p></div>}
    <div className="hero-actions"><button className="secondary" onClick={() => { if (window.confirm("Clear the local activity history?")) { setActivity([]); notify("Activity history cleared."); } }}>Clear activity</button></div>
  </div>;

  const renderDiagnostics = () => <div>
    <PageHeading page="Diagnostics" />
    <div className="diagnostic-table">
      {[
        ["Source review", "Preliminary discovery completed", "Repository-root listings for all 21 sources and selected READMEs / control documentation have been checked; a full per-application audit is still pending."],
        ["Local companion", "Optional / PC-side setup required", "Pairing, folder allowlists and the MCP transport have tests against a simulated PhotoCraft CLI; the real Windows PhotoCraft binary is not tested here."],
        ["Application adapters", "PhotoCraft pilot only", "The other creative applications are catalogue entries, not launchable integrations."],
        ["Cloud / local AI", "Not configured", "No model provider or local model endpoint is connected."],
        ["Workspace build", "Build passing", "The React/TypeScript shell is checked by the build pipeline; that does not build the native apps."],
      ].map(([title, status, description]) => <div className="diagnostic-row" key={title}><div><b>{title}</b><small>{description}</small></div><span className="status-text">{status}</span></div>)}
    </div>
    <section style={{ marginTop: 30 }}>
      <div className="section-head"><div><h2>Repository registry · 21</h2></div><span style={{ color: "var(--quiet)", fontSize: 10 }}>{updatedStatuses} status updates · {verifiedStatuses} verified</span></div>
      <div className="library-tools"><div className="inline-search"><span>⌕</span><input aria-label="Search repositories" placeholder="Search repository names" value={search} onChange={(event) => setSearch(event.target.value)} /></div><span>Audit status</span></div>
      <div className="diagnostic-table">{filteredRepos.map((item) => <div className="diagnostic-row" key={item.repo}>
        <div><b>{item.name}</b><small>{item.description} · Registered in Craft Workspace</small></div>
        <label className="status-picker"><span className="hide">Audit status for {item.name}</span><select value={auditStatuses[item.repo] || item.status} aria-label={"Audit status for " + item.name} onChange={(event) => { const value = event.target.value as AuditStatus; setAuditStatuses((current) => ({ ...current, [item.repo]: value })); recordActivity({ action: "Updated repository audit tracking", detail: item.repo + ": " + value }); notify("Audit tracking updated. This does not run a test."); }}>
          {AUDIT_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select></label>
      </div>)}</div>
    </section>
  </div>;

  const renderSettings = () => <div>
    <PageHeading page="Settings" />
    <div className="settings-row"><div><b>Appearance</b><p>Change between dark and light workspace themes.</p></div><button className="secondary" onClick={toggleTheme}>◐ Switch to {theme === "light" ? "dark" : "light"}</button></div>
    <div className="settings-row"><div><b>Project and activity metadata</b><p>Saved in this browser’s local storage, on this device.</p></div><StatusLabel>Local</StatusLabel></div>
    <div className="settings-row"><div><b>Native companion</b><p>Secure pairing and native application launching require the local helper to be installed and started on your PC.</p></div><StatusLabel>{companionHealth?.paired ? "Paired" : "Not connected"}</StatusLabel></div>
    <div className="settings-row"><div><b>Reset local workspace</b><p>Removes local projects, activity and audit-status tracking. The action cannot be undone.</p></div><button className="secondary" onClick={() => setModal({ type: "clear-data" })}>Clear local data</button></div>
  </div>;

  const renderPage = () => {
    switch (page) {
      case "Home": return renderHome();
      case "Projects": return renderProjects();
      case "Files": return renderFiles();
      case "Applications": return renderApplications();
      case "AI Workspace": return renderAI();
      case "Activity": return renderActivity();
      case "Diagnostics": return renderDiagnostics();
      case "Settings": return renderSettings();
    }
  };

  const renderModal = () => {
    if (!modal) return null;
    if (modal.type === "new-project") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <form onSubmit={(event) => { event.preventDefault(); createProject(); }}>
        <div className="panel-top"><span>NEW PROJECT</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
        <h2>Start something good.</h2><p>Project metadata is saved in this browser.</p>
        <label htmlFor="projectName">Project name</label><input id="projectName" maxLength={100} placeholder="e.g. Spring campaign" value={projectName} onChange={(event) => setProjectName(event.target.value)} required autoFocus />
        <label htmlFor="projectDescription">Short note (optional)</label><input id="projectDescription" maxLength={180} placeholder="A few words about this project" value={projectDescription} onChange={(event) => setProjectDescription(event.target.value)} />
        <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary">Create project</button></div>
      </form>
    </WorkspaceModal>;
    if (modal.type === "rename-project") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <form onSubmit={(event) => { event.preventDefault(); saveRename(modal.project); }}>
        <div className="panel-top"><span>RENAME PROJECT</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
        <h2>Change project name</h2><label htmlFor="renameName">Project name</label><input id="renameName" maxLength={100} value={renameName} onChange={(event) => setRenameName(event.target.value)} required autoFocus />
        <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary">Save name</button></div>
      </form>
    </WorkspaceModal>;
    if (modal.type === "project-options") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>PROJECT OPTIONS</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <h2>{modal.project.name}</h2><p>{modal.project.description || "Workspace project"}</p>
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => beginRename(modal.project)}>Rename</button><button type="button" className="secondary" onClick={() => deleteProject(modal.project)}>Delete</button></div>
    </WorkspaceModal>;
    if (modal.type === "application") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>APPLICATION DETAILS</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <div className="detail-icon">{modal.app.icon}</div><h2>{modal.app.name}</h2><p>{modal.app.description}</p>
      <div className="application-feature-list"><b>What this application is for</b><p>${modal.app.description}. Keep this type of work organised within the Craft Workspace suite.</p><b>Workspace availability</b><p>{modal.app.repo === "photocraft" ? "A local connection panel is available in AI Workspace. Start and pair the companion on the computer that has PhotoCraft installed to test the real application." : "This application is registered in the suite, but its native runtime has not yet been connected. We will not pretend a launch has succeeded."}</p></div>
      <div className="detail-meta"><span>Application</span><b>{modal.app.name}</b><span>Integration status</span><b>{auditStatuses[modal.app.repo] || modal.app.status}</b><span>Launch method</span><b>{modal.app.repo === "photocraft" ? "Local desktop companion · setup required" : "Integration required"}</b></div>
      <div className="notice">{modal.app.repo === "photocraft" ? "Open AI Workspace to pair the local PhotoCraft companion. PhotoCraft must be installed on your PC." : "Direct launching is not connected for this app yet. The next integration must connect the actual application, not open its source repository."}</div>
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Close</button><button type="button" className="primary" onClick={() => { const target = modal.app.repo === "photocraft" ? "AI Workspace" : "Diagnostics"; setModal(null); navigate(target as Page); }}>{modal.app.repo === "photocraft" ? "Open connection panel" : "View integration status"} ↗</button></div>
    </WorkspaceModal>;
    if (modal.type === "image-preview") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>IMAGE PREVIEW</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <h2>{modal.file.name}</h2><p>{formatBytes(modal.file.size)} · Original stays on your device.</p>
      <img src={modal.url} alt={modal.file.name} style={{ display: "block", maxWidth: "100%", maxHeight: "50vh", margin: "10px auto" }} />
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Close</button></div>
    </WorkspaceModal>;
    if (modal.type === "help") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>ABOUT CRAFT WORKSPACE</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <h2>A creative workspace in progress.</h2><p>The workspace shell is React/TypeScript. The local PhotoCraft pilot has automated security/transport tests, but it still needs the actual PhotoCraft release and a real Windows end-to-end test.</p>
      <div className="notice">Application launching, cloud/local AI and shared cloud storage are not fully connected. The other creative applications are not marked integrated.</div>
      <div className="modal-actions"><button type="button" className="primary" onClick={() => setModal(null)}>Got it</button></div>
    </WorkspaceModal>;
    if (modal.type === "profile") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>WORKSPACE PROFILE</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <div className="profile-edit-mark">{(profileNameDraft.trim() || profileName).slice(0, 2).toUpperCase()}</div>
      <h2>Your workspace profile</h2>
      <p>This profile is stored locally in this browser. Sign-in and cloud sync are not configured yet.</p>
      <form onSubmit={(event) => { event.preventDefault(); const name = profileNameDraft.trim() || "Workspace owner"; const email = profileEmailDraft.trim(); setProfileName(name); setProfileEmail(email); try { localStorage.setItem("craft-workspace-profile-name", name); localStorage.setItem("craft-workspace-profile-email", email); } catch {} recordActivity({ action: "Updated local profile", detail: name }); setModal(null); notify("Profile saved on this device."); }}>
        <label className="field-label" htmlFor="profile-name">Display name</label>
        <input id="profile-name" className="field-input" value={profileNameDraft} onChange={(event) => setProfileNameDraft(event.target.value)} maxLength={80} required />
        <label className="field-label" htmlFor="profile-email">Email (optional)</label>
        <input id="profile-email" className="field-input" type="email" value={profileEmailDraft} onChange={(event) => setProfileEmailDraft(event.target.value)} maxLength={160} placeholder="you@example.com" />
        <div className="notice">This does not create an account or authenticate you with a server.</div>
        <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="submit" className="primary">Save profile</button></div>
      </form>
    </WorkspaceModal>;
    if (modal.type === "clear-data") return <WorkspaceModal modal={modal} onClose={() => setModal(null)}>
      <div className="panel-top"><span>CLEAR LOCAL WORKSPACE</span><button type="button" className="icon-button" onClick={() => setModal(null)}>×</button></div>
      <h2>Clear saved workspace data?</h2><p>This removes project records, activity and audit statuses from this browser. It cannot be undone.</p>
      <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Cancel</button><button type="button" className="primary" onClick={clearLocalData}>Clear saved data</button></div>
    </WorkspaceModal>;
    return null;
  };

  return <div className={"app" + (theme === "light" ? " light" : "")}>
    <aside className="rail">
      <button className="brand" onClick={() => navigate("Home")} aria-label="Craft Workspace home"><span className="brand-mark">◈</span><span className="brand-name">craft<span className="brand-light">workspace</span></span></button>
      <div>{NAV_SECTIONS.map((section) => <div className="nav-group" key={section.label}><div className="nav-label">{section.label}</div>{section.items.map((item) => <button key={item.page} className={"nav-item" + (page === item.page ? " active" : "")} onClick={() => navigate(item.page)}><span className="nav-icon">{item.icon}</span><span className="nav-label-text">{item.page}</span></button>)}</div>)}</div>
      <div className="rail-bottom">
        <button className="nav-item" onClick={toggleTheme}><span className="nav-icon">◐</span><span className="nav-label-text">{theme === "light" ? "Dark appearance" : "Light appearance"}</span></button>
        <button className={"nav-item" + (page === "Settings" ? " active" : "")} onClick={() => navigate("Settings")}><span className="nav-icon">⚙</span><span className="nav-label-text">Settings</span></button>
        <button className="profile profile-button" type="button" onClick={() => { setProfileNameDraft(profileName); setProfileEmailDraft(profileEmail); setModal({ type: "profile" }); }} aria-label="Open workspace profile"><div className="profile-dot">{(profileName.trim() || "CW").slice(0, 2).toUpperCase()}</div><div className="profile-meta"><b>{profileName}</b><small>{profileEmail || "Local profile · click to edit"}</small></div><span className="profile-chevron">›</span></button>
      </div>
    </aside>
    <main className="main">
      <header className="topbar">
        <div className="crumb"><span>Craft Workspace</span><span className="slash">/</span><b>{page}</b></div>
        <div className="top-actions"><button className="search-trigger" onClick={() => { setPaletteOpen(true); setPaletteQuery(""); }}><span>⌕</span><span>Search anything...</span><kbd>Ctrl K</kbd></button><span className="top-sep" /><button className="icon-button" title="Help" aria-label="Help" onClick={() => setModal({ type: "help" })}>ⓘ</button><button className="icon-button" title="Diagnostics" aria-label="Diagnostics" onClick={() => navigate("Diagnostics")}>⎈</button><button className="profile-top-button" title="Workspace profile" aria-label="Workspace profile" onClick={() => { setProfileNameDraft(profileName); setProfileEmailDraft(profileEmail); setModal({ type: "profile" }); }}><span className="profile-dot">{(profileName.trim() || "CW").slice(0, 2).toUpperCase()}</span></button></div>
      </header>
      <div className="content">{renderPage()}</div>
    </main>
    {renderModal()}
    {paletteOpen && <div className="overlay palette-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setPaletteOpen(false); }}><div className="palette">
      <div className="palette-search"><span>⌕</span><input autoFocus placeholder="Search pages and applications..." value={paletteQuery} onChange={(event) => setPaletteQuery(event.target.value)} /><kbd>ESC</kbd><button className="icon-button" aria-label="Close search" onClick={() => setPaletteOpen(false)}>×</button></div>
      <div className="palette-label">NAVIGATION & APPLICATIONS</div>
      <div>{filteredPalettePages.map((item) => <button className="palette-item" key={item} onClick={() => navigate(item)}>⌘ {item}<span>Open page ↵</span></button>)}{filteredPaletteApps.map((item) => <button className="palette-item" key={item.repo} onClick={() => { setPaletteOpen(false); setModal({ type: "application", app: item }); }}>{item.icon} {item.name}<small>Application</small></button>)}</div>
    </div></div>}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>;
}

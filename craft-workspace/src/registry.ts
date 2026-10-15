import type { AuditStatus, RegisteredApp } from "./types";

const NOT_INSPECTED: AuditStatus = "Not inspected";

export const CREATIVE_APPS: RegisteredApp[] = [
  { name: "ArtCraft", description: "Image and visual creation workflows", repo: "artcraft", icon: "✳", group: "Image & visual", kind: "creative", status: NOT_INSPECTED },
  { name: "PhotoCraft", description: "Raster photo editing and image manipulation", repo: "photocraft", icon: "▧", group: "Image & visual", kind: "creative", status: NOT_INSPECTED },
  { name: "ArtCraft-X", description: "Creative image and media workflows", repo: "artcraftx", icon: "◈", group: "Image & visual", kind: "creative", status: NOT_INSPECTED },
  { name: "LightCraft", description: "Photo-library organization and RAW development", repo: "lightcraft", icon: "☼", group: "Image & visual", kind: "creative", status: NOT_INSPECTED },
  { name: "VectorCraft", description: "Vector illustration and SVG workflows", repo: "vectorcraft", icon: "◇", group: "Image & visual", kind: "creative", status: NOT_INSPECTED },
  { name: "FilmCraft", description: "Video editing, colour grading and sound", repo: "filmcraft", icon: "▶", group: "Video, motion & audio", kind: "creative", status: NOT_INSPECTED },
  { name: "EffectCraft", description: "Motion graphics and visual effects", repo: "effectcraft", icon: "▱", group: "Video, motion & audio", kind: "creative", status: NOT_INSPECTED },
  { name: "SoundCraft", description: "Audio recording, editing and mixing", repo: "soundcraft", icon: "♫", group: "Video, motion & audio", kind: "creative", status: NOT_INSPECTED },
  { name: "DesignCraft", description: "Graphic design, page layout and publishing", repo: "designcraft", icon: "▦", group: "Design & publishing", kind: "creative", status: NOT_INSPECTED },
  { name: "WordCraft", description: "Document writing and formatting", repo: "wordcraft", icon: "▤", group: "Design & publishing", kind: "creative", status: NOT_INSPECTED },
  { name: "DeckCraft", description: "Presentation creation and slide decks", repo: "deckcraft", icon: "▥", group: "Design & publishing", kind: "creative", status: NOT_INSPECTED },
  { name: "PDFCraft", description: "PDF viewing and document workflows", repo: "pdfcraft", icon: "▧", group: "Design & publishing", kind: "creative", status: NOT_INSPECTED },
  { name: "CADCraft", description: "CAD and technical drawing", repo: "cadcraft", icon: "⌗", group: "Technical & structured work", kind: "creative", status: NOT_INSPECTED },
  { name: "GridCraft", description: "Spreadsheets and structured-data work", repo: "gridcraft", icon: "▦", group: "Technical & structured work", kind: "creative", status: NOT_INSPECTED },
];

export const SUPPORT_REPOSITORIES: RegisteredApp[] = [
  { name: "ArtCraft Services", description: "Shared services; inspect APIs, authentication and deployment", repo: "artcraft-services", icon: "⌘", group: "Services & tooling", kind: "support", status: NOT_INSPECTED },
  { name: "Craft Launcher", description: "Desktop launch and update utility", repo: "craft-launcher", icon: "↗", group: "Services & tooling", kind: "support", status: NOT_INSPECTED },
  { name: "Craft Fonts", description: "Font discovery, storage and licensing", repo: "craft-fonts", icon: "Aa", group: "Libraries & assets", kind: "support", status: NOT_INSPECTED },
  { name: "Craft Libraries", description: "Reusable libraries and components", repo: "craft-libs", icon: "⌘", group: "Libraries & assets", kind: "support", status: NOT_INSPECTED },
  { name: "Craft Repo Status App", description: "Developer diagnostics and repository health", repo: "craft-repo-status-app", icon: "◷", group: "Services & tooling", kind: "support", status: NOT_INSPECTED },
  { name: "PhotoCraft Corpus", description: "Test data and validation resource", repo: "photocraft-corpus", icon: "▤", group: "Libraries & assets", kind: "support", status: NOT_INSPECTED },
  { name: "Terraform AWS Observability Accelerator", description: "Infrastructure and observability configuration", repo: "terraform-aws-observability-accelerator", icon: "⇄", group: "Infrastructure", kind: "support", status: NOT_INSPECTED },
];

export const ALL_REPOSITORIES: RegisteredApp[] = [...CREATIVE_APPS, ...SUPPORT_REPOSITORIES];
export const AUDIT_STATUSES: AuditStatus[] = [
  "Not inspected",
  "Inspected",
  "Build attempted",
  "Build passed",
  "Smoke test passed",
  "Integration in progress",
  "Integrated and verified",
  "Blocked",
  "Unsupported in current environment",
];

export function getRepository(repo: string): RegisteredApp | undefined {
  return ALL_REPOSITORIES.find((item) => item.repo === repo);
}

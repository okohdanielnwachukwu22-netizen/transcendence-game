# Repository discovery — 15 October 2026

## Scope and method

The GitHub API confirmed that all 21 named `storytold/*` repositories exist, are public, use `main` as their default branch, and are readable by the current connection. The connection does not have push access to those upstream repositories. Root directory listings were checked for all 21; selected READMEs, Cargo manifests and automation/control documentation were read for the candidate integrations and shared components.

This is **initial repository discovery**, not a full audit of every file. No native application has been built or smoke-tested by this document. The dashboard's app statuses remain `Not inspected` until the app-specific source/build/runtime checks have actually been completed.

## Shared patterns observed

Most named creative apps are Rust workspaces with `Cargo.toml`, `Cargo.lock`, `apps/`, `crates/`, `docs/`, `ROADMAP.md`, dual MIT/Apache license files and a `NOTICE`. Their package/license status must still be checked per crate and per bundled asset; a repository-level dual-license label does not settle third-party font, image, codec, fixture or vendored-asset obligations.

## Repository inventory

| Repository | Root-tree observations | Engineering implication / next check |
|---|---|---|
| `artcraft` | Cargo workspace, `artcraft-native/`, `crates/`, `frontend/`, docs, SQLx metadata, license and notice files | Native product and backend APIs need separate review; inspect its Tauri/native entry points, build scripts and auth assumptions. |
| `photocraft` | Cargo workspace, `apps/`, `crates/`, book, examples, packaging, security and protocol docs; CLI automation crate confirmed | Best candidate for the first controlled adapter because it documents stdio MCP, separate read/write roots and a token-authenticated loopback control bridge. Must wrap it in an allowlisted local companion. |
| `artcraftx` | Cargo workspace with crates, frontend, docs and SQLx metadata; no top-level license file appeared in the root listing | Establish relationship to ArtCraft and review its licence/ownership, runtime and APIs before any integration. |
| `lightcraft` | Cargo workspace, apps/crates, packaging, Nix assets and shared-resource files | Inspect photo-library/RAW workflow, resource files and per-asset licensing. |
| `filmcraft` | Cargo workspace, apps/crates, packaging and `.mcp.json` | Review media dependencies, subprocess use, supported formats and documented automation schema. |
| `vectorcraft` | Cargo workspace, apps/crates, docs, examples, vendored code and licensing directory | MCP/headless mode appears promising, but the documented control port has no auth; do not expose it or use it as the first remote-facing pilot. |
| `cadcraft` | Cargo workspace, apps/crates, examples, packaging and license/notice files | Inspect geometry engine, import/export formats, platform support and adapter surface. |
| `wordcraft` | Cargo workspace, apps/crates, docs, packaging and license/notice files | Inspect document model, file import/export and any automation protocol. |
| `soundcraft` | Cargo workspace, apps/crates, docs, packaging and license/notice files | Inspect audio engine, media devices, formats and automation schema. |
| `pdfcraft` | Cargo workspace, apps/crates, docs, parity fixtures, vendor code and attribution files | Review the PDF engine and the provenance/licences of fixtures, vendor code and other assets. |
| `designcraft` | Cargo workspace, apps/crates, docs, assets, license/notice files | Inspect page/layout model, editable document format and export paths. |
| `effectcraft` | Cargo workspace, apps/crates, docs, examples, extensions and `.mcp.json` | Review plug-in/extension trust boundary, media dependencies and automation interface. |
| `deckcraft` | Cargo workspace, apps/crates, docs, packaging, license/notice and licences directory | Inspect slide data model, external assets and export implementation. |
| `gridcraft` | Cargo workspace, apps/crates, docs, packaging, `omastore.toml` and license/notice files | Inspect formula engine, data model, import/export and source of any add-ons. |
| `artcraft-services` | Large Rust/TypeScript monorepo with SQLx, database migrations, secrets/config-related paths and multiple provider clients | It is a separate backend with authentication, media/job APIs and billing. README describes MySQL, Redis, Elasticsearch and S3-compatible/R2 storage. Do not point it at this workspace or substitute an unrelated database without a service-specific design/security review. |
| `craft-launcher` | Rust workspace, apps/crates, platform packaging and update documentation | Launcher installs and updates application release packages. Review checksum/signature/update verification before considering it an install or update authority for the workspace. |
| `craft-fonts` | Cargo workspace, font assets and attribution file | Font resources need file-by-file licence/redistribution handling; do not assume every font shares the crate licence. |
| `craft-libs` | Rust workspace, reusable crates, vendored code, notices and a licenses directory | Pin any dependencies to exact revisions and preserve notices; bundled assets may use different licences. |
| `craft-repo-status-app` | Rust workspace, `ui/`, TypeScript package, package lock, build configuration and Tauri-oriented documentation | Its README describes a local tray/dashboard app which polls GitHub; Node.js 24+ is required for its UI build. This is developer tooling, not the main workspace shell. |
| `photocraft-corpus` | Test corpus, tools, documentation, `SHA256SUMS`, license files and notice | Treat as test data; review provenance and checksums before packaging or uploading fixtures. |
| `terraform-aws-observability-accelerator` | Terraform modules, variables, outputs, examples, test and CI configuration | Infrastructure code is out of scope for browser integration. No Terraform plan/apply or cloud provisioning without a separate explicit approval. |

## First pilot candidate: PhotoCraft

Source documents checked:
- `Cargo.toml` (workspace version 0.9.0, Rust edition 2024, declared `MIT OR Apache-2.0`)
- `apps/photocraft-cli/Cargo.toml` (the `photocraft-cli` binary)
- `crates/automation/Cargo.toml` (MCP server via `rmcp`, stdio transport)
- `book/src/automation/mcp.md` (headless and desktop-bridge transports)
- `docs/control-protocol.md` (loopback protocol and token authentication)

Documented launch paths:
- Headless: `photocraft-cli mcp --automation-read-root <folder> --automation-write-root <folder>`
- Desktop bridge: launch PhotoCraft with loopback control and a protected token file, then use `photocraft-cli mcp --bridge 127.0.0.1:<port> --control-token-file <private-file>`.

Security limitation from PhotoCraft's own MCP docs: read/write roots constrain file access, but tool schemas are not authorization boundaries and the current server does not distinguish high-impact tools or issue scoped sessions. The workspace companion therefore needs its own capability allowlist, strict path policy, origin/auth checks, confirmation for destructive actions, and a design that never exposes the native bridge to a public internet listener.

## Deployment and verification state

- React/TypeScript: **typecheck passed**; Vite production build **passed** in the connected Node 22 sandbox.
- Automated checks: **14 passed, 0 failed** (three repository registry checks, three adapter/provider/schema security checks, and six local-companion origin, pairing, file-boundary and MCP transport checks).
- Latest Vercel preview: **READY** at `https://craft-workspace-ao8t5ywj8-damien-a18e.vercel.app/`; branch alias `https://craft-workspace-git-craft-workspace-damien-a18e.vercel.app/`. The Vercel deployment still uses authentication protection. The current Vercel connector cannot obtain the protected-page bypass because its authorized scope does not include the deployment's `damien-a18e` project scope. Therefore live-browser smoke verification remains **blocked/unverified**; the READY state is not equivalent to an observed page-level smoke test.
- No build or smoke-test result is claimed for any of the 21 upstream apps.
- No Supabase schema or data was changed. A separate owner-scoped schema draft was added to the branch but was not applied. The existing Supabase project is named TRANSCENDENCE and appears unrelated to this workspace; project metadata is kept locally for now.

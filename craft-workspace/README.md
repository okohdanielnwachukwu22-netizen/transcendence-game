# Craft Workspace

A React + TypeScript workspace foundation based on the supplied Master Build Prompt.

## Working now
- Responsive workspace shell with dark/light appearance and Ctrl+K command palette.
- Home, Projects, Files, Applications, AI Workspace, Activity, Diagnostics and Settings.
- Local project create/rename/delete, activity history and repository-status tracking in browser storage.
- User-selected local file previews; browser-selected files are not automatically uploaded.
- Typed registry for all 14 creative apps and all seven shared/support repositories.
- Typed PhotoCraft local adapter plus a local companion with short-lived tab pairing, read-root confinement, MCP stdio negotiation, and an explicit read/inspect/preview allowlist.
- Typed cloud/local AI provider contract. Providers are not connected. Non-prompt content cannot be sent off-device without a provider-specific explicit-consent record.
- Draft owner-scoped Supabase schema with RLS, plus static tests; migration is not applied to any database.
- Vite + React + TypeScript build and Node built-in tests.
- Source discovery and architecture notes under docs/.

## Build and test
Use Node.js 22 or newer. Run npm install, npm run typecheck, npm run build, and npm test. Vite writes the deployable static client to dist/.

## Local PhotoCraft companion
See companion/README.md. The optional helper must be started on the PC that has PhotoCraft installed. It uses a local one-time pairing code, a short-lived session token, a configured input directory, and a strict read-only tool allowlist. It does not expose edit/save/export or an arbitrary shell endpoint. The test suite proves the transport and path/origin guards against a simulated MCP process. The actual PhotoCraft binary and real Windows UI pairing still need an end-to-end test on the target PC.

## Supabase
See supabase/README.md. The schema draft creates project, asset-metadata and activity tables with owner-bound RLS policies. It has not been applied; the currently linked TRANSCENDENCE project is unrelated and was left untouched. Asset bytes need a separately configured private storage bucket with tested policies.

## Remaining work
This is not yet the complete unified creative OS. The other native applications remain unintegrated; cloud/local AI, shared cloud assets, authentication and cross-device project sync are not connected. All 21 upstream app-specific build and smoke-test states remain unverified. Do not change a repository's audit status unless its corresponding test was actually carried out.

## Source boundary
Development is on the craft-workspace branch under the craft-workspace/ folder in the connected okohdanielnwachukwu22-netizen/transcendence-game repository. That repository is unrelated to the app, so its main branch and all storytold/* upstreams were left unchanged. A dedicated GitHub repository should replace this temporary location before collaboration or public release.

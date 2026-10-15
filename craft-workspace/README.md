# Craft Workspace

A React + TypeScript workspace foundation based on the supplied Master Build Prompt.

## Working now
- Responsive workspace shell with dark/light appearance and Ctrl+K command palette.
- Home, Projects, Files, Applications, AI Workspace, Activity, Diagnostics and Settings.
- Local project create/rename/delete, activity history and repository-status tracking in browser storage.
- User-selected local file previews; browser-selected files are not automatically uploaded.
- Typed registry for all 14 creative apps and all seven shared/support repositories.
- PhotoCraft local companion pilot source with short-lived tab pairing, read-root confinement, MCP stdio negotiation, read/inspect/preview allowlist, and Windows setup notes.
- Build/test scripts use Vite, React, TypeScript and Node's built-in test runner.
- Initial source discovery and architecture records under docs/.

## Build and test
Use Node.js 22 or newer. Run npm install, then npm run typecheck, npm run build, and npm test. Vite writes the deployable static web client to dist/.

## Local PhotoCraft companion
See companion/README.md. The optional helper must be started on the PC that has PhotoCraft installed. It uses a local one-time pairing code, a short-lived session token, a configured input directory, and a strict read-only tool allowlist. It does not expose edit/save/export or an arbitrary shell endpoint. The real Windows binary and hosted-browser pairing still need an end-to-end test on the target PC.

## Remaining work
This is not yet the complete unified creative OS. The other native applications remain unintegrated; cloud/local AI, shared cloud assets, authentication and cross-device project sync are not connected. All 21 upstream app-specific build and smoke-test states remain unverified. Do not change a repository's audit status unless the corresponding test was actually carried out.

## Source boundary
Development is on the craft-workspace branch under the craft-workspace/ folder in the connected okohdanielnwachukwu22-netizen/transcendence-game repository. That repository is unrelated to the app, so the main branch and all storytold/* upstreams were left unchanged. A dedicated GitHub repository should replace this temporary location before collaboration or public release.

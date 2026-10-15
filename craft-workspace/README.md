# Craft Workspace

A browser-first unified creative workspace shell based on the 89-page Master Build Prompt.

## Built so far

- Responsive desktop-first workspace with dark/light appearance and Ctrl+K command palette.
- Home, Projects, Files, Applications, AI Workspace, Activity, Diagnostics and Settings.
- Project creation/rename/deletion with browser-local metadata.
- User-selected file previews in the browser; no selected file is uploaded automatically.
- All 14 creative-app entries and the seven shared/support repositories from the supplied brief.
- Repository status vocabulary and source links; status dropdowns are tracking-only and do not simulate builds.
- Local-only PhotoCraft companion (separate component) with pairing, explicit read-folder path, process spawning without a shell, MCP negotiation and a read/inspect/preview allowlist. This companion is implemented but still requires target-PC end-to-end testing with an installed PhotoCraft release.
- Initial repository discovery and integration decision logs under docs/.

## Build and test

Run in this folder:

```bash
npm run build
npm test
```

The static deployment build copies `index.html`, `app.js` and `styles.css` to `dist/`. The companion tests are part of `npm test`.

## Known limits (important)

The workspace is **not yet the finished unified creative OS**. The browser page cannot launch installed apps by itself. Native app integration is limited to an optional PhotoCraft companion pilot; it exposes no editing/save/export or arbitrary command execution. The Windows helper expects Node.js and PhotoCraft to be installed and a dedicated input directory configured locally.

Cloud AI, local model routing, cross-device sync, shared asset storage, user authentication and the remaining native app adapters are not connected. No Supabase database schema was changed. Native builds and smoke tests for the 21 upstream applications are not claimed as passed.

The hosted Vercel deployment is marked READY, but browser-level verification through its protected URL was blocked by the current Vercel connection scope. It is still protected by Vercel sign-in.

## Source boundary

Work lives in the `craft-workspace/` folder on the `craft-workspace` branch of the current connected GitHub repository. The main branch is unchanged, as are all `storytold/*` upstream repositories. A clean, dedicated GitHub repository should replace this temporary branch location before collaboration or public release.

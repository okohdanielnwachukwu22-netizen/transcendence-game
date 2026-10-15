# Craft Workspace

Initial usable workspace shell from the 89-page Master Build Prompt.

## Implemented
- Responsive workspace with dark/light themes and Ctrl+K command palette
- Home, Projects, Files, Applications, AI Workspace, Activity, Diagnostics and Settings
- Project creation, rename and deletion; project metadata saved in this browser
- User-selected file preview and session-only file list; nothing is automatically uploaded
- Catalogue for all 14 creative-app repositories plus all 7 support repositories
- Repository audit tracking with the explicit status vocabulary in the prompt
- Static build and four source-registry checks

## Build and test
Run: npm run build
Run: npm test

## Not yet integrated
Native apps are not embedded or launched. The local companion, cloud/local AI, authenticated sync and persistent cloud file storage are not connected. All repository audit statuses start at Not inspected. Updating a label is only tracking; it does not run a build or prove that an application is working.

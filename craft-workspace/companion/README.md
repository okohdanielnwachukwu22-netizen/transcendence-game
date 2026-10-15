# Craft Workspace local companion — PhotoCraft pilot

This is an optional native-side helper. The hosted web page by itself cannot start a desktop application or read arbitrary local files.

## Current capability boundary

The companion binds only to \`127.0.0.1:4174\`, rejects unapproved browser origins/Host headers, requires a temporary local pairing code to mint a short-lived session token, and launches PhotoCraft via \`spawn(..., { shell: false })\`. It grants the MCP process the explicitly configured read root and, if set, write root. The workspace currently exposes only a tiny read/inspect/preview allowlist; document editing, arbitrary command execution, saving and exports are not available through this HTTP bridge.

PhotoCraft is a pilot, not yet verified end-to-end on the user's PC. The browser page cannot call the companion until it is running on that PC and the origin is on the allowlist.

## Windows setup without an IDE

1. Install PhotoCraft from its official release and keep the supplied \`photocraft-cli.exe\`. The upstream docs list the usual path as \`C:\\Program Files\\PhotoCraft\\photocraft-cli.exe\`.
2. Install Node.js 22 or newer.
3. Create two folders under your user profile: \`CraftWorkspace\\input\` and optionally \`CraftWorkspace\\output\`. Put only test images or documents you deliberately want the companion to access inside \`input\`.
4. Copy \`config.ps1.example\` to \`config.ps1\`. Open the copy with Notepad and confirm the CLI and approved read-folder paths. The write-root setting should remain unset for this pilot.
5. Right-click \`start-windows.ps1\` and run with PowerShell (or start PowerShell in this folder and run \`./start-windows.ps1\`). A random pairing code is printed in that local terminal each time the helper starts.
6. Open Craft Workspace, go to AI Workspace, choose “Check local companion”, and enter the code shown in the local terminal to pair this browser tab. The pairing token remains in this tab's session storage and expires after 30 minutes.
7. Use a relative path inside the approved \`input\` folder to open a file, then inspect it or ask for a preview. The companion rejects absolute paths, parent-folder escapes and symlinks that resolve outside the approved folder.

## Security notes

- Never put \`config.ps1\`, the pairing code or session tokens into Git, screenshots, chats, or a public deployment.
- Do not broaden the allowed-origin list to \`*\`.
- Keep any PhotoCraft control port on loopback. Do not tunnel it, reverse-proxy it, or expose it to the internet.
- The browser's file picker is not the same as the companion's approved root. Files are not uploaded by this helper.
- This first pilot intentionally has no write/edit/export action. A future write-capable adapter needs separate UI confirmation, stricter capability policy and output validation.

## Current verification

Unit tests cover origin allowlists, relative-path rejection, root-boundary checks and the fixed MCP CLI argument vector. The native PhotoCraft executable and full Windows UI pairing still require an actual smoke test on the target PC.

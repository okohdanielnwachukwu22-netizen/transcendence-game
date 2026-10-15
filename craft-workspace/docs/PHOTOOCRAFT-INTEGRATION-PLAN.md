# PhotoCraft integration plan

## Why PhotoCraft first

The source docs show a concrete CLI/MCP route for headless document work and a separate token-authenticated loopback bridge for an existing desktop window. That is a more appropriate pilot than VectorCraft's documented unauthenticated loopback control port.

## Intended architecture

Browser workspace (hosted) → explicit, paired local companion on the user's PC → local `photocraft-cli mcp` stdio process → PhotoCraft engine or the separately running desktop app.

The hosted browser must never directly launch a process or hold a privileged control token. The companion is not a generic shell proxy: it should expose a small typed set of named operations, check the local origin and pairing credential, confine each operation to an approved project folder, validate every request/response, apply timeouts and size limits, and require confirmation for destructive actions.

## Required steps before marking integration in progress

1. Confirm an installed PhotoCraft release and CLI path on the target Windows PC; the repository docs say the CLI is shipped with the Windows MSI and typically is not on PATH.
2. Design pairing and origin checks for an HTTPS-hosted UI talking to a loopback-only service, including browser private-network/CORS requirements. Fail closed if those checks cannot be satisfied.
3. Implement the companion around the official CLI/MCP protocol; do not parse untrusted free-form commands into a shell.
4. Present explicit read and write folder selection locally; do not permit arbitrary filesystem roots.
5. Register only reviewed MCP capabilities and add confirmation for destructive document, export, or overwrite actions.
6. Test against a disposable sample document. Verify output paths remain inside the permitted write root, verify the document changes through PhotoCraft's own inspect/read operations, and verify denial of an out-of-root path and a missing/invalid credential.
7. Run a Windows end-to-end smoke test with an installed release and document the exact CLI version and results.

## Current status

**Planned; not yet integrated.** The workspace contains a catalogue and source links only. No native CLI has been invoked from this project, no companion service exists yet, and no PhotoCraft operation is claimed to work through the workspace.

# Initial architecture

## Stage 1: workspace shell
A portable static app provides navigation, application discovery, projects, file-selection previews, activity and audit tracking.

## Next stages
1. Inspect all 21 repositories, licenses, manifests, build workflows and control interfaces.
2. Define typed per-application adapter contracts based on verified interfaces.
3. Select and smoke-test a real pilot integration.
4. Implement a Windows companion with secure pairing, path allowlists, origin validation and explicit permissions.
5. Add cloud/local AI routing only with configured providers, capability checks and privacy-safe fallback rules.
6. Add authenticated project synchronization and cloud asset storage only when needed.
7. Add adapter-specific integration, security and output-validation tests.

## Security
The browser never receives unrestricted OS access. AI requests must use registered capability IDs and validated schemas, never raw shell commands. Destructive file operations require confirmation. Private files are not uploaded automatically.

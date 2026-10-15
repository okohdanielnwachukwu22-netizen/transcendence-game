# Craft Workspace architecture

## Frontend
- React + TypeScript, built by Vite.
- Typed domain model and registry for 21 upstream repositories.
- Browser local storage for project/activity/status metadata in this first milestone.
- File picker access is explicit; there is no general browser filesystem API.
- Each upstream creative app uses its own adapter contract only after its protocol and failure modes are verified.

## Native companion
The optional Node.js companion runs on the user PC and binds only to loopback. It validates Host and browser origin, issues a short-lived tab pairing token after a one-time local code, constrains operations to a configured read root, starts PhotoCraft with shell execution disabled, and exposes only named read/inspect/preview operations. The companion's tests use an isolated fake MCP CLI; this proves the transport and local guards, not that a real PhotoCraft installation is available.

## Security boundaries
- No arbitrary shell endpoint in the web app or companion HTTP API.
- No unrestricted browser filesystem access.
- No secrets in the static client.
- No automatic upload of private files and no automatic cloud/local AI fallback.
- Destructive file operations will require separate typed capabilities and confirmation.
- Cloud resource provisioning is not part of the build.

## Later stages
1. Complete each application's source, license, manifest, build and runtime audit.
2. Define and test adapters from each upstream's actual supported automation contracts.
3. Run a real PhotoCraft smoke test on a Windows PC and verify output with the native app.
4. Add separately authenticated cloud/local AI provider adapters with explicit privacy routes.
5. Design owner-based Supabase persistence and RLS only after the account/project choice and schema review; the existing TRANSCENDENCE project was left untouched.
6. Add shared asset metadata/storage, user authentication and sync when approved.
7. Replace the temporary repository folder location with a dedicated Craft Workspace repository.

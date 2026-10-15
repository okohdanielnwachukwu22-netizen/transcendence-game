# Craft Workspace — repository audit baseline

This is a tracking register, not proof of completed source reviews or builds. All entries begin at Not inspected.

## 14 creative applications
| Repository | Initial status | Verification focus |
|---|---|---|
| artcraft | Not inspected | README, license, manifests, runtime, APIs |
| photocraft | Not inspected | Rust build, CLI/JSON/MCP schemas, Windows smoke test |
| artcraftx | Not inspected | Relationship to ArtCraft and dependencies |
| lightcraft | Not inspected | Photo library and RAW runtime |
| filmcraft | Not inspected | Video pipeline and supported formats |
| vectorcraft | Not inspected | Rust/WASM build, document operations, automation |
| cadcraft | Not inspected | CAD engine, formats, platform support |
| wordcraft | Not inspected | Document editing and import/export |
| soundcraft | Not inspected | Audio engine and export |
| pdfcraft | Not inspected | PDF capabilities and license |
| designcraft | Not inspected | Layout and publishing model |
| effectcraft | Not inspected | Composition model and runtime |
| deckcraft | Not inspected | Slide model and export |
| gridcraft | Not inspected | Data/formula model and export |

## 7 shared/support repositories
| Repository | Initial status | Verification focus |
|---|---|---|
| artcraft-services | Not inspected | Auth, storage, APIs, security, deployment |
| craft-launcher | Not inspected | Launcher/update trust model |
| craft-fonts | Not inspected | Font licensing and discovery |
| craft-libs | Not inspected | Shared APIs and license notices |
| craft-repo-status-app | Not inspected | Diagnostics value and interface |
| photocraft-corpus | Not inspected | Dataset provenance and license |
| terraform-aws-observability-accelerator | Not inspected | Infrastructure modules; no auto-provisioning |

## Pilot candidates
PhotoCraft and VectorCraft are candidates to study because their public documentation describes automation interfaces. This is not a claim that either integration is working. Verify source, build, Windows/runtime requirements and a real input/output smoke test before claiming integration.

## Security gates
No arbitrary shell API, no unrestricted browser filesystem access, no API secrets in frontend code, no automatic upload of private files, and no cloud provisioning without authorization. Preserve native project formats.

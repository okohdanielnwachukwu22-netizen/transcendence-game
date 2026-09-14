# TRANSCENDENCE Research Playbook

This project studies public game repositories for patterns, not copied code or protected game assets.

## Patterns adopted

### NJ MMO
- Server-authoritative gameplay: movement, combat, XP and drops belong to the simulation, not the browser.
- Shared game-core contracts between client and server.
- Deterministic seeded randomness and layered tests.

### Eidolon
- Clean client/server separation.
- Persistent progression, reconnect/session resume and full/delta replication as the long-term network target.

### Aetheria
- Browser-first 3D MMO with procedural geometry.
- Mobile controls, chunked world design, bots for development population, and server-owned gameplay state.

### Veilspire
- Runtime-generated world content, day/night, weather, touch controls, map markers and lock-on style combat are useful targets for a low-bandwidth browser game.

### Sanctuary's End
- Procedural dungeons, loot rarity, item affixes, skill progression, auto-save and optional co-op show how much can fit in a static browser client.

### DarkVell / OpenMMO / SCP3008
- Browser MMO/social patterns, agent-human parity, realtime WebSockets, procedural survival spaces and day/night danger escalation provide additional design references.

## TRANSCENDENCE rule
We borrow architectural ideas and high-level mechanics only. No third-party code, art, music, characters, lore, maps or proprietary data are copied into this project.

## Our deliberate twist
TRANSCENDENCE combines these ideas with a persistent multiverse where worlds can branch, missions can become permanently unavailable, high-stage beings can alter routes, and a player's role can diverge from the nominal hero path.
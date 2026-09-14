# Web RPG benchmark research

Research used for architecture, not for copying implementation or game content.

## NJ MMO
A browser MMORPG built with Three.js + Colyseus, with an Nx monorepo, shared game-core rules, authoritative server simulation, persistence, deterministic tests, NPCs, quests, inventory, party/social systems and a large explorable world.

Reference: https://github.com/tech-leads-club/nj-mmo

Useful lesson for TRANSCENDENCE: keep gameplay rules in a shared/core layer, make the server authoritative for outcomes, and build roadmap phases that end in runnable slices.

## Orbital Breach
A browser multiplayer game using Three.js + Colyseus with `client/`, `server/`, `shared/` and `tests/`, plus room lifecycle, authoritative state, matchmaking/rooms, mobile controls and online reconciliation.

Reference: https://github.com/DotanVG/Orbital-Breach

Useful lesson for TRANSCENDENCE: separate rendering from simulation/network contracts and keep multiplayer-specific behavior testable.

## Aetheria
A browser MMORPG using TypeScript, Three.js and Colyseus with procedural content, mobile support, chunk-based world generation, combat, survival, crafting, pets, housing, guilds and PvP.

Reference: https://github.com/mositron/Aetheria

Useful lesson for TRANSCENDENCE: procedural world systems are practical for a browser MMO and can reduce dependence on a giant downloaded asset set.

## Eidolon
A browser action-RPG MMO using Three.js with an authoritative backend, WebSockets, persistent player/social data, reconnect/session handling and a separated client/server protocol.

Reference: https://github.com/aeml/eidolon

Useful lesson for TRANSCENDENCE: long-term multiplayer reliability needs explicit session/reconnect design and canonical server state.

## TRANSCENDENCE conclusion
We will combine these proven patterns with TRANSCENDENCE's distinct design: randomized multiverse starts, multiple intelligent races, emergent missions, permanent consequences, higher-stage authorities/titles, world/universe/dimension travel, and player roles that do not require becoming Damien.

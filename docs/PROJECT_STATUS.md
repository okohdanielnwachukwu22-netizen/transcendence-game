# TRANSCENDENCE Project Status

## Current state

TRANSCENDENCE is a browser-first multiplayer 3D action RPG prototype. The repository is the source of truth for the web client and technical documentation.

## Implemented foundation

- Responsive browser shell for desktop and mobile screens.
- Lightweight Three.js 3D scene designed to remain usable on low-power hardware.
- Third-person-style camera follow and WASD movement.
- System/status interface.
- Mission log with a branching choice event.
- XP and level progression foundation.
- Local persistence for the prototype.
- Settings foundation.

## Architecture direction

- GitHub: source control and engineering history.
- Supabase: authentication, persistence, world data, realtime services.
- Netlify: web delivery.
- Three.js: current lightweight browser 3D client.
- Godot: retained as a future native/advanced 3D client path.

## Build order

1. Core client and data contracts
2. Supabase authentication and persistence
3. Combat and enemy AI
4. NPC interaction and consequences
5. Dungeons and boss encounters
6. Multiplayer sessions and server authority
7. Economy, inventory, equipment and crafting
8. Dynamic world events and factions
9. Transfer Points and world travel
10. Multiverse simulation
11. Godhood and authority systems
12. Transcendence and unknown endgame systems

## Non-negotiable design rules

- Damien Dane is the intended hero of the narrative, but multiplayer players are not forced to become Damien or follow his exact path.
- Players may follow heroic, neutral, selfish, villainous, support, explorer, strategist, merchant, ruler and other paths.
- The game world must preserve uncertainty: missions can branch, fail permanently, disappear, or become altered by powerful entities and player choices.
- Dungeons, halls, encounters and events may contain positive, negative or unexpected outcomes.
- Demigod progression can reach level 999. Godhood and higher replace normal leveling with named ranks/authorities.
- Every major system must be modular enough to expand without rewriting unrelated systems.
- Do not expose secrets, service-role keys, or private credentials in client code.

This file is intentionally a living project document and should be updated as the architecture becomes concrete.

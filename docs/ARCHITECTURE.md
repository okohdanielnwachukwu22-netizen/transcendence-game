# TRANSCENDENCE Architecture

## Product direction
TRANSCENDENCE is a browser-first multiplayer 3D action RPG combining fighting, survival/horror, strategy, adventure, missions, exploration and consequential decisions. The world is a vast multiverse, not an Earth-centered campaign. Players can begin on different worlds, races and circumstances. Damien Dane is the intended canonical hero path, but multiplayer players are not required to become Damien, a hero, a god, or a transcendent being.

## Core design rules
- Progression evolves from mortal through increasingly rare stages toward Demigod (level cap 999), God and higher realms.
- God and above use named ranks/realms instead of ordinary level numbers.
- Higher beings can travel across worlds/universes and eventually dimensions; transfer points become discoverable during mid progression.
- High-level entities can influence, delay, interrupt or redirect journeys.
- Missions can fail permanently and consequences persist.
- Dungeons/halls have variable outcomes, team requirements and boss conditions.
- Gods can be killed, but doing so is extraordinarily difficult below appropriate power.
- Gods and higher beings can disappear through exploration, conflict or unknown phenomena.
- Multiple intelligent races have distinct cultures, abilities, histories and progression conditions.
- Some places, titles, entities, dimensions and mechanics remain unknown until discovered.
- Choices can be heroic, neutral, selfish, harmful or opportunistic.
- Modern weapons and technology coexist with supernatural progression.
- Random world events can create temporary cooperative missions.

## Technical architecture
- Client: lightweight WebGL/Three.js first, designed for desktop and mobile browsers.
- Backend: Supabase for Auth, PostgreSQL persistence, Realtime and server-side validation/functions.
- Source control: GitHub.
- Hosting: Netlify.
- Native 3D path: Godot remains a future client option; web architecture should avoid locking game rules into one engine.

## Development strategy
Build vertical slices that are playable and testable. Never pretend a subsystem is complete until it has a working integration test or playable flow. Keep game rules server-authoritative for multiplayer. Treat randomness as seeded/auditable where fairness matters. Keep narrative data separate from executable game logic so the multiverse can expand without rewriting core systems.

## First vertical slice
Spawn -> movement -> camera -> System UI -> mission -> consequential choice -> persistent save -> progression -> world reaction. Next: combat -> enemy AI -> NPCs -> dungeon -> boss -> multiplayer session -> transfer point.

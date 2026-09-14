# TRANSCENDENCE networking plan

## Stage 1: browser realtime presence

The current web build uses Supabase Realtime Presence to prove that multiple players can occupy the same world channel. Presence is intentionally non-authoritative: it is a visualization and transport foundation.

## Stage 2: authoritative simulation

Move movement, combat, XP, drops, mission transitions and irreversible consequences into an authoritative realtime game server. The browser sends intent; the server validates and broadcasts canonical state.

Candidate runtime: Colyseus/Node or a dedicated realtime service. Supabase remains the persistent account/world data layer.

## Stage 3: persistence and reconnect

Persist canonical character state, mission state, inventory, titles, world progress and session checkpoints in Supabase. Reconnect resumes from server state rather than trusting browser local storage.

## Stage 4: scale

Introduce world shards/rooms, transfer points, region routing, interest management, delta state, server tick budgets and observability. Higher-scale infrastructure should be selected only after the gameplay loop is proven.

## Non-negotiable rule

Never trust the client for game outcomes. Client prediction may make controls feel responsive, but the canonical result belongs to the server.

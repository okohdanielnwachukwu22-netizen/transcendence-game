# TRANSCENDENCE Visual Direction

## Target
A premium stylized 3D action-RPG look: expressive humanoids, readable silhouettes, strong animation, atmospheric environments, polished lighting and cinematic presentation. Do not use primitive capsules or spheres as final characters.

## Character standard
Use rigged GLTF/GLB humanoids with skeletal animation. Required baseline clips: idle, walk, run, sprint, jump, fall, light attack, heavy attack, dodge, hit reaction, stagger and death. Character controllers must support camera-relative movement and animation state transitions.

## Camera
Third-person follow camera with smooth acceleration, orbit, zoom, collision-aware distance, action framing, optional target lock and cinematic boss framing.

## World
Procedural or modular terrain with elevation, paths, vegetation, rocks, ruins, settlements, caves, distant landmarks and biome-specific atmosphere. World composition should create a sense of place before combat begins.

## Lighting and atmosphere
Dynamic sky, time of day, fog, soft shadows, emissive points of interest, weather states and restrained post-processing. Maintain readable silhouettes on low and mid-range hardware.

## Combat presentation
Attack wind-up, contact frame, hit stop, impact VFX, directional hit reaction, enemy telegraphs, stagger windows, dodge timing and boss phases. UI should communicate danger without covering the world.

## Performance target
Desktop first, with a mobile performance mode. Cap pixel ratio, stream or instanced distant decoration, pool transient effects, avoid unbounded entity creation, and degrade shadows/VFX before reducing gameplay fidelity.

## Asset provenance
Prefer CC0 assets or original/procedural work. External inspirations may guide architecture and quality but their source code, branded characters, maps, stories, and proprietary assets must not be copied. Quaternius Universal Base Characters and Universal Animation Library are useful CC0 references; license/provenance must remain documented before redistributing any downloaded asset.
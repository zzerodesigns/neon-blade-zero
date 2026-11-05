# neon blade: engine architecture
**Engine State for: v49.5.0 ("Universal Sliding Mechanics")**

> **ATTENTION FUTURE AGENTS:** This document is the absolute source of truth for the Neon Blade engine. Read this before modifying core systems. The core project is a strict **single-file application** (`index.html`) served via a minimalist **Vite** pipeline. Do not create external scripts or stylesheets.

## 1. The Golden Rules (Engine Philosophy)
*   **Zero-Allocation Architecture:** The engine is built to eliminate garbage collection spikes during high-frequency gameplay. Never use `new THREE.Vector3()`, `new Object()`, or array mapping inside `animate()`, the physics step, or the AI update loop. 
    *   **Global Scratchpads:** All spatial and mathematical operations must utilize pre-allocated global variables (e.g., `_aiDir`, `_aiTemp`, `_vec3_1`, `_pTemp`, `_scratchVec1`, `_scratchVec2`).
*   **Coordinate System:** 1 unit = 1 meter. Y is UP. The `SpatialHashGrid` operates strictly on the 2D X/Z plane. Do not write 3D physics checks for the 2D grid.
*   **Single-File Integrity:** All HTML, CSS, shaders, and game logic live exclusively in `index.html`. The `package.json` and `vite.config.ts` files exist solely to provide a local development server and standard build process. Agents are strictly forbidden from adding any unnecessary configuration files, clutter, or metadata files (including `metadata.json`). Keep the workspace clean and uncluttered.

## 2. Core Systems & Data Flow

### A. Boot & Configuration (`BOOT_SETTINGS`, `CONFIG`, Preferences)
*   `BOOT_SETTINGS`: Centralized initialization registry specifying app version, release notices, default loadouts, and map presets, hydrating UI elements synchronously under `#ui-layer`.
*   `localStorage` Persistence (`nb_settings_v1`): Automatically preserves visual themes, active arena, movement mode, and custom keybindings across browser sessions.
*   `CONFIG`: Master runtime control object containing physical parameters (speed, damage, friction, energy consumption, gadget kinetics, Blaze passive multipliers).
*   **Data Flow:** `BOOT_SETTINGS` -> Initial DOM hydration & `localStorage` restore -> `CONFIG` -> Player, Enemy, Autoplay, and Projectile systems.

### B. Map & Scene Management (`MapManager`, `LevelBuilder`, `MovingPlatform`)
*   `MapManager`: Orchestrates state transitions across all 12 playable arenas categorized into 5 master map groups:
    *   **GYM:** Classic Gym (`GYM`) and Advanced Physics Facility (`MEGA_GYM`).
    *   **ARENA:** Coliseum (`ARENA`), Centrifugal Parkour (`ARENA_EX`), Dual Fortress (`CITADELS`), and Rolling Glacial Hills (`HIGHLANDS`).
    *   **MACHINA:** Industrial Kinetic Machine Arena (`MACHINA`).
    *   **TITAN:** Open Battlefield (`TITAN`) and Traversal Coliseum (`TITAN_EX`).
    *   **MAZE:** 2D Neon Labyrinth (`MAZE`), 5-story cubic grid (`3D_MAZE`), and Colossal Mega-Maze (`LABYRINTH`).
*   `LevelBuilder`: Procedural geometry factory generating terrain, perimeter boundaries, rotationally symmetric jump pads and portals ($P_{\text{North}} = (X, Y, Z) \implies P_{\text{South}} = (-X, Y, -Z)$), and polyhedral obstacle blocks (Rhombic Dodecahedra, Octahedra, Tetrahedra).
*   `MovingPlatform`: Kinematic platform engine executing oscillating linear elevators, rotating central hubs, and pendulum sweeps with real-time dynamic matrix, OBB, and SAT collision updates.
*   **Data Flow:** `MapManager.switch()` -> `LevelBuilder.build()` -> Populates `SpatialHashGrid`, `MovingPlatform` arrays, and entity registries.

### C. Physics & Collision (`SpatialHashGrid`, `physicsStep`, Universal Sliding)
Custom kinematic physics engine operating with zero external physics library dependencies.
*   `SpatialHashGrid`: A 2D (X/Z) grid using integer keys for zero-allocation spatial queries. The performance backbone for environmental collision detection.
*   `physicsStep`: Core movement, gravity, surface resolution, and momentum integration in `PlayerController` and `Enemy`.
*   **Separating Axis Theorem (SAT):** Resolves Oriented Bounding Box (OBB) collisions for rotated crates, sloped ramps, velodrome banks, hollow cylinders, moving platforms, and polyhedra.
*   **Continuous Collision Detection (CCD):** Swept collision checks eliminate tunneling during high-velocity player-bot contacts and thin geometry penetrations.
*   **Universal Sliding Mechanics:**
    *   *Universal Momentum Conservation:* Preserves tangent velocity and kinetic energy seamlessly when transitioning across floors, slopes, walls, ceilings, and open air without artificial velocity zeroing.
    *   *Dynamic Slope Traversal:* Downhill slopes apply tangential gravitational acceleration for exponential speed building; uphill slides convert kinetic energy into climbing momentum with proportional friction decay.
    *   *Sub-step Ground Snapping:* Ground probes secure players to steep declines, preventing micro-bounces and airborne detachment at high velocities.
    *   *Lateral Wall & Ceiling Dynamics:* Sliding into vertical surfaces engages dynamic wall contact with a 30% gravity reduction for horizontal wall-runs and vertical climbs. Inverted surface normals redirect momentum along ceilings and angled overhangs.
    *   *Aerial Slide Buffer:* Launching off ramps or platforms preserves crouched posture and surface velocity in mid-air, producing natural parabolic flight arcs that seamlessly transition back into ground slides upon touchdown.
*   **Motion Stabilization (`dtHistory`):** Uses a 4-sample rolling frame-delta buffer to eliminate high-speed translation judder and camera micro-stutters.
*   **Unified Rigid-Body Ragdoll Physics:** Both player and enemy bots utilize an 8-vertex impulse-based rigid-body ragdoll simulation upon death. Accurately calibrated 1.8m height box (0.9m center offset) prevents subterranean clipping. Integrates gravity, 3D angular torque, floor contact impulses, exponential ground drag, and an `isNaturallyStill` kinetic dampening gate to achieve stable resting on terrain.
*   **Data Flow:** Entities query `SpatialHashGrid` and `MovingPlatform` instances; players and bots exchange physical momentum directly upon contact.

### D. Player & Input (`PlayerController`, `InputManager`)
*   `InputManager`: Captures raw keyboard/mouse events and mouse movement delta vectors.
*   `PlayerController`: Central player entity driving velocity, jumps, slashes, wall movement, sliding, and abilities.
*   **Procedural Character Kinematics & Posture:** Dynamic avatar kinematics featuring speed-adaptive sprint diving, strafe banking, jump-crouch anticipation, and smooth lean transitions (`animLerpRate`).
*   **Universal Dynamic Camera Tilt & FOV Warping:** Procedural camera roll based on surface normals during slide, wall-run, and wall-slide maneuvers, accompanied by speed-adaptive FOV dilation (80° to 95°).
*   **Third-Person Action Camera System:** Over-the-shoulder perspective (2.8m camera distance, 1.0m height offset, 0.15m right offset) operating via post-physics camera decoupling. Executes obstruction-tracing raycasts (`cameraRaycaster`) from player center of mass to pull camera forward when walls intervene, restoring true physical camera coordinates post-render.
*   **Holographic Player Avatar & Theme Shaders:** Renders the player mannequin in third-person view using a custom GLSL shader (`playerGlowMat`), generating theme-adaptive outer silhouette edge glows, directional scanlines, and Fresnel rim lighting.
*   **Death Input Suppression & Interactive Breakout:** Strict `isDead` state guards suppress slashes, jumps, teleports, and gadget aiming during death, with an interactive prompt ("PRESS ANY KEY TO CONTINUE") allowing instant respawn breakout after 5 seconds.

### E. Neural Override System (`AutoplaySystem`)
A high-performance autonomous agent that simulates pro-player movement and combat decisions.
*   **Intention Scoring Framework:** Evaluates competing priorities (`ESCAPE`, `ENGAGE`, `HUNT`, `EXPLORE`) based on health ratios, energy levels, and combat momentum.
*   **Neural Momentum:** Dynamic state variable increased by successful slashes and kills, enhancing aggression biases and tracking precision.
*   **Spatial Awareness:** Uses forward and downward raycasting (`checkGapForward`, `checkWallForward`) to navigate vertical geometry, jump over voids, and execute tactical wall-slides.
*   **Data Flow:** Consumes `PlayerController` state -> Evaluates Intentions -> Simulates `InputManager` keys -> Drives camera rotations and movement execution.

### F. AI System & EchoBot (`Enemy`, `EchoBot`)
Manages bot behavior via a state machine (`ROAM`, `AGGRO`, `SEARCH`).
*   **Scoped Virtual Context Manager (`EchoBot`):** Executes rival player AI using a virtual context wrapper (`scope()`) that redirects camera, input, and player targets, enabling EchoBots to execute high-speed player mechanics (wall-sprinting, blink teleports, gadget aiming, and melee slashes).
*   **Score Siphoning:** EchoBots steal accumulated player points upon scoring fatalities, which can be fully reclaimed upon defeating them.
*   **Logic LOD (Level of Detail):** Distance-based update throttling reduces AI logic frequency for distant entities while keeping physics integration active.
*   **Data Flow:** Enemies react to `PlayerController` position and query `SpatialHashGrid` for pathfinding and wall collision.

### G. Tactile Gadget System (`Projectile` & Loadout)
A high-fidelity ballistic and kinetic system with dynamically selectable loadouts (`FRAG`, `VOID`, `IMPULSE`, `STASIS`).
*   **Loadout UI:** Managed via a customizable modal in the pause menu allowing arbitrary gadget mapping to `F`, `R`, and `E` keys, with active `Tab` cycle controls during combat.
*   **Kinetic Interaction:** Implements reciprocal impulse and momentum transfer. Players and bots can physically kick or shove rolling grenades, flying projectiles scatter on mutual impact, and thrown grenades bounce realistically off live entities.
*   **Recursive Attachment:** Sticky gadget types (`VOID`, `STASIS`) use dynamic target-radius offset tracking to attach flush to terrain, enemies, players, or other moving projectiles.
*   **Temporal Dilation (`STASIS`):** Modulates the local delta time parameter (`timeScale`) for entities and projectiles inside the field, slowing physical simulation while maintaining full rendering frame rates.
*   **Damage Classification & Blaze Synergy:** Explosive blast damage from grenades passes as physical shockwave force (`isFire = false`), allowing explosions to deal damage regardless of Blaze passive status, while preserving death protection against pure fire contact and burn ticks. Dead bot burn status timers synchronize automatically with the 5.0-second corpse fade duration.
*   **Data Flow:** Player/EchoBot input -> Spawns projectile -> Updates trajectory & world/entity interactions -> Triggers audio/visual spawners -> Applies forces and damage falloff to nearby targets.

### H. Visual Engine (Hybrid Object Pools & GPU Shaders)
Performance-critical rendering architecture built with pre-allocated pools to ensure zero runtime memory allocation.
*   **Fixed Pools:** `_particlePool`, `_trailPool`, `_ripplePool`, `_slashPool`, `_snowPool`, and `_leafPool` provide reusable mesh/sprite instances.
*   **Procedural GLSL Shaders:**
    *   *Skyboxes:* Camera-tracking sphere (`850m` radius) running dynamic horizon and celestial shaders tailored to each theme (cosmic nebulas, synthwave wireframe suns, dawn clouds, gnarled silhouettes).
    *   *Triplanar Surfaces:* World-coordinate mapped shaders for floors and walls preventing texture stretching, seam gaps, and mirroring.
    *   *Scale-Invariant Obstacles:* Local-dimension decorator shaders maintaining a constant border edge glow width regardless of scale or orientation.
    *   *Procedural 3D Crescent Slashes:* Procedural 3D crescent moon ribbon geometries with sinusoidal width tapering, GPU arc-fading shaders, radial edge glow, and 7 randomized attack slant angles (`useDiverseSlashAngles`).
    *   *Tech-Glass & Avatar Shaders:* Four-pass tech glass materials (`glassBorderMat`, `glassFresnelMat`, `glassEnergyMat`, `glassTintedMat`) and theme-adaptive holographic character shaders (`playerGlowMat`).
    *   *Aerodynamic Continuum Particles:* High-performance billboarded foliage and snow particles governed by continuous aerodynamic energy math ($E \in [0.0, 1.0]$), synthesizing tranquil drifting with dynamic glider swoops and spatial 3D wind sampling.

### I. Audio Engine (`AudioSys`)
Fully procedural spatial sound synthesizer utilizing the Web Audio API. Zero external audio file overhead.
*   **Dynamic Sound Synthesis:** Synthesizes slashes, misses, heavy impacts, mechanical teleports, stasis fields, explosions, interface tones, and low-health heartbeats in real time with distance-based attenuation.
*   **Data Flow:** Global audio service invoked directly by combat, movement, and UI events.

## 3. The Main Loop (`animate()`)
The core execution sequence executed every frame:
1. Uniform Updates (`globalTimeUniform`, `globalBrightnessUniform`)
2. Frame-Delta Stabilization (`dtHistory` buffer updates)
3. Neural Override Logic & Autoplay Evaluation
4. Player Controller Update & Physics Step (Universal Sliding, SAT/CCD Resolution)
5. Kinematic Moving Platform Step (`MovingPlatform.updateAll()`)
6. World & Map Updates (Stasis Fields, Portals, Jump Pads, Projectiles, Enemies, Weather)
7. Visual Particle & Trail Pool Updates (Particles, Ripples, Crescent Slashes, Foliage Continuum)
8. Third-Person Action Camera Matrix Offsetting & Raycast Obstruction Handling
9. Minimap Rendering Pass
10. WebGL Scene Render (`renderer.render(scene, camera)`)
11. Post-Render Camera Physical State Restoration (Restores physical eye coordinates for the next physics step)
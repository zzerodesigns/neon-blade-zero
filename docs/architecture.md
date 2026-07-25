# neon blade: engine architecture
**Engine State for: v48.8.8**

> **ATTENTION FUTURE AGENTS:** This document is the absolute source of truth for the Neon Blade engine. Read this before modifying core systems. The project is a strict **single-file application** (`index.html`). Do not create external scripts or stylesheets.

## 1. The Golden Rules (Engine Philosophy)
*   **Zero-Allocation Architecture:** The engine is built to eliminate garbage collection spikes during high-frequency gameplay. Never use `new THREE.Vector3()`, `new Object()`, or array mapping inside `animate()`, the physics step, or the AI update loop. 
    *   **Global Scratchpads:** All spatial and mathematical operations must utilize pre-allocated global variables (e.g., `_aiDir`, `_aiTemp`, `_vec3_1`, `_pTemp`, `_scratchVec1`, `_scratchVec2`).
*   **Coordinate System:** 1 unit = 1 meter. Y is UP. The `SpatialHashGrid` operates strictly on the 2D X/Z plane. Do not write 3D physics checks for the 2D grid.
*   **Single-File Integrity:** All HTML, CSS, shaders, and game logic live exclusively in `index.html`.

## 2. Core Systems & Data Flow

### A. Configuration (`CONFIG`)
The master control object containing all "magic numbers" (speed, damage, friction, energy costs, gadget physics, and Blaze passive status multipliers).
*   **Data Flow:** Read by Player, Enemy, Autoplay, and Projectile classes. Tune game feel and balance parameters here first.

### B. Map & Scene Management (`MapManager`, `LevelBuilder`)
*   `MapManager`: Handles high-level map state transitions across standard arenas (`ARENA`, `TITAN`), mazes (`MAZE`, `LABYRINTH`, `3D_MAZE`), experimental environments (`GYM`), and high-speed traversal variants (`ARENA_EX`, `TITAN_EX`), preserving player physics and lock states across transitions.
*   `LevelBuilder`: Procedural geometry factory generating terrain, perimeter boundaries, jump pads, portals, and obstacle boxes.
*   **Experimental Traversal Maps (`ARENA_EX`, `TITAN_EX`):** Feature high-speed architectural structures engineered specifically for momentum physics and wall-running, including sloped centrifugal vaulting rings, an ascending spiral parkour staircase climbing over 100 units, and a 100% flush, dual-track parallel spiral wall-run structure using oriented bounding boxes.
*   **Data Flow:** `MapManager.switch()` -> `LevelBuilder.build()` -> Populates `SpatialHashGrid` and entity arrays.

### C. Physics & Collision (`SpatialHashGrid`, `physicsStep`)
Custom kinematic physics engine operating with zero external physics library dependencies.
*   `SpatialHashGrid`: A 2D (X/Z) grid using integer keys for zero-allocation spatial queries. The performance backbone for environmental collision detection.
*   `physicsStep`: Core movement, gravity, and surface collision resolution inside `PlayerController` and `Enemy`.
*   **Separating Axis Theorem (SAT):** Handles Oriented Bounding Box (OBB) collisions for rotated crates, sloped ramps, velodrome banks, and cylindrical central hubs.
*   **Continuous Collision Detection (CCD):** Swept-segment collision math prevents tunneling during high-velocity player-bot impacts, executing mass-balanced positional separation and kinetic momentum exchange.
*   **Surface Mobility & Jump Resets:** Wall-sliding and wall-sprinting lock the player to vertical or ceiling geometry via surface-normal snapping. Multi-jumps reset strictly upon touching the floor or triggering a wall-slide or wall-sprinting action.
*   **Unified Rigid-Body Ragdoll Physics:** Both player and enemy bots utilize an 8-vertex impulse-based rigid-body ragdoll simulation upon death or stun states. The player ragdoll collision volume uses an accurately calibrated 1.8m height box (0.9m center offset) to prevent underground clipping. Simulations integrate gravity, 3D angular velocity, floor contact impulses, and exponential ground drag, locking into a resting state via an `isNaturallyStill` threshold check.
*   **Data Flow:** Entities query `SpatialHashGrid` for terrain; players and bots exchange physical momentum directly upon contact.

### D. Player & Input (`PlayerController`, `InputManager`)
*   `InputManager`: Captures raw keyboard/mouse events and mouse movement delta vectors.
*   `PlayerController`: The central player entity. Consumes input to drive velocity, jumps, slashes, wall movement, and gadget deployment.
*   **Universal Dynamic Camera Tilt:** Procedural camera roll based on surface normals during slide, wall-run, and wall-slide maneuvers.
*   **Third-Person Action Camera System:** Over-the-shoulder perspective (2.8m camera distance, 1.0m height offset, 0.15m right offset) operating via post-physics camera decoupling. Executes obstruction-tracing raycasts (`cameraRaycaster`) from the player's center of mass to pull the camera forward when walls intervene, restoring true physical camera coordinates post-render.
*   **Holographic Player Avatar & Theme Shaders:** Renders a dedicated player character model in third-person view using a custom GLSL shader (`playerGlowMat`). The shader calculates local face coordinates and normals to generate theme-adaptive outer silhouette edge glows, directional scanlines, and Fresnel rim lighting (frosted ice in Light, stealth outlines in Dark, dual-tone digital scanlines in Neon, flickering pumpkin waves in Halloween).
*   **Death Input Suppression & Interactive Breakout:** Action input methods (`onJumpInput`, `onAttackInput`, `onSecondaryInput`, `onTeleportInput`, `beginAim`) enforce strict `isDead` state guards. Features a 10-second death sequence that displays an interactive prompt ("PRESS ANY KEY TO CONTINUE") after 5 seconds, enabling immediate manual respawn. The camera seamlessly orbits the ragdoll center of mass in third-person or aligns to the eye level of the tumbling model in first-person.

### E. Neural Override System (`AutoplaySystem`)
A high-performance autonomous agent that simulates pro-player movement and combat decisions.
*   **Intention Scoring Framework:** A decision-making framework evaluating competing priorities (`ESCAPE`, `ENGAGE`, `HUNT`, `EXPLORE`) based on health ratios, energy levels, and combat momentum.
*   **Neural Momentum:** A dynamic state variable increased by successful slashes and kills, enhancing aggression biases and tracking precision.
*   **Spatial Awareness:** Uses forward and downward raycasting (`checkGapForward`, `checkWallForward`) to navigate complex vertical geometry, clear voids, and execute tactical wall-slides.
*   **Data Flow:** Consumes `PlayerController` state -> Evaluates Intentions -> Simulates `InputManager` keys -> Drives camera rotations and movement execution.

### F. AI System & EchoBot (`Enemy`, `EchoBot`)
Manages bot behavior via a state machine (`ROAM`, `AGGRO`, `SEARCH`).
*   **Scoped Virtual Context Manager (`EchoBot`):** Executes rival player AI using a virtual context wrapper (`scope()`) that redirects camera, input, and player targets, enabling EchoBots to execute high-speed player mechanics (wall-sprinting, blink teleports, gadget aiming, and melee slashes).
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
    *   *Procedural 3D Crescent Slashes:* Procedural 3D crescent moon ribbon geometries with sinusoidal width tapering, GPU arc-fading shaders (bright across 80% of arc, tapering at tips), radial edge glow, and 7 randomized attack slant angles (`useDiverseSlashAngles`).
    *   *Tech-Glass & Avatar Shaders:* Four-pass tech glass materials (`glassBorderMat`, `glassFresnelMat`, `glassEnergyMat`, `glassTintedMat`) and theme-adaptive holographic character shaders (`playerGlowMat`).
    *   *Billboarded Snow Particles:* High-performance sprite weather particles with 3D sine/cosine sway math and screen-space flutter rotations.

### I. Audio Engine (`AudioSys`)
Fully procedural spatial sound synthesizer utilizing the Web Audio API. Zero external audio file overhead.
*   **Dynamic Sound Synthesis:** Synthesizes slashes, misses, heavy impacts, mechanical teleports, stasis fields, explosions, interface tones, and low-health heartbeats in real time with distance-based attenuation.
*   **Data Flow:** Global audio service invoked directly by combat, movement, and UI events.

## 3. The Main Loop (`animate()`)
The core execution sequence executed every frame:
1. Uniform Updates (`globalTimeUniform`, `globalBrightnessUniform`)
2. Neural Override Logic & Autoplay Evaluation
3. Player Controller Update & Physics Step
4. World & Map Updates (Stasis Fields, Portals, Jump Pads, Projectiles, Enemies, Weather)
5. Visual Particle & Trail Pool Updates (Particles, Ripples, Crescent Slashes)
6. Third-Person Action Camera Matrix Offsetting & Raycast Obstruction Handling
7. Minimap Rendering Pass
8. WebGL Scene Render (`renderer.render(scene, camera)`)
9. Post-Render Camera Physical State Restoration (Restores physical eye coordinates for the next physics step)
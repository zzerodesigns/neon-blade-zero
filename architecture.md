# neon blade: engine architecture
**Engine State for: v48.7.1d**

> **ATTENTION FUTURE AGENTS:** This document is the absolute source of truth for the Neon Blade engine. Read this before modifying core systems. The project is a strict **single-file application** (`index.html`). Do not create external scripts or stylesheets.

## 1. The Golden Rules (Engine Philosophy)
*   **Zero-Allocation Architecture:** The engine is built to eliminate garbage collection spikes during high-frequency gameplay. Never use `new THREE.Vector3()`, `new Object()`, or array mapping inside `animate()`, the physics step, or the AI update loop. 
    *   **Global Scratchpads:** All spatial and mathematical operations must utilize pre-allocated global variables (e.g., `_aiDir`, `_aiTemp`, `_vec3_1`, `_pTemp`).
*   **Coordinate System:** 1 unit = 1 meter. Y is UP. The `SpatialHashGrid` operates strictly on the 2D X/Z plane. Do not write 3D physics checks for the 2D grid.
*   **Single-File Integrity:** All HTML, CSS, shaders, and game logic live exclusively in `index.html`.

## 2. Core Systems & Data Flow

### A. Decoupled Threading Architecture (Neural Shadow Core)
To bypass the **Inter-Process Communication (IPC) bottleneck** triggered by modern Chromium site isolation and security validation, the engine has been decoupled into two distinct threads:
*   **Main Thread (UI/Input):** Strictly restricted to DOM manipulation, input telemetry collection, and audio triggering. It does not perform any 3D math or physics calculation.
*   **Worker Thread (Engine/Physics/AI):** The heavy-lifting core. Runs Three.js, the physics simulation, and the AI logic using `OffscreenCanvas`.
*   **Synchronization (SharedArrayBuffer):** Atomic state sharing via a shared memory map. `Input Registers` are written by the Main thread; `Entity Registers` are written by the Worker. This prevents the CPU spin-locking and micro-stutters caused by synchronous GPU command validation on the main thread.

### B. Configuration (`CONFIG`)
The master control object containing all "magic numbers" (speed, damage, friction, energy costs). 
*   **Data Flow:** Read by Player, Enemy, and Projectile classes. Tune game feel here first.

### B. Map & Scene Management (`MapManager`, `LevelBuilder`)
*   `MapManager`: Handles high-level state, swapping between maps (ARENA, TITAN, MAZE, GYM, LABYRINTH), and persisting player state across transitions.
*   `LevelBuilder`: The procedural geometry factory.
*   **Data Flow:** `MapManager.switch()` -> `LevelBuilder.build()` -> Populates `SpatialHashGrid` and entity arrays.

### C. Physics & Collision (`SpatialHashGrid`, `physicsStep`)
Custom kinematic physics engine (no external libraries).
*   `SpatialHashGrid`: A 2D (X/Z) grid using integer keys for zero-allocation spatial queries. The performance backbone.
*   `physicsStep`: Core movement/collision logic inside `PlayerController` and `Enemy`.
*   **Continuous Collision Detection (CCD):** Implemented for high velocity player-bot intersections, utilizing swept-sphere lines to prevent tunneling, complete with relative mass displacement and kinetic momentum transfer to bots during slide hits.
*   **Projectile Kinetic Physics:** Gadgets actively interact with everything. They use Displacement Logic for tactical "kicking/sweeping", reciprocal overlapping to bounce off bots natively, and mutually bump other projectiles to "scatter" piles of settled grenades.
*   **True Rigid-Body Ragdolls:** When bots receive heavy hits (CONFUSED state), they transition into an impulse-based physics simulation. They inherit angular momentum and tumble reacting accurately to floor vertices, including elastic bouncing and ground damping, cleanly separating visual animations from gameplay state checks via `FALLEN` verification.
*   **Data Flow:** Entities query the grid for walls; projectiles and players check dynamic structural proximity for kinetic interaction and overlap resolution.

### D. Player & Input (`PlayerController`, `InputManager`)
*   `InputManager`: Captures raw keyboard/mouse events.
*   `PlayerController`: The central entity. Consumes input to update velocity, trigger jumps, slashes, and gadgets.

### E. Neural Override System (`AutoplaySystem`)
A high-performance autonomous agent that simulates pro-player behavior.
*   **Intention Scoring Framework:** A nuanced decision-making layer that weights competing priorities (`ESCAPE`, `ENGAGE`, `HUNT`, `EXPLORE`) based on health, energy, and momentum.
*   **Neural Momentum:** A dynamic multiplier that increases with successful combat actions, boosting aggression and tracking precision.
*   **Spatial Awareness:** Uses forward and downward raycasting (`checkGapForward`, `checkWallForward`) to navigate complex geometry and anticipate pits.
*   **Data Flow:** Consumes `PlayerController` state -> Evaluates Intentions -> Simulates `InputManager` events -> Overrides `PlayerController` logic.

### F. AI System (`Enemy`)
Manages bot behavior via a State Machine (`ROAM`, `AGGRO`, `SEARCH`).
*   **Optimization:** Uses a Logic LOD (Level of Detail) system to reduce update frequency for distant bots.
*   **Data Flow:** Reacts to `PlayerController` position. Queries `SpatialHashGrid` for pathfinding and physics.

### G. Tactile Gadget System (`Projectile` & Loadout)
A high-fidelity ballistic and kinetic system with dynamically selectable loadouts (FRAG, VOID, IMPULSE, STASIS).
*   **Loadout UI:** Managed via a customizable UI Modal in the pause menu allowing arbitrary mapping to F, R, and E keys.
*   **Kinetic Interaction:** Implements reciprocal impulse and momentum transfer. Players and bots can physically "kick" or "shove" low-bouncing grenades; grenades hitting each other will scatter realistically; thrown grenades correctly retain bounciness off live bots.
*   **Recursive Attachment:** Sticky types (`VOID`, `STASIS`) use dynamic target-radius offset math to attach directly to world-geometry, enemies, players, or even other moving grenades without hovering gaps.
*   **Temporal Dilation (STASIS):** Re-scales the `timeScale` physics delta parameter for targeted entities (Bots, Player, flying Projectiles) caught in the area of effect, cleanly maintaining global animation rendering while drastically slowing physical gameplay execution natively.
*   **Cross-System Influence:** Explosion and Implosion forces (`explode()`) physically interact with all other active, flying projectiles—allowing for mid-air juggling or "snatching" of gadgets.
*   **Safety Buffers:** Uses `launchCooldown` (0.15s) to temporarily ignore player hitboxes and prevent self-collision during rapid deployment mid-air.
*   **Data Flow:** Triggered by Player -> Interacts with world (Raycasting) and entities (Displacement / CCD) -> Triggers Audio/Visual spawners -> Influences the physical integration loop (`timeScale`, velocity) of nearby entities.

### H. Visual Engine (Hybrid Object Pools)
Performance-critical system designed to eliminate memory allocation during gameplay.
*   **Fixed Pools:** `_particlePool`, `_ripplePool`, `_slashPool` are pre-allocated arrays.
*   **Spawners:** `spawnParticles()`, `spawnRipple()` "borrow" and reset objects from these pools.
*   **Dynamic Array:** `particles` is reserved for persistent "hero" effects (like the Snow Trail) that need unique materials.

### I. Audio Engine (`AudioSys`)
Fully procedural sound system using the Web Audio API. Zero external sound files.
*   **Data Flow:** Acts as a global service called by other systems to synthesize sounds on demand.

## 3. The Main Loop (`animate()`)
The heartbeat of the engine. Execution order is strictly maintained to prevent jitter:
1. Neural Override Logic (if active)
2. Player Logic & Physics
3. Map/World Logic (Enemies, Projectiles)
4. Visual Pool Updates (Particles, Ripples)
5. UI Updates & Rendering

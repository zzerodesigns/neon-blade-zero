# neon blade: engine architecture
**Engine State for: v48.6.2**

> **ATTENTION FUTURE AGENTS:** This document is the absolute source of truth for the Neon Blade engine. Read this before modifying core systems. The project is a strict **single-file application** (`index.html`). Do not create external scripts or stylesheets.

## 1. The Golden Rules (Engine Philosophy)
*   **Zero-Allocation Architecture:** The engine is built to eliminate garbage collection spikes during high-frequency gameplay. Never use `new THREE.Vector3()`, `new Object()`, or array mapping inside `animate()`, the physics step, or the AI update loop. 
    *   **Global Scratchpads:** All spatial and mathematical operations must utilize pre-allocated global variables (e.g., `_aiDir`, `_aiTemp`, `_vec3_1`, `_pTemp`).
*   **Coordinate System:** 1 unit = 1 meter. Y is UP. The `SpatialHashGrid` operates strictly on the 2D X/Z plane. Do not write 3D physics checks for the 2D grid.
*   **Single-File Integrity:** All HTML, CSS, shaders, and game logic live exclusively in `index.html`.

## 2. Core Systems & Data Flow

### A. Configuration (`CONFIG`)
The master control object containing all "magic numbers" (speed, damage, friction, energy costs). 
*   **Data Flow:** Read by Player, Enemy, and Projectile classes. Tune game feel here first.

### B. Map & Scene Management (`MapManager`, `LevelBuilder`)
*   `MapManager`: Handles high-level state, swapping between maps (ARENA, TITAN, MAZE, GYM, LABYRINTH), and persisting player state across transitions.
*   `LevelBuilder`: The procedural geometry factory.
*   **Data Flow:** `MapManager.switch()` -> `LevelBuilder.build()` -> Populates `SpatialHashGrid` and entity arrays.

### C. Physics & Collision (`SpatialHashGrid`, `physicsStep`)
Custom kinematic physics engine (no external libraries).
*   `SpatialHashGrid`: A 2D (X/Z) grid using integer keys for zero-allocation spatial queries. The performance backbone.
*   `physicsStep`: Core movement/collision logic inside `PlayerController`.
*   **Data Flow:** Entities query the grid to resolve wall/ground interactions.

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

### G. Combat & Effects (`Katana`, `Projectile`)
*   `Katana`: Melee weapon system using Raycasting for hit detection.
*   `Projectile`: Gadget system (FRAG, VOID, IMPULSE) with independent ballistic physics.
*   **Data Flow:** Triggered by Player -> Interacts with Enemy (damage) -> Triggers Audio/Visual spawners.

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

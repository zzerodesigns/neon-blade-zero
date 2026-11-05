# Map Architecture, Traversal Slopes & Spawning Rewrite Plan

## 1. Executive Summary & Objective

This document outlines the architectural assessment and implementation plan for visual alignment, default options, perimeter geometry, box rotations, interconnecting bridge slopes, and a complete rewrite of the spawning algorithms for bots, jump pads, and portals across all maps.

The primary goals are:
1. Eliminating visual z-fighting/clipping at floor level across all map types.
2. Updating application defaults to Dark Theme, Third-Person camera, and Slash Angles enabled. (Note: Keep ARENA as the default map as requested, removing MACHINA default map requirement).
3. Porting the GYM map's 8-bank velodrome perimeter slopes to `ARENA_EX` and `TITAN_EX`.
4. Implementing box orientation partitioning (yaw-only vs full 3D rotation with floor constraints) strictly for the basic Arena map.
5. Generating 8 seamless inter-box ramps (using existing ramp systems, connected seamlessly between top surfaces like the Gym map's center cylinder ramp) and 8 vertically distributed rotated platforms (similar to ARENA_EX) utilizing continuous spatial elevation distribution instead of a primitive tier plan.
6. Rewriting bot, jump pad, and portal placement engines to guarantee uniform spatial/elevation distribution and non-overlapping vertical portal progression chains.
7. Improving the Map Picker UI with an interactive dropdown selection overlay to make map switching significantly easier and faster.

---

## 2. Technical Architecture & Assessment of Current Systems

### 2.1 Floor Clipping & Decoration Box Offsets
* **Current State:** In `LevelBuilder.spawnDecorations()`, floor-resting obstacle boxes set `y = scale`. When box geometry sits flush at $Y=0$, bottom face polygons z-fight with floor shader planes (`materials.floor`).
* **Assessment:** Basic arena floor objects elevate by $+0.1$ units on the Y axis. Map generators `buildMachina`, `buildGym`, `buildMaze`, and `spawnDecorations` need this offset applied universally.

### 2.2 Default Configuration & UI Binding
* **Current State:**
  * Theme defaults to `currentTheme = 0` (LIGHT).
  * Map boot sequence calls `MapManager.switch("ARENA")`.
  * Camera defaults to `isThirdPerson = false` (FIRST PERSON).
  * Slash Angles toggle `set-slash-angles` starts unchecked (`false`).
* **Assessment:** System initialization in `index.html` requires updated initial variable states and UI element sync (`checked = true`, inner text updates) prior to first render.

### 2.3 Perimeter Slope Geometry (Velodrome Banks)
* **Current State:** `buildGym()` constructs 8 sloped perimeter banks (4 straight banks along cardinal axes and 4 corner banks rotated at 45°) that align with arena wall height ($Y = 26.1 \times \text{scaleMod}$). `ARENA_EX` and `TITAN_EX` currently lack these surrounding slopes.
* **Assessment:** Extract the perimeter banking algorithm into a reusable helper method (`buildPerimeterBanking(ms)`) and invoke it inside `buildOpenArena()` for `ARENA_EX` and `TITAN_EX`.

### 2.4 Box Rotation Mechanics & Constraints
* **Current State:** Most map objects generated via `createBox` are axis-aligned. `SpatialHashGrid` and `EnemySpatialGrid` already support arbitrary 3D Orientations via `THREE.Quaternion` and `THREE.Euler` in OBB calculations.
* **Assessment:**
  * **Basic Arena Only:** These rotation mechanics are strictly restricted to the basic `ARENA` map. All other maps (e.g., `MACHINA`, `GYM`, `MAZE`, `ARENA_EX`, `TITAN_EX`) preserve axis-aligned box orientations to maintain layout integrity.
  * Exclude moon box from rotations.
  * **25% Horizontal Rotation:** Random Yaw ($\theta_y \in [0, 2\pi]$), keeping top surface parallel to floor ($\theta_x = 0, \theta_z = 0$).
  * **25% Full 3D Rotation:** Random Pitch, Yaw, Roll ($\theta_x, \theta_y, \theta_z \in [0, 2\pi]$).
  * **Floor Restriction:** Boxes resting on or near the floor ($Y \le \text{height}/2 + 0.5$) are strictly constrained to Horizontal (Yaw-only) rotation to avoid intersecting into the floor plane.
  * **50% Axis-Aligned:** Standard orientation ($\theta_x = \theta_y = \theta_z = 0$).

### 2.5 Inter-Box Connections (8 Ramps & 8 Rotated Platforms)
* **Current State:** Adjacent boxes exist independently without structural bridge connections between top surfaces.
* **Assessment:**
  * **Spatial Elevation Distribution:** Eliminate primitive height bands (Low, Mid, High, Sky). Instead, use the continuous spatial elevation distribution to analyze adjacent platform heights and horizontal spacing across the full active map's vertical range.
  * **8 Seamless Ramps:** Select 8 adjacent box pairs. Connect their top surfaces seamlessly using existing ramp components (leveraging existing ramp geometry, not custom sloped box calculations), ensuring they align perfectly with top surface boundaries. Reference the seamless floor-to-cylinder ramp connection in the `GYM` map. This prevents haphazard, clipping, or floating slopes.
  * **8 Rotated Platforms:** For another 8 vertically spread-out locations, spawn rotated platforms similar to those in `ARENA_EX`. These platforms are placed at intermediate heights between adjacent boxes to act as stepping stones, spread out vertically across the map's elevation profile.
  * Register these ramps and platforms in map collision arrays and spatial grid.

### 2.6 Spawning Algorithm Overhaul (Bots, Jump Pads & Portals)

#### Surface Geometry Extraction & Spatial Hash Grid Sampling
* **Surface Data Harvest:** Eliminate arbitrary hardcoded height brackets ("tiers"). Instead, extract every valid physical surface directly from `ms.mapObjects` and `ms.spatialGrid`:
  * Ground floor plane ($Y = 0$).
  * Exact top surface bounds $P_{\text{surface}} = (X, Y_{\text{top}}, Z)$ derived from actual mesh transform matrices and geometry dimensions for all map boxes.
* **Continuous Height Distribution & Density Balancing:**
  * Collect all distinct platform top heights present in the active map instance.
  * To guarantee even distribution across elevations, sample surfaces uniformly along the map's actual continuous height spectrum $Y \in [0, Y_{\text{max}}]$ combined with 3D Spatial Grid density queries (`ms.spatialGrid.query`) to avoid clustering.

#### Bot & Jump Pad Distribution
* Evenly allocate bot and jump pad spawn locations across the actual collected surface list, ensuring every elevation band containing platforms receives proportional coverage.
* Jump pads spawn on both flat top surfaces and vertical wall faces identified via spatial grid queries.

#### Portal Pairing & Non-Overlapping Vertical Progression Rules
* **Portal Pair Organization:** All portals exist in linked bidirectional pairs $(P_{in, k} \leftrightarrow P_{out, k})$.
* **Ground-to-Platform Pairs (1/4 of total portals on ground, paired to higher platforms):**
  * Entrance portal $P_{in}$ is positioned on the ground floor ($Y = 0$).
  * Exit portal $P_{out}$ is positioned on a randomly selected platform surface above ground ($Y > 0$).
* **Non-Overlapping Ascending Pairs (remaining portal pairs):**
  * Divide the active map's actual vertical platform height range $[\min(Y_{\text{platform}}), \max(Y_{\text{platform}})]$ into $N$ non-overlapping continuous vertical intervals $[Y_{\text{start}, k}, Y_{\text{end}, k}]$.
  * Pair $k$ places entrance portal $P_{in, k}$ on a platform at height $Y_1 \in [Y_{\text{start}, k}, Y_{\text{mid}, k}]$ and exit portal $P_{out, k}$ on a higher platform at height $Y_2 \in (Y_{\text{mid}, k}, Y_{\text{end}, k}]$.
  * **Non-Clashing Guarantee:** Because interval $k+1$ starts strictly above $Y_{\text{end}, k}$, exiting portal $P_{out, k}$ drops the player below the entrance height of the next portal pair $P_{in, k+1}$. The player must physically traverse (jump, climb, or cross connecting bridge slopes) to reach the next portal entry or locate portals on the exact same elevation.

---

## 3. Step-by-Step Implementation Plan

### Phase 1: Visual Fixes & Default Settings
1. **Floor Offset Fix:** Update `spawnDecorations`, `createBox`, and map builders to add $+0.1$ Y elevation to all floor-resting boxes across all map configurations.
2. **Default Options Application:**
   * Set `currentTheme = 1` (DARK). Update UI `#theme-btn` to `"THEME: DARK"`.
   * Keep default map as ARENA (removing MACHINA default requirement).
   * Set `isThirdPerson = true`. Check `#set-third-person`. Update visual player mesh visibility.
   * Set `#set-slash-angles` checked = `true`.
3. **Map Picker UI Upgrade:**
   * Implement an elegant, interactive cyberpunk-themed dropdown menu popup overlaying the `#map-btn`.
   * Populate with all available maps dynamically so players can instantly click and switch maps.

### Phase 2: Perimeter Slopes & Box Rotations
1. **Perimeter Slopes for EX Maps:**
   * Modularize `buildPerimeterBanking(ms)` containing the 8 straight and corner bank geometries.
   * Call `buildPerimeterBanking(ms)` inside `buildOpenArena(ms)` when map type is `ARENA_EX` or `TITAN_EX`.
2. **Box Rotation Partitioning (Basic Arena Map Only):**
   * Loop through generated non-moon map boxes ONLY when the active map is the basic `ARENA`.
   * Randomly assign 25% to Horizontal (Yaw-only) rotation.
   * Randomly assign 25% to 3D rotation, enforcing Yaw-only fallback if box bottom rests on the floor ($Y \le h/2 + 0.5$).
   * Leave remaining 50% axis-aligned. Recompute bounding boxes and spatial grid entries.

### Phase 3: Connecting Slopes & Spawning Algorithms
1. **8 Seamless Ramps & 8 Rotated Platforms:**
   * Query the continuous spatial elevation distribution to find adjacent platform pairs.
   * Generate 8 seamless ramps using existing ramp systems (matching the Gym map's center cylinder ramp seamless alignment) to connect top surfaces.
   * Generate 8 vertically distributed rotated platforms (similar to `ARENA_EX` platforms) as stepping stones.
2. **Spawning Rewrite:**
   * Implement `extractActiveMapSurfaces(ms)` to extract all valid physical surfaces (floor plane + top faces of all box meshes in `ms.mapObjects`).
   * Query 3D spatial hash grid density (`ms.spatialGrid`) to evenly distribute bots and jump pads across all platform heights and horizontal regions.
   * Rewrite `createPortals` to build:
     * 25% Ground-to-Platform pairs (ground floor $Y=0$ paired to higher platforms).
     * 75% Non-overlapping ascending vertical progression pairs ordered continuously by actual height intervals $[\min(Y), \max(Y)]$.

---

## 4. Progress Tracking & Timestamp

**Timestamp:** Sun 16 Aug 2026, 09:46 (UTC+7)  
**Base Engine Version:** v48.9.9WIP8  
**Plan Status:** Architectural Plan Updated — Tier System Replaced with Spatial Hash Grid & Surface Geometry Extraction Engine

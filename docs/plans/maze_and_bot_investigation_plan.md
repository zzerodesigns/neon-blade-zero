# Investigation & Architectural Plan: 3D Maze Performance, Bot Logic & Map Systems

## 1. 3D Maze Framerate Optimization
- **Current State & Findings**: The `build3DMaze` generator instantiates thousands of individual `THREE.Mesh` objects (vertical panels, horizontal floor panels, vertical pillars, horizontal EW/NS structural beams, intersection connector cubes, decorations, portals, and jump pads). Each element is an independent mesh with its own material instance, shadow configuration, and collision entry. This creates thousands of individual draw calls and heavy per-frame transformation and raycast overhead.
- **High-Level Plan**:
  - Merge static solid geometries (pillars, beams, connector cubes) into unified, batched meshes or use `InstancedMesh` per material type.
  - Group glass wall/floor panels by material shader type to minimize draw calls and shader state changes.
  - Apply spatial bounding box partitioning for 3D maze collision and raycasting so distant invisible geometry does not consume frame budget.

## 2. 3D Maze Bot Spawning Fix [COMPLETED]
- **Current State & Findings**: `spawnCells` picks grid coordinates across all 3D layers ($y = 0 \dots 4$). However, it does not verify whether an actual solid floor panel (`hasFloor`) exists beneath the selected cell. Bots spawned above carved vertical openings immediately plunge to lower levels or get stuck in void shafts.
- **High-Level Plan**:
  - Filter candidate spawn cells to only include cells with a valid, generated solid floor panel underneath.
  - Distribute bot spawn points evenly across valid vertical layers and horizontal coordinates to guarantee stable starting positions.

## 3. Non-EchoBot Fallen State & Recovery
- **Current State & Findings**: Body settling in `FALLEN` state is heavily dependent on framerate. As observed, if the framerate recovers to and stays above 40 FPS for long enough, bots actually manage to naturally settle and eventually get up (taking longer than usual), and at 60 FPS they settle just as quickly as on other maps.
- **Status**: This entry needs some more investigation. (Do not apply bandaid timer fixes that bypass natural physical settling).

## 4. Teleportation Through Tech Glass in 3D Maze
- **Current State & Findings**: Teleport targeting (`getTeleportTarget`) casts a ray against `mapObjects` and returns the first intersection point. In the 3D maze, tech glass wall/floor panels are in `mapObjects`, causing the teleport marker raycast to hit glass surfaces rather than aiming through them.
- **High-Level Plan**:
  - Add a lightweight filter check in `getTeleportTarget` to ignore tech glass objects or materials during raycast testing in 3D maze map.
  - Allow the teleport ray to pass cleanly through tech glass panels and lock onto solid terrain/walls behind them.

## 5. Gym Map Tech Glass Demo Cubes Collision & Material Fix
- **Current State & Findings**: The three tech glass demo cubes in `buildGym` are added to `ms.mapObjects` visually, but lack physical collision volumes in `ms.colliders`. Additionally, their materials use standard single-sided rendering, leading to backface culling when viewed from inside.
- **High-Level Plan**:
  - Enable `DoubleSide` rendering on `glassBorderMat`, `glassFresnelMat`, and `glassEnergyMat` to remove backface culling.
  - Register double-sided physical box collision bounds in `ms.colliders` for the three display boxes, enabling outside obstruction and allowing players who teleport inside to remain physically enclosed and trapped inside the cube.

## 6. Universal 3D Bot Pathfinding System
- **Current State & Findings**: Standard bots rely on 2D horizontal vector steering (`_aiFwd`), which breaks in multi-story 3D environments (3D maze vertical shafts/jump pads), sloped ramps (GYM map), floating rotated platforms (EX maps), and moving platforms (Machina maps).
- **High-Level Plan**:
  - **3D Waypoint / Surface Node Graph**: Build a modular 3D pathfinding node graph that maps cell openings, jump pads, portals, ramp slopes, floating platform surfaces, and moving platform local coordinates.
  - **Dynamic Path Navigation**: Allow bots to query 3D waypoints toward target destinations and execute appropriate vertical actions (ascending ramps, triggering jump pads, teleporting through portals).
  - **Kinematic Attachment**: Attach bot ground physics to moving platform motion matrices so bots move seamlessly with dynamic platforms.

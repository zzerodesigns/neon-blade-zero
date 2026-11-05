# Polyhedral Blocks & Arena Maps Transition Context

**Date & Local Timestamp:** August 22, 2026 - 16:42:00 (Local Time UTC+7)  
**Last Updated:** August 23, 2026 - 04:50:00 (Local Time UTC+7)

## Executive Summary
This document provides the background context, architectural research, and mathematical findings that led to expanding our level building systems beyond standard rectangular boxes. It details our evaluation of runtime physics performance, spatial hash scaling, Separating Axis Theorem (SAT) projection counts, space-filling 3D tessellations, and recent solver refinements for exact polyhedral collision. Three convex polyhedral blocks were locked in: the **Rhombic Dodecahedron** (12-sided universal space-filling block) and the **Octet Truss pair** (Regular Octahedron + Regular Tetrahedron). With collision math fully unified with visual geometry, current work focuses on constructing new tessellated arena test maps while evaluating a broader library of complementary basic block shapes.

---

## 1. Initial Research & Performance Boundary Analysis

### Physics Runtime vs. Initialization
* **Spatial Hash Isolation:** Static blocks reside in a spatial hash grid and do not run background physics loops. The active collision cost per frame depends purely on local density (the 8 to 20 blocks overlapping the entity's immediate bounding area), making total map block count (1,500–3,000+ objects) virtually negligible for CPU physics as long as local clustering remains reasonable.
* **CPU Collision Math (SAT Projections):** The primary CPU cost for convex geometry comes from narrow-phase SAT checks: projecting vertices onto unique face normals and edge cross-product axes. A standard 6-sided box requires 15 potential axes, whereas complex 20-sided shapes like the icosahedron require up to 160 axes.
* **Rendering Overhead:** Object draw calls dominate GPU overhead. Reusing shared geometry buffers with transform matrices (and batching/instancing static groups) allows maps to support dense block counts without dropping below the 60 FPS frame budget.
* **Evaluation of Alternative Solvers (XPBD):** Extended Position-Based Dynamics (XPBD) was evaluated as a possible alternative. We concluded that retaining our geometric SAT solver is essential: XPBD's iterative constraint projection often creates a "spongy" feel for high-speed character controllers and introduces seam clipping/snagging along flush angular transitions, whereas SAT provides exact contact normals, stable step-ups, and crisp sliding response.

### Shape Space-Filling & Stacking Evaluation
To allow structural building through pure stacking without air gaps or jagged seams, candidate geometries were analyzed for 3D space-filling tessellation:

* **Rhombic Dodecahedron (12 Rhombic Faces):** Universal space-filling polyhedron tiling space in a Face-Centered Cubic (FCC) lattice with zero air gaps. It features 6 pairs of parallel faces (6 face normals) and 4 edge directions, resulting in only 22 SAT projection axes (~1.5× the cost of a cube). Its flush 45° and 60° planes enable seamless, continuous sliding without micro-edge snagging.
* **Regular Dodecahedron & Icosahedron (Rejected for Stacking):** Neither shape tiles 3D space. Stacking them creates internal angular voids that catch player collision, while the icosahedron's 160 SAT axes present prohibitive CPU scaling.
* **Complementary Pair Options:**
  1. **Option 1 — Octet Truss (Regular Octahedron + Regular Tetrahedron):** Interlocks with zero air gaps (1 Octahedron + 2 Tetrahedrons). Yields 60° and 109.5° slopes ideal for diamond trusses, pyramids, and high-angle ramps with an ultra-light SAT budget (~10 axes).
  2. **Option 2 — Kelvin Lattice (Truncated Octahedron + Cube):** Interlocks with zero air gaps using 14-sided truncated octahedrons (8 hexagons + 6 squares) and cubes, providing 45° chamfers and vertical walls (~28 SAT axes).

Based on these findings, **Option 1 (Octet Truss)** and the **Rhombic Dodecahedron** were locked in as the core polyhedral trio.

---

## 2. Geometry Selection & Exact Collision Solver Implementation

The three selected convex polyhedral shapes were integrated directly into the level builder and physics pipeline:

1. **Rhombic Dodecahedron (12 faces, 14 vertices):** Primary universal space-filling building block.
2. **Regular Octahedron (8 triangular faces, 6 vertices):** Primary diagonal connector and diamond perching node.
3. **Regular Tetrahedron (4 triangular faces, 4 vertices):** Triangular space filler, deflector wedge, and pyramid ramp.

### Solver Refinement (Exact Polyhedral SAT)
Initial integration placed polyhedra inside standard rectangular bounding boxes (OBBs), causing player and projectile interactions to collide with invisible cubic boundaries rather than the visible angled faces. 

To achieve 1:1 physical-to-visual alignment:
* Implemented `applyPolyhedronObbOverride` to extract exact local vertices, unique outward face normals, and distinct edge vectors for any convex polyhedron.
* Overrode `obb.intersectsBox3` to test player/bot AABBs against the polyhedron's true face normals, box axis normals, and edge cross-products, extracting exact contact penetration depth and surface ejection normals.
* Implemented `obb.clampPoint` to project points and projectile spheres directly against polyhedral planar hulls, ensuring accurate bouncing for grenades and weapons.

---

## 3. Current Objectives & Arena Map Construction

With the physics solver executing exact contacts across all polyhedral shapes, the current objective is to design, construct, and playtest dedicated arena maps utilizing these blocks:
* **Tessellated Lattice Arenas:** Structural space frames and multi-tier platforms built from interlocking Octet Trusses.
* **Momentum Slide Corridors:** High-speed downhill and diagonal courses constructed from flush-stacked Rhombic Dodecahedrons.
* **Multi-Level Diamond Parkour:** Stepping crystal paths, pyramid wedge launchers, and elevated diamond perches testing bot pathfinding and player mobility.

---

## 4. Fundamental Block Library (Complete Palette)

The basic and polyhedral block palette is fully implemented in `LevelBuilder` with exact convex SAT collision overrides:
* **Rhombic Dodecahedron (`createRhombicDodecahedron`):** 12 rhombic faces, 14 vertices. Universal space-filling block.
* **Regular Octahedron (`createOctahedron`):** 8 triangular faces, 6 vertices. Octet truss diagonal node.
* **Regular Tetrahedron (`createTetrahedron`):** 4 triangular faces, 4 vertices. Octet truss triangular filler & ramp.
* **Triangular Prism / Wedge (`createWedge`):** 5 faces, 6 vertices. For directional ramps, roof slopes, and smooth transitions.
* **Corner Pyramidal Wedge (`createCornerWedge` / `createPyramid`):** 5 faces, 5 vertices. For hip corners and pyramid launchers.
* **Trapezoidal / Chamfered Block (`createTrapezoidBlock`):** 6 faces, 8 vertices. For tapered walls, beveled ledges, and bevel wall-runs.
* **Hexagonal Prism (`createHexagonalPrism`):** 8 faces, 12 vertices. For rounded architectural columns, pillars, and 60° joints.
* **Truncated Octahedron (`createTruncatedOctahedron`):** 14 faces, 24 vertices. For Kelvin lattice space-filling structures with 45° chamfers.

All block types automatically pass through `applyPolyhedronObbOverride`, providing exact 1:1 physical-to-visual contact normals, jump snapping, wall sliding, and sphere/projectile bouncing across all map configurations.

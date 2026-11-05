# Comprehensive Assessment & Architectural Plan: Next-Generation Bot AI & 3D Spatial Systems

**Engine Version:** v48.9.9WIP6  
**Target:** Ground-Up Rebuild of Bot AI, 3D Spatial Navigation, CQC Combat, Collision LOD Reversion, and Map Geometry Alignment.

---

## 1. Executive Summary

This document presents a comprehensive technical assessment of the existing enemy Bot AI (`Enemy` and special variant logic), diagnoses identified behavioral and physical shortcomings, and outlines a high-level, zero-allocation architectural plan for rebuilding the AI subsystem from the ground up.

The goal is to replace the existing ad-hoc heuristic state machine with a smarter, cleaner, and more primitive AI engine that operates with full 3D spatial awareness, natural perception, comfortable combat pacing, and uncompromised collision integrity.

---

## 2. Assessment of Current Bot AI Architecture

### A. State Machine & Perception Model
- **Omniscient State Polling:** Current bots query `camera.position` and `camera.getWorldDirection()` directly rather than relying on an autonomous sensory model. When in `AGGRO` mode, bots continuously know the exact player coordinates and view vectors, bypassing organic field-of-view limits and environmental line-of-sight.
- **Vision Throttling & Line of Sight:** Raycasting for vision (`checkVision`) occurs on a simple timer with global raycasts. When line of sight is broken, bots instantly default to searching the last known point without momentum-based pursuit or search scanning.
- **Special Entity Rules (Golden Bot):** Golden bots perform teleportation by reading whether the player is looking directly at them (`camera.getWorldDirection().dot(toBot) > 0.95`). While effective for difficulty, it operates as an unnatural "psychic" trigger and causes sudden, disorienting teleport-flanks directly behind the player's back without realistic spatial telegraphing or line-of-sight constraints.

### B. Close-Quarters Combat (CQC) & Movement Dynamics
- **Tight Collision Hugging & Excessive Orbiting:** In close quarters (`dist < 5 * scale`), bots calculate strafe vectors perpendicular to the player and push aggressively forward. This creates an uncomfortably tight engagement radius (1.5–3m) where the bot constantly presses into the player's collision volume.
- **The "Whiplash Flank" Effect:** Because bots maintain an extremely tight proximity to the player, any rapid turn or mouse sweep by the player drastically shifts the relative vector from player to bot. The bot instantly resolves this by snapping to the opposite side of the player's field of view, forcing the player to constantly whip their view back and forth in an awkward, dizzying cycle.
- **Airborne Clumping Underneath the Player:** When the player jumps, wall-runs, or hangs in mid-air, bots flatten the destination vector to 2D ($Y=0$) and converge directly on the player's horizontal coordinate $(X, Z)$. This causes all nearby enemies to bunch together into a singular cluster right beneath the player's feet, creating an unnatural pile-up with no tactical spreading, perimeter containment, or airborne threat response.

### C. The Collision LOD Nerf & Wall Clipping
- **Distance Throttling:** In recent builds, an LOD optimization throttled wall collision queries for distant bots (`wallCheckInterval = 5 to 15 frames` for `distSq > 2500` or `10000`).
- **Wall Tunneling:** Because bots continue integrating velocity and movement vectors every single frame while wall collision queries are skipped for 5–15 frames, distant bots regularly step, slide, or get pushed straight through solid walls and obstacle geometry, becoming trapped inside blocks or falling into the void.
- **The Fix Strategy:** Rebuilding the bot AI with streamlined, primitive mathematics will reduce CPU overhead significantly, allowing the engine to safely revert this LOD nerf and execute full, continuous collision checks for all bots regardless of distance without frame drops.

### D. Map Scaling & Decoration Box Geometry Mismatch
- **Visual vs. Physics Discrepancies:** During map scaling experiments, player and bot collisions with decoration boxes revealed notable mismatches between visual boundaries and physical collision surfaces (becoming pronounced at higher scale multipliers).
- **Underlying Cause:** `Decoration` instances instantiate separate collider meshes (`THREE.BoxGeometry(2, 2, 2)` with scalar scaling) and visual meshes (`THREE.BoxGeometry(2, 2, 2)` with a $+0.005 \times \text{scale}$ Y-offset). Furthermore:
  - Attached decorative groups (pumpkin faces, ribbons, knots, bows, wireframe hulls) have geometries with fixed percentage offsets (e.g., $2.015$, $1.015$) that extend beyond the physical collision box when scaled up.
  - In dark themes, shader dimension uniforms default to unscaled values, affecting edge rendering and perceived boundaries.
  - In spatial queries, `groundObjects` and `walls` register different mesh references for the same decoration instance, causing height sampling (`getGroundHeight`) and wall bounding tests to evaluate disparate geometric volumes.

---

## 3. High-Level Architectural Plan for the AI Rebuild

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          NEXT-GEN BOT AI ENGINE                         │
├────────────────────────┬────────────────────────┬───────────────────────┤
│    SENSORY & STATE     │    3D SPATIAL PATH     │     COMBAT & CQC      │
│  • Fair Vision Cones   │  • Height-Aware Graph  │  • Standoff Distance  │
│  • Sound / Stimulus    │  • Multi-Tier Support  │  • Anti-Clumping Arc  │
│  • Natural Tracking    │  • Ledge & Ramp Nav    │  • Landing Prediction │
│  • Organic Golden TP   │  • Kinematic Ground    │  • Smooth Pacing Flow │
├────────────────────────┴────────────────────────┴───────────────────────┤
│                   ZERO-ALLOCATION PHYSICS & COLLISION                   │
│  • Full Continuous Collision (Zero LOD Clipping Nerf)                  │
│  • Unified Decoration Box Collision & Visual Meshes                     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Pillar 1: Complete 3D Space Navigation & Ground Tracking
1. **Verticality & Multi-Tier Traversal:** Enable bots to navigate multi-level arenas, sloped ramps, vertical shafts, jump pads, and floating platforms naturally. Bots will evaluate true 3D spatial nodes rather than flattening movement into 2D plane vectors.
2. **Robust Ground & Ledge Probing:** Implement lightweight, continuous forward-downward ground sampling that prevents bots from blindly walking off elevated ledges while roaming or engaging, while still allowing deliberate tactical drops and jump-pad ascents.
3. **Kinematic Surface Attachment:** Ensure bot foot heights and ground normals smoothly align to dynamic terrain, ramps, and moving platforms without popping or falling through geometry.

### Pillar 2: Fair, Uncheated Perception Model
1. **Natural Field of View (FOV):** Replace raw camera position access with an authentic sensory system. Bots will only acquire targets if the player is within their forward vision cone or creates a detectable sound stimulus (slashes, footsteps, explosions).
2. **Awareness & Memory Decay:** When the player breaks line of sight behind cover, bots should transition to a memory-based pursuit vector (investigating the last seen trajectory and clearing angles) rather than instantly losing interest or possessing psychic real-time coordinates.
3. **Tuned Golden Bot Mechanics:** Rebuild Golden Bot teleportation to feel organic:
   - Restrict teleport triggers to tactical scenarios (repositioning to high ground, dodging telegraphed high-damage attacks, or closing distance after losing sight).
   - Require brief, readable visual/audio telegraph cues before teleport execution.
   - Constrain behind-the-player flanking teleports to reasonable angles and safe distances so the player is never subjected to unfair, instant blind-spot ambushes.

### Pillar 3: Spatially Aware Close-Quarters Combat (CQC)
1. **Minimum Standoff Distance & Engagement Rings:** Enforce a healthy personal combat radius around the player (e.g., 3.5m–5.0m). Bots should close in to execute an attack strike, then naturally step back, strafe, or cycle out rather than permanently pressing against the player's collision hull.
2. **Rotational Inertia & Anti-Whiplash Flanking:** Decouple bot flanking movements from instantaneous player camera turns. Bots will possess their own angular momentum and positioning inertia, preventing the abrupt screen-hopping and frantic 180-degree mouse whipping during melee exchanges.
3. **Mutual Separation & Surround Formations:** Ensure attacking bots distribute themselves around the player in semi-circular or encirclement arcs rather than overlapping along a single attack ray.

### Pillar 4: Airborne Player Response Dynamics
1. **Predictive Landing & Perimeter Staging:** When the player is airborne (jumping, falling, wall-running), bots should not converge to the exact $(X, Z)$ coordinate directly beneath the player.
2. **Tactical Dispersion:** Bots will spread out into an offensive perimeter around the player's anticipated ground landing zone, prepare anti-air lunges, or take cover if the player is diving from above.

### Pillar 5: Reverting the Collision LOD Nerf via High-Efficiency Physics
1. **Reversion of Wall Check Throttling:** Fully restore 100% per-step wall collision verification for all bots across the map.
2. **Primitive Math Optimizations:** Replace heavy collision routines and broad-phase overhead with ultra-lean, zero-allocation spatial math. By removing extraneous object queries and redundant vector transforms, full continuous collision detection can run across the entire bot roster without compromising framerates.

### Pillar 6: Decoration Box Visual & Collision Alignment
1. **Single-Source-of-Truth Geometry:** Unify the visual mesh and physical collider definitions for decoration boxes across all map builders so that visual boundaries, wireframe borders, and physical collision extents match with 1:1 precision at all map scales.
2. **Scale-Invariant Decorative Attachments:** Ensure auxiliary child meshes (ribbons, faces, bows) conform tightly to the core bounding dimensions without introducing physical offset discrepancies when scaled up.

---

## 4. High-Level Development Roadmap

1. **Phase 1: Collision & Map Geometry Alignment**
   - Revert distance-based wall collision throttling on bots.
   - Synchronize visual mesh and collision boundaries for decoration boxes and scaled map objects.

2. **Phase 2: 3D Sensory Perception Engine**
   - Build fair FOV, line-of-sight checks, and awareness/memory timers.
   - Refactor Golden Bot teleportation with organic cues, safe positioning, and cooldowns.

3. **Phase 3: 3D Spatial Traversal & Ground Tracking**
   - Implement vertical node/height awareness, ramp navigation, and ledge-drop safety.
   - Integrate seamless jump pad and vertical shaft utilization.

4. **Phase 4: CQC Overhaul & Airborne Response**
   - Implement standoff distance rings, rotational inertia, and anti-whiplash movement.
   - Deploy landing prediction and perimeter staging for airborne player targets.
   - Fine-tune combat pacing, telegraphing, and multi-bot engagement flow.

---

## 5. Current Progress Check

**Timestamp:** Sun 16 Aug 2026, 08:58 (UTC+7)  
**Base Engine Version:** v48.9.9WIP8  
**Code Status:** Inspected without code changes.

---

### What's Working & What's Left

* **Pillar 1: 3D Navigation & Ground Tracking (In Progress)**
  * **Working:** Floor height checks (`getGroundHeight`), dynamic spawn heights, and forward ledge/obstacle detection (`checkObstacleAhead`) in `ROAM` and `AGGRO` states.
  * **Missing:** Full 3D node-graph pathfinding for multi-level ramps and vertical shafts.

* **Pillar 2: Vision, Sound & Golden Bot (Done)**
  * **Working:** Vision checks run on a short timer (`visionTimer`, 0.2–0.35s). If line-of-sight breaks, bots remember `lastKnownPos` and sweep their heads in a `SEARCH` state for 3 seconds. Golden Bots telegraph teleportation with a 350ms particle effect, have a 3.5s cooldown, and flank from the side (45–80°, 8–14m away).

* **Pillar 3: Close-Quarters Combat & Movement (Done)**
  * **Working:** Bots back off to a safe distance (`idealRange = 4.2 + 1.5 * scale`) when too close or cooling down. Smooth turning with banking tilt (`targetRoll`), pitch adjustments, and spatial grid checks (`EnemySpatialGrid`) to stop bots from overlapping.

* **Pillar 4: Airborne Player Response (Done)**
  * **Working:** When the player jumps or flies above 3.2m, bots calculate where the player will land using current speed and fall time. They surround the spot in an 8-point ring and time jump-attacks when the player gets within 3m of the ground.

* **Pillar 5: Reverting Collision Performance Limits (Done)**
  * **Working:** Removed distance-based frame skipping (`wallCheckInterval`). Bots check wall collisions every frame using zero-allocation bounding boxes derived straight from matrix columns (`rx_x`, `ry_y`, `rz_z`).

* **Pillar 6: Decorative Props & Map Alignment (In Progress)**
  * **Working:** Solid walls and floors match the physical grid.
  * **Missing:** Extra visual decorations (like face meshes and wireframes) still use fixed offset scaling when map objects resize.

---

### Phase Breakdown

1. **Phase 1: Collision & Map Alignment (85%)** — Wall checks run every frame. Decorative prop alignment still needs minor tuning.
2. **Phase 2: Vision & Sensory System (100%)** — FOV timers, search states, and telegraphing for Golden Bots are fully active.
3. **Phase 3: 3D Traversal & Ground Checks (60%)** — Basic height clamping and ledge stopping work. Multi-level pathfinding graphs are up next.
4. **Phase 4: CQC & Airborne Counter-Play (100%)** — Standoff distances, smooth turning, landing prediction, and anti-air rings are all complete.

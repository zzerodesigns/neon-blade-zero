# Physics Engine Upgrade: Architectural Overview & Roadmap

### Context & Baseline State
**Version:** Neon Blade: Melee Arena v49.0.8 — *Precise High-Velocity Collision*  
**Date:** August 24, 2026 — 5:55 AM (UTC+7)

The game operates as a standalone, single-file Three.js application with a custom AABB/OBB hybrid physics engine. High-speed dash tunneling has been resolved through dynamic displacement-based sub-stepping without introducing complex, fragile 3D swept-slab math or phantom walls. Surface drag and forward movement drive have been decoupled, preserving the natural exponential momentum bleed-off while providing responsive sprint acceleration. 

The physics pipeline currently remains decentralized across separate class loops (`PlayerController`, `Enemy`, `Projectile`, and `BouncyImpulseBall`). The next phases focus on introducing analytical curved colliders, centralizing physics into a unified Box3D-style solver, and synchronizing visual shaders with mathematical contact boundaries.

### Core Architectural Principles & Naming Standards

1. **Simulation vs. Visual Decoupling:** Physical collision calculations and procedural visual deformations are completely separate:
   - `physicalElasticity` *(Bounciness)*: Universal physical property in the solver governing kinetic velocity rebound on impact (`0.0` for solid player/bot boxes, `0.5` for frags, `0.85` for giant bouncy balls).
   - `visualElasticity` *(Squishiness)*: Rendering-only property controlling 3D mesh compression, squashing, and pudding-like spring recovery. Rigid player and bot cyber-boxes remain at `0.0`.

2. **Selective Displacement Sub-Stepping:** High-speed tunneling prevention is handled by capping step displacement (maximum 0.15m per sub-step slice). High velocities dynamically scale sub-steps between 1 and 16, ensuring fast dashes never skip thin barriers while normal movement runs at minimum baseline cost.

3. **Decoupled Engine Drive & Friction:** Forward motor acceleration (`drive = 5.0`) and ground drag (`frictionGround = 3.0`) are separated. This provides nearly immediate top-speed acceleration during sprints while maintaining a long, natural mathematical momentum tail upon releasing keys.

---

### Step 1: Continuous Collision Detection (CCD) & Drive Decoupling — [COMPLETED in v49.0.8]

**What Was Done:**
High-speed tunneling was resolved by implementing displacement-based sub-stepping in `PlayerController.update`. When the player moves at extreme velocities (such as during an impulse dash), the engine slices the single frame tick into micro-steps capped at 0.15 meters each, allowing the existing SAT collision solver to catch barriers naturally. The grounded state lifecycle was corrected to persist into `physicsStep`, ground friction was tuned to 3.0, and engine drive was decoupled to 6.0. This restored the original floaty momentum drift, eliminated floor sticking and edge-catching on polyhedral wedges, and made sprint acceleration significantly punchier.

---

### Step 2: Analytical Curved Colliders (Spheres, Capsules, Cylinders) — [NEXT]

**Why we do it:**
Currently, rounded physics in your game are handled through ad-hoc method overrides or approximations that can snag on geometry seams. By defining spheres, capsules, and cylinders through pure analytical geometry (centers, radii, and segment axes), collision tests reduce to basic vector arithmetic. An OBB-versus-sphere test is computationally cheaper than a 15-axis box-to-box test, runs faster, and produces mathematically exact sliding surfaces.

**Prompt for your agent:**
Standardize rounded geometry support by introducing first-class analytical colliders alongside existing OBBs. Create clean shape definitions (such as `SphereCollider`, `CapsuleCollider`, and `CylinderCollider`) defined by center vectors, half-heights, and radii. Implement direct narrowphase test functions (such as `testOBBVsSphere` and `testOBBVsCapsule`) that find the closest point on the box to the shape's center or central line segment, calculate the distance against the radius, and produce an exact contact normal and penetration depth. Plug these tests directly into the spatial grid and player collision queries so characters and bouncy projectiles interact with curved shapes natively.

---

### Step 3: Centralized `PhysicsWorld`, Fixed Timestep & Box3D Manifolds — [PENDING]

**Why we do it:**
Physics execution is currently duplicated across four independent silos (`PlayerController`, `Enemy`, `Projectile`, and `BouncyImpulseBall`), and movement is tied to variable browser render frames. Centralizing physics into an authoritative `PhysicsWorld` manager running on a **strict fixed timestep (accumulator pattern at 60Hz)** permanently decouples physics math from graphics frame-time fluctuations, eliminating visual jitter at the root. Adopting Box3D's manifold design cleanly separates broadphase queries, narrowphase contact generation, and unified impulse solving, preventing geometry snagging and ensuring realistic mass-balanced momentum exchange when kicking objects or pushing bots.

**Prompt for your agent:**
Consolidate the decentralized physics loops into an authoritative `PhysicsWorld` manager inspired by Box3D's architecture. 

1. **Fixed Timestep Accumulator:** Decouple physics from variable render frames by stepping `PhysicsWorld` on a rigid fixed delta time (`FIXED_DT = 0.016666`) using an accumulator loop in `animate()`.
2. **Universal Body Registration:** Entities (`Player`, `Enemy`, `Projectile`, `BouncyBall`, `MovingPlatform`) register a physical body component with properties for mass, collider shape, friction, and `physicalElasticity` (bounciness), inheriting verified sub-stepping and SAT collisions automatically.
3. **Four-Pass Architecture:** Structure the global `PhysicsWorld.step(FIXED_DT)` into four explicit passes: integration, broadphase candidate filtering via `spatialGrid`, narrowphase contact manifold generation (`ContactManifold`, `ContactPoint`), and a unified impulse/position solver that resolves momentum and separates overlaps simultaneously before syncing transforms back to Three.js meshes.

---

### Step 4: Visual & Shader Synchronization for Curved Surfaces — [PENDING]

**Why we do it:**
Once the physics engine calculates mathematically perfect curves, standard tessellated polygon meshes will look noticeably faceted or low-poly by comparison. By pairing analytical colliders with procedural shaders on simple proxy bounding boxes, the GPU can render infinitely smooth curved silhouettes and dynamic scanlines that match the underlying physics boundaries with minimal CPU overhead.

**Prompt for your agent:**
Synchronize the visual rendering of curved physical objects with their analytical colliders using procedural shaders on proxy meshes. For entities using sphere, cylinder, or capsule colliders (such as bouncy projectiles, gadget spheres, and the central cylinder), apply custom `ShaderMaterial` instances to low-poly proxy boxes. Pipe the physical collider dimensions, centers, and radii as uniforms (`u_radius`, `u_halfHeight`, `u_center`) to evaluate smooth mathematical surfaces and edge-glow borders in the fragment shader, ensuring visuals align with physical collision hulls without inflating polygon counts. Entities with active `visualElasticity` (squishiness) can hook into physical collision events to animate procedural mesh compression without altering rigid collision bounds.

---
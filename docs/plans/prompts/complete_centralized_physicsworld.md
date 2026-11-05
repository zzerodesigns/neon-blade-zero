# TASK: Complete Centralized PhysicsWorld & Remove Duplicated Physics Loops (v49.2.0)

### ARCHITECTURAL GOAL
Consolidate all physics execution into the authoritative `PhysicsWorld` class on a strict fixed timestep (`FIXED_DT = 0.016666`). 

Eliminate the double-integration bug: `PhysicsWorld` must be the ONLY system that integrates gravity ($v_y -= g \cdot dt$) and moves positions. Remove all duplicated gravity, integration, and collision loops from `Enemy.updatePhysics`, `PlayerController.physicsStep`, and `Projectile.update`.

---

### STEP 1: Complete `PhysicsWorld` Implementation

Fill in the unfinished passes inside `PhysicsWorld.step(FIXED_DT)` using zero-allocation math:

1. **Pass 1 — Force & Velocity Integration:**
   - For all active, non-static, non-sleeping bodies (`!body.isStatic && !body.isNaturallyStill`):
     - Apply gravity: `body.velocity.y -= CONFIG.gravity * dt`
     - Integrate linear velocity into `body.position.addScaledVector(body.velocity, dt)`
     - Integrate angular velocity into `body.quaternion` using quaternion axis-angle integration.

2. **Pass 2 — Broadphase (`spatialGrid` Query):**
   - Query `spatialGrid` using each body's bounding box/collider to find candidate static walls, floors, ramps, and moving platforms.

3. **Pass 3 — Narrowphase & Contact Generation:**
   - Execute exact collision tests based on collider types:
     - **Box vs Static Box/OBB:** 8-vertex ground sampling + SAT test against static OBBs/polyhedra.
     - **Sphere/Capsule/Cylinder:** Use existing analytical narrowphase functions (`testOBBVsSphere`, `testAABBVsSphere`, `testOBBVsCapsule`, etc.).
   - Compute contact point, true surface normal (`_contactNormal`), and penetration depth (`maxPenetration`).

4. **Pass 4 — Solver, Resting Contacts & Sleep State:**
   - **Positional Separation:** If `maxPenetration > 0`, push the body out along `_contactNormal`.
   - **Impulse & Restitution Resolution:**
     - Calculate relative contact normal velocity $v_n = \vec{v} \cdot \vec{N}$.
     - If $v_n < 0$:
       - If $v_n > -1.5$ (Soft/Resting Contact): Cancel downward normal velocity ($v_n = 0$), skip bounce, and apply friction without injecting angular torque.
       - If $v_n \le -1.5$ (Hard Impact): Apply standard restitution impulse and rotational torque ($\vec{r} \times \vec{J}$).
   - **Sleeping Logic:**
     - Apply exponential ground damping to linear and angular velocities.
     - If `speedSq < 0.2` and `angSq < 0.2` while contacting a surface, mark `body.isNaturallyStill = true` and zero all velocities.
   - **Transform Synchronization:**
     - Copy `body.position` and `body.quaternion` directly to `body.entity.mesh.position` and `body.entity.mesh.quaternion`.

---

### STEP 2: Refactor `Enemy.updatePhysics` & Ragdolls

1. **Delete Duplicated Physics:**
   - Remove manual gravity subtraction (`this.velocity.y -= CONFIG.gravity * dt`).
   - Remove manual position integration (`this.mesh.position.addScaledVector(...)`).
   - Remove the duplicate 8-vertex collision loop and OBB tests from `Enemy.updatePhysics`.
2. **State Consumption:**
   - `Enemy.updatePhysics` becomes a clean state evaluator.
   - To check if a ragdoll has stopped tumbling, simply check `this.physicsBody.isNaturallyStill`.
   - When `this.physicsBody.isNaturallyStill` holds for `1.2s`, advance the state from `CONFUSED/FALLEN` to `RECOVERING`.
3. **Impact Routing:**
   - When taking a hit (`takeHit`), set `this.physicsBody.isNaturallyStill = false` and add impulse to `this.physicsBody.velocity` / `this.physicsBody.angularVelocity`.

---

### STEP 3: Refactor `PlayerController` & `Projectile`

1. **Player Integration:**
   - Ensure motor inputs (WASD, slide, jump) add acceleration directly to the player's `RigidBody` velocity.
   - Remove redundant standalone gravity calculations that run outside `PhysicsWorld`.
2. **Projectiles & Bouncy Balls:**
   - Migrate projectile collision checks and bounce responses into `PhysicsWorld` rigid body simulation.
   - For impact gadgets (`IMPULSE`, `VOID`, `STASIS`), trigger `.explode()` on contact manifold generation.

---

### STEP 4: Verification Checklist

- [ ] `CONFIG.gravity` is ONLY referenced inside `PhysicsWorld.step`.
- [ ] No manual `mesh.position.addScaledVector(velocity, dt)` exists in `Enemy.js` or `PlayerController.js`.
- [ ] Stunned/dead bots tumble naturally, bleed off kinetic energy, settle completely flat on floors and sloped ramps without micro-jitter, and cleanly stand back up.
- [ ] Zero heap allocations in the physics loop (reuse global scratch vectors `_vec3_1`, `_vec3_2`, `_vec3_3`, `_quat`).
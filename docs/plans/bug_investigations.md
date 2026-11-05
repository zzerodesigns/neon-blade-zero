# Bug Investigations & Root Cause Analysis

**Last Updated:** Tuesday, August 25, 2026 - 04:57 (UTC+7 / Hanoi)

This document tracks ongoing bug investigations, root cause analyses, and test observations. It preserves full context across queries and will be updated as new issues are diagnosed.

*Note: Only Investigation 1 is preserved in its original verbatim detail; all subsequent investigations are consolidated into concise high-level summaries for clarity and readability.*

---

## Investigation 19: Fair Navigation Physics, Strict Camera FOV Matching, and Tactical Anti-Stuck Flanking

### High-Level Summary

- **Enforced Fair Bot Teleportation without Wall-Passing or Cheating**:
  - *Root Cause Analysis*: High-mobility catch-up previously calculated `tpTargetPos` by directly copying destination coordinates without testing raycast geometry or clamping range. As a result, bots teleported through solid walls, floors, and ceilings.
  - *Applied Fix*:
    1. **Identical Max Range Clamping**: Bot teleportation distance is now strictly clamped to `CONFIG.teleportRange` (25m), matching the player's teleport limits.
    2. **Line of Sight & Geometry Raycasting**: Raycasts from bot eye level along the teleport vector test for environmental collisions (`performFilteredRaycast`). If blocked by a wall or obstacle, the teleport destination is stopped in front of the wall (or cancelled if blocked immediately in front).
    3. **Ground Resolution & Secondary LOS Check**: Ground height is resolved at candidate coordinates and a secondary raycast verifies total unblocked line of sight before initiating the 350ms telegraph and spending stamina.

- **Resolved the 2D Distance Termination Trap & Implemented 3D Vertical Pursuit**:
  - *Root Cause Analysis*: When chasing an elevated player directly above them, bots traveled to the target's X/Z coordinates on the ground floor. The arrival check evaluated `distToDest2D < 2.5m`. Because the 2D planar distance was under 2.5m, the bot assumed it had reached the destination, terminated `AGGRO` pursuit, and dropped into `SEARCH` state wandering on the ground floor underneath the player.
  - *Applied Fix*:
    1. **Vertical Arrival Alignment**: Arrival at predicted intercept points now requires BOTH horizontal proximity (`distToDest2D < 2.5m`) AND vertical altitude alignment (`vertDistToDest < 2.5m`) before transitioning into `SEARCH`.
    2. **3D Jump & Mid-Air Multi-Jump Pursuit**: When chasing an elevated target ($dY > 1.6\text{m}$), bots execute ground leaps (`performJump`) and mid-air double-jumps (`jumps < maxJumps`) with active mid-air steering force toward the elevated platform.

- **Tactical Anti-Stuck Flanking (`pickFlankRoute`)**:
  - *Fix*: Probes lateral (+45°, -45°, +90°, -90°) and reverse angles around obstacles using `checkObstacleAhead`. When an obstacle is detected, the bot sets `flankHeading` and `flankTimer` (1.2s - 2.0s detour) to steer around the corner while executing a tactical leap over low geometry, seamlessly bypassing obstacles while keeping the bot engaged in active pursuit.

---

## Investigation 20: Start Screen Q Button Text Bug

### High-Level Summary

- **Q Button Mode Display Modifying Static Text**:
  - *Context & Bug*: The user reported that clicking the "Q: INSTANT" button on the start screen changed the text to "Q MODE: AIM" instead of switching the dynamic portion (INSTANT to AIM) while keeping the static "Q:" prefix.
  - *Root Cause Analysis*: 
    1. In the initial HTML, the button is defined as `<button class="btn-secondary" id="movement-mode-btn">Q: INSTANT</button>`.
    2. However, the JavaScript function `toggleMovementMode` reassigned `movementModeBtn.innerText = "Q MODE: " + movementMode;`, injecting the word "MODE" and removing the colon format that was originally there.
  - *Applied Fix*: Updated `toggleMovementMode` to use the correct formatting string `"Q: " + movementMode;`, ensuring the button purely cycles between "Q: INSTANT" and "Q: AIM" without corrupting the static label prefix.

---

## Investigation 21: High-Velocity Dash Visual Jitter & Choppiness (v49.0.9)

### High-Level Summary

- **Observation**:
  - Despite solid reported framerates between 50+ and ~60 FPS, dashing around the map at high velocities causes the visual presentation to feel jittery and choppy rather than fluid and smooth.
- **Root Cause Analysis**:
  1. **Variable Timestep Frame Discretization**: Physics directly advances `camera.position` based on variable frame delta `dt` and dynamic substepping (`timeSteps = Math.ceil(displacement / 0.15)`). When dashing at 40–70 m/s, minor millisecond fluctuations in browser render ticks produce uneven per-frame translation steps without fixed sub-frame interpolation, perceived as motion judder.
  2. **Multi-Substep Collision and Wall-Snapping Feedback**: Inside `physicsStep`, wall-snapping offsets (`camera.position.x -= normalX * 0.05`) and harsh AABB velocity zeroing (`velocity.x = 0` on lateral contact) run on every substep (up to 16 times per frame). High-speed grazing contacts repeatedly push and pull position multiple times in a single frame.
  3. **Ground Snapping Oscillations**: Ground snapping evaluates a 0.5m downward probe on every substep if `wasOnGround` was true at frame start. At high horizontal velocities over slopes and block edges, this creates micro-sawtooth vertical snapping.
  4. **Instantaneous 3rd-Person Camera Collision Pop**: In third-person perspective, obstacle raycast collision distance updates without spring/damping smoothing, causing distance pop jitter when skimming past walls or geometry at high speeds.
- **Session Focus & Proposed Mitigations**:
  - Implement smooth camera position interpolation / fixed physics time accumulator.
  - Dampen high-frequency sub-step collision corrections and smooth lateral wall grazing.
  - Stabilize vertical ground-snapping thresholds during high horizontal velocity.
- **Applied Fix (Physical Vibration & Jitter Clean Up)**:
  1. *Removed Substep Wall-Snapping Pulls*: Stripped all hardcoded position-pull offsets (`camera.position.x -= normalX * 0.05` / `camera.position.addScaledVector(snapVec, -0.05)`) across hollowbox, AABB, and OBB wall collision resolutions in `PlayerController.physicsStep`. Wall separation now relies purely on mathematical SAT contact normals without artificial push-pull oscillations across sub-step iterations.
  2. *Stabilized Downward Ground-Snapping*: Extracted the 0.5m downward probe out of the high-frequency sub-stepping loop and placed it into a single clean post-physics resolve in `PlayerController.update`, preventing vertical micro-sawtooth snapping on individual 0.15m sub-steps during high horizontal speeds.
  3. *Preserved Mechanics*: Mouse look, camera orientation, decoupled drive (5.0), and ground friction (3.0) remain intact.

---

## Investigation 22: High-Speed Movement Visual Smoothness & Root Cause Analysis (v49.1.1)

### High-Level Summary

- **Context & Diagnostic Findings**:
  - Naive raycast lerping on the 3rd-person camera failed to resolve high-speed visual choppiness because thin 1D raycasts flicker aggressively against collision geometry at high velocities.
  - Achieving butter-smooth high-speed motion while keeping physics and camera tracking 100% mathematically accurate requires addressing three key rendering artifacts.

- **Root Cause Analysis of Remaining Visual Choppiness**:
  1. **Browser Frame-Delta Jitter (The Primary Culprit)**:
     - Browsers do not invoke `requestAnimationFrame` at a perfectly rigid 16.666ms; frame intervals fluctuate irregularly (e.g., 14ms, 18ms, 15ms).
     - At standard walking speeds (7 m/s), a 2ms delta variance is unnoticeable. At high-velocity dash speeds (60 m/s), an 18ms frame translates the character **1.08 meters**, whereas a 14ms frame translates **0.84 meters**.
     - This 0.24m inter-frame translation variance is perceived by the eye as micro-stutter/judder.
     - **Status (RESOLVED)**: Implemented in `animate()` loop using a 4-sample rolling history buffer (`dtHistory`) clamped between `0.008` and `0.05` seconds. High-speed translation distance step variances caused by browser timer jitter are now smoothed out.
  2. **Razor-Thin 1D Raycast Third-Person Camera Collision**:
     - The third-person camera currently evaluates a razor-thin 1D ray. When dashing past obstacles, this single point ray rapidly flickers between hitting a geometry vertex/edge and hitting empty air, producing instant camera position popping.
     - *Solution*: Upgrade camera occlusion checks to a sphere-cast (~0.2m collision radius) or pull the ray origin slightly forward to prevent snagging on microscopic corner edges.
  3. **Optical Strobing at High Speeds & Dynamic FOV Speed Warp**:
     - At 60 FPS, translating 1 full meter per frame without optical velocity cues creates natural display strobing.
     - *Solution*: Implement dynamic FOV speed warping—briefly kicking FOV by +6° to +8° during high-speed dashes and smoothly easing back, stretching peripheral motion vectors for fluid, cinematic motion (matching high-speed titles like *Ultrakill*, *Titanfall*, and *Warframe*). 

- **Implementation Roadmap**:
  - **Step 1 (Completed)**: Frame Delta Smoothing implemented in `animate()`.
  - **Step 2 (Next)**: Upgrade 3rd-Person Camera collision checks to a sphere-cast (~0.2m radius).

---

## Investigation 23: Ragdoll Collision Impulses, Corpse LOD Filtering, Bot Outline Opacity, and Echo Bot Navigation Sticking

### High-Level Summary

- **Context & Diagnostic Findings**:
  - Detailed architectural review of ragdoll collisions against jump pads and active entities, LOD optimization filtering, bot wireframe outline dimming, and Echo Bot movement freezes.
  - Full details, root causes, and clean implementation guidelines are documented in `/docs/ragdoll_and_bot_issues_analysis.md`.

- **Root Cause & Solution Summary**:
  1. **Jump Pad Impulses & Corpse Collisions**:
     - *Root Cause*: `JumpPad.trigger` only applied forces to living entity velocity vectors (`velocity`), ignoring ragdoll velocity (`ragdollVelocity`) and leaving sleeping corpses (`isNaturallyStill = true`) static. `updatePlayerBox` also failed to update around `player.ragdollPos` upon death.
     - *Proposed Solution*: Update `JumpPad.trigger` to wake up ragdolls (`isNaturallyStill = false`) and apply impulse/torque vectors to ragdoll velocity, sync player bounding boxes to `ragdollPos`, and re-enable momentum transfer between living entities and dead bodies.
  2. **Corpse LOD Filtering Audit**:
     - *Root Cause*: Previous LOD optimization filtered out dead corpses (`!isDeadCorpse`) from spatial grid queries and mutual bumping loops.
     - *Proposed Solution*: Safely re-include dead corpses in spatial hash grid queries with dormant ragdoll sleeping (`isNaturallyStill`), imposing negligible (<0.05ms) CPU cost for <12 active corpses.
  3. **Bot Wireframe Outline Dimming**:
     - *Root Cause*: Un-highlighting and spawn animation completion reset outline opacity to hardcoded `0.3` instead of respecting theme-defined `CONFIG.theme.outlineOpacity`.
     - *Proposed Solution*: Centralize outline opacity calculation via `Enemy.updateOutlineOpacity()` tied to theme defaults.
  4. **Echo Bot Navigation Sticking**:
     - *Root Cause*: Variable scope desync inside `EchoBot.scope()` caused `this.echoBotInstance` or `this.camera` references to resolve against `AutoplaySystem` / `PlayerController` (`undefined`), forcing spatial queries to evaluate against the player's camera position instead of Echo Bot's position.
     - *Proposed Solution*: Pass explicit virtual camera/player references into AI evaluation methods and enforce strict `try...finally` scope restoration.





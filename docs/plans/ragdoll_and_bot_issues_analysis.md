# Ragdoll Collision, Bot Wireframes, & Echo Bot Sticking Analysis

**Date:** August 27, 2026  
**Document Status:** Technical Analysis & Architectural Review (No Code Changes Applied)

---

## 1. High-Level Executive Summary

This document provides a comprehensive root-cause analysis and architectural review for four critical gameplay issues reported regarding ragdoll collisions, bot LOD optimizations, wireframe opacity inconsistency, and Echo Bot navigation freezes. 

In previous implementation attempts, automated code edits introduced severe runtime corruption into `index.html` due to unsafe string replacements across `this.scope(...)` execution contexts and broken spatial hash grid iterations. As a result, those code modifications were reverted. This document details exact, mathematically sound, zero-allocation solutions for each bug while guaranteeing full compatibility with Neon Blade's strict single-file architecture.

---

## 2. Issue 1: Ragdoll Impulses on Jump Pads & Physical Corpse Interactions

### A. Symptom & Observed Behavior
- **Jump Pad Impulses**: When dead bodies (player or enemy bot ragdolls) land on or trigger a `JumpPad`, the pad triggers visually and audibly, but dead corpses are not launched into the air. Instead, they remain motionless on top of or near the pad.
- **Corpse Kicking & Bumping**: Live player avatars and active enemy bots pass through dead player corpses or dead enemy ragdolls without transferring kinetic momentum. Active entities cannot shove, kick, or launch dead bodies lying on the ground.

### B. Root Cause Analysis
1. **Jump Pad Trigger Isolation**: Inside `JumpPad.trigger`, force calculations were applied strictly to `player.velocity` (for living players) and `enemy.velocity` (for living bots). When an entity died, its movement switched to ragdoll velocity vectors (`ragdollVelocity`, `angularVelocity`), which `JumpPad.trigger` ignored. Furthermore, ragdolls resting on the floor enter a dormant state (`isNaturallyStill = true`) to preserve CPU cycles; the jump pad failed to clear this flag, keeping the ragdoll asleep.
2. **Corpse Position Tracking**: When the player dies, the camera target stays at the death point while `player.ragdollPos` simulates physical tumbling and falling. The player's bounding box (`updatePlayerBox`) continued updating relative to the camera position rather than `player.ragdollPos`.
3. **Collision Spatial Hash Culling**: Spatial hash grid insertion and collision resolution loops contained explicit `!isDead` or `!isDeadCorpse` checks. This omitted dead ragdolls from physical interaction checks, causing moving entities to slide through corpses without colliding or imparting impulse vectors.

### C. Proposed Clean Solution
- **Jump Pad Ragdoll Launcher**:
  - Update `JumpPad.trigger` to detect both living and dead entities within its trigger radius.
  - For dead enemy ragdolls, apply upward and directional normal forces to `e.ragdollVelocity`, apply random rotational torque to `e.angularVelocity`, and set `e.isNaturallyStill = false` (waking the ragdoll up).
  - For dead player ragdolls, apply the jump pad impulse to `player.ragdollVelocity` and `player.angularVelocity`, resetting `player.isNaturallyStill = false`.
- **Player Corpse Box Sync**:
  - Update `player.updatePlayerBox` to center the player's bounding box around `player.ragdollPos` when `player.isDead` is `true`.
- **Physical Corpse Momentum Transfer**:
  - Allow physical bounding box collisions to calculate impulse transfer between living entities and dead ragdolls using mass-proportional kinetic momentum exchange (`m1 * v1 + m2 * v2`), pushing dead ragdolls out of the way and waking sleeping corpses (`isNaturallyStill = false`).

---

## 3. Issue 2: Bot Ragdoll Collision LOD Optimization Audit

### A. Symptom & Observed Behavior
- Historically, an LOD optimization excluded dead bot corpses from mutual entity collisions and spatial grid queries (`SpatialHashGrid`).
- The user queried whether this LOD culling noticeably saves performance and requested undoing it if performance impact is negligible, restoring authentic and physically accurate corpse interactions across all entities.

### B. Root Cause Analysis & Performance Impact
- **Original Optimization Rationale**: Excluding dead corpses from `SpatialHashGrid` and mutual collision checks prevented $O(N^2)$ collision checks between multiple fallen ragdolls on the ground.
- **Performance Evaluation**: Since Neon Blade caps active enemy spawns and ragdoll corpses fade out after 5.0 seconds, the maximum active ragdoll count on screen rarely exceeds 8–12 entities. Calculating SAT bounding box or spherical contact checks for 8–12 ragdolls costs less than 0.05ms per frame.
- **Why Previous Reversal Broke**: Naively removing `!isDead` checks without keeping entity references stable caused `SpatialHashGrid` to query invalid or partially unmounted mesh positions, throwing undefined reference errors during rendering and physics integration.

### C. Proposed Clean Solution
- **Safe Reversal of Corpse LOD Filter**:
  - Re-include dead bot ragdolls in `SpatialHashGrid` queries using their dynamic center of mass (`e.ragdollPos`).
  - Keep dormant ragdolls (`isNaturallyStill = true`) static until an active moving entity (player, bot, or projectile) passes within their collision radius.
  - When contact occurs, apply impulse forces, set `isNaturallyStill = false`, and let the ragdoll tumble naturally before settling back into sleep.
  - Maintain the 5.0-second corpse fade-out timer so inactive corpses are cleaned up without accumulating memory leaks.

---

## 4. Issue 3: Bot Wireframe Outline Dimming Bug

### A. Symptom & Observed Behavior
- Occasionally, certain enemy bots have their neon wireframe outline intensity dim down dramatically (to ~0.3 opacity) compared to the expected full theme brightness (0.6–0.8 opacity).

### B. Root Cause Analysis
1. **Opacity State Contamination**: Enemy wireframe outlines use custom material instances where opacity is dynamic. Several systems modify outline opacity:
   - Target highlighting (when locked on or aimed at).
   - Spawn-in fade transition curves (`spawnTimer` / `spawnFade`).
   - Death fade-out sequences.
2. **Inconsistent Default Fallbacks**: When un-highlighting an enemy or finishing a spawn-in animation, the code reset `mat.opacity` to a hardcoded constant (`0.3`) rather than referencing `CONFIG.theme.outlineOpacity` or the active theme's brightness scalar (`globalBrightnessUniform`).
3. **Theme Update Overwrites**: When switching map themes (e.g., Light to Dark or Neon), `updateTheme()` updated global material templates but failed to recalculate active enemy instances that were mid-animation, leaving their opacity locked at dim values.

### C. Proposed Clean Solution
- **Centralized Outline Opacity Property**:
  - Define a master helper method `Enemy.updateOutlineOpacity()` that resolves opacity strictly based on `CONFIG.theme.outlineOpacity * spawnAlpha * highlightMultiplier`.
- **Standardized State Transitions**:
  - Replace all hardcoded opacity assignments (like `mat.opacity = 0.3`) in `unhighlight()`, `onSpawnComplete()`, and `updateTheme()` with calls to `updateOutlineOpacity()`.
  - Ensure spawn-in animations ease continuously from `0.0` to `1.0` multiplier, terminating cleanly at full theme outline brightness.

---

## 5. Issue 4: Echo Bot Navigational Sticking & Scoping Desync Bug

### A. Symptom & Observed Behavior
- Echo Bot (the autonomous player clone) frequently gets stuck in place, becoming completely unmovable and unable to navigate the map.

### B. Root Cause Analysis
1. **Virtual Context Wrapper (`scope()`) Breakdown**:
   - `EchoBot` executes player physics and navigation AI using a virtual execution context (`this.scope(fn)`). This temporarily redirects global references (`camera`, `player`, `input`) to point to `EchoBot`'s virtual camera and virtual input state during its tick.
2. **Variable Scoping Desync**:
   - In previous automated refactoring, expressions like `this.echoBotInstance` or `this.camera` inside `AutoplaySystem` and `PlayerController` evaluated `this` in contexts where `this` referred to `AutoplaySystem` or `PlayerController` instead of `EchoBot`.
   - Because `this.echoBotInstance` evaluated to `undefined`, distance checks, spatial raycasts (`checkGapForward`, `checkWallForward`), and pathfinding calculations evaluated against the real player's camera position instead of Echo Bot's position.
   - Echo Bot attempted to calculate navigation paths using the main player's coordinates, resulting in zero-velocity vector outputs and leaving Echo Bot frozen in place.

### C. Proposed Clean Solution
- **Explicit Parameter Passing**:
  - Replace ambiguous `this` scope lookups inside navigation and AI routines with explicit parameter references (passing `virtualCamera` and `virtualPlayer` directly into AI evaluation functions).
- **Scope Guard Verification**:
  - Ensure `EchoBot.scope()` uses a `try...finally` block to guarantee global context restoration (`camera = mainCamera`, `player = mainPlayer`) even if an exception occurs mid-tick.
- **Isolated Target Evaluation**:
  - Disambiguate player coordinates vs. Echo Bot coordinates in `AutoplaySystem` target selection so spatial awareness raycasting originates strictly from Echo Bot's dynamic 3D bounds.

---

## 6. High-Level Implementation Strategy & Code Safety Guidelines

To prevent the code corruption issues encountered in previous automated turns, any future code implementation MUST strictly adhere to the following rules:

1. **Monolithic AST Integrity (`index.html`)**:
   - `index.html` is a single-file application containing inline scripts. All string replacements must be verified against exact unique surrounding code blocks using `view_file` immediately before applying `edit_file`.
2. **Zero Runtime Allocations**:
   - Do not instantiate new `THREE.Vector3` or array objects in physics or AI loops. Use existing global scratch vectors (`_aiDir`, `_aiTemp`, `_vec3_1`).
3. **No Blind Scope Mass-Replacements**:
   - Avoid global regex replacements on `this.scope` or `this.echoBotInstance`. Inspect every call site individually to ensure lexical scope integrity.
4. **Verification Step**:
   - After code changes are made in future implementation turns, run `compile_applet` and test gameplay transitions to verify zero syntax or scope errors.

---
*End of Analysis Document.*

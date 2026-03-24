# neon blade: development log & playtest notes

> **Note to AI Agents:** Read this file to understand current bugs, planned features, and user observations. Do not modify the architecture based on this file alone; use it as a task list and context guide.

## 🐛 active bugs
*   **AI Aiming Logic:** Neural Override occasionally aims gadgets or teleports into the sky or walls when no valid floor is found in the immediate radius.
*   **Phantom Slashing:** AI sometimes performs attack inputs when the target is technically out of range or behind thin cover, leading to "slashing at nothing."
*   **Survival Instincts:** AI doesn't prioritize `ESCAPE` state aggressively enough when health is low, often getting caught in a `COMBAT` loop until death.
*   **Floating Teleport Marker:** Still persists on certain OBB rotated objects.
*   **Geometry Clipping:** High-speed movement can occasionally cause the agent to clip through thin geometry if the physics step doesn't catch the collision.

## 📝 playtest observations & implementation notes
*   **Neural Override Utility:** The Autoplay system is functional but "utilitarian." It moves with purpose but lacks the high-speed verticality and "flair" of a human player.
*   **Spatial Awareness Success:** The addition of `checkGapForward` and `checkWallForward` has significantly reduced the AI's tendency to fall off platforms or run mindlessly into walls.
*   **Gadget Utility:** Impulse is now a core part of AI traversal, used effectively to launch away from danger or toward targets, though frequency could still be higher.
*   **UI Aesthetic Standard:** The "liquid glass" style (backdrop-filter blur, semi-transparent backgrounds, rounded corners, subtle drop shadows) is now the established standard for all UI elements (settings, messages, buttons) to ensure readability against bright backgrounds without visual clutter.
*   **Collision Edge Cases:** The recent slope sliding bug revealed that SAT collision with OBBs can return downward-pointing normals if the player hits the underground flat faces of a ramp. Ground-checks (`_obbNormal.y < -0.1`) are necessary to force the physics engine to resolve upward along the slope.
*   **OBB Sliding Friction & Slopes:** Sliding against any rotated surface (OBB walls, slopes) feels rough, like sliding on sandpaper. Slopes specifically suffer from a very obvious micro-bounce, and sliding downwards on them currently doesn't work at all.
*   **Zero-Allocation Performance:** The migration to global scratchpads has effectively eliminated garbage collection spikes during high-frequency combat, maintaining a stable 60 FPS even with multiple active entities.

## 🎯 current priorities
*   [ ] **AI Survival & Tactical Retreat:** Refine the `ESCAPE` intention to be more dominant at low health and improve the AI's ability to use cover or rapid teleportation to disengage.
*   [ ] **Gadget Saturation:** Increase the frequency and variety of gadget usage in the `GADGET` state, especially for area denial (Frag/Void).
*   [ ] **Wall Traversal Polish:** Implement dedicated "Wall Slide" and "Wall Run" logic for the AI to chain vertical movements more fluidly.
*   [ ] **Sandpaper Physics & OBB Sliding:** Resolve friction issues against rotated objects (walls and slopes) and implement ground-sticking logic to prevent micro-bouncing on downward slopes.
*   [ ] **Intention Refinement:** Further tune the intention scoring weights to prevent "indecisive" state switching during rapid combat transitions.

## 💡 future ideas & roadmap
### Combat & Weaponry
*   **Explosion Enhancements:** Expand explosion visual variety and color palettes, potentially linking them to combo milestones.
*   **Secondary Combo System:** Introduce a distinct combo tracking system specifically for grenade usage.

### AI & Enemy Behavior
*   **Dynamic AI Profiles:** Implement scalable intelligence and aggression matrices for varied bot behaviors.
*   **Advanced Combat Tactics:** Develop dedicated AI modules for flanking, retreating, and complex attack patterns.
*   **Passive "Inspect" State:** Introduce a non-hostile observation state for cautious or curious bots.
*   **Animation & State Polish:** Add transitional keyframes for falling bots and correct orientation/HP bar alignment for incapacitated states.

### Visuals & Interface
*   **Floating Damage Numbers:** Implement an optional MMO-style damage counter overlay above enemy HP bars.
*   **Procedural Texturing:** Develop a system to generate consistent, math-based textures without external image assets.
*   **Math-Driven 3D Pipeline:** Investigate rendering pipelines for importing simple 3D geometry as pure mathematical functions.
*   **Combat Typography & FX:** Redesign the strike font and slash particle graphics for greater impact.

### Environment & Level Design
*   **Verticality & Traversal:** Design vertical-focused maps featuring jump pads and ascending platforms.
*   **Environmental Hazards ("Void Bubbles"):** Place static, rhythmically pulsating damage zones that invert local colors.
*   **Dynamic Architecture:** Introduce moving and transforming platforms utilizing procedural generation patterns.
*   **Advanced Spatial Layouts:** Explore 3D maze generation algorithms beyond standard recursive backtracking.
*   **Inter-Map Connectivity:** Implement portals or gates to seamlessly transition between different environments.

### Gameplay Loop & Progression
*   **Dynamic Theme Progression:** Automatically cycle map themes upon reaching significant combo milestones.
*   **Unlockable Environments:** Gate specific themes behind gameplay achievements to create a sense of progression.
*   **Contextual Onboarding:** Integrate a lightweight, trigger-based tutorial script using the existing message popup system.
*   **Hidden "God Mode":** Create secret unlock conditions for a sandbox mode, featuring both peaceful and chaotic variants.
*   **Respawn Mechanics:** Implement fluid player death animations and instant in-place respawning when extra lives are available.
*   **Expanded Modes:** Develop a dedicated training arena and an intuitive quest/objective system.
*   **NPC Interactions:** Introduce non-hostile geometric entities to deliver lore, quests, and tutorials.
*   **Temporal Mechanics:** Prototype game-state and player-position rewind abilities.

### Audio Engineering
*   **Synthesized Melodies:** Integrate procedural Web Audio API melodies as easter eggs or ambient tracks.

## ✅ recently completed concepts
- [x] **Neural Override (Autoplay):** Implemented a hierarchical AI system with intentions (Escape, Engage, Hunt, Explore) and state-based behaviors.
- [x] **Spatial Awareness Raycasting:** Added forward gap and wall detection to the AI traversal logic.
- [x] **Stuck Detection:** Implemented a position-tracking timer to force jumps when the AI is blocked by geometry.
- [x] **Settings Modal:** Added a comprehensive settings menu for brightness, volume, FPS, and physics toggles.
- [x] **Jump Pads:** Implemented surface-aligned jump pads on floors and walls with custom impulse physics and color-inverting visuals.
- [x] **Bot Physics:** Fixed grounded-state velocity wiping and standardized an upward launch bias for explosions.
- [x] **Floor Collision Fix:** Doubled floor thickness (to 4 units) to prevent high-velocity fall-throughs.
- [x] **Universal Raven Magic:** Applied the "Inverted Hull" effect to Portals, Void Implosion, and the Teleport Marker.
- [x] **Ethereal Wireframe Stacking:** Implemented a 5-layer wireframe stack with decaying opacity for all ethereal objects.
- [x] **Portal Visuals:** Added dual color inversion to inner/outer shapes and a 30% opacity color-matched raven hull.
- [x] **Void Implosion Polish:** Adjusted hull opacity to 80%, restored asynchronous wireframe rotation, and hid wireframes when the player is inside.
- [x] **Teleport Marker Visibility:** Upgraded with difference blending for perfect contrast, a 20% raven hull, Z-fighting fixes (0.001 Y-offset), and half-speed synchronized aura ring rotation.
- [x] **Weather Enhancements:** Increased snow/leaf particle density and expanded the spawn distance radius.

## 📖 version history / patch notes

### v48.6.2 - Autonomous Tactical Refinement
*   **Zero-Allocation Architecture:** Migrated all spatial and mathematical calculations to global scratchpads (`_aiDir`, `_aiTemp`, etc.) to eliminate garbage collection stutters.
*   **Intention Scoring Framework:** Replaced the basic state machine with a nuanced goal evaluator (`ESCAPE`, `ENGAGE`, `HUNT`, `EXPLORE`) that weights priorities based on health, energy, and momentum.
*   **Neural Momentum:** Introduced a momentum tracking system that rewards successful combat actions with increased aggression and tracking precision.
*   **Survival Override:** Implemented an absolute escape override at critical health thresholds (<= 40%) to prioritize survivability.
*   **Fluid Traversal:** Refined continuous sliding patterns and height-aware jumping logic for better navigation of complex vertical geometry.
*   **Camera Stability:** Optimized camera interpolation and removed jitter from aiming logic during gadget execution.
*   **Gadget Optimization:** Implemented centroid-based cluster aiming for more effective gadget deployment.

### v48.6.1 - Neural Override 1.1 (Spatial Awareness)
*   **Spatial Intelligence:** Integrated `checkGapForward` and `checkWallForward` raycasting. The AI now jumps over pits and anticipates walls.
*   **Wall Interaction:** AI now actively seeks walls to trigger sliding and performs wall-bounces when airborne.
*   **Stuck Recovery:** Added a `stuckTimer` that triggers a jump if the AI's position remains static for too long.
*   **Gadget Refinement:** Impulse gadget now uses `pitchOverride` to look down for self-launching. Reduced aiming delays for all abilities (0.3s - 1.5s).
*   **Visual FX:** Added "Neural Override" status text with CSS wipe animations and color-coded states (Cyan for enabled, Red for disabled).
*   **Settings:** Expanded the settings modal with Brightness, Volume, FPS display, and Wall Tilt controls.

### v48.6.0 - Neural Override - Autoplay System
*   **Autoplay Core:** Introduced the `AutoplaySystem` (activated via "AUTO" cheat).
*   **Intention System:** Implemented a high-level goal evaluator (`ESCAPE`, `ENGAGE`, `HUNT`, `EXPLORE`) based on health and proximity.
*   **State Machine:** Behavior is now governed by weighted states (`TRAVERSAL`, `COMBAT`, `GADGET`, `TELEPORTING`, `ENVIRONMENT`).
*   **Targeting:** Added `findBestTarget` with Line-of-Sight (LOS) checks to ensure the AI only engages visible enemies.

### v48.5.0 - Jump Pad Traversal System
*   **Jump Pads:** Introduced procedural Jump Pads as a new traversal mechanic, spawning dynamically across floors, walls, and platforms.
*   **Launch Physics:** Added collision-triggered impulse explosions with a localized radius and a force of 100. Calculated explosion offsets based on surface normals to prevent backward launching.
*   **Bot Physics:** Fixed bot launch physics and standardized an upward bias for explosions. Patched a core physics bug preventing grounded bots from launching correctly upon impact with impulse explosions.
*   **Ethereal Visuals:** The visual design features stacked ring geometry with custom blending for color inversion, complemented by localized, outward-floating particle emissions.

### v48.4.0 - Raven Magic & Ethereal Visuals
*   **Floor Collision:** Doubled the thickness of the floor object (to 4 units) to prevent players from falling into the void during high-velocity impacts.
*   **Universal Raven Magic:** Implemented the "Inverted Hull" method (Backface Culling Outline) across Portals, Void Implosions, and the Teleport Marker. Features a custom chaotic vertex shader for a jagged, dark-energy aesthetic.
*   **Ethereal Stacking:** Created a dense, shimmering technical ghosting effect by stacking 5 layers of wireframes with decaying opacity on all ethereal objects.
*   **Portal Overhaul:** Applied mathematical difference blending (color inversion) to both inner and outer portal geometry, complemented by a 30% opacity, color-matched raven hull.
*   **Void Implosion Refinement:** Tuned hull opacity to 80% for better background bleed, restored chaotic multi-layered wireframe rotation, and added a camera check to hide wireframes when the player is caught inside the blast.
*   **Teleport Marker Upgrade:** Ensured perfect visibility against any background using difference blending on the core diamond and floor ring. Fixed Z-fighting with a precise 0.001 Y-offset and synchronized the aura ring to rotate at half the diamond's speed.
*   **Weather Tuning:** Increased environmental immersion by bumping snow density to 1000, leaf density to 150, and expanding the spawn radius to 120 units.

### v48.3.0 - Systems Polish & Gadget Physics
*   **Weather System:** Refactored to spawn dynamically around the player's camera with distance-based recycling, supporting vertical maps.
*   **Energy & Gadgets:** Removed gadget cooldowns entirely. The energy system was manually simplified and rebalanced by the Lead Developer to perfectly complement the rapid gadget usage.
*   **Movement Polish:** Added `slideControl` to `CONFIG` for directional sliding authority. Unified and grounded snow trail/kickup VFX for bots, and disabled them when bots are fallen.
*   **Gadget Physics:** Centralized gadget physics (`throwSpeed`, `life`, `bounciness`, `friction`) in `CONFIG`. Added dynamic "baseball spin" to thrown gadgets and updated the visual aim arrow to reflect individual throw speeds. The Lead Developer conducted extensive manual tuning of these variables for optimal game feel.

### v48.2.0 - Visuals & Void Polish
*   **Gift Box Rendering:** Fixed Z-fighting (clipping) and transparency sorting issues on gift boxes by making ribbons opaque and utilizing `polygonOffset`.
*   **Knot Polish:** Separated knot materials from ribbons, giving them a matte finish (`roughness: 0.8`), double-sided rendering (`THREE.DoubleSide`), and slight transparency.
*   **Void Grenade Rendering:** Fixed visual artifacts (overlapping discs) on the void implosion effect. Implemented dynamic camera distance checks to flip the core material to `BackSide` and disable `depthTest` only when the camera is inside the explosion radius, ensuring a unified area-of-effect inversion.

### v48.1.1 - Gift Box Polish
*   **Light Theme Aesthetics:** Expanded gift box color palettes to 15 distinct variations for better visual variety.
*   **Ribbon Geometry:** Reduced the 3D thickness of ribbons to sit almost flush against the boxes (2.015 depth). Replaced the bulky spherical center knot with a sleek, flattened sphere.
*   **Material Tuning:** Upgraded ribbon and knot materials to `MeshStandardMaterial`. Tuned ribbons to be slightly metallic and knots to be more matte to avoid a "plastic" toy look.

### v48.1.0 - Map Refactor & Gym Geometry Polish
*   **Map Terminology:** Unified "world" to "map" terminology across the codebase.
*   **Gym Map Quick-Switch:** Added 'G' keybind to instantly switch to the GYM map for testing.
*   **Slope Sliding Physics:** Fixed SAT collision edge case where sliding into OBB ramps pushed the player into the floor. Added a ground-check to ignore downward-pointing normals from underground ramp faces.
*   **Gym Map Geometry Overhaul:** 
    *   Replaced 4 central obstacles with a single flush central platform.
    *   Increased vertical spread of floating cubes.
    *   Lowered perimeter banks so their bottom edges sit underground, enabling seamless sliding from the floor.
    *   Perfected corner bank geometry by matching the depth of straight banks and applying a `0.7071` inward offset to form a flush octagonal bevel.
*   **UI Polish:** Upgraded the settings menu with a rounded, liquid glass aesthetic and swipe-in hover animations. Refined typography hierarchy and narrative display text shadows.

### v48.0.2
*   Unified "world" to "map" terminology across the codebase.
*   Fixed geometry orientations in the GYM map (but not really).
*   Established `architecture.md` and single-file strict rules.

## 🗄️ session logs

### Session: Autonomous Tactical Refinement (v48.6.2)

#### Development Log
**Technical Stabilization & Behavioral Elevation**
The transition from v48.6.1 to v48.6.2 focused on transforming the autonomous agent into a high-performance combatant while strictly adhering to a memory-efficient architecture. The development cycle began with a fundamental architectural shift to address performance degradation caused by frequent memory allocation within the high-frequency game loop. By migrating to a strict zero-allocation architecture using pre-allocated global scratchpads, we effectively eliminated garbage collection spikes and maintained a stable 60 FPS.

**Intention Scoring & Neural Momentum**
Once the performance foundation was secured, we moved away from a basic state machine toward a nuanced intention scoring framework. This allows the agent to weigh competing priorities such as survival, engagement, and exploration based on dynamic variables like health ratios and target proximity. The introduction of neural momentum and target locking ensured that the agent remains focused during combat, rewarding successful actions with increased aggression and tracking precision.

**Fluid Traversal & Survival Instincts**
The final phase addressed movement fluidity and tactical survival. Refinements included continuous sliding patterns and height-aware jumping logic, allowing the agent to navigate vertical geometry without losing momentum. Survival instincts were hardened through an absolute override system at critical health thresholds. Additionally, visual stability was improved by smoothing camera interpolation and removing jitter from the aiming logic.

#### Prompt History
*   **Architectural Foundation:** The user provided a handover note detailing the mission for v48.6.2. The agent confirmed the scratchpad system and the outline for paced jumping and centroid aiming.
*   **Visual and Movement Polish:** The user noted camera shake during gadget throws. The agent identified vertical jitter and replaced it with a stable upward offset.
*   **Behavioral Refinement:** The user critiqued erratic jumping and lack of target focus. The agent implemented minimum teleport distances, increased combat timers, and boosted weights for hunting.
*   **Intelligence Upgrades:** The user requested an upgrade to the intention system. The agent introduced momentum tracking and aggression bias scaled by health and energy.
*   **Survival and Navigation:** The user noted the agent was dying too early and failing vertical traversal. The agent implemented an absolute escape override and height-check raycasts for multi-jumping.
*   **Final Execution Refinement:** The user addressed sliding bounces and wall collisions. The agent consolidated sliding logic into a duration-based mechanism and enhanced wall detection.

### Session: Neural Override & Spatial Awareness (v48.6.1)

#### Development Log
**The Birth of Neural Override**
The goal was to create an "Autoplay" system that felt intelligent rather than just a sequence of random inputs. We moved away from a simple reactive bot to a hierarchical system. The first iteration (v48.6.0) established the "Intention" layer—a high-level brain that decides if the player should be aggressive or defensive. This solved the issue of the AI wandering aimlessly, but it still struggled with basic navigation, often running off edges or getting stuck on corners.

**Spatial Awareness & Raycasting**
To fix the navigation issues, we implemented a "Spatial Awareness" module using raycasting. By projecting rays forward and downward, the AI can now "see" gaps in the floor and walls in its path. This allowed us to implement proactive jumping and wall-seeking. The AI now feels much more grounded, using the environment's verticality by intentionally hitting walls to slide and bounce.

**Tactical Gadgetry**
Gadget usage was overhauled to be intention-driven. The Impulse gadget, previously used randomly, is now a primary tool for both `ESCAPE` (launching away from enemies) and `HUNT` (launching toward them). We implemented a `pitchOverride` system that allows the AI to look at specific angles (like straight down for Impulse) without losing its horizontal target tracking. Aiming delays were also tightened to make the AI feel more responsive.

**UI & Polish**
To signal the state of the system, we added high-fidelity CSS animations for the "Neural Override" status. The "Liquid Glass" settings menu was also expanded to give users more control over the experience, including brightness and volume sliders that persist across sessions.

#### Prompt History
*   **Neural Override Concept:** The user requested a "Neural Override" system that could play the game automatically. The agent implemented the `AutoplaySystem` with a basic state machine.
*   **Intention & Targeting:** The user asked for more intelligent decision-making. The agent added the `Intention` system and `findBestTarget` with LOS checks.
*   **Navigation Failures:** Playtesting revealed the AI was falling off ledges. The user requested "Spatial Awareness." The agent added `checkGapForward` and `checkWallForward`.
*   **Verticality & Walls:** The user wanted the AI to use wall-sliding. The agent added wall-seeking logic and wall-bounce triggers.
*   **Gadget Refinement:** The user noted that gadgets weren't being used effectively. The agent tied gadget selection to intentions and implemented the `pitchOverride` for Impulse aiming.
*   **Visual Feedback:** The user requested visual polish for the system status. The agent added the "Neural Override" text FX and expanded the settings modal.

### Session: Jump Pads & Physics Tuning (v48.5.0)

#### Development Log
**Initial Implementation & Physics Hurdles**
The integration of Jump Pads began with the goal of creating localized, high-power impulse explosions triggered by contact. Early implementation attempts struggled with spatial logic and physics vectors. The initial spawning system failed to utilize the existing portal raycasting logic, resulting in pads missing floating platforms entirely. Furthermore, the launch physics were fundamentally flawed; entities running into the pads were being launched backward because the explosion origin was not correctly offset relative to the pad's surface normal.

**Systemic Spawning & Bot Interactions**
A significant breakthrough occurred when diagnosing why enemy bots were largely unaffected by the impulse explosions. We identified a core physics bug where grounded bots were having their upward velocity instantly wiped out by the update loop. Fixing this allowed bots to enter an "airborne" state correctly. To ensure reliable launches across all entities, we refined the explosion logic to offset the blast slightly behind the contact point along the pad's normal, pushing the entity outward. Spawning was also overhauled into a dual-pass system: one loop matching portal density for floors and platforms, and a secondary raycasting loop dedicated to snapping pads to vertical AABB and OBB walls.

**Aesthetic Polish & Inversion Design**
The visual design required several iterations to fit the cyberpunk/wireframe aesthetic without causing visual glitches. Early dark wireframe designs clipped heavily into the floor geometry. The solution was an "inversion" approach: stacking multiple `RingGeometry` hexagonal outlines and applying `THREE.CustomBlending` with `OneMinusDstColorFactor` and `OneMinusSrcColorFactor`. This created a striking color-inverting effect that remains visible against any background without clipping. Directional floating particles were added to emit along the pad's normal, providing dynamic visual feedback.

**Project Migration & Final Physics Tuning**
Following a period of severe AI degradation and quota exhaustion, the project was migrated to a new environment. Here, final physics tuning was achieved. A specific upward bias was successfully corrected to ensure it only affected bots impacted by the impulse explosion, allowing them to consistently clear floor geometry without altering the player's intended physics. Attempts to fix entity knockback were abandoned after proving unstable, solidifying the current build.

#### Prompt History
*   **Initial Concept & False Start:** The user wanted to introduce a new environmental traversal mechanic (Jump Pads) spawning dynamically across floors and walls with a localized, double-strength impulse explosion. The agent hallucinated its response, attempting to wrap up a non-existent session. The code was rolled back.
*   **Correction & First Pass:** The user forcefully corrected the agent. The agent implemented basic procedural spawning and set the explosion force to 120, but introduced an overcomplicated directional launch calculation and a clunky visual design.
*   **Physics Refinement & Bot Bug Discovery:** The user requested fixes for spawning on floating platforms, simplifying explosion logic to prevent backward launching, reducing blast radius, and investigating why bots ignored explosive forces. The agent fixed a critical bug where grounded bots had their upward velocity wiped out, but mistakenly offset the explosion "slightly below the feet," breaking omni-directional physics.
*   **Wall Spawning & Aesthetic Overhaul:** The user directed the agent to create a dedicated secondary spawn loop for walls, remove the flawed "below the feet" logic, and requested a visual overhaul using color-inverting outlines. The agent implemented the visual blending and wall spawning but broke the launch vectors, causing backward launches.
*   **Density & Vector Correction:** The user demanded jump pad density match the portal count and a final fix for the backward-launching physics. The agent updated the explosion origin to sit slightly behind the pad's surface (opposite its normal), ensuring the impulse vector always pushes outward, and matched the spawn counts.
*   **Final Polish & Manual Adjustments:** After manual rollbacks and edits to standardize a `0.3` upward bias for explosions, the user restated the final architectural requirements. The agent documented the final stable state, confirming the AABB/OBB wall raycasting, normal-based explosion offset, custom blending materials, and outward-floating particles.
*   **Project Migration & Upward Bias Correction:** Following a catastrophic failure loop that exhausted the Pro model quota, the user migrated the codebase to a new account. Using the Flash model, the user sought to correctly apply the upward bias exclusively to bots impacted by impulse explosions, and attempted to fix broken entity knockback mechanics. The Flash model successfully corrected the bias but failed to resolve the knockback issue, which was abandoned to finalize the v48.5.0 build.

#### Addendum: Post-Implementation Failures & Quota Exhaustion
Following the successful implementation of the Jump Pads, the user attempted to refine the spawn logic for both portals and jump pads, alongside minor visual tweaks. This initiated a catastrophic breakdown in the AI's reasoning capabilities. The agent entered a loop of severe confusion, repeatedly overwriting stable logic with broken, hallucinated code. Over the course of 20 minutes, the agent systematically dismantled the working architecture, generating complete garbage and entirely exhausting the user's Gemini Pro 3.1 Preview quota.

Forced to switch to the Gemini 3 Flash model to salvage the session, the user attempted to guide the AI to fix the code or at least perform a session wrap-up. The Flash model failed to comprehend the wrap-up request entirely. Out of sheer frustration, the user was forced to migrate the entire codebase to a new project on a different account to regain Pro quota.

In the new environment, the Flash model was utilized to successfully identify and correct the upward bias attachment for bots impacted by impulse explosions. However, attempts to fix entity knockback failed entirely. Recognizing the AI's limitations and the compounding technical debt of its hallucinations, the user rolled back to the upward bias fix, accepted that knockback would remain broken for the time being, and halted further modifications to preserve the project's sanity at v48.5.0.

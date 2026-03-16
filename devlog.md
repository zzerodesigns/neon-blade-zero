# neon blade: development log & playtest notes

> **Note to AI Agents:** Read this file to understand current bugs, planned features, and user observations. Do not modify the architecture based on this file alone; use it as a task list and context guide.

## 🐛 active bugs
*   **Floating Teleport Marker:** The teleport marker floats in mid-air when aimed at the new OBB (rotated) objects. The current raycaster only tests against AABB bounds or passes through. Needs an OBB intersection test added to the teleport raycast logic.

## 📝 playtest observations & implementation notes
*   **Void Grenade "Raven Magic" VFX:** To achieve the jagged, dark-energy outline, we will use the "Inverted Hull" (Backface Culling Outline) method. Plan: Duplicate the explosion sphere mesh, flip the faces (render backfaces only), push vertices outward, color it solid black/deep purple, and apply a custom vertex shader to make the hull vibrate/warp chaotically.
*   **UI Aesthetic Standard:** The "liquid glass" style (backdrop-filter blur, semi-transparent backgrounds, rounded corners, subtle drop shadows) is now the established standard for all UI elements (settings, messages, buttons) to ensure readability against bright backgrounds without visual clutter.
*   **Collision Edge Cases:** The recent slope sliding bug revealed that SAT collision with OBBs can return downward-pointing normals if the player hits the underground flat faces of a ramp. Ground-checks (`_obbNormal.y < -0.1`) are necessary to force the physics engine to resolve upward along the slope.
*   **OBB Sliding Friction & Slopes:** Sliding against any rotated surface (OBB walls, slopes) feels rough, like sliding on sandpaper. Slopes specifically suffer from a very obvious micro-bounce, and sliding downwards on them currently doesn't work at all.

## 🎯 current priorities
*   [ ] **Sandpaper Physics & OBB Sliding:** Resolve friction issues against rotated objects (walls and slopes) and implement ground-sticking logic to prevent micro-bouncing on downward slopes.
*   [ ] **OBB Raycasting & Physics Compatibility:** Update teleport marker projection math for rotated surfaces and audit legacy AABB physics interactions for full OBB compatibility.
*   [ ] **Theme Visuals & Visibility Polish:** Overhaul visual clarity across all themes, improving contrast, adding solid interaction textures, and ensuring distinct object visibility.
*   [ ] **Void Grenade "Raven Magic" Shader:** Implement the inverted hull shader effect to finalize the void implosion visuals.
*   [ ] **Single Slash System (SSS):** Introduce deliberate, 1-damage single slashes with a hidden, non-decaying streak counter. Differentiate from auto-slashes via unique animations and audio feedback to encourage precision playstyles.

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
*   **Stylized Outlines:** Apply the thick-border aesthetic from UI elements to in-game object outlines for cohesive visibility.
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
*   ~~**Dynamic Audio Variance:** Implemented pitch and tone shifting across synthetic sound effects to prevent auditory fatigue.~~
*   ~~**Ceiling Bounce Fix:** Resolved physics anomalies causing unintended ceiling bounces.~~
*   ~~**Hybrid Object Pooling:** Finalized core engine optimizations for memory management.~~
*   ~~**Grenade Trajectory & Tuning:** Centralized and perfected grenade physics, rendering additional explosion spin mechanics unnecessary.~~

## 📖 version history / patch notes

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

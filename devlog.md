# neon blade: development log & playtest notes

> **Note to AI Agents:** Read this file to understand current bugs, planned features, and user observations. Do not modify the architecture based on this file alone; use it as a task list and context guide.

## 🐛 active bugs
*   **Floating Teleport Marker:** The teleport marker floats in mid-air when aimed at the new OBB (rotated) objects. The current raycaster only tests against AABB bounds or passes through. Needs an OBB intersection test added to the teleport raycast logic.

## 📝 playtest observations & implementation notes
*   **Void Grenade "Raven Magic" VFX:** To achieve the jagged, dark-energy outline, we will use the "Inverted Hull" (Backface Culling Outline) method. Plan: Duplicate the explosion sphere mesh, flip the faces (render backfaces only), push vertices outward, color it solid black/deep purple, and apply a custom vertex shader to make the hull vibrate/warp chaotically.
*   **Weather System Limits:** The current weather system stops spawning particles above a certain height because the map is much bigger/taller now. To fix this and save memory, the weather emission volume should be tied to the player's position, wrapping or recycling particles as they fall outside the immediate radius.
*   **UI Aesthetic Standard:** The "liquid glass" style (backdrop-filter blur, semi-transparent backgrounds, rounded corners, subtle drop shadows) is now the established standard for all UI elements (settings, messages, buttons) to ensure readability against bright backgrounds without visual clutter.
*   **Collision Edge Cases:** The recent slope sliding bug revealed that SAT collision with OBBs can return downward-pointing normals if the player hits the underground flat faces of a ramp. Ground-checks (`_obbNormal.y < -0.1`) are necessary to force the physics engine to resolve upward along the slope.
*   **OBB Sliding Friction & Slopes:** Sliding against any rotated surface (OBB walls, slopes) feels rough, like sliding on sandpaper. Slopes specifically suffer from a very obvious micro-bounce, and sliding downwards on them currently doesn't work at all.

## 🚀 planned features / to-dos
*   [x] **Light Theme Overhaul:** Fix the awkward color schemes and make the 3D ribbons significantly thinner.
*   [ ] **Weather Optimization:** Update weather to spawn near/follow the player and remove the height ceiling.
*   [ ] **OBB Sliding Fix:** Smooth out general sliding against all rotated objects (walls and slopes) to eliminate the "sandpaper" friction.
*   [ ] **Downward Slope Sliding:** Force the player to stick to the ground while sliding to fix micro-bouncing and enable proper downward sliding.
*   [ ] **Void Grenade Outline:** Implement the "Raven magic" inverted hull shader effect.
*   [ ] **OBB Raycasting:** Update the teleport marker math to accurately project onto rotated surfaces.

## 📖 version history / patch notes

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

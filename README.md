<div align="center"> 
  <a href="https://zzerodesigns.github.io/neon-blade-zero/">
    <img width="1344" height="768" alt="Neon Blade" src="https://github.com/user-attachments/assets/c396f15e-ac16-405a-b6dd-e031c9a0430e" />
  </a>
</div>

<div align="right"><sub><a href="https://ai.studio/apps/200f290d-ca1c-408a-a930-c7038b93561e">Developed with AI Studio</a></sub></div>

# NEON BLADE: Melee Arena

**Neon Blade** is a high-fidelity, fast-paced 3D melee arena built on a strict **Single-File Architecture**. The entire engine—including hybrid 3D physics (SAT/CCD), kinematic moving platforms, procedural GLSL shaders, synthesized audio, procedural character animation, third-person action camera projection, and advanced decision-state AI—is contained entirely within a single `index.html` file.

---

## 🕹️ Play Now

### 1. Hosted Web Versions

#### Primary Release (GitHub Pages)
The primary stable build, synchronized with repository source code, version archives, and documentation:
# 👉 [zzerodesigns.github.io/neon-blade-zero](https://zzerodesigns.github.io/neon-blade-zero/) ⚔️

#### Official Live Deployment (Google AI Studio)
An official web deployment hosted directly via Google AI Studio:
## 👉 [neon-blade.ai.studio](https://neon-blade.ai.studio/) ⚡
*Receives updates directly as soon as they become available, often earlier than the GitHub Pages release while documentation is being updated. Provides instant in-browser play for the latest builds, though without downloadable offline files or commit release notes.*

### 2. Peak Performance & Archived Builds (Local)
For the intended experience, it is highly recommended to **run the game locally** as a local file.

*   **Latest Build:** Download the raw `index.html` file from the root directory.
*   **Archived Versions:** Go directly to the `/archive/` directory. All previous versions are saved and categorized across subfolders (e.g., `/archive/v48.x/`, `/archive/v49.x/`). Simply download any version and run it directly in your browser.
*   **Commit History (Alternative):** You can also navigate to any historical commit in the repository, open the `index.html` file at that commit state, and download it.

---

## ⚡ Performance Note: Local vs. Hosted

Due to modern browser security mitigations (such as **Spectre** and **Meltdown**), Chromium-based browsers (Chrome, Edge, Opera, Brave) enforce strict isolation contexts for hosted websites. 

When running via a URL (GitHub Pages or AI Studio), the browser often throttles timer precision and limits single-threaded execution efficiency to mitigate side-channel attacks. This can result in:
*   Subtle micro-stuttering.
*   Reduced input polling frequency.
*   Lower overall FPS in complex 3D environments like "TITAN", "MEGA_GYM", "MACHINA", or "3D_MAZE".

**Running the file locally (`file://`) bypasses many of these web-context overheads**, allowing the engine to access the full performance of your hardware. For 144Hz+ gameplay, use the local file.

---

## 🛠️ Project Philosophies & Core Architecture

*   **Zero Dependencies:** Built using Three.js (via CDN), native Web Audio API, and raw GLSL. No NPM packages, no build steps, and no build configurations required.
*   **Hybrid SAT Collision & Continuous Collision Detection (CCD):** Features a custom Separating Axis Theorem (SAT) collision solver backed by continuous swept-sphere verification. Prevents high-velocity tunneling across boxes, sloped ramps, trapezoids, rotated obstacles, hollow cylinders, and polyhedra.
*   **Procedural Character Animation & Dynamic Posture:** The holographic player avatar features responsive kinematics with speed-adaptive sprint diving, strafe banking, jump-crouch anticipation, and smooth lean transitions tuned for tactile control feedback.
*   **Kinematic Platform Simulation:** Supports real-time moving, sweeping, and rotating platforms (`MovingPlatform`) with dynamic matrix and bounding-box synchronization.
*   **Procedural GLSL Shaders & Crescent Slashes:** Custom GLSL shaders render the entire environment and combat FX on the GPU—featuring 3D crescent moon slash ribbons with fading arc shaders, optional binary glitch matrix overlays, coordinate-mapped triplanar floor materials, constant-width obstacle edge detection, and aerodynamic weather billboarding.
*   **Integrated Third-Person Action Camera:** An over-the-shoulder action camera ('3' key toggle) with collision-aware raycasting and a customizable holographic player avatar, decoupled from physical collision volumes to ensure zero physics interference.
*   **Dynamic Audio Synthesis:** Zero external audio asset overhead (no `.mp3` or `.wav` files). All sound effects—including sword slashes, dashes, mechanical teleports, stasis fields, and interface tones—are synthesized dynamically in the browser using the Web Audio API.
*   **Theme-Specific Skyboxes:** A camera-tracking skybox sphere runs localized shaders to render real-time cosmic nebulas, synthwave sunsets with wireframe scanlines, drifting dawn clouds, and eerie moonlit silhouettes.
*   **Autoplay AI System & Scoped EchoBots:** Powered by a unified decision framework (managing target tracking, fatigue meters, and trajectory math) that governs both the player’s Neural Override Autoplay and enemy **EchoBot** agents. EchoBots operate through a context-scoping manager, executing wall-sprints, blink-teleports, and multi-charge gadget bursts.
*   **Unified Boot Configuration & Persistent Preferences:** A centralized `BOOT_SETTINGS` architecture synchronizes release notices, app titles, and default configurations, with automatic `localStorage` persistence (`nb_settings_v1`) saving visual themes, maps, movement modes, and gadget loadouts across sessions.

---

## 🛹 Universal Sliding Mechanics

The sliding engine delivers seamless momentum conservation and responsive physics across every surface geometry in the game:

*   **Universal Momentum Conservation:** Transitioning between floors, slopes, walls, ceilings, and open air preserves tangent velocity and kinetic energy. Cresting ramps or dropping off vertical ledges into aerial glides maintains full momentum without artificial deceleration or velocity zeroing.
*   **Dynamic Slope Traversal (Downhill & Uphill):**
    *   *Downhill Gravity Acceleration:* Sloped ramps and angled geometric faces apply tangential gravitational acceleration, allowing players to build exponential speed on steep descents.
    *   *Uphill Momentum Preservation:* Sliding up steep inclines converts forward kinetic energy into climbing momentum with proportional friction decay rather than stopping abruptly at the incline base.
    *   *Sub-step Ground Snapping:* Ground probes secure players to steep declines, preventing micro-bounces and airborne detachment when sliding down rapid elevation changes at high speeds.
*   **Lateral Wall-Sliding & Wall-Sprinting:** Sliding into vertical surfaces engages dynamic wall contact with a 30% gravity reduction, enabling high-speed horizontal wall-runs and vertical wall-climbs. Camera banking mathematically scales tilt intensity based on the view-to-normal dot product.
*   **Ceiling Sliding & Overhang Gluing:** Sliding beneath horizontal overhangs, angled wedges, or sloped ceilings resolves against inverted surface normals, redirecting momentum along the ceiling plane with inverted character lean.
*   **Aerial Slide Buffer & Natural Flight Arcs:** Sliding off platforms, ramps, or pyramids preserves the crouched posture and surface velocity in mid-air, producing natural parabolic flight arcs that seamlessly transition back into ground slides upon landing.

---

## 🏟️ Arena Roster

Neon Blade features **12 playable maps** organized across **5 master map categories**, matching the in-game selector flow:

| Arena &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Dimensions | Bot Count | Archetype & Description |
| :--- | :---: | :---: | :--- |
| **GYM** | 400m | 10 Bots | **Classic Physics Playground:** Compact testing layout centered around the original hollow hub cylinder, perimeter bank ramps, and obstacle collision courses. |
| <div align="right">**MEGA_GYM**</div> | 600m | 15 Bots | **Advanced Physics Facility:** Extended mega-scale testing arena featuring a towering hollow center cylinder, floating polyhedra, high-speed trapezoid ramps, and kinematic moving platforms. |
| **ARENA** | 400m | 30 Bots | **Classic Coliseum:** Balanced melee arena with dense obstacle distributions, cover blocks, and rhythmic close-quarters combat. |
| <div align="right">**ARENA_EX**</div> | 400m | 30 Bots | **Centrifugal Parkour Arena:** High-velocity arena engineered with centrifugal vaulting rings and flush spiral wall-run panels. |
| <div align="right">**CITADELS**</div> | 400m | 30 Bots | **Dual-Fortress Citadel:** Symmetrical 107-block fortress arena with dual elevated courtyards (Y=22), towering bastions (Y=48), central chasm, and the suspended Great Sky Bridge (Y=40). |
| <div align="right">**HIGHLANDS**</div> | 400m | 30 Bots | **Rolling Glacial Hills:** Expansive undulating terrain featuring continuous $C^1$ surface normal smoothing, sweeping glacial ice fields, and steep mountain slopes. |
| **MACHINA** | 600m | 40 Bots | **Kinetic Machine Arena:** Standalone industrial kinetic layout featuring oscillating linear elevators, rotating central platforms, and pendulum sweeps for timing-based parkour. |
| **TITAN** | 2000m | 150 Bots | **Colossal Open Battlefield:** Massive scale battlefield optimized for high-velocity traversal, long-range teleport routing, and massive multi-bot skirmishes. |
| <div align="right">**TITAN_EX**</div> | 2000m | 150 Bots | **Massive Traversal Coliseum:** Combines Titan's colossal scale with ascending spiral parkour rings and continuous curved wall-runs. |
| **MAZE** | 400m | 25 Bots | **2D Neon Labyrinth:** Procedural labyrinth generated via recursive backtracking with 18m high neon walls and vertical jump pads. |
| <div align="right">**3D_MAZE**</div> | 400m | 52 Bots | **Multi-Story 3D Cube:** Complex multi-tiered 3D cubic maze spanning 5 vertical layers ($10 \times 10 \times 5$ cells) connected by directional thrust pads and vertical jump pads. |
| <div align="right">**LABYRINTH**</div> | 1200m | 75 Bots | **Colossal Mega-Maze:** Giant maze layout with 40m high towering walls designed for claustrophobic navigation and aerial vantage jumps. |

---

## 🎮 Controls

| Input | Action | Description |
| :--- | :--- | :--- |
| **W, A, S, D** | Movement | Standard omnidirectional ground and aerial movement |
| **Space** | Jump | Double / Triple jump available; resets on floor contact, sliding, or wall-running |
| **Shift** | Sprint | High-speed sprint on floors and along vertical walls |
| **C** | Slide / Crouch | Universal slide across floors, slopes, walls, ceilings, and aerial glides |
| **Q** | Primary Mobility | Execute active mobility skill (Teleport or Dash, based on loadout) |
| **Tab + Q** | Swap Mobility | Quick-swap primary mobility ability between **Teleport** and **Dash** |
| **Hold F / R / E** | Aim Gadget | Aim assigned gadget (**Frag**, **Void**, **Impulse**, **Stasis**) |
| **Tab + F / R / E** | Cycle Gadget | Cycle assigned gadget in that slot during gameplay |
| **Left Click** | Katana Slash | Single click for heavy strike, hold for auto-slashes; release aimed gadget or dash |
| **Right Click** | Lock / Charge | Lock Teleport destination in Q-Aim mode; hold to charge Dash impulse power |
| **CapsLock** | Toggle Blaze | Toggle passive skill: ignites slides into fire trails, adds homing embers to slashes, detonates grenades |
| **3** | Toggle Camera | Switch between First-Person and Over-the-Shoulder Third-Person perspective |
| **T** | Cycle Theme | Cycle visual themes (**Light**, **Dark**, **Neon**, **Halloween**) |
| **M** | Toggle Minimap | Toggle tactical minimap overlay with speed-based dynamic zoom |
| **G** | Quick-Warp Gym | Instant warp to the GYM / MEGA_GYM testing facility |
| **auto** | Cinematic / AI | Type `auto` in-game to toggle Neural Override Autoplay and Cinematic Mode letterboxing |
| **Esc** | Pause / Settings | Open pause menu, system settings, keybinds, and gadget loadout modal |

---

## 📜 Milestone Highlights (v48.8.8 → v49.5.0)

*   **v48.8.8 - Third-Person Action Camera & Crescent Slash Shaders:** Added the over-the-shoulder action camera with collision-aware raycasting and theme-adaptive holographic avatar shaders, procedural 3D crescent moon ribbon slashes with arc-fading GPU shaders, experimental traversal arenas (`ARENA_EX`, `TITAN_EX`), and standardized player/bot ragdoll death sequences.
*   **v48.9.0 - Dash Ability & Mobility Cycling:** Integrated Dash into the Q mobility slot with instant impulse blasts, hold-to-charge mechanics, and loadout cycling.
*   **v48.9.1 - Cinematic Action Mode:** Added letterboxed cinematic camera scaling with smooth distance interpolation and FOV expansion (80° to 95°).
*   **v48.9.3 - Flush Curved Wall-Run Panels:** Achieved vertex-level alignment for curved spiral parkour panels on EX maps, eliminating joint collision snags.
*   **v48.9.4 - Machina Map & Kinematic Platform Physics:** Built the `MovingPlatform` architecture handling real-time linear elevators, rotating hubs, and pendulum sweeps with synchronized SAT collision resolution.
*   **v48.9.5 - Settings Tooltip Overlays & Analog Clock Reticle:** Added customizable binary glyph slash overlays (`gridSlashMesh`), interactive settings flyout menus (slash visual sliders and toggles), and an animated multi-ring analog clock crosshair.
*   **v49.0.0 - Twin Citadels Arena & Map Dropdown:** Constructed the symmetrical 107-block fortress arena and introduced the liquid-glass drop-down map indicator menu (`.map-dropdown`) with deep blur and hover expansion (developed across the `v48.9.9 WIP` series).
*   **v49.0.4 - Start Screen Button Architecture:** Overhauled the main menu layout with futuristic slanted selectors (`.btn-start-skewed`) for Aim Mode and Map Selection alongside circular action buttons, refined through `v49.0.4a–d`.
*   **v49.0.5 - Real-Time POS Dev Tool & Polyhedral Blocks:** Added the live 3D player coordinate HUD (`#pos-display` / `"Show POS"` toggle) for level-building diagnostics, alongside procedural Rhombic Dodecahedra, Octahedra, and Tetrahedra building blocks.
*   **v49.0.8 - Continuous Collision Detection (CCD):** Implemented swept collision verification to eliminate geometry clipping and tunneling at extreme velocities.
*   **v49.1.1 - High-Velocity Smoothness & Motion Stabilization:** Resolved high-speed translation judder using a 4-sample rolling frame-delta buffer (`dtHistory`), eliminated sub-step wall-pull vibrations, stabilized vertical ground-snapping, and introduced dynamic FOV speed warping.
*   **v49.2.0 - Ragdoll Physics Unification:** Standardized player and bot ragdoll tumbling with 8-vertex momentum transfer, ground drag, and resting stability.
*   **v49.4.3 - Aerodynamic Continuum Engine:** Introduced dynamic trigonometric swaying and flutter physics for billboarded snow and leaf particles (refined through `v49.4.3a–g`).
*   **v49.4.7 - Configuration Unification & Release Notice UI:** Consolidated engine boot parameters into `BOOT_SETTINGS` with synchronous DOM hydration under `#ui-layer` and an interactive release notice hover tooltip.
*   **v49.4.8 - Saved Settings & Preference Persistence:** Implemented browser `localStorage` persistence (`nb_settings_v1`) for themes, maps, movement modes, and custom loadouts across sessions.
*   **v49.4.9 - Refined Portal & Jump Pad Placement:** Integrated precision-placed jump pads and directional portal pairs with rotational symmetry and seamless velocity redirection.
*   **v49.5.0 (WIP Builds) - Procedural Animation & Matter Ballistics:** Developed adaptive character posture smoothing (`animLerpRate`), tactical sprint dive and strafe banking, jump-crouch anticipation, high-speed aerial slide buffering, and decoupled physical matter ballistics from camera raycasts.
*   **v49.5.0 - Universal Sliding Mechanics:** Comprehensive traversal overhaul delivering seamless momentum conservation, natural flight arcs, and unified velocity preservation across all surfaces (floors, slopes, walls, and ceilings).

---

*Developed by zzerodesigns | Zero Assets, Pure Logic*
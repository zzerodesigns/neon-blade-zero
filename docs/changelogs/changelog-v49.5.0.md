# Changelog: v48.8.8 to v49.5.0

## Universal Sliding Mechanics & Momentum Conservation
The traversal engine has undergone a comprehensive overhaul, transitioning from surface-constrained sliding into a universal momentum conservation model across all geometries. Sliding transitions between floors, sloped ramps, vertical walls, inverted ceilings, and open air without artificial velocity zeroing or directional deceleration. 

*   **Slope Traversal Dynamics:** Downhill descents apply tangential gravitational acceleration along the surface plane, allowing exponential velocity accumulation. Uphill slides convert forward kinetic energy directly into climbing momentum with proportional friction decay rather than stopping abruptly upon incline contact. Enhanced sub-step ground-snapping keeps players glued to steep descents, preventing micro-bounces and unintentional airborne detachment.
*   **Lateral Wall & Ceiling Gliding:** Sliding into vertical surfaces engages dynamic wall contact with an active 30% gravity reduction, enabling high-velocity horizontal wall-runs and vertical wall-climbs. Inverted surface normals redirect momentum along ceilings and angled overhangs with corresponding character lean.
*   **Aerial Slide Buffer & Parabolic Flight:** Launching off ramps, pyramids, or platforms while sliding preserves crouched posture and surface velocity in mid-air, producing natural parabolic flight arcs that seamlessly transition back into ground slides upon touchdown.

## Procedural Character Animation & Dynamic Posture
The holographic player avatar now features procedural posture kinematics that deliver tactile control feedback:
*   Speed-adaptive sprint diving and forward pitch scaling with velocity.
*   Dynamic strafe banking along the lateral axis during sharp turns.
*   Jump-crouch compression anticipation before vertical liftoff.
*   Adaptive posture smoothing (`animLerpRate`) ensuring seamless blending between sprint, crouch, wall-slide, and airborne states.
*   Decoupled physical matter ballistics from camera raycasts, maintaining true projectile origin trajectories during rapid traversal.

## Unified Boot Configuration & Settings Persistence
The engine initialization sequence has been centralized under a single immutable `BOOT_SETTINGS` architecture, eliminating fragmented startup parameters:
*   Synchronous DOM hydration beneath `#ui-layer` dynamically renders release notice tooltips and startup information.
*   Browser `localStorage` persistence (`nb_settings_v1`) automatically stores and restores visual themes, active arena, movement mode, and custom keybinding loadouts across sessions.
*   Rotationally symmetric traversal placements ($P_{\text{North}} = (X, Y, Z) \implies P_{\text{South}} = (-X, Y, -Z)$) guarantee balanced portal routing and jump pad launches across symmetrical battlegrounds.

## Traversal Arenas, Kinematic Platforms & Polyhedral Geometry
The playable roster has expanded to 12 dedicated arenas organized into 5 structured master map categories:
*   **Twin Citadels (`CITADELS`):** Symmetrical 107-block dual-fortress arena featuring elevated courtyards (Y=22), towering bastions (Y=48), central chasm cover, and the suspended Great Sky Bridge (Y=40).
*   **Machina Arena & Kinematic Platform Physics (`MACHINA`):** Introduces the `MovingPlatform` engine, executing real-time oscillating linear elevators, rotating central hubs, and pendulum sweeps with continuous SAT collision resolution and dynamic matrix updates.
*   **Highlands (`HIGHLANDS`):** Expansive rolling terrain with continuous $C^1$ surface normal smoothing and steep mountain slopes.
*   **Mega Gym (`MEGA_GYM`):** Extended 600m physics facility featuring a towering hollow cylinder, high-speed trapezoid ramps, and procedural polyhedral obstacle blocks (Rhombic Dodecahedra, Octahedra, and Tetrahedra).

## Aerodynamic Continuum Engine
The environmental particle simulation for snow and zen courtyard foliage has been unified into a continuous mathematical energy spectrum ($E \in [0.0, 1.0]$):
*   Blends tranquil atmospheric drifting peacefully with high-energy glider swoops and wide lateral sweeps ($3.5\text{m}$ radius).
*   Features multi-frequency trigonometric swaying, spatial 3D wind sampling ($x, y, z$ phase coordinates), and aerodynamic lift cushioning ($10\text{--}20\%$ descent deceleration during lateral glides).

## Continuous Collision Detection & High-Velocity Stabilization
High-speed physics and camera motion have been hardened against visual and geometric artifacts:
*   **Swept Continuous Collision Detection (CCD):** Implemented swept-sphere verification along movement trajectories, eliminating tunneling through thin walls, ramps, and obstacle boxes at extreme traversal speeds.
*   **Frame-Delta Stabilization (`dtHistory`):** Uses a 4-sample rolling frame-delta buffer to eliminate camera translation judder and frame-rate hitching during high-speed runs.
*   **Ragdoll Physics Unification:** Standardized 8-vertex impulse-based tumbling across both player and bot entities, utilizing 3D angular torque, floor contact drag, and an `isNaturallyStill` kinetic dampening gate to achieve stable resting on terrain.

## Combat Abilities, Tools & Interface Overhauls
*   **Dash Mobility Ability:** Integrated Dash as an alternate primary mobility ability in the Q slot with instant kinetic blasts, hold-to-charge impulses, and in-game quick-swapping (`Tab + Q`).
*   **Real-Time POS Dev Tool:** Added a live 3D player coordinate display (`#pos-display` / `"Show POS"` toggle) in the top-right header for real-time spatial diagnostics during level design.
*   **Liquid-Glass Map Dropdown:** Added a glassmorphic flyout menu (`.map-dropdown`) with deep blur and hover expansion.
*   **Start Screen Redesign:** Modernized main menu interface featuring futuristic slanted selectors (`.btn-start-skewed`) and circular action buttons.
*   **Settings Tooltip Overlays & Reticles:** Introduced customizable binary glyph slash overlays (`gridSlashMesh`), interactive settings flyout menus, and an animated multi-ring analog clock crosshair.

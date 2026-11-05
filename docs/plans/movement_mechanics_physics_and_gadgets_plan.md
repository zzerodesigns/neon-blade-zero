# Draft Conceptual Plan: Movement Mechanics, Physics Integrity, and Gadgets

This document outlines high-level concept designs and architectural solutions for upcoming gameplay refinements, traversal tuning, collision fixes, and interactive gadget mechanics.

---

## 1. Responsive Jump Dynamics & Crouch-and-Spring Motion

### Concept & Motion Profile
Rather than using artificial scale compression or camera hacks, the jump incorporates a genuine, responsive crouch-and-release physical motion utilizing existing crouching mechanics. The character briefly inserts that crouch leaning angle and lowered physical height before releasing it for the spring into the jump, with smooth interpolation for a fluid, natural movement.

### Kinematic Treatment
- **Anticipation & Release:** Fast crouch dip (anticipation) that loads into the jump, immediately releasing into the upward leap.
- **Unified Perspective:** Utilizes the character's existing crouch posture, height interpolation, and pitch leaning angles in both first-person and third-person view without artificial camera offsets.
- **Responsiveness Guarantee:** The action is snappy and fluid, ensuring instantaneous input reactivity while providing convincing procedural physical weight.

---

## 2. Ground Slide Activation Tuning

### Concept & Momentum Requirement
Floor sliding currently activates under lenient velocity thresholds, making it too easy to initiate from a near-standstill. The entry barrier for ground sliding will be raised to match full sprinting speed.

### Surface Differentiation
- **Ground Surfaces:** Players must reach sustained sprinting momentum before crouching will trigger a slide. Tapping crouch at lower walking speeds results in a standard tactical crouch or low-profile stance rather than an immediate power-slide.
- **Walls and Ceilings Unchanged:** Acrobatics on walls and ceilings retain their current responsive thresholds, ensuring parkour transitions, wall-running chains, and ceiling glides continue to flow uninterrupted.

---

## 3. Sliding Duration & Velocity Decay

### Concept & Velocity Curve
Continuous sliding will feature a balanced lifecycle that supports sustained momentum while preventing infinite slide exploits across expansive maps.

### Phase Breakdown
- **Peak Sustained Slide (5 Seconds):** When initiated at sprint speed, the slide maintains full peak velocity for up to five continuous seconds.
- **Smooth Velocity Taper (2.5 Seconds):** Following the five-second peak window, the slide boost smoothly and gradually drops off over half that duration (2.5 seconds), transitioning the player back down to base running speed without jarring deceleration.

---

## 4. Universal Under-Object Bot Elevation Fix

### Problem Analysis
When bots path underneath elevated Oriented Bounding Box (OBB) ramps or Axis-Aligned Bounding Box (AABB) structures (such as in the Arena EX and Citadel maps), elevation raycasting or vertical collision resolution often incorrectly samples the highest surface normal in the vertical column. This results in bots snapping or teleporting directly to the rooftop or upper deck of the structure.

### Robust Universal Architecture
- **Elevation History & Clearance Filtering:** Ground queries must validate candidate surfaces against the entity's prior vertical position and available head clearance. A surface is only considered a valid walkable floor if the entity was already positioned above it.
- **Top-Down Projection Prevention:** Penetration solvers must distinguish between standing on top of an obstacle versus moving through an underpass. If an entity is bounded below a ceiling or within the lower half of an inclined volume, upward displacement snapping is rejected, resolving contact against the lower floor or treating the obstacle's bottom as a solid ceiling.

---

## 5. Teleportation Marker Ramp & Corner Stability

### Problem Analysis
Aiming the teleportation marker near intersecting wall ramps and perimeter corners (noticeable in Gym, Arena EX, and prominently on Titan EX) causes the targeting projection to snap erratically or displace to distant unexpected ledges. This happens when the targeting ray intersects multiple overlapping angled planes or hits ambiguous seams between rotated geometries.

### Robust Minimal Architecture
- **Surface Normal Filtering & First-Contact Clamping:** The targeting solver evaluates the first legitimate front-facing collision surface along the view ray, discarding back-face reflections and degenerate crease normals.
- **Crevice Smoothing:** When a ray lands within the boundary seam between two intersecting ramps, the landing position is projected onto the dominant walkable slope rather than flipping between competing surface angles.

---

## 6. Frag Grenade Velocity & Detonation Pacing

### Concept & Trajectory Preservation
The frag grenade should travel faster and detonate sooner while preserving its exact physical arc, bounce geometry, and landing distance.

### Assessment of Approaches
- **Delta Time ($dt$) Scaling:** Multiplying the grenade's internal update step accelerates both translation and gravitational drop simultaneously, ensuring the trajectory curve remains geometrically identical while moving through the air faster.
- **Considerations & Alternatives:** Excessive $dt$ scaling in a single step can increase the risk of clipping through thin geometry. The cleanest approach is scaling the grenade's internal simulation clock alongside a slight increase in initial launch velocity and gravity multiplier, paired with discrete sub-stepping or continuous collision raycasting to ensure collision detection remains rock solid.
- **Fuse Pacing:** The overall fuse countdown is reduced proportionally to match the heightened travel speed, creating a punchier, high-intensity explosive gadget.

---

## 7. Dynamic Blade Slash on Grenades

### Mechanic & Behavioral Concept
Interacting with active grenades via melee strikes will now feature an intuitive countdown halving mechanic.

### Behavior
- **Countdown Halving:** Slashing an active grenade cuts its remaining fuse time directly in half ($t_{\text{remaining}} \leftarrow t_{\text{remaining}} / 2$) instead of subtracting a flat one-second interval.
- **Tactical Gameplay:** A freshly thrown grenade slashed early loses several seconds at once, while repeated slashes rapidly compress the final fraction of a second, introducing high-stakes risk and rewarding agile melee deflections.

---

## 8. Interactive Hopscotch Bounce Pad

### Visual Identity
Taking visual inspiration from the double helix floating card arrays, the hopscotch pad manifests as an illuminated, glowing ground grid of interconnected energetic glyphs and geometric tiles.

### Playful Kinetic Mechanics
- **Uncontrollable Joyous Dancing:** Any player or bot landing on the active hopscotch pad receives a series of rhythmic, bouncy vertical impulses combined with playful procedural spin and swaying animations.
- **Arena Utility:** Serves as both an entertaining visual novelty and an unpredictable kinetic hazard that disrupts combat positioning and launches entities into aerial play.

---

## 9. Gym Map Dual Bouncy Gadget Balls & Clean Platforms

### Concept & Arena Spawning
Two interactive giant physics entities spawned on dedicated elevated platforms within the GYM map:
1. **Bouncy Impulse Ball:** Positioned on the mid-altitude platform (y = 40). Features cyan tech glow aesthetics and high-impulse shockwave physics.
2. **Bouncy Frag Ball:** Positioned on a higher elevated platform (y = 75). Adopts frag grenade physics with micro-bouncing behavior, fiery red-amber aesthetics, and high explosive damage (300 damage, radius 35).

Both balls are 3.6m in diameter (twice standard size), feature an extended 30-second fuse, and detonate using a single expanding soft particle sprite rather than mesh wireframe outlines.

### Platform Material & Automated Replacement
- **Clean Structural Material:** Platforms are built using the clean obstacle material found in the EX staircase platforms, avoiding gift ribbons and decorative decals.
- **Continuous 1-Second Respawn:** Whenever either ball is kicked, slashed, or knocked off its platform perimeter, an automated 1-second countdown triggers to spawn a fresh ball in its place.

### Viscoelastic "Pudding-Like" Deformation Physics
- **Directional Impact Squish & Stretch:** Repurposes dynamic volumetric deformation to trigger when colliding with walls, ramps, floors, or player strikes. The ball compresses along the contact normal while expanding on transverse axes, decaying smoothly with damped sinusoidal oscillations.
- **Impact Scaling:** Deformation amplitude dynamically scales with collision force and relative contact velocity.
- **Interactive Melee Slashing:** Players can deflect and parry either ball with blade strikes. Slashing cuts remaining fuse time in half ($t_{\text{remaining}} \leftarrow t_{\text{remaining}} / 2$) while launching it across the arena with high kinetic impulse.


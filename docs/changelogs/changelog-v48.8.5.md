# Changelog: v48.8.0 to v48.8.5

### Core Architecture and Rendering Upgrades

The foundational rendering pipeline has been upgraded by transitioning the codebase from Three.js version `r128` to `r136`. This update establishes a more stable environment for uniform bindings, enabling real-time clock variables to feed consistently into environmental shaders. To address memory overhead and eliminate micro-stuttering caused by Garbage Collection pauses, the engine's tick paths have been systematically refactored to employ a zero-allocation mathematical model. By utilizing class-level scratchpad vectors and matrices for recurrent spatial transformations, the runtime avoids heap allocations during active frames. 

This memory optimization is further supported by structural changes to the particle, trail, and weather pooling systems. Rather than iterating over entire arrays, the engine now maintains dedicated tracking indexes for active particle subsets, processing only active elements. Weather particles, such as snow and leaves, are pre-warmed and cached in memory at initialization, allowing the engine to hide and reveal existing indices instead of instantiating new geometries during gameplay.

### The Scoped EchoBot System (Rival AI)

The introduction of the `EchoBot` class, which extends the base `Enemy` controller, represents a major expansion of the arena's threat system. The EchoBot runs a fully realized virtual instance of the `PlayerController` and `AutoplaySystem`. This is achieved through a specialized scoping context manager that temporarily redirects global camera, player, input, and target references to the bot's local variables for a single frame. This architecture allows the EchoBot to execute player-level logic, such as high-velocity wall sprinting, complex trajectory blinks, and dynamic gadget aiming. 

To raise the stakes of these encounters, a score-siphoning mechanic has been integrated. When an EchoBot defeats the player, it claims the player's accumulated score; conversely, when the player defeats the EchoBot, the player recovers their lost score, fully replenishes their resources, and regains bonus lives. EchoBots are visually distinguished within the arena by an animated red-shifted aura and custom red-themed visual effects for their slashes and teleports.

### Level Generation and Custom Shader Materials

The environmental systems have been expanded to support multi-story traversal and custom-shaded materials. A new map configuration, `3D_MAZE`, uses a three-dimensional recursive backtracker spanning-tree algorithm to carve corridors and vertical shafts through a multi-story translucent grid. Jump pads are procedurally spawned at the base of vertical shafts to assist with upward movement, while horizontal thrust pads are positioned along the walls of long corridors to launch entities across chasms. 

Additionally, the central hub of the Gym level has been reshaped from a simple box into a cylinder, supported by an updated Oriented Bounding Box collision solver that processes precise Cylinder-to-AABB intersection mathematics. 

Four procedural tech-glass shaders have been developed to enhance the visual style of these structures:
*   `glassBorderMat` calculates the distance to the nearest UV boundary to render sharp glowing outer edges.
*   `glassFresnelMat` computes view-dependent dot products to simulate realistic glancing-angle light reflection.
*   `glassEnergyMat` utilizes a time uniform to scroll razor-sharp scanlines vertically across panels.
*   `glassTintedMat` offers a dark, highly reflective variant of the glass surface.

### AI Behavior and Tactical Autoplay Refinements

The Autoplay decision engine has undergone a major performance and behavioral refactor. All mathematical vector operations have been converted to use pre-allocated variables, removing heap allocation overhead during targeting passes. The AI's traversal capabilities are enhanced by a new trajectory path planner that calculates multi-stage teleport paths tailored to the bot's immediate objectives, such as executing flanks, escaping danger zones, scaling platforms, or crossing chasms. 

The combat logic also introduces predictive targeting, which estimates the target's relative velocity and closing speed to predict its coordinates fractionally ahead of time, ensuring gadgets and melee strikes are aimed with greater precision. 

Furthermore, the AI now features a slalom checking behavior known as the "Interception Swirl." While moving toward its primary destination, the AI monitors adjacent space; if a secondary target enters its path, the bot executes a drive-by slalom slash to clear the threat without disrupting its primary movement trajectory.

### Traversal, Physics, and Ragdoll Override

Player and bot movement states have been refined to support more expressive vertical gameplay. A new wall-sprinting state, `isWallSprinting`, allows players holding the sprint key against steep vertical surfaces to run horizontally or climb upward with an active 30% gravity reduction. This provides a faster, more controlled alternative to the standard wall slide, which retains 20% gravity. 

The transition of state on death has also been redesigned. Upon receiving fatal damage, standard players and EchoBots transition into a full physical ragdoll simulation. The camera locks to a virtual eye point on the model, which tumbles, bounces, and slides based on rigid-body calculations, torque values, and ground-contact friction. A built-in stillness detector monitors the linear and angular velocity of the model, disabling physics calculations once the body has fully settled on a surface to preserve processor resources.

### UI, HUD, and Audio Pipeline Upgrades

The user interface and audio systems have been optimized to handle the demands of multi-entity combat. The HUD now features an SVG-based backdrop mask that uses screen-space clip paths to selectively apply a high-density blur filter directly behind active HUD elements, maintaining sharp contrast regardless of resolution. 

The settings menu introduces a "Combat Calibration" difficulty selector, which scales player damage values to Simulation, Tactical, or Lethal parameters. 

The narrative system has been upgraded with a dual-axis hover expansion mode that measures the exact dimensions of active panels before initiating a smooth, bouncy horizontal-and-vertical reveal. This system is integrated with the Gym level's glass demonstrator blocks; focusing on a demonstrator queries the spatial grid and opens the narrative box to display the corresponding GLSL shader concepts. 

In the audio pipeline, a pre-allocated white-noise wave buffer has been introduced, eliminating the minor latency previously caused by generating sound waves on every blade swing. The spatial audio system also supports a mapping of concurrent sliding tracks, allowing the player and active EchoBots to slide simultaneously with independent, localized audio cues.
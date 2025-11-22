/*
Development History & Design Intentions: Neon Blade v44
Project Architecture & Core Philosophy
Neon Blade: Melee Arena is a high-performance, browser-based FPS built exclusively within a single HTML file using Three.js (r128). The project strictly adheres to a "no external assets" policy; all textures, sounds, and models are generated procedurally at runtime to ensure zero load times and instant accessibility. The underlying architecture eschews heavy physics libraries in favor of a custom velocity-based engine using Axis-Aligned Bounding Boxes (AABB). This decision grants precise control over the "game feel," specifically regarding momentum conservation and air control.

Physics, Movement & Collision
The movement system is tuned to prioritize speed and flow. Friction values are kept intentionally low (frictionAir: 0.02) to allow players to preserve velocity gained from sliding into jumps (bunny hopping). Wall jumping is implemented via raycasting (checking cardinal directions), allowing players to bounce off vertical surfaces to maintain altitude and speed. A significant architectural lesson involves collision detection: rotated AABB colliders historically caused clipping issues. The current v44 implementation strictly separates the visual mesh from the collider. In this version, both decoration visuals and physical hitboxes remain strictly axis-aligned (0,0,0 rotation) to guarantee 100% predictable collision and absolute platforming precision.

Combat Mechanics & Scoring System
Combat has evolved from simple hit-detection into a style-based scoring economy. The v44 update utilizes a "Streak System" which tracks specific movement actions (Slides, Aerials, Wall Jumps, Teleports). Repeating a specific move within a 1.5-second window increments a counter, adding cumulative bonus points to subsequent hits (e.g., Base + Streak Count). Mechanics such as "Aerial Strikes" and "Long Aerials" (awarded for staying airborne longer than 1.0 seconds) encourage vertical play. The "Phase Strike" mechanic provides a massive point bonus (flat +50) for the first successful hit immediately following a teleport. Teleport logic distinguishes between ground-to-ground tactical shifts and true aerial maneuvers based on height variance relative to the floor.

Artificial Intelligence & Enemy Hierarchy
The enemy system features a class-based hierarchy (Normal, Brute, Titan, Colossus) with scaling health, speed, and size. The AI operates on a "passive-aggressive" state machine that transitions from roaming to searching, and finally to aggression upon sight or damage. A key feature is the "Matryoshka" death mechanic: larger high-tier enemies (Colossi and Titans) have a high probability of exploding into multiple smaller enemies upon death, transforming boss encounters into swarm management. Bots possess physical weight and fall damage logic; if they fall with significant downward velocity (y < -15), they enter a "Confused" state where they lie prone and vulnerable for several seconds before recovering.

User Interface & Experience
The UI utilizes a "Cyberpunk" aesthetic with CSS transforms to create skewed, non-rectangular HUD elements. The health and stamina bars use custom gradients and angular clipping paths. A unique UX feature is the "Breathe" mechanic on the main menu: if a player attempts to re-enter the game too quickly (triggering browser security cooldowns on pointer lock), the start button prevents the click and gently pulses with the text "b r e a t h e," turning a technical limitation into an atmospheric interaction.
*/

export const store = {
  score: 0,
  health: 100,
  stamina: 100,
  streak: 0,
};

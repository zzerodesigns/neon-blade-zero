# Prompt History (v48.6.4 to v48.7.0) - AI-reformatted

#### **[Phase 1]**
**[Stasis Gadget implementation & Initial Physics]**
*   **Prompt:** "[what if, we simply let the gadget buttons still show up on the pause screen, and clicking them let you select the slot and show the options... we're going to add one new ability that is based on the void grenade, but works in reverse...]"
    *   *Context/Intent:* The user proposed a modular gadget loadout HUD menu and a brand new "Stasis" (Bullet-time) grenade that radially slows everything caught in its field instead of pulling everything.
*   **Result:** The agent implemented the Stasis multiplier by tracking entities trapped inside the spherical field modifying the global `dt` scale factor down to a tight 0.1x crawl (breeching actual bullet-time integration rather than just raw speed overrides).
    *   *Outcome:* Entities, including the Player, bots, and flying projectiles gracefully drift mid-air and compute slower. A loadout tool was added to the main UI.

#### **[Phase 2]**
**[HUD UI Refinements & Tactile Equilibriums]**
*   **Prompt:** "[here's some small feedback for some truly tiny UI polish. also there's no UI click sound when cycling gadgets yet...]"
    *   *Context/Intent:* The new loadout popup had awkward visual blank spaces and uneven weighting where scaling logic intruded into margins. User demanded specific padding constraints and audio cues for tactical click-feel.
*   **Result:** The agent struggled through numerous back-and-forth loops miscalculating DOM scales and margins.
    *   *Outcome:* After multiple failed attempts and manual fixes by the user, the layout correctly balanced an identical top/bottom visual field spacing and tactile click sound.

#### **[Phase 3]**
**[Stasis Material Adjustments & Explosive Color Grading]**
*   **Prompt:** "[the statis grenade is having the same color as the impulse grenade (white-ish), and not at all the blue color of the hull... let's copy the void grenade style completely and adjust the color to match.]"
    *   *Context/Intent:* The stasis grenade projectile had washed out emissive bloom blinding out the deep cyan colors. 
*   **Result:** Agent iteratively removed the emissive core scaling, matching the void style matte center and projecting custom 0x00BFFF glow specifically into the dark trailing wireframes.
    *   *Outcome:* Pure visual fidelity that properly communicates the utility identity before detonation. Additionally fixed the spin speeds to make outer wireframes sync properly with core explosions.

#### **[Phase 4]**
**[Projectile Overlaps, Mass Kicking & Kinetic Collisions]**
*   **Prompt:** "[let's update the physical interaction for thrown gadgets further, to ensure that they respond to bots and players and even other thrown gadgets collision like actual physical objects...]"
    *   *Context/Intent:* Grenades were fading through floors and ghosting bots. User wanted tight physical colliders rendering them as kickable elements on the terrain that bounce and slide based on speed.
*   **Result:** The agent implemented mutual displacement resolves. It upgraded the projection math allowing players running or sliding to dynamically scatter stationary grenades along the floor and imparted mutual kinetic force logic among gadgets.
    *   *Outcome:* Heavy tactile scattering. Additionally added a temporal 'Safe Deployment Cooldown' delaying instant grenade overlapping on spawned frames avoiding self-detonations.

#### **[Phase 5]**
**[True Rigid-Body Ragdolls for Confused Bots]**
*   **Prompt:** "[not bad. the animations are smooth enough, but i'd rather not have only 4 hard-coded orientations. it should be dynamic and based on actual physics...]"
    *   *Context/Intent:* The user was dissatisfied with rigid, randomized 4-direction fall animations and wanted authentic ragdoll tripping and tumbling that accurately respected angular momentum when stunned by heavy impacts (`CONFUSED` state).
*   **Result:** Agent struggled through Slerps and pinned vertices before adopting a successful true rigid body formulation. Added raw `angularVelocity` and recursive vertex-to-floor overlap checks resolving heavy tumbling rebounds.
    *   *Outcome:* Fast, chaotic tumbling falls integrating seamlessly with an isolated 3D slerp stand-up animation when recovery triggers. Fixed `CONFUSED` bugs keeping HP bars properly scaled relative to their lowest flat dimensions.

#### **[Phase 6]**
**[Anti-Jitter Physics Settle logic]**
*   **Prompt:** "[your bandage fix still leaves the bots completely jittery when lying on the ground... literally all i want to do is keep all the ragdoll physics as simple and accurate as possible, just without the strange jitter.]"
    *   *Context/Intent:* Ragdolled bots vibrated endlessly on horizontal floors due to gravity pressing them mathematically infinite amounts past the floor and bouncing back micro-amounts per frame.
*   **Result:** The agent learned to stop overriding restitution algorithms and instead applied an organic `isNaturallyStill` gate intercepting gravitational drops once relative resting conditions matched the formal `FALLEN` check thresholds.
    *   *Outcome:* Beautiful, heavy bouncy collisions that finally completely slide into velvet still states exactly as requested. Followed by player collision sweeping checks to ensure high speeds register physical ramming against standing and flat bots rather than ghost passing.

#### **[Phase 7]**
**[Isolating Meta-Score from Physical Strikes]**
*   **Prompt:** "[both sword strikes on dead bots and sword strikes on projectiles shouldn't count toward the combo counter, style matrix or any scoring metric at all. they should only be purely physical strikes.]"
    *   *Context/Intent:* User implemented mechanical projectile parrying and lethal death strikes. But combo timers and scoring overlays were popping off of dead corpses and ticking.
*   **Result:** The agent separated the execution block filtering targets via array maps. An `isScoringHit` boolean successfully decouples the math ensuring physics checks (sparks, radial knockbacks) operate independently of scoring modifiers.
    *   *Outcome:* Hitting corpses nudges them kinematically without adding points, preserving the integrity of the Golden Buff and the "Combo" matrices.

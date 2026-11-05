# Twin Citadels Portals, Jump Pads & Player Coordinates HUD Plan

**Timestamp:** Saturday, August 22, 2026 - 05:22 (UTC+7)  
**Base Version:** `v49.0.4d`

---

## 1. Overview & Objectives

This implementation plan establishes a two-phase enhancement for in-game spatial diagnostics and tactical traversal in the Twin Citadels map:

1. **Phase 1: Player Coordinates Debug HUD Toggle** — Introducing a live position readout HUD toggle in the Legacy Registry menu, matching the visual style of the top-right FPS counter and updating position coordinates each frame in real time.
2. **Phase 2: Twin Citadels Symmetrical Traversal System (Portals & Jump Pads)** — Implementing a bespoke, rotationally symmetric layout of jump pads and portals across the North and South territories of the Twin Citadels map using exact 180-degree rotational coordinate mapping ($P_{\text{North}} = (X, Y, Z) \implies P_{\text{South}} = (-X, Y, -Z)$).

---

## 2. Phase 1: Player Coordinates Debug HUD Toggle

### 2.1 UI Integration & Settings Menu
* **Legacy Registry Menu Entry:**
  * Add a new checkbox/toggle option in the Legacy Registry settings menu labeled **"Show POS"**.
  * Synchronize default state (e.g., initial `false` or matching saved user preference).
  * Ensure clean event listener binding that updates the display state instantaneously upon user interaction without requiring map reloads.

### 2.2 Coordinate HUD Element & Styling
* **Placement & Alignment:**
  * Position the coordinate HUD element in the top-right corner, immediately to the left of the existing FPS counter on the same horizontal row.
  * Use identical visual styling to the FPS counter (matching typography, background translucency, padding, border radius, and theme accent colors).
* **Format & Precision:**
  * Render the player's world position formatted as:
    $$\text{POS: } X, Y, Z$$
  * Round values to one decimal place (e.g., `POS: 14.2, 3.0, -28.6`).
* **Frame-by-Frame Real-Time Update:**
  * Hook into the main animation/render loop (`requestAnimationFrame`).
  * When active, query the player's root position vector (`player.position` or active camera rig reference) and update the DOM element textContent with zero garbage-collection overhead.
  * Gracefully hide or detach the HUD element when toggled off.

---

## 3. Phase 2: Placing Portals and Jump Pads Using Measured Coordinates and Rotational Symmetry

### 3.1 Rotational Symmetry Mechanics
The Twin Citadels map features a dual-fortress structure divided across the central chasm. All interactive traversal elements maintain exact 180-degree rotational symmetry around the origin $(0, Y, 0)$:

$$\text{If North Position} = (X, Y, Z) \implies \text{South Position} = (-X, Y, -Z)$$

Portal orientations and teleporter exit angles mirror correspondingly to preserve traversal momentum and intuitive tactical routing.

### 3.2 Traversal Placements & Connectivity Rules

#### 1. Jump Pad (a) — Center Spire Launch
* **North Placement:** Floor jump pad positioned at $(X_a, Y_a, Z_a)$ on the North territory.
* **South Placement (Symmetrical):** Floor jump pad positioned at $(-X_a, Y_a, -Z_a)$ on the South territory.
* **Functionality:** Launches players upward toward the high central structure/citadel apex.

#### 2. Portals 1 & 2 — Cross-Connected Citadel Links
* **North Spawns:** 
  * North Portal 1 at $(X_1, Y_1, Z_1)$
  * North Portal 2 at $(X_2, Y_2, Z_2)$
* **South Spawns (Symmetrical):**
  * South Portal 1 at $(-X_1, Y_1, -Z_1)$
  * South Portal 2 at $(-X_2, Y_2, -Z_2)$
* **Connection Topology:**
  * $\text{North Portal 1} \longleftrightarrow \text{South Portal 2}$
  * $\text{South Portal 1} \longleftrightarrow \text{North Portal 2}$
  * Creates cross-flank teleports across the territorial divide.

#### 3. Portal 3 — Direct Across-Divide Link
* **North Spawn:** Portal 3 at $(X_3, Y_3, Z_3)$ on the North side.
* **South Spawn:** Portal 3 at $(-X_3, Y_3, -Z_3)$ on the South side.
* **Connection Topology:**
  * $\text{North Portal 3} \longleftrightarrow \text{South Portal 3}$
  * Direct bidirectional transit across the main divide.

#### 4. Portal Pair 4 — Local Citadel Flank Traversal
* **North Local Pair:**
  * North Inner Portal at $(X_{4a}, Y_{4a}, Z_{4a})$
  * North Outer Portal at $(X_{4b}, Y_{4b}, Z_{4b})$
  * Linked bidirectionally: $\text{North Inner} \longleftrightarrow \text{North Outer}$
* **South Local Pair (Symmetrical):**
  * South Inner Portal at $(-X_{4a}, Y_{4a}, -Z_{4a})$
  * South Outer Portal at $(-X_{4b}, Y_{4b}, -Z_{4b})$
  * Linked bidirectionally: $\text{South Inner} \longleftrightarrow \text{South Outer}$

---

## 4. Execution & Measurement Strategy

1. **Step 1:** Implement Phase 1 (Legacy Registry toggle and HUD readout).
2. **Step 2:** Utilize the live coordinate HUD within the Twin Citadels map to verify and measure key anchor positions $(X, Y, Z)$ on the North fortress.
3. **Step 3:** Implement the Twin Citadels bespoke portal and jump pad generator adhering strictly to the rotational symmetry transformation and connectivity pairings.
4. **Step 4:** Verify teleportation destinations, exit velocities, visual beam/gate indicators, and collision clearance for all portal pairs and launch pads.

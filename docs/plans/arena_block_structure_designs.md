# 3D Block Structures & Map Design Assessment

## Overview & True Scale Analysis

The standard Arena map (`ARENA`) operates at a substantial world scale (`size: 400`, `scale: 3`), multiplying both the spawned block counts and individual block dimensions by a scale modifier of `3.0`.

Because each `Decoration` instance instantiates a base cube geometry with dimensions `2 × 2 × 2` scaled by `scale * scaleMod`, the actual in-game entities in the Arena map possess massive structural volume:

| Tier | Base Count (`scale=1`) | Scaled Count (`scale=3`) | Block Scale Range | Actual Edge Dimensions | Spatial Footprint (X/Z) | Vertical Range (Y) |
|---|---|---|---|---|---|---|
| **1. Heavies (High Anchors)** | 12 | **36 blocks** | 36.0 – 66.0 | **72 – 132 units** | ±160 units | Y = 60 – 360 |
| **2. Mid-Field Verticality** | 20 | **60 blocks** | 18.0 – 36.0 | **36 – 72 units** | ±280 units | Y = 90 – 600 |
| **3. Outer Perimeter Scatter** | 35 | **105 blocks** | 9.0 – 24.0 | **18 – 48 units** | ±360 units | Y = 120 – 900 |
| **4. Small Ground Anchors** | 15 | **45 blocks** | 6.0 – 12.0 | **12 – 24 units** | ±340 units | Ground level (Y = 6–12) |
| **5. Large Ground Blocks** | 25 | **75 blocks** | 24.0 – 45.0 | **48 – 90 units** | ±320 units | Ground level (Y = 24–45) |
| **Total Inventory** | **107 blocks** | **321 blocks** | — | — | **±360 × ±360 arena** | **Y = 0 to 900** |

When designing structural arenas (such as the Citadels series), we must build directly for this true scale (`scaleMod = 3.0`, 321 total blocks) so that architectural components form monumental fortress ramparts, massive sky bridges, and grand vertical courtyards rather than miniature scatter.

---

## Architectural Principles at True Scale

1. **Monumental Foundations**: Stacking 48–90 unit large blocks flush creates seamless elevated fortress plazas (150–300 units wide) capable of supporting full bot skirmishes and acrobatics.
2. **Double-Decker Skyways**: Spanning heavies (72–132 units wide) across the central void at Y=120–180 produces multi-layered transit: an open high bridge deck for aerial combat and a sheltered under-tunnel for ground duels.
3. **High-Altitude Parkour Highways**: Distributing the 105 perimeter blocks in graduated, stepped parabolic curves along the arena boundary allows continuous wall-sprints and aerial glides from Y=80 up to Y=450 without bottoming out.
4. **Sightline Discipline**: Ensuring that high keep bastions provide clear downward firing lanes while retaining sufficient cover parapets to prevent cross-map spawn camping.

---

## Citadels 2 (Twin Citadels v2) Architectural Blueprint

"Citadels 2" is designed from the ground up around the full 321-block inventory at `scale: 3`, transforming the arena into a grand sci-fi fortress canyon.

### 1. North & South Fortress Keeps (150 Blocks total)
Each side of the arena (North Z < -60, South Z > 60) houses a symmetrical multi-tier fortress:
- **Elevated Courtyard Plaza (28 Large Ground Blocks per keep, 56 total)**:
  - 4x4 and 2x3 contiguous block grids (edge 60–80) forming an expansive raised combat deck at Y=40–70.
  - Features dedicated stair transitions and entry gates facing the central chasm.
- **High Bastion Towers (12 Heavies per keep, 24 total)**:
  - Staggered twin towers rising from the rear and lateral corners of the courtyard, reaching apex heights of Y=180–280.
  - Flat tower rooftops serve as sniper perches and high-altitude jump points.
- **Battlements, Parapets & Wing Ramparts (20 Mid-Field Blocks per keep, 40 total)**:
  - Interlocking medium blocks (edge 40–60) forming protective crenellations, flanking overlook wings, and intermediate mantling platforms at Y=80–140.
- **Courtyard Cover & Step-Ups (15 Small Ground Blocks per keep, 30 total)**:
  - Ground-level barricades, tactical cover pylons, and approach steps leading up into the fortress interior.

### 2. The Great Trans-Chasm Skyway (36 Blocks total)
Connecting the two fortress keeps across the central low-ground chasm (Z = -60 to +60):
- **Central Bridge Deck (8 Heavies, edge 80–110)**:
  - End-to-end alignment spanning the chasm at Y=120–160, creating a wide, elevated highway.
- **Under-Bridge Struts & Chasm Pylons (8 Mid-Field Blocks, edge 50–70)**:
  - Vertical columns anchoring the bridge to the chasm floor, providing vertical climb routes via wall jumps.
- **Lateral Jump Balconies (12 Mid-Field Blocks, edge 40–55)**:
  - Cantilevered dive platforms projecting east and west from the center of the bridge at Y=140.
- **Under-Pass Cover Monoliths (8 Large Ground Blocks, edge 60–80)**:
  - Ground pillars and low arches dividing the lower chasm into three distinct combat lanes.

### 3. The Low Chasm Arena (30 Blocks total)
The sheltered ground floor beneath the skyway (Y = 0 to 40):
- **Central Power Shrine / Altar (3 Large Ground Blocks + 2 Heavies)**:
  - A tiered central arena anchor beneath the bridge apex.
- **Tactical Trench Cover (15 Small Ground Blocks)**:
  - Low barriers for line-of-sight protection against elevated shooters.
- **Chasm Stepping Stele (10 Mid-Field Blocks)**:
  - Stepped transition pedestals allowing players on the ground to leap back onto the courtyard approaches without teleports.

### 4. Outer Perimeter Skyway Parkour Arcs (105 Blocks total)
Two grand symmetrical stairways of floating blocks spanning the entire length of the arena along the West (X < -200) and East (X > 200) walls:
- **West Parkour Arc (52 Perimeter Scatter Blocks, edge 20–45)**:
  - Continuous parabolic trajectory starting at North Courtyard (Y=80, Z=-300), ascending to apex altitude over the center chasm (Y=320, Z=0), and descending smoothly into South Courtyard (Y=80, Z=300).
- **East Parkour Arc (53 Perimeter Scatter Blocks, edge 20–45)**:
  - Symmetrical ascent with an additional high-altitude sniper crown at Y=380 overlooking the central sky bridge.

---

## Technical Block Allocation Summary (321 Blocks Total)

| Zone | Heavies (36) | Mid-Field (60) | Perimeter (105) | Small Ground (45) | Large Ground (75) | Total |
|---|---|---|---|---|---|---|
| **North Fortress** | 12 | 20 | 0 | 15 | 28 | **75** |
| **South Fortress** | 12 | 20 | 0 | 15 | 28 | **75** |
| **Central Skyway** | 8 | 20 | 0 | 0 | 8 | **36** |
| **Chasm Floor** | 4 | 0 | 0 | 15 | 11 | **30** |
| **Perimeter Arcs** | 0 | 0 | 105 | 0 | 0 | **105** |
| **Total** | **36** | **60** | **105** | **45** | **75** | **321** |

---

## Comparison: Existing Proposals vs. Citadels 2

- **Citadels 1**: Built using a 107-block allocation at `scale: 1.0` (cube sizes 6–28 units), resulting in smaller, isolated structures in a 400-size arena.
- **Citadels 2**: Built using the native 321-block inventory at `scale: 3.0` (cube sizes 20–132 units), providing massive architectural cohesion, wide multi-lane platforms, towering fortress bastions, and high-velocity parkour highways spanning up to Y=400+.

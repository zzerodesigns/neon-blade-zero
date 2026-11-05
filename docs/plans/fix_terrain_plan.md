### Task: Eliminate Terrain Micro-Bumping, Smooth Surface Harmonics, and Restore Glacial Ice Transparency

#### Target:
`v49.2.3WIP4.html` (or `index.html`)

---

### Context & Root Cause Analysis
1. **The Sliding Jitter / Micro-Bumping:**
   In `LevelBuilder.buildHighlands`, `ms.getTerrainHeight` evaluates piecewise-flat triangle face normals across 8-meter cells ($cellSize = 400 / 50$). Every time the player slides across a diagonal seam or cell boundary, the normal instantaneously snaps to a new angle. In `PlayerController.prototype.physicsStep`, projecting velocity onto a snapping normal (`this.velocity.addScaledVector(_groundNormal, -vDotN)`) redirects horizontal momentum into sudden vertical/lateral kicks, causing camera shake and micro-bumping.
2. **Terrain Harmonics & Grid Scale:**
   The 50×50 grid creates large 8-meter chords, and the high-frequency secondary wave (`0.08`) creates tight creases. Upgrading to a 100×100 grid (4-meter cells) and broader, sweeping wave harmonics reduces chord sagitta by 4x and creates majestic rolling hills.
3. **Glacial Ice Transparency:**
   In the Light (Snow) theme, the shader computes `finalAlpha = mix(0.72, 0.98, snowMask);` designed for translucent ice. Setting `depthWrite: true` and `transparent: true` on `materials.floor` and the cloned `terrainMat` allows the icy depth to show without causing Z-sorting cutouts.

---

### Implementation Directives

#### 1. Material Transparency & Depth
- On `materials.floor` (around line 2150) and `terrainMat` inside `LevelBuilder.buildHighlands`:
  - Set `transparent: true`
  - Set `depthWrite: true`
  - Set `side: THREE.FrontSide` on `terrainMat`
- This ensures the glacial ice in the Light theme renders with translucent depth while guaranteeing that weapons, particles, corpses, and obstacles on top of the terrain never clip or sort behind it.

#### 2. Higher Grid Resolution & Sweeping Dunes Harmonics
- In `LevelBuilder.buildHighlands`:
  - Increase `gridSize` from `50` to `100` (4.0 units per cell over 400m).
  - Update `THREE.PlaneGeometry(size, size, 100, 100)` accordingly.
  - Tune the rolling dune harmonics in `evalRawHeight`:
    ```javascript
    const h1 = Math.sin(x * 0.028) * Math.cos(z * 0.028) * 13.0;
    const h2 = Math.sin(x * 0.052 + 1.2) * Math.cos(z * 0.045 - 0.8) * 4.2;
    return Math.max(0, (h1 + h2) * fade);
    ```

#### 3. Continuous $C^1$ Surface Normal Smoothing in `ms.getTerrainHeight`
- Precompute smooth vertex normals on the grid during `buildHighlands` so runtime height queries never hit faceted triangle creases:
  - Create two precomputed grids: `normXGrid` and `normZGrid` (each of size `[gridSize + 1][gridSize + 1]`).
  - At each grid vertex $(gx, gz)$, compute the central difference slope:
    ```javascript
    const xPrev = gx > 0 ? heightGrid[gx - 1][gz] : heightGrid[gx][gz];
    const xNext = gx < gridSize ? heightGrid[gx + 1][gz] : heightGrid[gx][gz];
    const zPrev = gz > 0 ? heightGrid[gx][gz - 1] : heightGrid[gx][gz];
    const zNext = gz < gridSize ? heightGrid[gx][gz + 1] : heightGrid[gx][gz];

    const dx = gx > 0 && gx < gridSize ? 2.0 * cellSize : cellSize;
    const dz = gz > 0 && gz < gridSize ? 2.0 * cellSize : cellSize;

    normXGrid[gx][gz] = (xPrev - xNext) / dx;
    normZGrid[gx][gz] = (zPrev - zNext) / dz;
    ```
- In `ms.getTerrainHeight(x, z, targetNormal)`:
  - Keep the exact bilinear height interpolation from `heightGrid` to ensure 100% millimeter parity with the mesh vertices.
  - For `targetNormal`, **bilinearly interpolate the precomputed vertex slopes** across the cell $(fx, fz)$:
    ```javascript
    const nx = (1.0 - fx) * (1.0 - fz) * normXGrid[ix][iz] +
               fx * (1.0 - fz) * normXGrid[ix + 1][iz] +
               (1.0 - fx) * fz * normXGrid[ix][iz + 1] +
               fx * fz * normXGrid[ix + 1][iz + 1];

    const nz = (1.0 - fx) * (1.0 - fz) * normZGrid[ix][iz] +
               fx * (1.0 - fz) * normZGrid[ix + 1][iz] +
               (1.0 - fx) * fz * normZGrid[ix][iz + 1] +
               fx * fz * normZGrid[ix + 1][iz + 1];

    if (targetNormal) {
      targetNormal.set(nx, 1.0, nz).normalize();
    }
    ```

#### 4. Architecture & Hot-Loop Constraints
- Maintain single-file integrity in `index.html`. No external scripts, packages, or secondary files.
- Zero runtime heap allocations inside `getTerrainHeight` or `physicsStep`: write directly into `targetNormal` and reuse scratch variables.
- Protect all existing maps and verified systems (CITADELS, ARENA, GYM, MACHINA, TITAN, MAZE, etc.).
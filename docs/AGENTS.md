# AI Studio Agent Programming Guidelines & Ecosystem Synthesis 

## Core Philosophy: Stable FPS, Zero GC

In a 60 FPS Three.js loop, memory allocations directly map to intermittent frame drops (Garbage Collection spikes) and O(N*M) mathematical operations directly limit scale. Code must act defensively at all points. Avoid instantiating new objects, arrays, and avoid heavy sequential loops at high frequency.

## 1. Zero-Allocation Render Loops (The "GC Free" mandate)
The main `animate()` loop and all child `.update(dt)` loops must be written completely garbage-free.
- **NEVER** use `new THREE.Vector3()` or `new THREE.Matrix4()` or create new objects inside update methods. Always declare globally (e.g., `const _vec3_1 = new THREE.Vector3();`) and use `.copy()`, `.set()`, `.subVectors()`, or `.addScaledVector()`.
- **NEVER** write `const arr = []` or `const elements = new Set()` in loops. Declare `const _globalPool = []` once, and use `_globalPool.length = 0;` (or `.clear()`) each frame to reuse the container memory.
- Avoid functional array methods (`.filter`, `.map`, `.reduce`, `.forEach`) in the `update()` stack. High order functions create temporary closure allocations. Use native `for(let i=0; i<arr.length; i++)` everywhere in the render tree.

## 2. Defensive Mathematics & Big O Limits
Avoid O(N*M) computational loops without staging.
- e.g., 60 Bots checking 1,000 Particles means 60,000 distance checks `(distanceToSquared)` per frame.
- **Throttling/Staggering Patterns:** If a looping check operates across thousands of entities (like particle hit detection or vision rays), **stagger** the updates using modulus against a global frame counter `if ((frameCounter + index) % 5 === 0)`. Then mathematically scale up the damage or delta time (e.g. `damage * 5`) so the output effectively matches 60fps logic with 1/5th the computation.
- **Distance limits:** Always use `distanceToSquared()` instead of `distanceTo()` to avoid expensive `Math.sqrt()` overhead when comparing basic radii.

## 3. Structural Object Pooling & Flyweight Logic
- Ensure that fast-dying and high-spawning entities (Particles, Slash Trails, Embers) utilize a unified object lifecycle buffer/pool (e.g., `_particlePool`). Never use structural `scene.add` or `scene.remove` inside an active combat exchange.
- Hide "inactive" elements to save rendering resources while preserving memory locations: `mesh.visible = false` and `active = false`.

## 4. Single Source System (Architecture)
- Avoid attaching logic redundantly across classes. If global environmental states (gravity zones, spatial hashes, audio synchronization, or game difficulty curves) exist, they should exist as explicit singleton subsystems.
- Example: `getGroundHeight()`, `AudioSys()`, `MapManager` and `NarrativeSys`. The object themselves only act as delegates calling the core singleton rules.

By rigorously applying these laws, an environment handles over 10x the entity load before CPU stall.

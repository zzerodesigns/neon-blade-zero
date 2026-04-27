# Implementation Plan: Decoupled Engine Architecture & IPC Optimization
**Base Version:** v48.7.0

## 1. Executive Summary: The IPC Bottleneck
Modern strict site isolation turns synchronous WebGL draw calls from the main thread into an Inter-Process Communication (IPC) bottleneck. On remote hosts, waiting for the GPU process to validate commands induces CPU spin-locking, thermal throttling, and massive minimum-frame-time spikes (micro-stutters). 

**The Solution:** Decouple the monolithic architecture. Shift the engine (Three.js, physics, AI) into a Dedicated Web Worker using `OffscreenCanvas`. The Main Thread is strictly relegated to UI manipulation and input telemetry. State is synchronized instantaneously using a `SharedArrayBuffer` (SAB), with a Service Worker injecting required cross-origin headers to bypass static hosting strictures.

---

## 2. Priority Matrix & Logic Structures

### Priority 1: Environment Security Proxy (Service Worker)
**Objective:** Unlock `SharedArrayBuffer` support on static hosts (like GitHub Pages).
- **Constraint:** SAB requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp`.
- **Logic:** Implement an inline/local Service Worker that intercepts page/asset requests and artificially appends these headers to the responses.
- **Outcome:** Subverts host limitations, tricking the browser into a secure context required for memory allocation.

### Priority 2: Atomic Memory Synchronization (SharedArrayBuffer)
**Objective:** Zero-latency communication between the UI/Input thread and the Engine thread.
- **Constraint:** Standard `postMessage` cloning causes unacceptable garbage collection hits and input delay.
- **Logic:** Allocate a contiguous block of memory directly accessible by both threads.
  - **Input Registers:** Main Thread (Writer) -> Worker Thread (Reader). Stores hardware bitmasks, mouse deltas, click states.
  - **Entity Registers:** Worker Thread (Writer) -> Main Thread (Reader). Stores health values, active flags, HUD data.
- **Outcome:** Near-instant read-write cycle restricted only by a 1-frame (~16ms) polling delay.

### Priority 3: The Engine Relocation (Web Worker & OffscreenCanvas)
**Objective:** Relieve the Main Thread, allowing standard DOM operations and parallel rendering.
- **Constraint:** Web Workers are blind to the DOM.
- **Logic:**
  1. Transfer control of the primary `<canvas>` to the worker via `canvas.transferControlToOffscreen()`.
  2. Package Three.js initialization, game loops, spatial algorithms, and AI behaviors into a Blob/Worker module.
  3. Spin up the Worker, pass the OffscreenCanvas and SharedArrayBuffer memory references.
- **Outcome:** The engine pipeline saturates the GPU command buffer uninterrupted, achieving high frame rates without Main Thread locking.

### Priority 4: Main Thread UI & Telemetry
**Objective:** Crystal clear input tracking and DOM manipulation.
- **Logic:**
  - Setup raw hardware event listeners (`mousemove`, `keydown`, `keyup`, `mousedown`).
  - Write normalized state data into the SAB's Input Registers.
  - Read from the SAB's Entity Registers to trigger DOM updates (e.g., CSS health bars, score overlays, menus) without disrupting the game loop.

---

## 3. Execution Roadmap

1. **Phase A: Infrastructure Setup:** Draft and inject a minimal Service Worker (`sw.js`). *Note on Single-File Architecture:* Browsers strictly require Service Workers to have a `text/javascript` MIME type. Therefore, an inline blob/HTML file cannot be registered as a Service Worker. `sw.js` is the single absolute minimal external file required *exclusively* for hosted environments like GitHub Pages to guarantee COOP/COEP headers. If the file is absent (e.g., in a standalone offline environment), the engine will gracefully degrade instead of crashing.
2. **Phase B: Memory Mapping:** Define the memory address layout for the SharedArrayBuffer (Float32/Int32 arrays, byte offsets for specific data points).
3. **Phase C: Main Thread Refactor:** Strip Three.js instances from the Main logic. Keep only input listeners, UI overlays, and Worker instantiation code.
4. **Phase D: Worker Logic:** Establish the Web Worker payload. Reconstruct the Three.js scene, physics timestep, and render loop relying strictly on `OffscreenCanvas`.
5. **Phase E: Integration & Testing:** Verify SAB write/read fidelity, ensure 60/144hz syncing, and profile CPU usage for thermal stabilization.

---

## 4. Reasoning and Feasibility Analysis

**Reasoning:**
The reasoning behind this architectural leap is sound. By migrating Three.js, Bot AI, and standard physics to a highly decoupled Web Worker, the main thread is freed to handle strict UI transitions, event listeners, and input polling. This architecture entirely circumvents IPC overhead that routinely starves WebGL applications causing stutter and dropping frame synchronization. By separating these concerns, we ensure that heavy script execution never hangs rendering, matching modern AAA structural methodology.

**Feasibility:**
- **OffscreenCanvas + Web Worker:** Exceptionally feasible. `OffscreenCanvas` has mature browser support and works beautifully within a web worker thread allowing hardware acceleration to continue in isolation.
- **SharedArrayBuffer & Service Worker Proxy:** Very high feasibility but moderate implementation complexity. Bypassing Cross-Origin constraints on hosts via a Service Worker injecting headers is an elegant, well-documented workaround allowing atomic `SharedArrayBuffer` memory maps.
- **Re-wiring Audio and Inputs:** High feasibility, but requires disciplined message parsing. AudioContext cannot run within a generic Web Worker, requiring the worker to dispatch lightweight cues through SAB or `postMessage` to the main thread for SFX.
- **Conclusion:** Completely feasible for this stage, providing absolute state-of-the-art WebGL performance and minimal garbage collection pauses. This is definitely the appropriate logical next step to handle our heavier ragdoll and particle math.

<div align="center">
  <a href="https://zzerodesigns.github.io/neon-blade-zero/">
    <img width="1344" height="768" alt="Neon Blade" src="https://github.com/user-attachments/assets/c396f15e-ac16-405a-b6dd-e031c9a0430e" />
  </a>
</div>

<div align="right"><sub><a href="https://ai.studio/apps/200f290d-ca1c-408a-a930-c7038b93561e">Developed with AI Studio</a></sub></div>

# NEON BLADE: Melee Arena

**Neon Blade** is a high-fidelity, fast-paced 3D melee arena built on a strict **Single-File Architecture**. The entire engine—including hybrid 3D physics (AABB/OBB), custom GLSL shaders, synthesized real-time audio, and advanced decision-state AI—is contained entirely within a single `index.html` file.

## 🕹️ Play Now

### 1. Latest Version (Web)
The most recent stable build is automatically hosted via GitHub Pages:
# 👉 [zzerodesigns.github.io/neon-blade-zero](https://zzerodesigns.github.io/neon-blade-zero/) ⚔️

### 2. Peak Performance & Archived Builds (Local)
For the intended experience, it is highly recommended to **run the game locally** as a local file.

*   **Latest Build:** Download the raw `index.html` file from the root directory.
*   **Archived Versions:** Go directly to the `/archive/` folder. All previous versions are saved and sorted there as pre-named files (e.g., `v48.8.6.html`). Simply download the version you want and run the file.
*   **Commit History (Alternative):** You can still navigate to any historical commit in the repository, open the `index.html` file at that commit state, and download it.

---

## ⚡ Performance Note: Local vs. Hosted

Due to modern browser security mitigations (such as **Spectre** and **Meltdown**), Chromium-based browsers (Chrome, Edge, Opera) enforce strict isolation contexts for hosted websites. 

When running via a URL (GitHub Pages), the browser often throttles timer precision and limits single-threaded execution efficiency to mitigate side-channel attacks. This can result in:
*   Subtle micro-stuttering.
*   Reduced input polling frequency.
*   Lower overall FPS in complex 3D environments like the "TITAN" or "3D_MAZE" maps.

**Running the file locally (`file://`) bypasses many of these web-context overheads**, allowing the engine to access the full performance of the hardware. For 144Hz+ gameplay, use the local file.

---

## 🛠️ Project Philosophies & Core Architecture

*   **Zero Dependencies:** Built using Three.js (via CDN) and native Web Audio and GLSL. No NPM packages, no build steps, and no build configurations required.
*   **Hybrid AABB/OBB Physics Engine:** Features a custom Separating Axis Theorem (SAT) collision solver handling standard boxes, sloped ramps, rotated obstacles, lateral wall-running, and ceiling-sliding.
*   **Dynamic Audio Synthesis:** Zero external audio asset overhead (no `.mp3` or `.wav` files). All sound effects—including sword slashes, mechanical teleports, stasis fields, and interface tones—are synthesized dynamically in the browser using the Web Audio API.
*   **Procedural GLSL Shaders:** Rendering showcases custom real-time glass panel shading featuring uv-to-border edge outlines, glancing-angle Fresnel reflections, and animated time-looped scanlines.
*   **Autoplay AI System:** Powered by a unified decision framework (managing target tracking, fatigue meters, and trajectory math) that governs both the player’s Neural Override Autoplay and the **EchoBot** agent. The AI coordinates roam, hunt, and flank states while executing slide jumps, teleport chains, and multi-charge gadget bursts (frag, void, impulse).

---

## 🎮 Controls

*   **WASD:** Movement
*   **Space:** Jump (Double/Triple jump available; resets on wall-slide or ceiling contact)
*   **Shift:** Sprint (Enables wall-running and wall-climbing)
*   **C:** Slide / Crouch (Slide on walls or ceilings to activate camera tilting)
*   **Q:** Teleport (Toggle AIM or INSTANT mode)
*   **Hold F / R / E:** Aim Gadget (Frag, Void, and Impulse by default; swap with Stasis in the menu)
*   **Left Click:** Katana Slash (Single click for high-damage heavy strike, hold for auto-slashes)
*   **Right Click:** Lock Teleport Target (Saves targeted coordinates while in Q-Aim mode)
*   **CapsLock:** Toggle passive ability (Blaze by default)
*   **T:** Cycle Visual Themes
*   **M:** Toggle Minimap (Features speed-based auto-zoom)
*   **auto:** Type 'auto' in-game to toggle the Autoplay system (Neural Override)
*   **Esc:** Pause Screen / Stats

---

*Developed by zzerodesigns | Zero Assets, Pure Logic*
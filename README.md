<div align="center">
<img width="1344" height="768" alt="Image" src="https://github.com/user-attachments/assets/c396f15e-ac16-405a-b6dd-e031c9a0430e" />
</div>

<div align="right">Developed with AI Studio: https://ai.studio/apps/200f290d-ca1c-408a-a930-c7038b93561e</div>

# NEON BLADE: Melee Arena

**Neon Blade** is a high-fidelity, fast-paced 3D melee arena built on a strict **Single-File Architecture**. The entire engine—including 3D physics (AABB/OBB), procedural shaders, synthesized audio, and advanced AI—is contained entirely within a single `index.html` file.

## 🕹️ Play Now

### 1. Latest Version (Web)
The most recent stable build is automatically hosted via GitHub Pages:
👉 https://zzerodesigns.github.io/neon-blade-zero/

### 2. Peak Performance & Archived Builds (Local)
For the intended experience, it is highly recommended to **run the game locally**.

*   **Download:** Navigate to any commit in the repository history, open the `index.html` file, and download it.
*   **Run:** Simply double-click the `.html` file to open it in your browser. No `npm install`, no local server, and no dependencies required.

---

## ⚡ Performance Note: Local vs. Hosted

Due to modern browser security mitigations (such as **Spectre** and **Meltdown**), Chromium-based browsers (Chrome, Edge, Opera) enforce strict isolation contexts for hosted websites. 

When running via a URL (GitHub Pages), the browser often throttles timer precision and limits single-threaded execution efficiency to mitigate side-channel attacks. This can result in:
*   Subtle micro-stuttering.
*   Reduced input polling frequency.
*   Lower overall FPS in complex 3D environments like the "TITAN" or "3D_MAZE" maps.

**Running the file locally (`file://`) bypasses many of these web-context overheads**, allowing the engine to access the full performance of the hardware. For 144Hz+ gameplay, use the local file.

---

## 🛠️ Project Philosophies

*   **Zero Dependencies:** Built using Three.js (via CDN) and native Web Audio/GLSL. No NPM packages, no build steps, no complexity.
*   **Volumetric 3D Design:** Featuring a true 3D Recursive Backtracker for solvable 3D mazes and a hybrid AABB/OBB physics engine.
*   **Math-Driven Aesthetics:** Textures, animations, and audio are generated via procedural math rather than external assets, keeping the file lightweight and offline-capable.
*   **EchoBot Rivalry:** An advanced AI "Neural Override" system that uses the same logic as the player's autoplay system to hunt, strafe, and utilize gadgets.

---

## 🎮 Controls

*   **WASD:** Movement
*   **Space:** Jump (Double/Triple jump available)
*   **Shift:** Sprint
*   **C:** Slide / Wall-Slide
*   **Q:** Teleport (Toggle AIM or INSTANT mode)
*   **Hold F / R / E:** Aim Gadgets (Frag, Void, Impulse)
*   **Left Click:** Katana Slash (Single click for power, hold for auto)
*   **T:** Cycle Visual Themes
*   **M:** Toggle Minimap
*   **auto:** Enable Neural Override (Autoplay)
*   **Esc:** Pause Screen

---

*Developed by zzerodesigns | Zero Assets, Pure Logic*

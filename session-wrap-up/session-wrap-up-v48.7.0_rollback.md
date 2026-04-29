### Session: Decoupled Architecture Rollback (v48.7.0)

### Development Log
The development cycle for v48.7.1, titled "Decoupled Engine Architecture," was an ambitious architectural experiment aimed at decoupling the Three.js and physics engine from the main thread. By migrating core logic to a Dedicated Web Worker with `OffscreenCanvas` and `SharedArrayBuffer` synchronization, we intended to bypass the IPC bottlenecks observed in modern Chromium environments. 

However, throughout versions v48.7.1a through v48.7.1f, we encountered systemic challenges related to hosted environment security. While the engine performed flawlessly in local or unrestricted previews, browsers typically restrict `SharedArrayBuffer` instantiation in hosted iframes lacking specific cross-origin isolation headers (COOP/COEP). Attempts to harden the engine with "SAB Ghost" detection (v48.7.1f) and automatic main-thread takeover were partially successful but introduced significant complexity and fragile initialization sequences.

Ultimately, to preserve the game's foundational "Single-File Offline" portability and ensure universal playability across all hosting platforms, the decision was made to shelf the multi-threaded architecture. Version v48.7.0 (Restored Baseline) marks a return to the stable, monolithic engine architecture, sacrificing the theoretical throughput gains of the worker-thread model in favor of guaranteed stability and low maintenance.

### Prompt History
#### **[Engine Resilience & SAB Hardening]**
**Fixing False-Positive Worker Detection and Initialization Soft-locks**
*   **Prompt:** "i'm back after testing. the issue is that it behaves exactly the same as the hosted "d" version. we're going to need an "f" version next, but first please don't make any changes and just focus on analyzing the code to find the precise source of that bug..."
    *   *Context/Intent:* Investigating why the game world failed to load in hosted environments despite previous UI-layer hardening.
*   **Result:** Identified that `SharedArrayBuffer` presence was being detected but its usage was blocked, causing a silent worker crash.
    *   *Outcome:* Hardened initialization logic and added worker-crash detection.

#### **[Architecture Rollback]**
**Shelving the Neural Shadow Core Experiment**
*   **Prompt:** "i've decided to ditch the decoupled engine architecture entirely, for now. we're forced to test on production and so far things have been broken more often than they got fixed... i've already manually restored index.html and architecture.md to their exact v48.7.0 baseline."
    *   *Context/Intent:* Concluding the multi-threading experiment due to environment constraints and restoring the known-stable monolithic baseline.
*   **Result:** Acknowledged the decision to prioritize stability and cross-origin compatibility.
    *   *Outcome:* Supported the transition back to v48.7.0. Updated documentation to reflect the archived state of the Neural Shadow Core project.

## Commit Description
```
v48.7.0 (Restored Baseline) - Decoupled Architecture Rollback
TL;DR: Shelves the experimental multi-threaded engine and restores the stable v48.7.0 monolithic baseline.

Summary: After extensive testing across hosted environments, the Decoupled Player/Physics engine (Neural Shadow Core) has been rolled back. Modern browser restrictions on SharedArrayBuffer without specific security headers made the architecture unstable for universal hosting. This commit confirms the return to the monolithic main-thread engine.

Specific changes:
- Reverted index.html and architecture.md to v48.7.0.
- Updated devlog.md to document the v48.7.1 experiment and the subsequent rollback.
- Shelved IPC-related features in the development log.
- Synchronized all internal version strings to v48.7.0.

This restores the project's foundational "Single-File Offline" portability while ensuring playability in restricted iframes.
```

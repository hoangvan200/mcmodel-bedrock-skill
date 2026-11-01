# Configuration & Context Handover

This document maintains the current context of the **`mcmodel-bedrock-skill`** project so successor AI agents and developers can understand system architecture, progress, and operational invariants.

## 1. Project Overview
An Antigravity Skill (Plugin) that empowers AI agents to automatically build 3D Minecraft Bedrock models (`.geo.json`) and procedural textures (`.png`) from 2D reference images or natural-language descriptions via geometric decomposition and procedural material shading.
- **Workspace Directory:** `D:\code\aiskills\mcmodel-bedrock-skill`
- **Plugin Registry Directory:** `C:\Users\Admin\.gemini\config\plugins\mcmodel-bedrock`

## 2. Recent Architectural Enhancements
1. **Z-Fighting Elimination:** Applied an micro-shift algorithm (`shift = index * 0.005`) to cube `origin` coordinates to resolve coplanar Z-fighting in the Bedrock engine without changing overall dimensional footprint.
2. **Texture Bleeding Prevention:** Leveraged `Math.ceil()` UV anchor positioning on packed texture atlases while preserving float dimensions, ensuring cubes with fractional sizes cleanly align with integer pixel grids.
3. **Shaded Priority Over Noise:** The `noise` style creates excessive grain. Invariants require `shaded` (3D Volumetric Gradient + Dithering) for organic creatures (fur, skin) and vehicle paint; `noise` is restricted strictly to sand, gravel, and stone.
4. **Facial Geometry Standards:** Living entities MUST feature raised 3D eye pupils and distinct snout/beak/mouth geometry.
5. **Versioned Output Directory Architecture:** All generated assets are organized into dedicated versioned subfolders under `output/` (e.g. `output/<asset_name>_v1/`, `output/<asset_name>_v2/`), preventing clutter and preserving historical revisions.
6. **Cross-Bone Tied Hair Engine:** Support for back ponytail/braid cascades across neck and torso boundaries, preserving back outfit fabric on flank columns.

## 3. Extended Capabilities & Tools
1. **Addon Builder & Packaging Tool (`package_addon`):**
   - Implemented via `src/addon_builder.js` and `adm-zip`.
   - The MCP tool `package_addon` packages multiple generated models into a complete `.mcaddon` bundle, generating `manifest.json`, Behavior Pack block definitions (`blocks/<id>.json`), and Resource Pack texture mappings (`terrain_texture.json`).
2. **Armor Attachable Builder (`build_armor_attachable`):**
   - Automatically generates Bedrock Attachable JSON (`RP/attachables/<piece>.json`) and Behavior Pack Item JSON (`BP/items/<piece>.json`).
3. **Masterpiece Skin Generator (`generate_skin`):**
   - Dual-layer 64x64 and 128x128 HD player skin painter with dynamic hue-shifting, clustered shading, gender anatomy dimorphism, Geta/boots footwear elevation, and cross-bone flowing hair.

## 4. Multi-Agent Protocols & Engineering Invariants
- **Multi-Agent Orchestration (Rule 5):** For complex tasks (e.g. multi-model packages, complex bug diagnosis, full applications), activate a multi-agent team: QA Engineer (Agent A), Strict Senior QA Reviewer (Agent B), Coder Pair (Agents C & D), Strict PM & Orchestrator (Agent E), Visual Designer (Agent F), and Animator (Agent G).
- **Mandatory English Requirement (Rule 1):** All source code, documentation, markdown, comments, variable names, and file paths must be written exclusively in English.
- **Mandatory Pre-Task Planning (Rule 2):** Create a structured markdown plan and feasibility analysis before modifying files or writing code.
- **Temporary Scripts Isolation (Rule 3):** All one-off test scripts and benchmarks must reside in `temp/` and must never be committed to version control.
- **Remote GitHub Source Protection (Rule 4):** Never push or modify remote Git branches without explicit user confirmation.
- **Mathematical Invariants:** Any modification to a cube's `size` requires recalculating its `origin` (`[Cx - W/2, Cy - H/2, Cz - D/2]`). Rotation pivots must anchor to real joint hinges.

## 5. Current State
- Codebase fully internationalized to 100% English.
- Versioned output subdirectories active across all CLI and MCP tools.
- Cross-bone ponytail engine verified with 100% compliance across all 5 quality gates.

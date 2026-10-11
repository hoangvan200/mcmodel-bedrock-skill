# MINECRAFT BEDROCK EDITION RESOURCE PACK DEVELOPMENT GUIDE (1.21+)

> **International Technical Reference & Best Practices Manual for Bedrock Creators**  
> *Targeting Minecraft Bedrock Edition (v1.21+ / Format Version 1.26.x / Bedrock Engine)*

---

## TABLE OF CONTENTS

1. [System Architecture & Client-Server Paradigm](#1-system-architecture--client-server-paradigm)
2. [Project Directory Structure & Naming Conventions](#2-project-directory-structure--naming-conventions)
3. [Manifest Configuration (`manifest.json`) & Validation Rules (`CHKMANIF`)](#3-manifest-configuration-manifestjson--validation-rules-chkmanif)
4. [3D Geometry & Blockbench Modeling Workflow (`.geo.json`)](#4-3d-geometry--blockbench-modeling-workflow-geojson)
5. [Client Entity (`.entity.json`) & Attachables (`.attachable.json`)](#5-client-entity-entityjson--attachables-attachablejson)
6. [Render Controllers & Dynamic Molang Arrays](#6-render-controllers--dynamic-molang-arrays)
7. [Animation Systems & Animation Controllers (`.animation.json` & `.animation_controllers.json`)](#7-animation-systems--animation-controllers-animationjson--animation_controllersjson)
8. [Data-Driven Custom Blocks (v1.26.50+) & Block Culling](#8-data-driven-custom-blocks-v12650--block-culling)
9. [RenderDragon Engine, Deferred Technical Preview & PBR Textures (`.texture_set.json`)](#9-renderdragon-engine-deferred-technical-preview--pbr-textures-texturesetjson)
10. [JSON UI Customization & Performance Best Practices](#10-json-ui-customization--performance-best-practices)
11. [Audio Systems (`sound_definitions.json`) & Particle Effects (`.particle.json`)](#11-audio-systems-sound_definitionsjson--particle-effects-particlejson)
12. [Script API (`@minecraft/server`) Integration & Custom Components](#12-script-api-minecraftserver-integration--custom-components)
13. [Content Logging, Debugging Workflows & Package Distribution (`.mcpack` / `.mcaddon`)](#13-content-logging-debugging-workflows--package-distribution-mcpack--mcaddon)

---

## 1. SYSTEM ARCHITECTURE & CLIENT-SERVER PARADIGM

In Minecraft Bedrock Edition, Add-On development adheres to a strict separation of concerns between two execution environments: the **Client Environment (Resource Pack)** and the **Server Environment (Behavior Pack)**.

```
+-----------------------------------------------------------------------+
|                            MINECRAFT BEDROCK                          |
+-----------------------------------++----------------------------------+
|      RESOURCE PACK (CLIENT)       ||       BEHAVIOR PACK (SERVER)     |
|  - Render Models (.geo.json)      ||  - Entity Logic & AI (.json)     |
|  - Client Entities (.entity.json) ||  - Block Logic & Permutations    |
|  - Attachables (.attachable.json) ||  - Loot Tables & Recipes         |
|  - Render Controllers             ||  - Trade Tables & Custom Biomes  |
|  - Textures, Shaders & PBR        ||  - Script API (JS/TS Modules)    |
|  - Skeletal Animations            ||  - Server Commands & Functions   |
|  - Sound Definitions & Particles  ||  - World Generation & Structures |
|  - JSON UI Layouts & Fonts        ||                                  |
+-----------------------------------++----------------------------------+
                                  \    /
                                   \  /  Linked via Namespaced Identifiers
                                    \/   (e.g., "my_namespace:custom_entity")
```

### Technical Feature Matrix: Resource Pack vs. Behavior Pack

| Attribute | Resource Pack (RP - Client Side) | Behavior Pack (BP - Server Side) |
| :--- | :--- | :--- |
| **Primary Scope** | Controls visual rendering, audio playback, HUD/UI screens, and client assets. | Controls game simulation, entity AI, physics, inventory logic, and world state. |
| **Local Directory** | `development_resource_packs/` | `development_behavior_packs/` |
| **Client Autonomy** | Can be loaded client-side independently (custom themes, textures, UI tweaks). | Must be bound to a World or dedicated server instance. |
| **Data Formats** | Client JSON, Molang expressions, PNG textures, OGG audio, TTF/OTF fonts. | Server JSON, Molang expressions, JavaScript/TypeScript (`@minecraft/server`). |
| **Performance Impact**| GPU VRAM, Rendering FPS, Mesh Polycount, Texture Atlas Resolution. | Server Tick Rate (TPS), CPU Threading, Pathfinding & AI Entity Limits. |

---

## 2. PROJECT DIRECTORY STRUCTURE & NAMING CONVENTIONS

### 2.1 Complete Production Directory Tree for Resource Packs

```
MyProject_RP/
├── manifest.json                   # Essential metadata definition file
├── pack_icon.png                   # Project thumbnail (1:1 ratio, 128x128 or 256x256 px)
├── animation_controllers/          # State machine logic (.animation_controllers.json)
│   └── player.animation_controllers.json
├── animations/                     # Keyframe skeletal animations (.animation.json)
│   └── custom_entity.animation.json
├── attachables/                    # Handheld item rendering definitions (.attachable.json)
│   └── custom_sword.attachable.json
├── block_culling/                  # Occlusion geometry definitions for custom blocks
│   └── custom_block.culling.json
├── entity/                         # Client entity binding definitions (.entity.json)
│   └── custom_entity.entity.json
├── fogs/                           # Volumetric environment fog definitions (.fog.json)
├── font/                           # Custom TTF/OTF fonts and glyph mappings
│   └── default_glyph.json
├── items/                          # Client-side item texture definitions
├── materials/                      # Render material configs (.material)
├── models/                         # 3D geometry JSON meshes
│   ├── blocks/                     # Custom block models (.geo.json)
│   └── entity/                     # Entity geometry models (.geo.json)
├── particles/                      # Particle emitter definitions (.particle.json)
├── render_controllers/             # Geometry, texture, and material binding rules
│   └── custom_entity.render_controllers.json
├── sounds/                         # OGG audio files
│   ├── mob/
│   └── item/
├── sound_definitions.json          # Client audio category registration registry
├── sounds.json                     # Vanilla sound event override mapping
├── subpacks/                       # Variant configuration folders
├── textures/                       # PNG image assets
│   ├── blocks/                     # Block textures
│   ├── entity/                     # Entity textures
│   ├── items/                      # Item textures
│   ├── ui/                         # Interface graphics
│   ├── item_texture.json           # Texture atlas registry for items
│   └── terrain_texture.json        # Texture atlas registry for blocks
├── ui/                             # JSON UI interface screens
│   ├── _ui_defs.json               # Screen defs registry
│   └── hud_screen.json             # HUD screen modifications
└── texts/                          # Localization strings
    ├── en_US.lang
    ├── es_ES.lang
    └── languages.json
```

### 2.2 Global Naming Conventions & Standards

1. **Strict `snake_case` Standard**:
   * All directories, filenames, bone names, texture names, and animation identifiers MUST use lowercase alphanumeric characters separated by underscores.
   * *Compliant*: `gold_dragon_sword.png`, `custom_zombie.geo.json`.
   * *Non-compliant*: `GoldDragonSword.PNG`, `customZombie.Geo.JSON`.
2. **Namespace Isolation**:
   * Always use a unique custom namespace prefix for custom content: `my_namespace:identifier`.
   * Never use the `minecraft:` namespace for original content (reserve `minecraft:` strictly for overriding vanilla assets).
3. **Standard Local Development Path (`com.mojang`)**:
   * Windows platform local path:  
     `%localappdata%\Packages\Microsoft.MinecraftUWP_8wekyb3d8bbwe\LocalState\games\com.mojang\development_resource_packs\`

---

## 3. MANIFEST CONFIGURATION (`manifest.json`) & VALIDATION RULES (`CHKMANIF`)

The `manifest.json` file registers the Resource Pack with the Minecraft Bedrock engine. For modern Add-Ons (v1.21+), `format_version: 2` is mandatory.

### 3.1 Production Feature-Rich `manifest.json`

```json
{
  "format_version": 2,
  "header": {
    "name": "pack.name",
    "description": "pack.description",
    "uuid": "f3b2a104-7c8d-4e9f-a1b2-c3d4e5f6a7b8",
    "version": [1, 0, 0],
    "min_engine_version": [1, 21, 50]
  },
  "modules": [
    {
      "type": "resources",
      "uuid": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "version": [1, 0, 0]
    }
  ],
  "capabilities": [
    "pbr",
    "script_eval"
  ],
  "dependencies": [
    {
      "uuid": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "version": [1, 0, 0]
    }
  ]
}
```

### 3.2 Manifest Validation Error Codes (`CHKMANIF`)

During package validation, the engine evaluates the manifest against rule set `CHKMANIF`:

| Error Code | Error Description | Resolution & Best Practice |
| :--- | :--- | :--- |
| **`CHKMANIF101`** | Invalid `format_version` | Ensure `format_version` is set to `2`. |
| **`CHKMANIF110`** | Duplicate UUID detected | Generate unique v4 UUIDs for `header`, `modules`, and dependencies. |
| **`CHKMANIF111`** | Malformed UUID syntax | Ensure UUID matches 8-4-4-4-12 hexadecimal character formatting. |
| **`CHKMANIF119`** | Incompatible `min_engine_version` | When declaring `"pbr"` capability, `min_engine_version` must be `[1, 21, 0]` or higher. |
| **`CHKMANIF134`** | Missing required module dependency | Verify resource module dependencies correctly bind to the matching Behavior Pack UUID. |

---

## 4. 3D GEOMETRY & BLOCKBENCH MODELING WORKFLOW (`.geo.json`)

### 4.1 Blockbench Technical Standards for Bedrock Edition
1. Open Blockbench and select **Bedrock Model** format (do NOT select Java Block/Item format).
2. Set **Mob Geometry Name** using `snake_case` with `geometry.` prefix (e.g., `geometry.custom_boss`).
3. Enable **Box UV** to ensure uniform integer-based UV mapping.
4. Maintain a clean **Bone Hierarchy**:
   * Pivot points define the rotation articulation joints.
   * Group cubes logically inside parent bones (`root` -> `waist` -> `chest` -> `head`).
5. Export geometry mesh as `.geo.json` into `models/entity/` or `models/blocks/`.

### 4.2 Geometry JSON Schema (`RP/models/entity/custom_boss.geo.json`)

```json
{
  "format_version": "1.26.50",
  "minecraft:geometry": [
    {
      "description": {
        "identifier": "geometry.custom_boss",
        "texture_width": 64,
        "texture_height": 64,
        "visible_bounds_width": 4.0,
        "visible_bounds_height": 4.5,
        "visible_bounds_offset": [0, 2.0, 0]
      },
      "bones": [
        {
          "name": "root",
          "pivot": [0, 0, 0]
        },
        {
          "name": "body",
          "parent": "root",
          "pivot": [0, 12, 0],
          "cubes": [
            {
              "origin": [-6, 12, -4],
              "size": [12, 14, 8],
              "uv": [0, 0]
            }
          ]
        },
        {
          "name": "head",
          "parent": "body",
          "pivot": [0, 26, 0],
          "cubes": [
            {
              "origin": [-4, 26, -4],
              "size": [8, 8, 8],
              "uv": [32, 0]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 5. CLIENT ENTITY (`.entity.json`) & ATTACHABLES (`.attachable.json`)

### 5.1 Client Entity Definition (`RP/entity/custom_boss.entity.json`)

Client Entity definitions map resource assets (models, textures, materials, animations) to the entity behavior ID.

```json
{
  "format_version": "1.10.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "my_namespace:custom_boss",
      "materials": {
        "default": "entity_alphatest"
      },
      "textures": {
        "default": "textures/entity/custom_boss_phase1",
        "phase2": "textures/entity/custom_boss_phase2"
      },
      "geometry": {
        "default": "geometry.custom_boss"
      },
      "animations": {
        "idle": "animation.custom_boss.idle",
        "walk": "animation.custom_boss.walk",
        "move_controller": "controller.animation.custom_boss.movement"
      },
      "scripts": {
        "animate": [
          "move_controller"
        ]
      },
      "render_controllers": [
        "controller.render.custom_boss"
      ],
      "spawn_egg": {
        "base_color": "#1a1a1a",
        "overlay_color": "#ff3300"
      }
    }
  }
}
```

### 5.2 Handheld Attachable Item Definition (`RP/attachables/custom_sword.attachable.json`)

Attachables render items in third-person and first-person perspective on players or armor stands.

```json
{
  "format_version": "1.10.0",
  "minecraft:attachable": {
    "description": {
      "identifier": "my_namespace:custom_sword",
      "materials": {
        "default": "entity_alphatest"
      },
      "textures": {
        "default": "textures/items/custom_sword"
      },
      "geometry": {
        "default": "geometry.custom_sword"
      },
      "render_controllers": [
        "controller.render.item_default"
      ]
    }
  }
}
```

---

## 6. RENDER CONTROLLERS & DYNAMIC MOLANG ARRAYS

Render Controllers specify which geometry, materials, and textures are rendered on screen using conditional Molang logic.

### 6.1 Advanced Render Controller (`RP/render_controllers/custom_boss.render_controllers.json`)

```json stream=false
{
  "format_version": "1.8.0",
  "render_controllers": {
    "controller.render.custom_boss": {
      "geometry": "Geometry.default",
      "materials": [
        { "*": "Material.default" }
      ],
      "textures": [
        "Array.textures[query.variant]"
      ],
      "arrays": {
        "textures": {
          "Array.textures": [
            "Texture.default",
            "Texture.phase2"
          ]
        }
      }
    }
  }
}
```

---

## 7. ANIMATION SYSTEMS & ANIMATION CONTROLLERS (`.animation.json` & `.animation_controllers.json`)

### 7.1 Keyframe Skeletal Animation (`RP/animations/custom_boss.animation.json`)

Animations manipulate bone rotations, positions, and scale values dynamically.

```json
{
  "format_version": "1.8.0",
  "animations": {
    "animation.custom_boss.idle": {
      "loop": true,
      "animation_length": 2.0,
      "bones": {
        "head": {
          "rotation": {
            "0.0": [0, 0, 0],
            "1.0": ["math.sin(query.life_time * 100) * 5", 0, 0],
            "2.0": [0, 0, 0]
          }
        }
      }
    },
    "animation.custom_boss.walk": {
      "loop": true,
      "bones": {
        "body": {
          "rotation": [0, 0, "query.modified_distance_moved * 30"]
        }
      }
    }
  }
}
```

### 7.2 State Machine Animation Controller (`RP/animation_controllers/custom_boss.animation_controllers.json`)

```json
{
  "format_version": "1.17.30",
  "animation_controllers": {
    "controller.animation.custom_boss.movement": {
      "initial_state": "idle",
      "states": {
        "idle": {
          "animations": [ "idle" ],
          "transitions": [
            { "walk": "query.modified_move_speed > 0.05" }
          ]
        },
        "walk": {
          "animations": [ "walk" ],
          "transitions": [
            { "idle": "query.modified_move_speed <= 0.05" }
          ]
        }
      }
    }
  }
}
```

---

## 8. DATA-DRIVEN CUSTOM BLOCKS (v1.26.50+) & BLOCK CULLING

Custom block components declare client-side visual representation.

### 8.1 Custom Block Data Component (`BP/blocks/custom_rune_stone.json`)

```json
{
  "format_version": "1.26.50",
  "minecraft:block": {
    "description": {
      "identifier": "my_namespace:custom_rune_stone",
      "menu_category": {
        "category": "construction"
      }
    },
    "components": {
      "minecraft:light_emission": 10,
      "minecraft:geometry": {
        "identifier": "geometry.custom_rune_stone"
      },
      "minecraft:material_instances": {
        "*": {
          "texture": "my_namespace:rune_stone_side",
          "render_method": "opaque"
        },
        "top": {
          "texture": "my_namespace:rune_stone_top",
          "render_method": "opaque"
        }
      }
    }
  }
}
```

### 8.2 Block Atlas Registration (`RP/textures/terrain_texture.json`)

```json
{
  "resource_pack_name": "my_resource_pack",
  "texture_name": "atlas.terrain",
  "texture_data": {
    "my_namespace:rune_stone_side": {
      "textures": "textures/blocks/rune_stone_side"
    },
    "my_namespace:rune_stone_top": {
      "textures": "textures/blocks/rune_stone_top"
    }
  }
}
```

---

## 9. RENDERDRAGON ENGINE, DEFERRED TECHNICAL PREVIEW & PBR TEXTURES (`.texture_set.json`)

Minecraft Bedrock's RenderDragon engine supports physical-based rendering (PBR) through the **Deferred Technical Preview / Vibrant Visuals** pipeline.

### 9.1 Texture Set Map Specification (`.texture_set.json`)

Place `.texture_set.json` alongside the base color PNG asset (e.g., `textures/blocks/rune_stone_side.texture_set.json`):

```json
{
  "format_version": "1.21.30",
  "minecraft:texture_set": {
    "color": "rune_stone_side",
    "metalness_emissive_roughness": "rune_stone_side_mer",
    "heightmap": "rune_stone_side_normal"
  }
}
```

### 9.2 MER Channel Mapping Reference

* **Red Channel (R)**: Metalness (0 = Non-metallic, 255 = Fully Metallic).
* **Green Channel (G)**: Emissive (0 = No light emission, 255 = Full self-illumination).
* **Blue Channel (B)**: Roughness (0 = Smooth/Glossy, 255 = Rough/Matte).

---

## 10. JSON UI CUSTOMIZATION & PERFORMANCE BEST PRACTICES

JSON UI governs the client interface layout. Modern creators must follow performance guidelines to avoid FPS drops.

### 10.1 UI Registry (`RP/ui/_ui_defs.json`)

```json
{
  "ui_defs": [
    "ui/custom_hud_panel.json"
  ]
}
```

### 10.2 Non-Destructive Modification Strategy (`RP/ui/hud_screen.json`)

Instead of replacing the full root panel, use `modifications` array operations (`insert_front`, `insert_back`, `replace`):

```json
{
  "custom_status_bar": {
    "type": "panel",
    "size": [100, 20],
    "anchor_from": "top_left",
    "anchor_to": "top_left",
    "offset": [10, 10],
    "controls": [
      {
        "icon": {
          "type": "image",
          "texture": "textures/ui/status_icon",
          "size": [16, 16]
        }
      }
    ]
  },
  "root_panel": {
    "modifications": [
      {
        "array_name": "controls",
        "operation": "insert_front",
        "value": [
          { "custom_status_bar@hud.custom_status_bar": {} }
        ]
      }
    ]
  }
}
```

### 10.3 JSON UI Performance Best Practices

1. **Use `"ignored": true` instead of `"visible": false`**:
   * `"visible": false` still evaluates control bindings behind the scenes.
   * `"ignored": true` completely unloads the element from computation, recovering FPS.
2. **Minimize Nested Bindings**:
   * Reduce deeply nested control trees and complex arithmetic expressions inside string bindings.
3. **Isolate Custom Namespaces**:
   * Always encapsulate custom UI components inside your own namespace (e.g., `my_ui:custom_panel`).

---

## 11. AUDIO SYSTEMS (`sound_definitions.json`) & PARTICLE EFFECTS (`.particle.json`)

### 11.1 Sound Category Registry (`RP/sound_definitions.json`)

```json
{
  "format_version": "1.21.0",
  "sound_definitions": {
    "my_namespace.boss.roar": {
      "category": "hostile",
      "sounds": [
        {
          "name": "sounds/mob/boss_roar",
          "volume": 1.0,
          "pitch": 0.9
        }
      ]
    }
  }
}
```

---

## 12. SCRIPT API (`@minecraft/server`) INTEGRATION & CUSTOM COMPONENTS

Script API JavaScript code can trigger client particle effects and sound playback dynamically.

### 12.1 JavaScript Event Listener (`BP/scripts/main.js`)

```javascript
import { world } from "@minecraft/server";

world.beforeEvents.worldInitialize.subscribe((event) => {
  event.itemComponentRegistry.registerCustomComponent("my_namespace:magic_wand", {
    onUse(useEvent) {
      const player = useEvent.source;
      player.sendMessage("§aMagic Wand Activated!");
      player.dimension.spawnParticle("my_namespace:sparkle_particle", player.location);
      player.playSound("my_namespace.boss.roar", player.location);
    }
  });
});
```

---

## 13. CONTENT LOGGING, DEBUGGING WORKFLOWS & PACKAGE DISTRIBUTION (`.mcpack` / `.mcaddon`)

### 13.1 Content Log Configuration
1. Navigate to **Settings** -> **Creator** in Minecraft Bedrock.
2. Enable **Enable Content Log File** and **Enable Content Log GUI**.
3. Log file location (Windows):  
   `%APPDATA%\Minecraft Bedrock\logs\ContentLog.txt`

### 13.2 Troubleshooting Matrix

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Magenta/Black Checkerboard** | Missing or unregistered texture atlas key. | Verify `terrain_texture.json` or `item_texture.json` atlas key matches texture path. |
| **Invisible Entity** | Geometry identifier mismatch. | Ensure `geometry.name` in `.geo.json` matches identifier in `client_entity.json`. |
| **JSON Syntax Error** | Trailing comma or unescaped character. | Validate JSON syntax via standard linter. |

### 13.3 Package Compilation (`.mcpack` & `.mcaddon`)

1. **Creating a `.mcpack`**:
   * Compress the root contents of the Resource Pack folder into a `.zip` archive.
   * Rename file extension from `.zip` to `.mcpack`.
2. **Creating a `.mcaddon`**:
   * Place `ResourcePack.mcpack` and `BehaviorPack.mcpack` into a single container folder.
   * Compress container folder as `.zip` and rename extension to `.mcaddon`.

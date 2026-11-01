const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// 30 Vietnam Urban Traffic & Infrastructure Models
const models = [
  // 1. square_concrete_utility_pole
  {
    asset_name: "square_concrete_utility_pole",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 3.5, height: 4.5, offset: [0, 2, 0] },
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: []
      },
      {
        name: "pole_base",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base footing & lower concrete trunk
          { origin: [-3.5, 0, -3.5], size: [7, 16, 7], material: { color: "#757575", style: "bordered" } },
          // Steel collar base clamp
          { origin: [-3.8, 1, -3.8], size: [7.6, 2, 7.6], material: { color: "#424242", style: "solid" } },
          // Grounding copper wire running down side
          { origin: [-3.7, 0, -0.5], size: [0.4, 16, 1], material: { color: "#8D6E63", style: "solid" } }
        ]
      },
      {
        name: "pole_mid",
        parent: "pole_base",
        pivot: [0, 16, 0],
        cubes: [
          // Tapered middle concrete trunk
          { origin: [-3, 16, -3], size: [6, 24, 6], material: { color: "#828282", style: "shaded" } },
          // Staggered climbing steps
          { origin: [3, 20, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } },
          { origin: [-5.5, 26, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } },
          { origin: [3, 32, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } },
          { origin: [-5.5, 38, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } },
          // Grounding wire continuation
          { origin: [-3.2, 16, -0.5], size: [0.4, 24, 1], material: { color: "#8D6E63", style: "solid" } }
        ]
      },
      {
        name: "pole_top",
        parent: "pole_mid",
        pivot: [0, 40, 0],
        cubes: [
          // Upper concrete trunk tapering to top cap
          { origin: [-2.5, 40, -2.5], size: [5, 24, 5], material: { color: "#8E8E8E", style: "shaded" } },
          { origin: [-2.8, 63, -2.8], size: [5.6, 1.2, 5.6], material: { color: "#616161", style: "bordered" } },
          // Climbing steps top
          { origin: [2.5, 44, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } },
          { origin: [-5, 50, -0.75], size: [2.5, 0.8, 1.5], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "crossarm_lower",
        parent: "pole_top",
        pivot: [0, 52, 0],
        cubes: [
          // Lower steel crossarm
          { origin: [-15, 52, -1.5], size: [30, 2, 3], material: { color: "#455A64", style: "bordered" } },
          // Diagonal angle iron braces
          { origin: [-9, 48.5, -0.5], size: [8, 1, 1], pivot: [-2.5, 47, 0], rotation: [0, 0, 32], material: { color: "#37474F", style: "solid" } },
          { origin: [1, 48.5, -0.5], size: [8, 1, 1], pivot: [2.5, 47, 0], rotation: [0, 0, -32], material: { color: "#37474F", style: "solid" } },
          // Porcelain pin insulators
          { origin: [-14, 54, -1], size: [2, 3.5, 2], material: { color: "#E0E0E0", style: "shaded" } },
          { origin: [-8, 54, -1], size: [2, 3.5, 2], material: { color: "#5D4037", style: "shaded" } },
          { origin: [6, 54, -1], size: [2, 3.5, 2], material: { color: "#5D4037", style: "shaded" } },
          { origin: [12, 54, -1], size: [2, 3.5, 2], material: { color: "#E0E0E0", style: "shaded" } }
        ]
      },
      {
        name: "crossarm_upper",
        parent: "pole_top",
        pivot: [0, 58, 0],
        cubes: [
          // Upper steel crossarm
          { origin: [-10, 58, -1.5], size: [20, 2, 3], material: { color: "#455A64", style: "bordered" } },
          // Porcelain insulators upper
          { origin: [-9, 60, -1], size: [2, 3.5, 2], material: { color: "#5D4037", style: "shaded" } },
          { origin: [-1, 60, -1], size: [2, 3.5, 2], material: { color: "#E0E0E0", style: "shaded" } },
          { origin: [7, 60, -1], size: [2, 3.5, 2], material: { color: "#5D4037", style: "shaded" } },
          // Pole top lightning arrestor rod
          { origin: [-0.5, 64, -0.5], size: [1, 5, 1], material: { color: "#B0BEC5", style: "solid" } }
        ]
      }
    ]
  },

  // 2. round_concrete_utility_pole
  {
    asset_name: "round_concrete_utility_pole",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 3.5, height: 4.5, offset: [0, 2, 0] },
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: []
      },
      {
        name: "pole_base",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Spun concrete cylindrical base (8-sided cross-section)
          { origin: [-3.5, 0, -3.5], size: [7, 18, 7], material: { color: "#78909C", style: "shaded" } },
          { origin: [-3.5, 0, -3.5], size: [7, 18, 7], pivot: [0, 9, 0], rotation: [0, 45, 0], material: { color: "#78909C", style: "shaded" } },
          // Base flange collar
          { origin: [-4, 0, -4], size: [8, 1.5, 8], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "pole_mid",
        parent: "pole_base",
        pivot: [0, 18, 0],
        cubes: [
          // Mid round cylinder tapering
          { origin: [-3, 18, -3], size: [6, 24, 6], material: { color: "#90A4AE", style: "shaded" } },
          { origin: [-3, 18, -3], size: [6, 24, 6], pivot: [0, 30, 0], rotation: [0, 45, 0], material: { color: "#90A4AE", style: "shaded" } },
          // Metal hoop clamps holding cables
          { origin: [-3.3, 24, -3.3], size: [6.6, 1, 6.6], material: { color: "#455A64", style: "solid" } },
          { origin: [-3.3, 34, -3.3], size: [6.6, 1, 6.6], material: { color: "#455A64", style: "solid" } }
        ]
      },
      {
        name: "transformer",
        parent: "pole_mid",
        pivot: [3.5, 28, 0],
        cubes: [
          // Pole-mounted transformer drum
          { origin: [3.2, 26, -3.5], size: [6, 9, 7], material: { color: "#546E7A", style: "bordered" } },
          // Cooling radiator fins
          { origin: [9.2, 27, -3], size: [0.8, 7, 6], material: { color: "#37474F", style: "solid" } },
          // Bushing insulators on top of transformer
          { origin: [4.5, 35, -2], size: [1.2, 2.5, 1.2], material: { color: "#8D6E63", style: "solid" } },
          { origin: [7, 35, -2], size: [1.2, 2.5, 1.2], material: { color: "#8D6E63", style: "solid" } },
          { origin: [5.7, 35, 1.5], size: [1.2, 2.5, 1.2], material: { color: "#8D6E63", style: "solid" } }
        ]
      },
      {
        name: "pole_top",
        parent: "pole_mid",
        pivot: [0, 42, 0],
        cubes: [
          // Top cylindrical section
          { origin: [-2.5, 42, -2.5], size: [5, 24, 5], material: { color: "#A7B6BE", style: "shaded" } },
          { origin: [-2.5, 42, -2.5], size: [5, 24, 5], pivot: [0, 54, 0], rotation: [0, 45, 0], material: { color: "#A7B6BE", style: "shaded" } },
          // Steel crossarm
          { origin: [-16, 56, -1.5], size: [32, 2.5, 3], material: { color: "#37474F", style: "bordered" } },
          // Suspension bell insulators
          { origin: [-14.5, 52, -1], size: [2, 4, 2], material: { color: "#D7CCC8", style: "shaded" } },
          { origin: [-7.5, 52, -1], size: [2, 4, 2], material: { color: "#D7CCC8", style: "shaded" } },
          { origin: [5.5, 52, -1], size: [2, 4, 2], material: { color: "#D7CCC8", style: "shaded" } },
          { origin: [12.5, 52, -1], size: [2, 4, 2], material: { color: "#D7CCC8", style: "shaded" } },
          // Top lightning arrestor needle
          { origin: [-0.5, 66, -0.5], size: [1, 6, 1], material: { color: "#ECEFF1", style: "solid" } }
        ]
      }
    ]
  },

  // 3. Dy cp in ri (bm ct) (tangled_cables_on_pole) - Block
  {
    asset_name: "tangled_cables_on_pole",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Mounting bracket collar
          { origin: [-4, 6, 5], size: [8, 3, 2.5], material: { color: "#37474F", style: "bordered" } },
          // Fiber optic splice enclosure cylinder
          { origin: [-5.5, 8, 3.5], size: [11, 3.5, 3.5], material: { color: "#212121", style: "shaded" } },
          // Main bundled central cable core
          { origin: [-6, 5, 2], size: [12, 4, 3], material: { color: "#1E1E1E", style: "shaded" } },
          // Cable zip ties / binding loops
          { origin: [-3, 4.8, 1.8], size: [1, 4.4, 3.4], material: { color: "#EEEEEE", style: "solid" } },
          { origin: [2, 4.8, 1.8], size: [1, 4.4, 3.4], material: { color: "#EEEEEE", style: "solid" } },
          // Coiled cable loops hanging down with rotational angles (8.5/10 standard)
          { origin: [-4, 1.5, 2], size: [7, 4.5, 1.2], pivot: [0, 5, 2], rotation: [12, 8, -6], material: { color: "#1B1B1B", style: "shaded" } },
          { origin: [-2.5, 0.5, 2.8], size: [5.5, 5, 1.2], pivot: [0, 5, 2], rotation: [-10, -12, 8], material: { color: "#262626", style: "shaded" } },
          { origin: [-4.5, 2, 1], size: [8, 3.8, 1.2], pivot: [0, 5, 2], rotation: [6, 15, -4], material: { color: "#111111", style: "shaded" } },
          // Loose drooping cable lines branching out
          { origin: [-7.5, 0, 1], size: [1, 14, 1], pivot: [-7, 7, 1], rotation: [8, 0, 15], material: { color: "#212121", style: "solid" } },
          { origin: [6.5, 0, 1], size: [1, 14, 1], pivot: [7, 7, 1], rotation: [-8, 0, -15], material: { color: "#212121", style: "solid" } },
          { origin: [-2, 0, -2], size: [0.8, 10, 0.8], pivot: [-2, 5, 0], rotation: [22, 15, 0], material: { color: "#292929", style: "solid" } },
          { origin: [1.5, 0, -1.5], size: [0.8, 11, 0.8], pivot: [1.5, 5, 0], rotation: [18, -20, 0], material: { color: "#292929", style: "solid" } }
        ]
      }
    ]
  },

  // 4. Dy in chng ngang (ni 2 ct) (hanging_power_lines) - Block
  {
    asset_name: "hanging_power_lines",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // 4 parallel catenary wires with natural droop angles
          // Wire 1: Front line (slight sag from left to center to right)
          { origin: [-8, 12, -4], size: [5.5, 0.8, 0.8], pivot: [-8, 12, -4], rotation: [0, 0, -15], material: { color: "#212121", style: "solid" } },
          { origin: [-2.5, 10.4, -4], size: [5, 0.8, 0.8], material: { color: "#212121", style: "solid" } },
          { origin: [2.5, 10.4, -4], size: [5.5, 0.8, 0.8], pivot: [8, 12, -4], rotation: [0, 0, 15], material: { color: "#212121", style: "solid" } },
          // Wire 2: Mid-front line
          { origin: [-8, 13, -1.5], size: [5.5, 0.8, 0.8], pivot: [-8, 13, -1.5], rotation: [0, 0, -12], material: { color: "#262626", style: "solid" } },
          { origin: [-2.5, 11.6, -1.5], size: [5, 0.8, 0.8], material: { color: "#262626", style: "solid" } },
          { origin: [2.5, 11.6, -1.5], size: [5.5, 0.8, 0.8], pivot: [8, 13, -1.5], rotation: [0, 0, 12], material: { color: "#262626", style: "solid" } },
          // Wire 3: Mid-back line
          { origin: [-8, 12.5, 1.5], size: [5.5, 0.8, 0.8], pivot: [-8, 12.5, 1.5], rotation: [0, 0, -14], material: { color: "#1F1F1F", style: "solid" } },
          { origin: [-2.5, 11, 1.5], size: [5, 0.8, 0.8], material: { color: "#1F1F1F", style: "solid" } },
          { origin: [2.5, 11, 1.5], size: [5.5, 0.8, 0.8], pivot: [8, 12.5, 1.5], rotation: [0, 0, 14], material: { color: "#1F1F1F", style: "solid" } },
          // Wire 4: Rear line
          { origin: [-8, 13.5, 4], size: [5.5, 0.8, 0.8], pivot: [-8, 13.5, 4], rotation: [0, 0, -16], material: { color: "#212121", style: "solid" } },
          { origin: [-2.5, 11.8, 4], size: [5, 0.8, 0.8], material: { color: "#212121", style: "solid" } },
          { origin: [2.5, 11.8, 4], size: [5.5, 0.8, 0.8], pivot: [8, 13.5, 4], rotation: [0, 0, 16], material: { color: "#212121", style: "solid" } },
          // Cable spacer / separator clips
          { origin: [-3, 10.6, -4.2], size: [0.6, 1.8, 8.4], material: { color: "#424242", style: "solid" } },
          { origin: [2.4, 10.6, -4.2], size: [0.6, 1.8, 8.4], material: { color: "#424242", style: "solid" } }
        ]
      }
    ]
  },

  // 5. Cng t in (gn ct) (electric_meter_box) - Block
  {
    asset_name: "electric_meter_box",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel backplate mounting bracket
          { origin: [-5, 2, 4], size: [10, 12, 1], material: { color: "#37474F", style: "bordered" } },
          // Main enclosure cabinet
          { origin: [-4.5, 2.5, -2], size: [9, 11, 6], material: { color: "#CFD8DC", style: "bordered" } },
          // Hinged door with glass bezel frame
          { origin: [-4.2, 2.8, -2.6], size: [8.4, 10.4, 0.6], material: { color: "#90A4AE", style: "bordered" } },
          // Two circular inspection glass windows
          { origin: [-3.2, 7.5, -3], size: [3, 3, 0.5], material: { color: "#80DEEA", style: "shaded" } },
          { origin: [0.2, 7.5, -3], size: [3, 3, 0.5], material: { color: "#80DEEA", style: "shaded" } },
          // Internal meter dial faces (visible through glass)
          { origin: [-2.8, 8, -2.5], size: [2.2, 2, 0.2], material: { color: "#FAFAFA", style: "solid" } },
          { origin: [0.6, 8, -2.5], size: [2.2, 2, 0.2], material: { color: "#FAFAFA", style: "solid" } },
          // Top corrugated PVC conduit inlet
          { origin: [-1.2, 13.5, 0], size: [2.4, 2.5, 2], material: { color: "#455A64", style: "solid" } },
          // Bottom outgoing conduits (2 curved PVC pipes)
          { origin: [-3, 0, 0], size: [1.8, 2.5, 2], material: { color: "#455A64", style: "solid" } },
          { origin: [1.2, 0, 0], size: [1.8, 2.5, 2], material: { color: "#455A64", style: "solid" } },
          // Padlock / security lead seal
          { origin: [3.4, 4.5, -3], size: [0.8, 1.5, 0.6], material: { color: "#F57F17", style: "solid" } },
          // High voltage lightning warning decal (yellow)
          { origin: [-1, 4.5, -2.8], size: [2, 2, 0.2], material: { color: "#FDD835", style: "solid" } }
        ]
      }
    ]
  },

  // 6. sidewalk_transformer_station
  {
    asset_name: "sidewalk_transformer_station",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Raised concrete plinth base
          { origin: [-7.5, 0, -7.5], size: [15, 2.5, 15], material: { color: "#78909C", style: "bordered" } },
          // Main substation kiosk housing (dark industrial green)
          { origin: [-7, 2.5, -7], size: [14, 12, 14], material: { color: "#1B5E20", style: "bordered" } },
          // Front double door seam and frame
          { origin: [-6.5, 3, -7.3], size: [13, 11, 0.5], material: { color: "#2E7D32", style: "bordered" } },
          { origin: [-0.3, 3, -7.5], size: [0.6, 11, 0.3], material: { color: "#1B5E20", style: "solid" } },
          // Recessed door handles
          { origin: [-1.2, 7.5, -7.8], size: [0.6, 2, 0.4], material: { color: "#37474F", style: "solid" } },
          { origin: [0.6, 7.5, -7.8], size: [0.6, 2, 0.4], material: { color: "#37474F", style: "solid" } },
          // Side ventilation louver grilles (slatted rule)
          { origin: [-7.3, 8, -4], size: [0.4, 4, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [6.9, 8, -4], size: [0.4, 4, 8], material: { color: "#212121", style: "bordered" } },
          // External cooling radiator fins (rear)
          { origin: [-5.5, 4, 7], size: [0.8, 9, 1.2], material: { color: "#37474F", style: "solid" } },
          { origin: [-2, 4, 7], size: [0.8, 9, 1.2], material: { color: "#37474F", style: "solid" } },
          { origin: [1.5, 4, 7], size: [0.8, 9, 1.2], material: { color: "#37474F", style: "solid" } },
          { origin: [5, 4, 7], size: [0.8, 9, 1.2], material: { color: "#37474F", style: "solid" } },
          // Top weather canopy roof with drip eaves
          { origin: [-7.5, 14.5, -7.5], size: [15, 1.5, 15], material: { color: "#2E7D32", style: "bordered" } },
          // Hazard electric shock warning triangle
          { origin: [-1.5, 10, -7.5], size: [3, 2.5, 0.2], material: { color: "#FFD600", style: "bordered" } }
        ]
      }
    ]
  },

  // 7. led_street_light
  {
    asset_name: "led_street_light",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 4.5, height: 5, offset: [0, 2.2, -0.6] },
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: []
      },
      {
        name: "pole_base",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Heavy octagonal base flange with anchor bolts
          { origin: [-3, 0, -3], size: [6, 3, 6], material: { color: "#455A64", style: "bordered" } },
          // Lower tapered vertical steel mast
          { origin: [-2, 3, -2], size: [4, 26, 4], material: { color: "#607D8B", style: "shaded" } },
          // Electrical inspection hatch
          { origin: [-1.2, 5, -2.3], size: [2.4, 5, 0.4], material: { color: "#37474F", style: "bordered" } }
        ]
      },
      {
        name: "pole_upper",
        parent: "pole_base",
        pivot: [0, 29, 0],
        cubes: [
          // Upper slender steel mast
          { origin: [-1.5, 29, -1.5], size: [3, 26, 3], material: { color: "#78909C", style: "shaded" } }
        ]
      },
      {
        name: "curved_arm",
        parent: "pole_upper",
        pivot: [0, 55, 0],
        cubes: [
          // Curved outreach mast arm extending forward towards street
          { origin: [-1.2, 54, -4], size: [2.4, 6, 5], pivot: [0, 55, 0], rotation: [-25, 0, 0], material: { color: "#78909C", style: "solid" } },
          { origin: [-1, 58, -10], size: [2, 3, 7], pivot: [0, 58, -4], rotation: [-15, 0, 0], material: { color: "#78909C", style: "solid" } }
        ]
      },
      {
        name: "luminaire",
        parent: "curved_arm",
        pivot: [0, 60, -13],
        cubes: [
          // Die-cast aluminum modern cobra-head LED housing
          { origin: [-2.5, 59.5, -21], size: [5, 2.5, 10], material: { color: "#90A4AE", style: "bordered" } },
          // Top cooling heat-sink fin grid
          { origin: [-2, 62, -20], size: [4, 0.8, 8], material: { color: "#546E7A", style: "solid" } },
          // Downward-facing LED optical lens array (emissive cool white)
          { origin: [-2, 59, -20], size: [4, 0.6, 8], material: { color: "#E0F7FA", style: "solid" } },
          // Blue photocell twilight sensor dome on top
          { origin: [-0.8, 62.8, -15], size: [1.6, 1.2, 1.6], material: { color: "#0288D1", style: "solid" } }
        ]
      }
    ]
  },

  // 8. vintage_incandescent_street_light
  {
    asset_name: "vintage_incandescent_street_light",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 3.5, height: 4.5, offset: [0, 2, -0.4] },
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: []
      },
      {
        name: "pedestal",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Ornate French colonial cast iron pedestal base
          { origin: [-4, 0, -4], size: [8, 3, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [-3, 3, -3], size: [6, 8, 6], material: { color: "#263238", style: "bordered" } },
          { origin: [-2.5, 11, -2.5], size: [5, 2.5, 5], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "fluted_column",
        parent: "pedestal",
        pivot: [0, 13.5, 0],
        cubes: [
          // Slender fluted column
          { origin: [-1.5, 13.5, -1.5], size: [3, 36, 3], material: { color: "#37474F", style: "shaded" } },
          // Decorative collar rings
          { origin: [-2, 25, -2], size: [4, 1.5, 4], material: { color: "#212121", style: "solid" } },
          { origin: [-2, 45, -2], size: [4, 1.5, 4], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "gooseneck_arm",
        parent: "fluted_column",
        pivot: [0, 49.5, 0],
        cubes: [
          // Ornate curved gooseneck arch arm curving forward
          { origin: [-1, 49.5, -3.5], size: [2, 6, 4], pivot: [0, 50, 0], rotation: [-30, 0, 0], material: { color: "#263238", style: "solid" } },
          { origin: [-1, 54.5, -7.5], size: [2, 3, 5], pivot: [0, 54, -3], rotation: [-15, 0, 0], material: { color: "#263238", style: "solid" } }
        ]
      },
      {
        name: "vintage_lamp",
        parent: "gooseneck_arm",
        pivot: [0, 56, -8],
        cubes: [
          // Brass finial cap
          { origin: [-1.5, 56.5, -9.5], size: [3, 2, 3], material: { color: "#FFA000", style: "solid" } },
          // Wide vintage enameled dark green saucer/bell shade
          { origin: [-5.5, 54.5, -13.5], size: [11, 2, 11], material: { color: "#1B3B2B", style: "bordered" } },
          // Glowing warm incandescent glass bulb
          { origin: [-2.5, 51, -10.5], size: [5, 3.5, 5], material: { color: "#FFF9C4", style: "shaded" } },
          // Decorative wrought iron scroll bracket
          { origin: [-0.5, 49, -6], size: [1, 4, 3], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 9. traffic_light_pole
  {
    asset_name: "traffic_light_pole",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 3.5, height: 4.5, offset: [0, 2, -0.4] },
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: []
      },
      {
        name: "pole_base",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base flange plate
          { origin: [-3, 0, -3], size: [6, 2.5, 6], material: { color: "#37474F", style: "bordered" } },
          // Vertical mast
          { origin: [-1.5, 2.5, -1.5], size: [3, 56, 3], material: { color: "#455A64", style: "shaded" } },
          // Pedestrian push button controller box mounted on pole
          { origin: [-2, 12, -2.6], size: [4, 5.5, 2.2], material: { color: "#FBC02D", style: "bordered" } },
          { origin: [-0.6, 14, -3], size: [1.2, 1.2, 0.5], material: { color: "#D32F2F", style: "solid" } }
        ]
      },
      {
        name: "signal_mounting",
        parent: "pole_base",
        pivot: [0, 42, 0],
        cubes: [
          // Outreach horizontal mounting bracket
          { origin: [-1, 42, -7], size: [2, 2, 6], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "signal_head",
        parent: "signal_mounting",
        pivot: [0, 42, -9],
        cubes: [
          // Backing border plate with high-vis yellow reflective rim
          { origin: [-4.5, 33, -9.8], size: [9, 19, 0.6], material: { color: "#FBC02D", style: "bordered" } },
          // Signal housing box in matte black
          { origin: [-3.5, 34, -9.5], size: [7, 17, 4], material: { color: "#212121", style: "bordered" } },
          // Red light (top)
          { origin: [-2, 45.5, -10], size: [4, 4, 0.8], material: { color: "#E53935", style: "shaded" } },
          // Amber light (middle)
          { origin: [-2, 40.5, -10], size: [4, 4, 0.8], material: { color: "#FB8C00", style: "shaded" } },
          // Green light (bottom)
          { origin: [-2, 35.5, -10], size: [4, 4, 0.8], material: { color: "#43A047", style: "shaded" } },
          // 3 angled sun visors / hoods
          { origin: [-2.5, 49.5, -12], size: [5, 1, 2.5], pivot: [0, 49.5, -10], rotation: [-22, 0, 0], material: { color: "#212121", style: "solid" } },
          { origin: [-2.5, 44.5, -12], size: [5, 1, 2.5], pivot: [0, 44.5, -10], rotation: [-22, 0, 0], material: { color: "#212121", style: "solid" } },
          { origin: [-2.5, 39.5, -12], size: [5, 1, 2.5], pivot: [0, 39.5, -10], rotation: [-22, 0, 0], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 10. no_turn_sign
  {
    asset_name: "no_turn_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel pole post
          { origin: [-1, 0, -1], size: [2, 18, 2], material: { color: "#78909C", style: "bordered" } },
          // Rear clamp brackets
          { origin: [-2, 10, 0.2], size: [4, 4, 1.4], material: { color: "#455A64", style: "solid" } },
          // Circular sign disc (octagonal approximation)
          { origin: [-6, 8, -1.5], size: [12, 12, 0.8], material: { color: "#D32F2F", style: "bordered" } },
          // White reflective inner field
          { origin: [-4.8, 9.2, -1.8], size: [9.6, 9.6, 0.4], material: { color: "#FAFAFA", style: "solid" } },
          // Black curved turn arrow
          { origin: [-2, 12, -2], size: [4, 1.5, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [1, 10, -2], size: [1.5, 3.5, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [-3, 11.5, -2], size: [1.5, 2.5, 0.3], material: { color: "#212121", style: "solid" } },
          // Red diagonal slash prohibition bar (angled at 45 degrees)
          { origin: [-4.5, 13.5, -2.2], size: [9, 1.4, 0.4], pivot: [0, 14, -2], rotation: [0, 0, 45], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 11. 50
  {
    asset_name: "speed_limit_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel post
          { origin: [-1, 0, -1], size: [2, 18, 2], material: { color: "#78909C", style: "bordered" } },
          // Rear clamp
          { origin: [-2, 10, 0.2], size: [4, 4, 1.4], material: { color: "#455A64", style: "solid" } },
          // Red outer ring
          { origin: [-6, 8, -1.5], size: [12, 12, 0.8], material: { color: "#D32F2F", style: "bordered" } },
          // White inner reflective face
          { origin: [-4.8, 9.2, -1.8], size: [9.6, 9.6, 0.4], material: { color: "#FAFAFA", style: "solid" } },
          // Raised black digits "50"
          // "5" segments
          { origin: [-3.8, 14.5, -2], size: [2.8, 0.8, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [-3.8, 12.5, -2], size: [0.8, 2, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [-3.8, 12.2, -2], size: [2.8, 0.8, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [-1.8, 10.5, -2], size: [0.8, 2, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [-3.8, 10.2, -2], size: [2.8, 0.8, 0.3], material: { color: "#212121", style: "solid" } },
          // "0" segments
          { origin: [0.8, 10.2, -2], size: [0.8, 5, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [2.8, 10.2, -2], size: [0.8, 5, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [1.2, 14.4, -2], size: [2, 0.8, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [1.2, 10.2, -2], size: [2, 0.8, 0.3], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 12. one_way_street_sign
  {
    asset_name: "one_way_street_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel pole
          { origin: [-1, 0, -1], size: [2, 18, 2], material: { color: "#78909C", style: "bordered" } },
          // Rear clamp
          { origin: [-2, 10, 0.2], size: [4, 4, 1.4], material: { color: "#455A64", style: "solid" } },
          // Rectangular cobalt blue sign face
          { origin: [-7, 9, -1.5], size: [14, 8, 0.8], material: { color: "#1565C0", style: "bordered" } },
          // White border relief
          { origin: [-6.6, 9.4, -1.8], size: [13.2, 7.2, 0.4], material: { color: "#1976D2", style: "bordered" } },
          // Center horizontal pointing white arrow
          { origin: [-5, 12.2, -2.1], size: [7, 1.6, 0.4], material: { color: "#FFFFFF", style: "solid" } },
          // Arrow barb head angled
          { origin: [1.5, 12.8, -2.1], size: [2.5, 1.2, 0.4], pivot: [2, 13, -2], rotation: [0, 0, 35], material: { color: "#FFFFFF", style: "solid" } },
          { origin: [1.5, 11.5, -2.1], size: [2.5, 1.2, 0.4], pivot: [2, 13, -2], rotation: [0, 0, -35], material: { color: "#FFFFFF", style: "solid" } }
        ]
      }
    ]
  },

  // 13. no_parking_sign
  {
    asset_name: "no_parking_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel post
          { origin: [-1, 0, -1], size: [2, 18, 2], material: { color: "#78909C", style: "bordered" } },
          // Rear clamp
          { origin: [-2, 10, 0.2], size: [4, 4, 1.4], material: { color: "#455A64", style: "solid" } },
          // Red outer ring
          { origin: [-6, 8, -1.5], size: [12, 12, 0.8], material: { color: "#D32F2F", style: "bordered" } },
          // Azure blue inner field
          { origin: [-4.8, 9.2, -1.8], size: [9.6, 9.6, 0.4], material: { color: "#1976D2", style: "solid" } },
          // Red diagonal cross bars (X shape with 45-degree rotations)
          { origin: [-4.2, 13.5, -2.1], size: [8.4, 1.4, 0.4], pivot: [0, 14, -2], rotation: [0, 0, 45], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-4.2, 13.5, -2.1], size: [8.4, 1.4, 0.4], pivot: [0, 14, -2], rotation: [0, 0, -45], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 14. G gim tc (mu vng/en) (speed_bump) - Block
  {
    asset_name: "speed_bump",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Modular alternating rubber segments with beveled ramp profile
          // Black segment 1 (left)
          { origin: [-7.5, 0, -4.5], size: [3.8, 2, 9], material: { color: "#212121", style: "bordered" } },
          // Yellow segment 2 (mid-left)
          { origin: [-3.7, 0, -4.5], size: [3.7, 2, 9], material: { color: "#FDD835", style: "bordered" } },
          // Black segment 3 (mid-right)
          { origin: [0, 0, -4.5], size: [3.7, 2, 9], material: { color: "#212121", style: "bordered" } },
          // Yellow segment 4 (right)
          { origin: [3.7, 0, -4.5], size: [3.8, 2, 9], material: { color: "#FDD835", style: "bordered" } },
          // Front and rear beveled slopes (angled transition)
          { origin: [-7.5, 0, -6], size: [15, 1, 1.5], material: { color: "#37474F", style: "shaded" } },
          { origin: [-7.5, 0, 4.5], size: [15, 1, 1.5], material: { color: "#37474F", style: "shaded" } },
          // Anchor bolt countersunk recesses
          { origin: [-5.8, 1.6, 0], size: [1, 0.5, 1], material: { color: "#424242", style: "solid" } },
          { origin: [-1.8, 1.6, 0], size: [1, 0.5, 1], material: { color: "#424242", style: "solid" } },
          { origin: [1.8, 1.6, 0], size: [1, 0.5, 1], material: { color: "#424242", style: "solid" } },
          { origin: [5.8, 1.6, 0], size: [1, 0.5, 1], material: { color: "#424242", style: "solid" } }
        ]
      }
    ]
  },

  // 15. Di phn cch b tng (con ln) (concrete_median_barrier) - Block
  {
    asset_name: "concrete_median_barrier",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // New Jersey barrier profile
          // Wide flared base foot
          { origin: [-7.5, 0, -5], size: [15, 3, 10], material: { color: "#757575", style: "bordered" } },
          // Sloped transition batter
          { origin: [-7.5, 3, -3.5], size: [15, 4, 7], material: { color: "#828282", style: "shaded" } },
          // Vertical upper barrier stem
          { origin: [-7.5, 7, -2.5], size: [15, 7, 5], material: { color: "#9E9E9E", style: "bordered" } },
          // Top rounded cap
          { origin: [-7.5, 14, -2], size: [15, 1, 4], material: { color: "#B0BEC5", style: "solid" } },
          // Reflective warning chevron marker plate mounted on top
          { origin: [-2, 14.8, -0.6], size: [4, 3, 1.2], material: { color: "#FDD835", style: "bordered" } },
          // Black diagonal chevron stripes on reflector
          { origin: [-1.5, 15.5, -0.8], size: [1.2, 2, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [0.3, 15.5, -0.8], size: [1.2, 2, 0.3], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 16. traffic_cone
  {
    asset_name: "traffic_cone",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Heavy square weighted base in black rubber
          { origin: [-5, 0, -5], size: [10, 1.5, 10], material: { color: "#212121", style: "bordered" } },
          // Tapered stepped cone body with safety orange and reflective white bands
          { origin: [-4, 1.5, -4], size: [8, 3, 8], material: { color: "#FF6D00", style: "shaded" } },
          // Reflective white collar 1
          { origin: [-3.25, 4.5, -3.25], size: [6.5, 2.5, 6.5], material: { color: "#ECEFF1", style: "bordered" } },
          // Middle orange section
          { origin: [-2.5, 7, -2.5], size: [5, 2.5, 5], material: { color: "#FF6D00", style: "shaded" } },
          // Reflective white collar 2
          { origin: [-1.75, 9.5, -1.75], size: [3.5, 2.5, 3.5], material: { color: "#ECEFF1", style: "bordered" } },
          // Upper orange tip
          { origin: [-1.25, 12, -1.25], size: [2.5, 2.5, 2.5], material: { color: "#FF6D00", style: "shaded" } },
          // Top hollow carrying lip ring
          { origin: [-1, 14.5, -1], size: [2, 0.8, 2], material: { color: "#E65100", style: "solid" } }
        ]
      }
    ]
  },

  // 17. round_iron_manhole_cover
  {
    asset_name: "round_iron_manhole_cover",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Outer embedded cast iron flange rim
          { origin: [-7.5, 0, -7.5], size: [15, 1.2, 15], material: { color: "#37474F", style: "bordered" } },
          // Circular lid rim (8-sided octagonal approximation)
          { origin: [-6.5, 1, -6.5], size: [13, 0.8, 13], material: { color: "#263238", style: "bordered" } },
          { origin: [-6.5, 1, -6.5], size: [13, 0.8, 13], pivot: [0, 1.4, 0], rotation: [0, 45, 0], material: { color: "#263238", style: "bordered" } },
          // Center raised waffle tread disc
          { origin: [-5, 1.6, -5], size: [10, 0.4, 10], material: { color: "#455A64", style: "shaded" } },
          { origin: [-5, 1.6, -5], size: [10, 0.4, 10], pivot: [0, 1.8, 0], rotation: [0, 45, 0], material: { color: "#455A64", style: "shaded" } },
          // Two pick / lifting key slots
          { origin: [-3, 1.5, -0.6], size: [1.2, 0.6, 1.2], material: { color: "#111111", style: "solid" } },
          { origin: [1.8, 1.5, -0.6], size: [1.2, 0.6, 1.2], material: { color: "#111111", style: "solid" } }
        ]
      }
    ]
  },

  // 18. square_manhole_cover
  {
    asset_name: "square_manhole_cover",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Heavy square cast iron embedded frame
          { origin: [-7.5, 0, -7.5], size: [15, 1.5, 15], material: { color: "#37474F", style: "bordered" } },
          // Recessed seating ledge
          { origin: [-6.5, 1, -6.5], size: [13, 0.6, 13], material: { color: "#212121", style: "solid" } },
          // Split double triangular hatch covers
          { origin: [-6, 1.2, -6], size: [12, 0.8, 5.8], material: { color: "#455A64", style: "bordered" } },
          { origin: [-6, 1.2, 0.2], size: [12, 0.8, 5.8], material: { color: "#455A64", style: "bordered" } },
          // Center diagonal hinge / separation groove
          { origin: [-6.2, 1.4, -0.4], size: [12.4, 0.7, 0.8], material: { color: "#263238", style: "solid" } },
          // Checkered waffle grip patterns
          { origin: [-4.5, 1.8, -4.5], size: [9, 0.3, 3], material: { color: "#546E7A", style: "shaded" } },
          { origin: [-4.5, 1.8, 1.5], size: [9, 0.3, 3], material: { color: "#546E7A", style: "shaded" } },
          // Recessed pry bar slots
          { origin: [-5, 1.6, -0.6], size: [1.5, 0.5, 1.2], material: { color: "#1E1E1E", style: "solid" } },
          { origin: [3.5, 1.6, -0.6], size: [1.5, 0.5, 1.2], material: { color: "#1E1E1E", style: "solid" } }
        ]
      }
    ]
  },

  // 19. drain_grate
  {
    asset_name: "drain_grate",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Outer rectangular frame with hollow catch basin cavity inside
          { origin: [-7.5, 0, -7.5], size: [15, 3, 2], material: { color: "#263238", style: "bordered" } },
          { origin: [-7.5, 0, 5.5], size: [15, 3, 2], material: { color: "#263238", style: "bordered" } },
          { origin: [-7.5, 0, -5.5], size: [2, 3, 11], material: { color: "#263238", style: "bordered" } },
          { origin: [5.5, 0, -5.5], size: [2, 3, 11], material: { color: "#263238", style: "bordered" } },
          // Central cross-support beam underneath
          { origin: [-5.5, 0.8, -1], size: [11, 1, 2], material: { color: "#37474F", style: "solid" } },
          // 7 distinct separated parallel slatted grate bars (size 0.8, gaps 0.7)
          { origin: [-5, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [-3.4, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [-1.8, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [-0.2, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [1.4, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [3, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } },
          { origin: [4.6, 2, -5.5], size: [0.8, 1, 11], material: { color: "#455A64", style: "shaded" } }
        ]
      }
    ]
  },

  // 20. Tr nc cu ha () (red_fire_hydrant) - Block (Height 16px)
  {
    asset_name: "red_fire_hydrant",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base flange with bolt lugs
          { origin: [-4.5, 0, -4.5], size: [9, 1.5, 9], material: { color: "#37474F", style: "bordered" } },
          // Lower cylindrical barrel
          { origin: [-3.5, 1.5, -3.5], size: [7, 7, 7], material: { color: "#C62828", style: "shaded" } },
          { origin: [-3.5, 1.5, -3.5], size: [7, 7, 7], pivot: [0, 5, 0], rotation: [0, 45, 0], material: { color: "#C62828", style: "shaded" } },
          // Mid collar ring
          { origin: [-4, 8.5, -4], size: [8, 1.5, 8], material: { color: "#B71C1C", style: "bordered" } },
          // Upper bonnet dome
          { origin: [-3, 10, -3], size: [6, 4, 6], material: { color: "#D32F2F", style: "shaded" } },
          // Top pentagonal operating nut
          { origin: [-1.2, 14, -1.2], size: [2.4, 1.8, 2.4], material: { color: "#FFA000", style: "solid" } },
          // Front 4.5" pumper nozzle
          { origin: [-2, 5, -5.5], size: [4, 4, 2.5], material: { color: "#FFA000", style: "bordered" } },
          // Side 2.5" hose nozzles with threaded caps
          { origin: [-5.5, 5.5, -1.5], size: [2.5, 3, 3], material: { color: "#FFA000", style: "bordered" } },
          { origin: [3, 5.5, -1.5], size: [2.5, 3, 3], material: { color: "#FFA000", style: "bordered" } },
          // Dangling retention chains
          { origin: [-4.5, 3.5, -0.5], size: [0.6, 2.2, 1], material: { color: "#424242", style: "solid" } },
          { origin: [3.9, 3.5, -0.5], size: [0.6, 2.2, 1], material: { color: "#424242", style: "solid" } }
        ]
      }
    ]
  },

  // 21. Bt in thoi cng cng (c) (old_public_telephone_booth) - Block (Height ~28px)
  {
    asset_name: "old_public_telephone_booth",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base foundation plinth
          { origin: [-6.5, 0, -6.5], size: [13, 1.5, 13], material: { color: "#37474F", style: "bordered" } },
          // 4 vertical structural corner posts in VNPT telephone blue
          { origin: [-6, 1.5, -6], size: [1.5, 23.5, 1.5], material: { color: "#0D47A1", style: "solid" } },
          { origin: [4.5, 1.5, -6], size: [1.5, 23.5, 1.5], material: { color: "#0D47A1", style: "solid" } },
          { origin: [-6, 1.5, 4.5], size: [1.5, 23.5, 1.5], material: { color: "#0D47A1", style: "solid" } },
          { origin: [4.5, 1.5, 4.5], size: [1.5, 23.5, 1.5], material: { color: "#0D47A1", style: "solid" } },
          // Lower blue apron panel walls (left, right, back)
          { origin: [-6, 1.5, -4.5], size: [0.6, 8, 9], material: { color: "#1565C0", style: "bordered" } },
          { origin: [5.4, 1.5, -4.5], size: [0.6, 8, 9], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-4.5, 1.5, 5.4], size: [9, 8, 0.6], material: { color: "#1565C0", style: "bordered" } },
          // Upper tinted acrylic window panes
          { origin: [-5.8, 9.5, -4.5], size: [0.4, 15, 9], material: { color: "#80DEEA", style: "shaded" } },
          { origin: [5.4, 9.5, -4.5], size: [0.4, 15, 9], material: { color: "#80DEEA", style: "shaded" } },
          { origin: [-4.5, 9.5, 5.4], size: [9, 15, 0.4], material: { color: "#80DEEA", style: "shaded" } },
          // Yellow slanted canopy roof with weather overhang
          { origin: [-7, 25, -7], size: [14, 2.5, 14], material: { color: "#FDD835", style: "bordered" } },
          // Interior payphone console unit
          { origin: [-2.5, 11, 2], size: [5, 7, 3], material: { color: "#90A4AE", style: "bordered" } },
          // Keypad and LCD screen
          { origin: [-2, 13, 1.8], size: [4, 4, 0.3], material: { color: "#37474F", style: "solid" } },
          // Handset receiver on cradle
          { origin: [-3.8, 12, 2.5], size: [1.2, 5, 1.5], material: { color: "#212121", style: "solid" } },
          // Coiled telephone cord
          { origin: [-3.4, 9, 2.8], size: [0.6, 3, 0.6], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 22. Gch lt va h (block lc gic /xanh) (hexagonal_paving_block) - Block (Height ~2px)
  {
    asset_name: "hexagonal_paving_block",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Mortar bedding layer
          { origin: [-7.5, 0, -7.5], size: [15, 1, 15], material: { color: "#B0BEC5", style: "solid" } },
          // Interlocking hexagonal paver 1 (Red)
          { origin: [-7, 1, -7], size: [6.5, 1, 6.5], material: { color: "#B71C1C", style: "bordered" } },
          { origin: [-7, 1, -7], size: [6.5, 1, 6.5], pivot: [-3.75, 1.5, -3.75], rotation: [0, 45, 0], material: { color: "#B71C1C", style: "bordered" } },
          // Paver 2 (Green)
          { origin: [0.5, 1, -7], size: [6.5, 1, 6.5], material: { color: "#2E7D32", style: "bordered" } },
          { origin: [0.5, 1, -7], size: [6.5, 1, 6.5], pivot: [3.75, 1.5, -3.75], rotation: [0, 45, 0], material: { color: "#2E7D32", style: "bordered" } },
          // Paver 3 (Green)
          { origin: [-7, 1, 0.5], size: [6.5, 1, 6.5], material: { color: "#2E7D32", style: "bordered" } },
          { origin: [-7, 1, 0.5], size: [6.5, 1, 6.5], pivot: [-3.75, 1.5, 3.75], rotation: [0, 45, 0], material: { color: "#2E7D32", style: "bordered" } },
          // Paver 4 (Red)
          { origin: [0.5, 1, 0.5], size: [6.5, 1, 6.5], material: { color: "#B71C1C", style: "bordered" } },
          { origin: [0.5, 1, 0.5], size: [6.5, 1, 6.5], pivot: [3.75, 1.5, 3.75], rotation: [0, 45, 0], material: { color: "#B71C1C", style: "bordered" } },
          // Recessed sand mortar joints
          { origin: [-0.5, 1, -7], size: [1, 0.8, 14], material: { color: "#9E9E9E", style: "solid" } },
          { origin: [-7, 1, -0.5], size: [14, 0.8, 1], material: { color: "#9E9E9E", style: "solid" } }
        ]
      }
    ]
  },

  // 23. Gch lt va h (zc zc) (zigzag_paving_block) - Block (Height ~2px)
  {
    asset_name: "zigzag_paving_block",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Mortar sub-base
          { origin: [-7.5, 0, -7.5], size: [15, 1, 15], material: { color: "#9E9E9E", style: "solid" } },
          // Interlocking Uni-zigzag wavy paver bricks in alternating terracotta and dark charcoal
          { origin: [-7, 1, -7], size: [4.5, 1, 6.5], material: { color: "#D84315", style: "bordered" } },
          { origin: [-4.5, 1, -5.5], size: [4.5, 1, 6.5], material: { color: "#37474F", style: "bordered" } },
          { origin: [-2, 1, -7], size: [4.5, 1, 6.5], material: { color: "#D84315", style: "bordered" } },
          { origin: [0.5, 1, -5.5], size: [4.5, 1, 6.5], material: { color: "#37474F", style: "bordered" } },
          { origin: [3, 1, -7], size: [4, 1, 6.5], material: { color: "#D84315", style: "bordered" } },
          // Lower row
          { origin: [-7, 1, 0.5], size: [4.5, 1, 6.5], material: { color: "#37474F", style: "bordered" } },
          { origin: [-4.5, 1, -0.5], size: [4.5, 1, 6.5], material: { color: "#D84315", style: "bordered" } },
          { origin: [-2, 1, 0.5], size: [4.5, 1, 6.5], material: { color: "#37474F", style: "bordered" } },
          { origin: [0.5, 1, -0.5], size: [4.5, 1, 6.5], material: { color: "#D84315", style: "bordered" } },
          { origin: [3, 1, 0.5], size: [4, 1, 6.5], material: { color: "#37474F", style: "bordered" } }
        ]
      }
    ]
  },

  // 24. terrazzo_paving_tile
  {
    asset_name: "terrazzo_paving_tile",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base concrete slab
          { origin: [-7.5, 0, -7.5], size: [15, 1.2, 15], material: { color: "#78909C", style: "bordered" } },
          // Classic Vietnamese terrazzo sidewalk concentric eye pattern
          // Center raised boss circle
          { origin: [-2.5, 1.2, -2.5], size: [5, 0.8, 5], material: { color: "#8D6E63", style: "bordered" } },
          { origin: [-2.5, 1.2, -2.5], size: [5, 0.8, 5], pivot: [0, 1.6, 0], rotation: [0, 45, 0], material: { color: "#8D6E63", style: "bordered" } },
          // Inner grooved ring
          { origin: [-4.5, 1.2, -4.5], size: [9, 0.6, 9], material: { color: "#B0BEC5", style: "shaded" } },
          // 4 outer corner quadrant petals with molded drainage grooves
          { origin: [-6.8, 1.4, -6.8], size: [4.5, 0.6, 4.5], material: { color: "#A1887F", style: "bordered" } },
          { origin: [2.3, 1.4, -6.8], size: [4.5, 0.6, 4.5], material: { color: "#9E9E9E", style: "bordered" } },
          { origin: [-6.8, 1.4, 2.3], size: [4.5, 0.6, 4.5], material: { color: "#9E9E9E", style: "bordered" } },
          { origin: [2.3, 1.4, 2.3], size: [4.5, 0.6, 4.5], material: { color: "#A1887F", style: "bordered" } }
        ]
      }
    ]
  },

  // 25. concrete_curb
  {
    asset_name: "concrete_curb",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Low asphalt road base on street side
          { origin: [-7.5, 0, -7.5], size: [15, 2, 5], material: { color: "#37474F", style: "bordered" } },
          // Drainage gutter depression groove along road
          { origin: [-7.5, 1.2, -3], size: [15, 1, 1.5], material: { color: "#263238", style: "solid" } },
          // Concrete curb block lower body
          { origin: [-7.5, 0, -1.5], size: [15, 5, 9], material: { color: "#78909C", style: "bordered" } },
          // Chamfered transition slope
          { origin: [-7.5, 4.5, -2], size: [15, 2.5, 3], pivot: [0, 5, 0], rotation: [-25, 0, 0], material: { color: "#90A4AE", style: "shaded" } },
          // Upper sidewalk pavement walking surface
          { origin: [-7.5, 5, 1], size: [15, 2.5, 6.5], material: { color: "#90A4AE", style: "bordered" } },
          // Expansion joint notch midway
          { origin: [-0.4, 0, -1.8], size: [0.8, 7.6, 9.3], material: { color: "#455A64", style: "solid" } }
        ]
      }
    ]
  },

  // 26. Vch k ng (vch lin trng) (solid_white_road_line) - Block (Height ~1.5px)
  {
    asset_name: "solid_white_road_line",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Asphalt road base slab
          { origin: [-7.5, 0, -7.5], size: [15, 1, 15], material: { color: "#263238", style: "shaded" } },
          // Solid thermoplastic reflective white centerline band
          { origin: [-2.5, 1, -7.5], size: [5, 0.5, 15], material: { color: "#ECEFF1", style: "bordered" } }
        ]
      }
    ]
  },

  // 27. Vch k ng (vch t vng) (dashed_yellow_road_line) - Block (Height ~1.5px)
  {
    asset_name: "dashed_yellow_road_line",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Asphalt road base slab
          { origin: [-7.5, 0, -7.5], size: [15, 1, 15], material: { color: "#263238", style: "shaded" } },
          // Centered reflective traffic yellow dashed stripe segment
          { origin: [-2, 1, -4.5], size: [4, 0.5, 9], material: { color: "#FFD600", style: "bordered" } }
        ]
      }
    ]
  },

  // 28. Zebra crossing
  {
    asset_name: "zebra_crossing",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Asphalt road base slab
          { origin: [-7.5, 0, -7.5], size: [15, 1, 15], material: { color: "#263238", style: "shaded" } },
          // 3 broad reflective pedestrian crossing white bars with asphalt gaps
          { origin: [-6.5, 1, -7.5], size: [3.5, 0.5, 15], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [-1.75, 1, -7.5], size: [3.5, 0.5, 15], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [3, 1, -7.5], size: [3.5, 0.5, 15], material: { color: "#ECEFF1", style: "bordered" } }
        ]
      }
    ]
  },

  // 29. road_stud
  {
    asset_name: "road_stud",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Asphalt substrate
          { origin: [-7.5, 0, -7.5], size: [15, 0.8, 15], material: { color: "#263238", style: "shaded" } },
          // Cast aluminum housing trapezoid prism
          { origin: [-3.5, 0.8, -3.5], size: [7, 1.4, 7], material: { color: "#90A4AE", style: "bordered" } },
          // Approaching wheel ramp slopes (front and back)
          { origin: [-3.5, 0.8, -4.5], size: [7, 0.8, 1], pivot: [0, 1.2, -4], rotation: [25, 0, 0], material: { color: "#78909C", style: "solid" } },
          { origin: [-3.5, 0.8, 3.5], size: [7, 0.8, 1], pivot: [0, 1.2, 4], rotation: [-25, 0, 0], material: { color: "#78909C", style: "solid" } },
          // Dual retroreflective amber lenses
          { origin: [-2.5, 1.4, -3.8], size: [5, 0.8, 0.5], material: { color: "#FFAB00", style: "solid" } },
          { origin: [-2.5, 1.4, 3.3], size: [5, 0.8, 0.5], material: { color: "#FFAB00", style: "solid" } },
          // Center anchor shank pin
          { origin: [-0.6, 0.2, -0.6], size: [1.2, 0.6, 1.2], material: { color: "#37474F", style: "solid" } }
        ]
      }
    ]
  },

  // 30. Ro chn cng trng (tn) (corrugated_iron_barricade) - Block (Height ~20px)
  {
    asset_name: "corrugated_iron_barricade",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Steel outrigger stabilizing feet
          { origin: [-6.5, 0, -4.5], size: [2, 1, 9], material: { color: "#37474F", style: "bordered" } },
          { origin: [4.5, 0, -4.5], size: [2, 1, 9], material: { color: "#37474F", style: "bordered" } },
          // Concrete counterweight ballast blocks on feet
          { origin: [-6.2, 1, 1], size: [2.4, 2, 3], material: { color: "#78909C", style: "bordered" } },
          { origin: [4.8, 1, 1], size: [2.4, 2, 3], material: { color: "#78909C", style: "bordered" } },
          // A-frame rear diagonal braces (angled support outriggers)
          { origin: [-6, 1, 0], size: [1, 14, 1], pivot: [-5.5, 1, 3], rotation: [-22, 0, 0], material: { color: "#455A64", style: "solid" } },
          { origin: [5, 1, 0], size: [1, 14, 1], pivot: [5.5, 1, 3], rotation: [-22, 0, 0], material: { color: "#455A64", style: "solid" } },
          // Vertical scaffolding frame uprights
          { origin: [-6.2, 1, -0.5], size: [1.4, 18, 1.4], material: { color: "#455A64", style: "solid" } },
          { origin: [4.8, 1, -0.5], size: [1.4, 18, 1.4], material: { color: "#455A64", style: "solid" } },
          // Horizontal framing cross rails
          { origin: [-6.2, 2.5, -0.5], size: [12.4, 1.2, 1.2], material: { color: "#37474F", style: "solid" } },
          { origin: [-6.2, 18, -0.5], size: [12.4, 1.2, 1.2], material: { color: "#37474F", style: "solid" } },
          // Galvanized corrugated sheet profile
          { origin: [-5.5, 3.5, -1], size: [2, 14.5, 0.4], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-3.5, 3.5, -0.6], size: [2, 14.5, 0.4], material: { color: "#90A4AE", style: "bordered" } },
          { origin: [-1.5, 3.5, -1], size: [2, 14.5, 0.4], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [0.5, 3.5, -0.6], size: [2, 14.5, 0.4], material: { color: "#90A4AE", style: "bordered" } },
          { origin: [2.5, 3.5, -1], size: [2, 14.5, 0.4], material: { color: "#B0BEC5", style: "bordered" } },
          // High-vis hazard warning bar across middle with alternating red/white stripes
          { origin: [-6, 9.5, -1.4], size: [12, 3, 0.4], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-4, 9.7, -1.6], size: [2, 2.6, 0.3], material: { color: "#FFFFFF", style: "solid" } },
          { origin: [0, 9.7, -1.6], size: [2, 2.6, 0.3], material: { color: "#FFFFFF", style: "solid" } },
          { origin: [4, 9.7, -1.6], size: [1.8, 2.6, 0.3], material: { color: "#FFFFFF", style: "solid" } }
        ]
      }
    ]
  }
];

// Execution runner
async function main() {
  console.log(`Starting generation for ${models.length} Infrastructure models...`);
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const items = [];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[${i + 1}/${models.length}] Generating ${model.asset_name} (${model.mode})...`);
    const res = buildMinecraftAsset(model, { outputDir });
    console.log(`  -> Built ${res.assetName}: ${res.cubeCount} cubes, ${res.boneCount} bones, texture: ${res.textureWidth}x${res.textureHeight}`);
    items.push({ assetName: res.assetName, mode: res.mode });
  }

  console.log(`\nAll 30 models built successfully. Packaging into Addon...`);
  const addonName = "vietnam_infrastructure_pack";
  const addonPath = packageAddon({
    addonName,
    items,
    outputDir
  });
  console.log(`Addon generated at: ${addonPath}`);

  // Synchronize to plugin output directory
  const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';
  if (fs.existsSync(path.dirname(pluginOutputDir))) {
    if (!fs.existsSync(pluginOutputDir)) {
      fs.mkdirSync(pluginOutputDir, { recursive: true });
    }
    console.log(`Syncing outputs to ${pluginOutputDir}...`);
    // Copy all generated files for this pack
    for (const item of items) {
      const geoSrc = path.join(outputDir, `${item.assetName}.geo.json`);
      const pngSrc = path.join(outputDir, `${item.assetName}.png`);
      const geoDest = path.join(pluginOutputDir, `${item.assetName}.geo.json`);
      const pngDest = path.join(pluginOutputDir, `${item.assetName}.png`);
      if (fs.existsSync(geoSrc)) fs.copyFileSync(geoSrc, geoDest);
      if (fs.existsSync(pngSrc)) fs.copyFileSync(pngSrc, pngDest);
    }
    const addonDest = path.join(pluginOutputDir, `${addonName}.mcaddon`);
    if (fs.existsSync(addonPath)) {
      fs.copyFileSync(addonPath, addonDest);
    }
    console.log(`Synchronization to plugin output directory complete!`);
  }
}

main().catch(err => {
  console.error("Generation failed:", err);
  process.exit(1);
});

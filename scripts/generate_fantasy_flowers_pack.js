const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// Helper to calculate origin from center and size
function cube(cx, cy, cz, w, h, d, color, style = "shaded", extra = {}) {
  const origin = [
    Math.round((cx - w / 2) * 100) / 100,
    Math.round((cy - h / 2) * 100) / 100,
    Math.round((cz - d / 2) * 100) / 100
  ];
  const res = {
    origin,
    size: [w, h, d],
    material: { color, style }
  };
  if (extra.inflate !== undefined) res.inflate = extra.inflate;
  if (extra.rotation) res.rotation = extra.rotation;
  if (extra.pivot) res.pivot = extra.pivot;
  return res;
}

const flowers = [
  // 1. Ice Crystal Flower
  {
    asset_name: "hoa_pha_le_bang",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#1b4d3e", "solid"),
          cube(-1.5, 2.5, 0, 2.5, 0.8, 1.5, "#2e7d62", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 18] }),
          cube(1.5, 4, 0.5, 2.5, 0.8, 1.5, "#2e7d62", "shaded", { pivot: [0.5, 4, 0.5], rotation: [0, 15, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Calyx base
          cube(0, 6.2, 0, 3.5, 1, 3.5, "#0277bd", "bordered"),
          // Tier 1 Outer Petals (Cardinal)
          cube(0, 8.5, -2.8, 3.2, 4, 1.2, "#0288d1", "shaded", { pivot: [0, 6.5, -2.5], rotation: [-15, 0, 0] }),
          cube(0, 8.5, 2.8, 3.2, 4, 1.2, "#0288d1", "shaded", { pivot: [0, 6.5, 2.5], rotation: [15, 0, 0] }),
          cube(-2.8, 8.5, 0, 1.2, 4, 3.2, "#0288d1", "shaded", { pivot: [-2.5, 6.5, 0], rotation: [0, 0, 15] }),
          cube(2.8, 8.5, 0, 1.2, 4, 3.2, "#0288d1", "shaded", { pivot: [2.5, 6.5, 0], rotation: [0, 0, -15] }),
          // Tier 1 Diagonal Petals (Rotated 45 deg)
          cube(-2, 8.2, -2, 2.6, 3.5, 1.2, "#29b6f6", "shaded", { pivot: [-1.5, 6.5, -1.5], rotation: [-10, 45, 10] }),
          cube(2, 8.2, -2, 2.6, 3.5, 1.2, "#29b6f6", "shaded", { pivot: [1.5, 6.5, -1.5], rotation: [-10, -45, -10] }),
          cube(-2, 8.2, 2, 2.6, 3.5, 1.2, "#29b6f6", "shaded", { pivot: [-1.5, 6.5, 1.5], rotation: [10, -45, 10] }),
          cube(2, 8.2, 2, 2.6, 3.5, 1.2, "#29b6f6", "shaded", { pivot: [1.5, 6.5, 1.5], rotation: [10, 45, -10] }),
          // Tier 2 Inner Petals
          cube(0, 9, -1.6, 2.4, 4.5, 1, "#4fc3f7", "shaded", { pivot: [0, 7, -1.5], rotation: [-8, 0, 0], inflate: 0.01 }),
          cube(0, 9, 1.6, 2.4, 4.5, 1, "#4fc3f7", "shaded", { pivot: [0, 7, 1.5], rotation: [8, 0, 0], inflate: 0.01 }),
          cube(-1.6, 9, 0, 1, 4.5, 2.4, "#81d4fa", "shaded", { pivot: [-1.5, 7, 0], rotation: [0, 0, 8], inflate: 0.01 }),
          cube(1.6, 9, 0, 1, 4.5, 2.4, "#81d4fa", "shaded", { pivot: [1.5, 7, 0], rotation: [0, 0, -8], inflate: 0.01 }),
          // Inner Glowing Frost Core
          cube(0, 9.2, 0, 2.2, 4.2, 2.2, "#e1f5fe", "bordered", { inflate: -0.01 }),
          cube(0, 10, 0, 1.2, 2.5, 1.2, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 10, 0],
        cubes: [
          // Floating Frost Crystals
          cube(-3.2, 11.5, 2, 0.8, 0.8, 0.8, "#b3e5fc", "solid"),
          cube(3.5, 10, -2.2, 0.8, 0.8, 0.8, "#81d4fa", "solid"),
          cube(-2, 13.5, -2.5, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(2.2, 12.8, 2.5, 0.7, 0.7, 0.7, "#e1f5fe", "solid")
        ]
      }
    ]
  },

  // 2. Purple Flame Flower
  {
    asset_name: "hoa_lua_tim",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.5, 0, 1.5, 5, 1.5, "#1e1b4b", "solid"),
          cube(-1.2, 2.2, 0, 2, 0.8, 1.2, "#2e1065", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 20] }),
          cube(1.2, 3.5, 0, 2, 0.8, 1.2, "#2e1065", "shaded", { pivot: [0.5, 3.5, 0], rotation: [0, 0, -20] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 5, 0],
        cubes: [
          // Dark mystic calyx
          cube(0, 5.2, 0, 3.8, 1.2, 3.8, "#3b0764", "bordered"),
          // 4 Tall Outer Flame Petals (curving upward)
          cube(0, 8.5, -2.4, 2.8, 6, 1, "#6d28d9", "shaded", { pivot: [0, 5.5, -2.2], rotation: [-12, 0, 0] }),
          cube(0, 8.5, 2.4, 2.8, 6, 1, "#6d28d9", "shaded", { pivot: [0, 5.5, 2.2], rotation: [12, 0, 0] }),
          cube(-2.4, 8.5, 0, 1, 6, 2.8, "#6d28d9", "shaded", { pivot: [-2.2, 5.5, 0], rotation: [0, 0, 12] }),
          cube(2.4, 8.5, 0, 1, 6, 2.8, "#6d28d9", "shaded", { pivot: [2.2, 5.5, 0], rotation: [0, 0, -12] }),
          // 4 Diagonal Flame Tongues (45 deg)
          cube(-1.8, 8.2, -1.8, 2.2, 5.5, 1, "#7c3aed", "shaded", { pivot: [-1.4, 5.5, -1.4], rotation: [-8, 45, 8] }),
          cube(1.8, 8.2, -1.8, 2.2, 5.5, 1, "#7c3aed", "shaded", { pivot: [1.4, 5.5, -1.4], rotation: [-8, -45, -8] }),
          cube(-1.8, 8.2, 1.8, 2.2, 5.5, 1, "#7c3aed", "shaded", { pivot: [-1.4, 5.5, 1.4], rotation: [8, -45, 8] }),
          cube(1.8, 8.2, 1.8, 2.2, 5.5, 1, "#7c3aed", "shaded", { pivot: [1.4, 5.5, 1.4], rotation: [8, 45, -8] }),
          // Inner Vibrant Flame Petals
          cube(0, 8.8, -1.4, 2.2, 5, 0.9, "#8b5cf6", "shaded", { pivot: [0, 6, -1.2], rotation: [-5, 0, 0], inflate: 0.01 }),
          cube(0, 8.8, 1.4, 2.2, 5, 0.9, "#8b5cf6", "shaded", { pivot: [0, 6, 1.2], rotation: [5, 0, 0], inflate: 0.01 }),
          cube(-1.4, 8.8, 0, 0.9, 5, 2.2, "#a855f7", "shaded", { pivot: [-1.2, 6, 0], rotation: [0, 0, 5], inflate: 0.01 }),
          cube(1.4, 8.8, 0, 0.9, 5, 2.2, "#a855f7", "shaded", { pivot: [1.2, 6, 0], rotation: [0, 0, -5], inflate: 0.01 }),
          // Glowing Soul Flame Core
          cube(0, 8.5, 0, 1.8, 4.5, 1.8, "#c084fc", "bordered", { inflate: -0.01 }),
          cube(0, 9.2, 0, 1, 3, 1, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-2.5, 11, 2.5, 0.8, 0.8, 0.8, "#d8b4fe", "solid"),
          cube(2.8, 12.2, -2, 0.8, 0.8, 0.8, "#c084fc", "solid"),
          cube(0, 13.8, 2.2, 0.7, 0.7, 0.7, "#f3e8ff", "solid"),
          cube(-2.2, 13, -1.8, 0.7, 0.7, 0.7, "#a855f7", "solid")
        ]
      }
    ]
  },

  // 3. Golden Star Flower
  {
    asset_name: "hoa_sao_vang",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#2e7d32", "solid"),
          cube(-1.8, 2.8, 0, 2.8, 0.8, 1.5, "#43a047", "shaded", { pivot: [-0.5, 2.8, 0], rotation: [0, 0, 18] }),
          cube(1.8, 4.2, 0, 2.8, 0.8, 1.5, "#43a047", "shaded", { pivot: [0.5, 4.2, 0], rotation: [0, 0, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Calyx
          cube(0, 6.2, 0, 3.6, 1, 3.6, "#f57f17", "bordered"),
          // 4 Cardinal Star Petals (tapered wedge effect)
          cube(0, 8, -3.8, 2.6, 2, 4.5, "#fbc02d", "shaded", { pivot: [0, 7, -1.5], rotation: [-18, 0, 0] }),
          cube(0, 8, 3.8, 2.6, 2, 4.5, "#fbc02d", "shaded", { pivot: [0, 7, 1.5], rotation: [18, 0, 0] }),
          cube(-3.8, 8, 0, 4.5, 2, 2.6, "#fbc02d", "shaded", { pivot: [-1.5, 7, 0], rotation: [0, 0, 18] }),
          cube(3.8, 8, 0, 4.5, 2, 2.6, "#fbc02d", "shaded", { pivot: [1.5, 7, 0], rotation: [0, 0, -18] }),
          // 4 Diagonal Star Points (rotated 45 deg)
          cube(-2.8, 7.8, -2.8, 2.2, 1.8, 3.5, "#ffeb3b", "shaded", { pivot: [-1.2, 7, -1.2], rotation: [-12, 45, 12] }),
          cube(2.8, 7.8, -2.8, 2.2, 1.8, 3.5, "#ffeb3b", "shaded", { pivot: [1.2, 7, -1.2], rotation: [-12, -45, -12] }),
          cube(-2.8, 7.8, 2.8, 2.2, 1.8, 3.5, "#ffeb3b", "shaded", { pivot: [-1.2, 7, 1.2], rotation: [12, -45, 12] }),
          cube(2.8, 7.8, 2.8, 2.2, 1.8, 3.5, "#ffeb3b", "shaded", { pivot: [1.2, 7, 1.2], rotation: [12, 45, -12] }),
          // Inner Golden Ring
          cube(0, 7.8, 0, 4.2, 1.8, 4.2, "#d4af37", "bordered", { inflate: 0.01 }),
          // Center Celestial Jewel (Violet/Indigo Star Gem)
          cube(0, 8.5, 0, 2.2, 2.2, 2.2, "#7c4dff", "solid", { inflate: 0.01 }),
          cube(0, 9.2, 0, 1.2, 1.2, 1.2, "#e040fb", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Floating golden star sparks
          cube(-3.5, 11, -2, 0.8, 0.8, 0.8, "#fff59d", "solid"),
          cube(3.8, 9.5, 2.5, 0.8, 0.8, 0.8, "#fff59d", "solid"),
          cube(2.5, 12, -3, 0.7, 0.7, 0.7, "#ffee58", "solid"),
          cube(-2, 12.8, 3.2, 0.7, 0.7, 0.7, "#fff9c4", "solid"),
          cube(0, 13.5, 0, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  },

  // 4. Sea Lantern Flower
  {
    asset_name: "hoa_den_bien",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Upward curvy stalk
          cube(-2, 3, 0, 1.5, 6, 1.5, "#00695c", "solid"),
          cube(-1.5, 2.5, -1.5, 1.2, 0.8, 2.5, "#00897b", "shaded", { pivot: [-1.5, 2.5, 0], rotation: [15, 0, 0] }),
          // Curved arch segment
          cube(-1.2, 7.5, 0.5, 1.5, 4, 1.5, "#00796b", "solid", { pivot: [-1.2, 6, 0.5], rotation: [-15, 0, 10] }),
          cube(0.2, 10.5, 1.5, 1.5, 3.5, 1.5, "#00897b", "solid", { pivot: [0.2, 9, 1.5], rotation: [-25, 0, 20] }),
          // Stem bending down towards lantern
          cube(1.8, 10, 1.8, 1.4, 2.5, 1.4, "#00796b", "solid", { pivot: [1.8, 11, 1.8], rotation: [20, 0, -10] }),
          // Side branch for small second bell
          cube(-3, 6.5, 1.2, 2.5, 1.2, 1.2, "#00897b", "shaded", { pivot: [-2, 6.5, 0], rotation: [15, -20, 0] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [2, 9, 2],
        cubes: [
          // Main Hanging Sea Bell Cap
          cube(2, 9.2, 2, 4.5, 1.4, 4.5, "#004d40", "bordered"),
          // Glowing Main Bell
          cube(2, 6.5, 2, 4, 4.2, 4, "#00e5ff", "shaded", { inflate: 0.01 }),
          cube(2, 6.5, 2, 3.2, 3.5, 3.2, "#18ffff", "shaded", { inflate: -0.01 }),
          cube(2, 6.2, 2, 2, 2.5, 2, "#e0f7fa", "solid"),
          // Bell lower lip trim
          cube(2, 4.5, 2, 3.6, 0.8, 3.6, "#80deea", "bordered"),
          // Small Secondary Drooping Sea Bell
          cube(-4, 6.2, 2, 2.8, 1, 2.8, "#004d40", "bordered"),
          cube(-4, 4.5, 2, 2.4, 2.5, 2.4, "#00e5ff", "shaded"),
          cube(-4, 4.2, 2, 1.4, 1.5, 1.4, "#e0f7fa", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          cube(3.5, 4.5, 3.5, 0.8, 0.8, 0.8, "#80deea", "solid"),
          cube(0.5, 5, 3.8, 0.8, 0.8, 0.8, "#18ffff", "solid"),
          cube(-4.5, 3.2, 2.5, 0.7, 0.7, 0.7, "#00e5ff", "solid"),
          cube(3.8, 8, 0.5, 0.7, 0.7, 0.7, "#e0f7fa", "solid")
        ]
      }
    ]
  },

  // 5. Bloodstone Flower
  {
    asset_name: "hoa_huyet_thach",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#1a0c0e", "solid"),
          // Sharp Obsidian Thorns
          cube(-1.2, 2.2, 0, 1.8, 0.6, 0.8, "#4a151b", "solid", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 30] }),
          cube(1.2, 3.5, 0.5, 1.8, 0.6, 0.8, "#4a151b", "solid", { pivot: [0.5, 3.5, 0.5], rotation: [0, 20, -30] }),
          cube(-0.5, 4.8, -1.2, 0.8, 0.6, 1.8, "#4a151b", "solid", { pivot: [-0.5, 4.8, -0.5], rotation: [-30, 0, 0] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Calyx
          cube(0, 6.2, 0, 3.8, 1, 3.8, "#2d1519", "bordered"),
          // Outer Gothic Crimson Petals
          cube(0, 8.5, -2.8, 3.2, 4.2, 1.2, "#880e4e", "shaded", { pivot: [0, 6.5, -2.5], rotation: [-16, 0, 0] }),
          cube(0, 8.5, 2.8, 3.2, 4.2, 1.2, "#880e4e", "shaded", { pivot: [0, 6.5, 2.5], rotation: [16, 0, 0] }),
          cube(-2.8, 8.5, 0, 1.2, 4.2, 3.2, "#880e4e", "shaded", { pivot: [-2.5, 6.5, 0], rotation: [0, 0, 16] }),
          cube(2.8, 8.5, 0, 1.2, 4.2, 3.2, "#880e4e", "shaded", { pivot: [2.5, 6.5, 0], rotation: [0, 0, -16] }),
          // Diagonal Blood Ruby Petals (45 deg)
          cube(-2, 8.2, -2, 2.6, 3.8, 1.2, "#b71c1c", "shaded", { pivot: [-1.5, 6.5, -1.5], rotation: [-10, 45, 10] }),
          cube(2, 8.2, -2, 2.6, 3.8, 1.2, "#b71c1c", "shaded", { pivot: [1.5, 6.5, -1.5], rotation: [-10, -45, -10] }),
          cube(-2, 8.2, 2, 2.6, 3.8, 1.2, "#b71c1c", "shaded", { pivot: [-1.5, 6.5, 1.5], rotation: [10, -45, 10] }),
          cube(2, 8.2, 2, 2.6, 3.8, 1.2, "#b71c1c", "shaded", { pivot: [1.5, 6.5, 1.5], rotation: [10, 45, -10] }),
          // Inner Vivid Scarlet Petals
          cube(0, 9, -1.6, 2.2, 4.5, 1, "#c62828", "shaded", { pivot: [0, 7, -1.5], rotation: [-8, 0, 0], inflate: 0.01 }),
          cube(0, 9, 1.6, 2.2, 4.5, 1, "#c62828", "shaded", { pivot: [0, 7, 1.5], rotation: [8, 0, 0], inflate: 0.01 }),
          cube(-1.6, 9, 0, 1, 4.5, 2.2, "#d32f2f", "shaded", { pivot: [-1.5, 7, 0], rotation: [0, 0, 8], inflate: 0.01 }),
          cube(1.6, 9, 0, 1, 4.5, 2.2, "#d32f2f", "shaded", { pivot: [1.5, 7, 0], rotation: [0, 0, -8], inflate: 0.01 }),
          // Glowing Blood Gem Core
          cube(0, 9.2, 0, 2, 4, 2, "#ff1744", "bordered", { inflate: -0.01 }),
          cube(0, 10, 0, 1.2, 2, 1.2, "#ff5252", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-3.2, 11, 2, 0.8, 0.8, 0.8, "#b71c1c", "solid"),
          cube(3.5, 11.5, -2, 0.8, 0.8, 0.8, "#ff1744", "solid"),
          cube(-1.8, 13, -2.5, 0.7, 0.7, 0.7, "#ff5252", "solid"),
          cube(2.2, 13.2, 2.2, 0.7, 0.7, 0.7, "#d32f2f", "solid")
        ]
      }
    ]
  },

  // 6. Fire Mushroom Flower
  {
    asset_name: "hoa_nam_lua",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 1.2, 0, 3.5, 2.4, 3.5, "#5d4037", "solid"),
          cube(0, 4.5, 0, 2.5, 5, 2.5, "#6d4c41", "solid"),
          cube(0, 7.2, 0, 3.2, 1.5, 3.2, "#8d6e63", "solid")
        ]
      },
      {
        name: "cap",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Glowing Under-cap Gills (Ember Core)
          cube(0, 8.2, 0, 7.2, 1.4, 7.2, "#ff6f00", "shaded"),
          cube(0, 8.5, 0, 5.5, 1.2, 5.5, "#ffeb3b", "solid", { inflate: 0.01 }),
          // Mushroom Cap Tier 1 (Rim)
          cube(0, 9.5, 0, 8.2, 2, 8.2, "#4e342e", "bordered"),
          // Mushroom Cap Tier 2 (Mid Dome)
          cube(0, 11, 0, 6.5, 2, 6.5, "#5d4037", "shaded"),
          // Mushroom Cap Tier 3 (Top Dome)
          cube(0, 12.2, 0, 4.2, 1.5, 4.2, "#795548", "shaded"),
          // Glowing Ember Spots on Cap with subtle angles
          cube(-2.5, 10.6, -2.5, 1.4, 0.5, 1.4, "#ffab00", "solid", { pivot: [-2.5, 10.6, -2.5], rotation: [-5, 12, 0] }),
          cube(2.5, 10.6, -2.2, 1.4, 0.5, 1.4, "#ffab00", "solid", { pivot: [2.5, 10.6, -2.2], rotation: [5, -12, 0] }),
          cube(-2.2, 10.6, 2.5, 1.4, 0.5, 1.4, "#ffab00", "solid", { pivot: [-2.2, 10.6, 2.5], rotation: [-12, -5, 0] }),
          cube(2.5, 10.6, 2.2, 1.4, 0.5, 1.4, "#ffab00", "solid", { pivot: [2.5, 10.6, 2.2], rotation: [12, 5, 0] }),
          cube(0, 12.8, 0, 1.5, 0.5, 1.5, "#ffd54f", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          // Glowing Floating Spores with rotational dynamics
          cube(-4.5, 8.5, 3, 0.8, 0.8, 0.8, "#ff9800", "solid", { pivot: [-4.5, 8.5, 3], rotation: [15, 20, 0] }),
          cube(4.5, 7.8, -3, 0.8, 0.8, 0.8, "#ffeb3b", "solid", { pivot: [4.5, 7.8, -3], rotation: [-15, -20, 10] }),
          cube(-3.5, 12.5, -3.5, 0.7, 0.7, 0.7, "#ffd54f", "solid", { pivot: [-3.5, 12.5, -3.5], rotation: [20, -15, -25] }),
          cube(3.5, 13, 3.2, 0.7, 0.7, 0.7, "#ffab00", "solid", { pivot: [3.5, 13, 3.2], rotation: [-25, 30, 15] }),
          cube(0, 14.5, 2.5, 0.7, 0.7, 0.7, "#ff9800", "solid", { pivot: [0, 14.5, 2.5], rotation: [10, 45, 0] })
        ]
      }
    ]
  },

  // 7. Lantern Flower
  {
    asset_name: "hoa_long_den",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "vine",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Vine climbing and arching over
          cube(-3, 3, -1, 1.5, 6, 1.5, "#1b5e20", "solid"),
          cube(-2.5, 7.5, -0.5, 1.5, 4, 1.5, "#2e7d32", "solid", { pivot: [-2.5, 6, -0.5], rotation: [0, 0, -15] }),
          cube(-1, 11, 0, 1.5, 3.5, 1.5, "#2e7d32", "solid", { pivot: [-1, 9.5, 0], rotation: [0, 0, -25] }),
          cube(1, 12.5, 0, 3, 1.5, 1.5, "#388e3c", "solid"),
          // Leaf accents on vine
          cube(-3.8, 5, -1, 1.5, 0.8, 2, "#4caf50", "shaded", { pivot: [-3, 5, -1], rotation: [0, 0, 20] }),
          cube(0.5, 13.5, -0.5, 2, 0.8, 2, "#4caf50", "shaded", { pivot: [0.5, 13, 0], rotation: [10, 0, 0] })
        ]
      },
      {
        name: "lantern",
        parent: "root",
        pivot: [1.5, 11, 0],
        cubes: [
          // Suspension hook
          cube(1.5, 11.2, 0, 1, 1.5, 1, "#263238", "solid"),
          // Lantern Roof
          cube(1.5, 10.2, 0, 5.5, 1.2, 5.5, "#263238", "bordered"),
          // 4 Metal Corner Posts
          cube(-0.8, 6.8, -2.3, 1, 5.5, 1, "#263238", "solid"),
          cube(3.8, 6.8, -2.3, 1, 5.5, 1, "#263238", "solid"),
          cube(-0.8, 6.8, 2.3, 1, 5.5, 1, "#263238", "solid"),
          cube(3.8, 6.8, 2.3, 1, 5.5, 1, "#263238", "solid"),
          // Lantern Base Rim
          cube(1.5, 3.8, 0, 5.5, 1, 5.5, "#263238", "bordered"),
          // Soul Lantern Glowing Core
          cube(1.5, 6.8, 0, 4.2, 5, 4.2, "#00b4d8", "shaded", { inflate: 0.01 }),
          cube(1.5, 6.8, 0, 2.8, 3.5, 2.8, "#80ffdb", "solid"),
          cube(1.5, 6.8, 0, 1.4, 2, 1.4, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [1.5, 7, 0],
        cubes: [
          cube(4.5, 5, 2.5, 0.8, 0.8, 0.8, "#80ffdb", "solid"),
          cube(-1.5, 4.5, -3, 0.8, 0.8, 0.8, "#00b4d8", "solid"),
          cube(4, 9.5, -2, 0.7, 0.7, 0.7, "#e0fbfc", "solid"),
          cube(-1.5, 9.8, 2.2, 0.7, 0.7, 0.7, "#80ffdb", "solid")
        ]
      }
    ]
  },

  // 8. Crystal Lotus
  {
    asset_name: "hoa_sen_pha_le",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "base",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Lilypad base resting on soil
          cube(0, 0.5, 0, 6.5, 1, 6.5, "#2e7d32", "solid"),
          cube(0, 1.4, 0, 4.5, 1, 4.5, "#388e3c", "bordered")
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 2, 0],
        cubes: [
          // Tier 1 Outer Wide Flared Petals (Cardinal)
          cube(0, 3.2, -4.2, 3.5, 1.8, 2.5, "#e91e63", "shaded", { pivot: [0, 2, -2.5], rotation: [-25, 0, 0] }),
          cube(0, 3.2, 4.2, 3.5, 1.8, 2.5, "#e91e63", "shaded", { pivot: [0, 2, 2.5], rotation: [25, 0, 0] }),
          cube(-4.2, 3.2, 0, 2.5, 1.8, 3.5, "#e91e63", "shaded", { pivot: [-2.5, 2, 0], rotation: [0, 0, 25] }),
          cube(4.2, 3.2, 0, 2.5, 1.8, 3.5, "#e91e63", "shaded", { pivot: [2.5, 2, 0], rotation: [0, 0, -25] }),
          // Tier 1 Outer Diagonal Petals (45 deg)
          cube(-3.2, 3, -3.2, 2.8, 1.6, 2.2, "#ec407a", "shaded", { pivot: [-2, 2, -2], rotation: [-18, 45, 18] }),
          cube(3.2, 3, -3.2, 2.8, 1.6, 2.2, "#ec407a", "shaded", { pivot: [2, 2, -2], rotation: [-18, -45, -18] }),
          cube(-3.2, 3, 3.2, 2.8, 1.6, 2.2, "#ec407a", "shaded", { pivot: [-2, 2, 2], rotation: [18, -45, 18] }),
          cube(3.2, 3, 3.2, 2.8, 1.6, 2.2, "#ec407a", "shaded", { pivot: [2, 2, 2], rotation: [18, 45, -18] }),
          // Tier 2 Mid Upright Petals
          cube(0, 5.5, -2.5, 3.2, 4, 1.4, "#f06292", "shaded", { pivot: [0, 3, -2], rotation: [-12, 0, 0] }),
          cube(0, 5.5, 2.5, 3.2, 4, 1.4, "#f06292", "shaded", { pivot: [0, 3, 2], rotation: [12, 0, 0] }),
          cube(-2.5, 5.5, 0, 1.4, 4, 3.2, "#f06292", "shaded", { pivot: [-2, 3, 0], rotation: [0, 0, 12] }),
          cube(2.5, 5.5, 0, 1.4, 4, 3.2, "#f06292", "shaded", { pivot: [2, 3, 0], rotation: [0, 0, -12] }),
          // Tier 3 Inner Crystal Crown Tips
          cube(0, 6.8, -1.4, 2.4, 4.5, 1, "#f8bbd0", "shaded", { pivot: [0, 4, -1], rotation: [-5, 0, 0], inflate: 0.01 }),
          cube(0, 6.8, 1.4, 2.4, 4.5, 1, "#f8bbd0", "shaded", { pivot: [0, 4, 1], rotation: [5, 0, 0], inflate: 0.01 }),
          cube(-1.4, 6.8, 0, 1, 4.5, 2.4, "#ff80ab", "shaded", { pivot: [-1, 4, 0], rotation: [0, 0, 5], inflate: 0.01 }),
          cube(1.4, 6.8, 0, 1, 4.5, 2.4, "#ff80ab", "shaded", { pivot: [1, 4, 0], rotation: [0, 0, -5], inflate: 0.01 }),
          // Glowing Stamen Core
          cube(0, 5.5, 0, 2.2, 3.5, 2.2, "#ffffff", "bordered"),
          cube(0, 6.5, 0, 1.2, 2.2, 1.2, "#fce4ec", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 7, 0],
        cubes: [
          cube(-3.5, 8.5, 2.5, 0.8, 0.8, 0.8, "#f8bbd0", "solid"),
          cube(3.5, 9, -2.5, 0.8, 0.8, 0.8, "#ff80ab", "solid"),
          cube(0, 11, 3.2, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(-2.5, 10.5, -3, 0.7, 0.7, 0.7, "#fce4ec", "solid")
        ]
      }
    ]
  },

  // 9. Dark Shadow Flower
  {
    asset_name: "hoa_hac_am",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#120817", "solid"),
          cube(-1.5, 2.5, 0, 2.5, 0.8, 1.5, "#240e30", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 20] }),
          cube(1.5, 3.8, 0, 2.5, 0.8, 1.5, "#240e30", "shaded", { pivot: [0.5, 3.8, 0], rotation: [0, 0, -20] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          cube(0, 6.2, 0, 3.8, 1, 3.8, "#180b24", "bordered"),
          // 4 Cardinal Spiky Obsidian Petals
          cube(0, 8.5, -3, 3, 4.5, 1.2, "#180b24", "shaded", { pivot: [0, 6.5, -2.5], rotation: [-18, 0, 0] }),
          cube(0, 8.5, 3, 3, 4.5, 1.2, "#180b24", "shaded", { pivot: [0, 6.5, 2.5], rotation: [18, 0, 0] }),
          cube(-3, 8.5, 0, 1.2, 4.5, 3, "#180b24", "shaded", { pivot: [-2.5, 6.5, 0], rotation: [0, 0, 18] }),
          cube(3, 8.5, 0, 1.2, 4.5, 3, "#180b24", "shaded", { pivot: [2.5, 6.5, 0], rotation: [0, 0, -18] }),
          // 4 Diagonal Shadow Petals (45 deg)
          cube(-2, 8.2, -2, 2.5, 4, 1.2, "#2d1340", "shaded", { pivot: [-1.5, 6.5, -1.5], rotation: [-12, 45, 12] }),
          cube(2, 8.2, -2, 2.5, 4, 1.2, "#2d1340", "shaded", { pivot: [1.5, 6.5, -1.5], rotation: [-12, -45, -12] }),
          cube(-2, 8.2, 2, 2.5, 4, 1.2, "#2d1340", "shaded", { pivot: [-1.5, 6.5, 1.5], rotation: [12, -45, 12] }),
          cube(2, 8.2, 2, 2.5, 4, 1.2, "#2d1340", "shaded", { pivot: [1.5, 6.5, 1.5], rotation: [12, 45, -12] }),
          // Inner Void Magic Petals
          cube(0, 9, -1.5, 2.2, 4.5, 1, "#3d145c", "shaded", { pivot: [0, 7, -1.2], rotation: [-6, 0, 0], inflate: 0.01 }),
          cube(0, 9, 1.5, 2.2, 4.5, 1, "#3d145c", "shaded", { pivot: [0, 7, 1.2], rotation: [6, 0, 0], inflate: 0.01 }),
          cube(-1.5, 9, 0, 1, 4.5, 2.2, "#7b1fa2", "shaded", { pivot: [-1.2, 7, 0], rotation: [0, 0, 6], inflate: 0.01 }),
          cube(1.5, 9, 0, 1, 4.5, 2.2, "#7b1fa2", "shaded", { pivot: [1.2, 7, 0], rotation: [0, 0, -6], inflate: 0.01 }),
          // Glowing Neon Void Core
          cube(0, 9.2, 0, 2, 4, 2, "#bf55ec", "bordered", { inflate: -0.01 }),
          cube(0, 10, 0, 1, 2.5, 1, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-3.2, 11, 2.5, 0.8, 0.8, 0.8, "#bf55ec", "solid"),
          cube(3.5, 10.5, -2, 0.8, 0.8, 0.8, "#d980fa", "solid"),
          cube(-1.8, 13, -2.8, 0.7, 0.7, 0.7, "#e056fd", "solid"),
          cube(2, 13.5, 2.2, 0.7, 0.7, 0.7, "#ba68c8", "solid")
        ]
      }
    ]
  },

  // 10. Sky Cloud Flower
  {
    asset_name: "hoa_may_troi",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#388e3c", "solid"),
          cube(-1.5, 2.5, 0, 2.5, 0.8, 1.5, "#66bb6a", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 18] }),
          cube(1.5, 4.2, 0, 2.5, 0.8, 1.5, "#66bb6a", "shaded", { pivot: [0.5, 4.2, 0], rotation: [0, 0, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Calyx cradle
          cube(0, 6.2, 0, 4.5, 1.2, 4.5, "#81c784", "bordered"),
          // Cloud Base Layer
          cube(0, 7.5, 0, 7.5, 2.2, 7.5, "#bbdefb", "shaded"),
          // Main Puffy Cloud Center
          cube(0, 9.5, 0, 6.5, 3, 6.5, "#e3f2fd", "shaded"),
          // Front Puffed Lobe
          cube(0, 9.2, -3.2, 4, 3, 2.5, "#bbdefb", "shaded"),
          // Back Puffed Lobe
          cube(0, 9.2, 3.2, 4, 3, 2.5, "#bbdefb", "shaded"),
          // Left Puffed Lobe
          cube(-3.2, 9.2, 0, 2.5, 3, 4, "#90caf9", "shaded"),
          // Right Puffed Lobe
          cube(3.2, 9.2, 0, 2.5, 3, 4, "#90caf9", "shaded"),
          // Top Fluffy Cumulus Crown
          cube(0, 11.5, 0, 4.8, 2.2, 4.8, "#ffffff", "shaded"),
          cube(-1, 12.8, -1, 2.5, 1.2, 2.5, "#ffffff", "solid"),
          cube(1, 12.8, 1, 2.2, 1, 2.2, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 10, 0],
        cubes: [
          cube(-4.5, 11, 2, 0.8, 0.8, 0.8, "#bbdefb", "solid"),
          cube(4.5, 10.5, -2, 0.8, 0.8, 0.8, "#e3f2fd", "solid"),
          cube(-2, 13.5, 3, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(2.5, 14, -2.5, 0.7, 0.7, 0.7, "#90caf9", "solid")
        ]
      }
    ]
  },

  // 11. Dream Flower
  {
    asset_name: "hoa_giac_mo",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#2e3d30", "solid"),
          cube(-1.2, 2.5, 0, 2, 0.8, 1.2, "#4a6b4e", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 18] })
        ]
      },
      {
        name: "dreamcatcher",
        parent: "root",
        pivot: [0, 9.5, 0],
        cubes: [
          // Dreamcatcher Octagonal Ring
          // Top & Bottom Horizontal bars
          cube(0, 13.5, 0, 5, 1, 1, "#6a1b9a", "bordered"),
          cube(0, 5.5, 0, 5, 1, 1, "#6a1b9a", "bordered"),
          // Left & Right Vertical bars
          cube(-4, 9.5, 0, 1, 5, 1, "#6a1b9a", "bordered"),
          cube(4, 9.5, 0, 1, 5, 1, "#6a1b9a", "bordered"),
          // 4 Diagonal Ring Corners
          cube(-3, 12.5, 0, 2, 1.2, 1, "#8e24aa", "shaded"),
          cube(3, 12.5, 0, 2, 1.2, 1, "#8e24aa", "shaded"),
          cube(-3, 6.5, 0, 2, 1.2, 1, "#8e24aa", "shaded"),
          cube(3, 6.5, 0, 2, 1.2, 1, "#8e24aa", "shaded"),
          // Center Star Web
          cube(0, 9.5, 0, 3, 3, 1.2, "#ab47bc", "shaded", { inflate: 0.01 }),
          cube(0, 9.5, 0, 1.8, 1.8, 1.4, "#e1bee7", "solid"),
          cube(0, 9.5, 0, 0.8, 0.8, 1.6, "#ffffff", "solid"),
          // Hanging Bead Strands
          // Center strand
          cube(0, 4.2, 0, 0.8, 1.4, 0.8, "#ce93d8", "solid"),
          cube(0, 2.5, 0, 0.8, 1.4, 0.8, "#ba68c8", "solid"),
          // Left strand
          cube(-2.5, 4.5, 0, 0.8, 1.2, 0.8, "#ce93d8", "solid"),
          cube(-2.5, 3, 0, 0.8, 1.2, 0.8, "#ab47bc", "solid"),
          // Right strand
          cube(2.5, 4.5, 0, 0.8, 1.2, 0.8, "#ce93d8", "solid"),
          cube(2.5, 3, 0, 0.8, 1.2, 0.8, "#ab47bc", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9.5, 0],
        cubes: [
          cube(-4.8, 11, 1, 0.7, 0.7, 0.7, "#e1bee7", "solid"),
          cube(4.8, 11.5, -1, 0.7, 0.7, 0.7, "#ce93d8", "solid"),
          cube(0, 15, 0.5, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(-3.5, 14, -1, 0.7, 0.7, 0.7, "#ab47bc", "solid")
        ]
      }
    ]
  },

  // 12. Angel Trumpet Flower
  {
    asset_name: "hoa_ken_thien_than",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.5, 0, 1.6, 5, 1.6, "#2e7d32", "solid"),
          cube(-1.5, 2.2, 0, 2.2, 0.8, 1.4, "#388e3c", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 20] }),
          cube(1.5, 3.2, 0, 2.2, 0.8, 1.4, "#388e3c", "shaded", { pivot: [0.5, 3.2, 0], rotation: [0, 0, -20] }),
          // Branching pedicels
          cube(-1.5, 5.8, -1, 1.2, 2.5, 1.2, "#388e3c", "solid", { pivot: [0, 5, 0], rotation: [-15, 0, 25] }),
          cube(1.5, 5.8, -1, 1.2, 2.5, 1.2, "#388e3c", "solid", { pivot: [0, 5, 0], rotation: [-15, 0, -25] }),
          cube(0, 6.2, 1.5, 1.2, 2.8, 1.2, "#388e3c", "solid", { pivot: [0, 5, 0], rotation: [25, 0, 0] })
        ]
      },
      {
        name: "trumpets",
        parent: "root",
        pivot: [0, 7, 0],
        cubes: [
          // Trumpet 1 (Center Main - facing front/up)
          cube(0, 7.5, -1.5, 2, 2.5, 2, "#fff9c4", "shaded", { pivot: [0, 6.5, -0.5], rotation: [-25, 0, 0] }),
          cube(0, 9.2, -2.5, 3.8, 2.2, 3.8, "#fff59d", "bordered", { pivot: [0, 7.5, -1.5], rotation: [-25, 0, 0] }),
          cube(0, 9.4, -2.5, 1.4, 1.5, 1.4, "#ffa000", "solid", { pivot: [0, 7.5, -1.5], rotation: [-25, 0, 0] }),

          // Trumpet 2 (Left - facing left/up)
          cube(-2.5, 7.8, -0.5, 1.8, 2.2, 1.8, "#fffde7", "shaded", { pivot: [-1.5, 6.5, 0], rotation: [-10, 0, 35] }),
          cube(-3.8, 9.2, -0.8, 3.4, 2, 3.4, "#ffe082", "bordered", { pivot: [-2.5, 7.8, -0.5], rotation: [-10, 0, 35] }),
          cube(-3.8, 9.3, -0.8, 1.2, 1.2, 1.2, "#ffa000", "solid", { pivot: [-2.5, 7.8, -0.5], rotation: [-10, 0, 35] }),

          // Trumpet 3 (Right - facing right/up)
          cube(2.5, 7.8, -0.5, 1.8, 2.2, 1.8, "#fffde7", "shaded", { pivot: [1.5, 6.5, 0], rotation: [-10, 0, -35] }),
          cube(3.8, 9.2, -0.8, 3.4, 2, 3.4, "#ffe082", "bordered", { pivot: [2.5, 7.8, -0.5], rotation: [-10, 0, -35] }),
          cube(3.8, 9.3, -0.8, 1.2, 1.2, 1.2, "#ffa000", "solid", { pivot: [2.5, 7.8, -0.5], rotation: [-10, 0, -35] }),

          // Trumpet 4 (Back Top)
          cube(0, 8.8, 2.2, 1.8, 2.2, 1.8, "#fff9c4", "shaded", { pivot: [0, 7.5, 1.5], rotation: [30, 0, 0] }),
          cube(0, 10.5, 3.2, 3.4, 2, 3.4, "#ffb74d", "bordered", { pivot: [0, 8.8, 2.2], rotation: [30, 0, 0] }),
          cube(0, 10.6, 3.2, 1.2, 1.2, 1.2, "#ffa000", "solid", { pivot: [0, 8.8, 2.2], rotation: [30, 0, 0] })
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-4.5, 11, -1.5, 0.8, 0.8, 0.8, "#ffe082", "solid"),
          cube(4.5, 11.5, -1.5, 0.8, 0.8, 0.8, "#fff59d", "solid"),
          cube(0, 12.8, 3.8, 0.7, 0.7, 0.7, "#ffb74d", "solid"),
          cube(0, 12.5, -3.5, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  },

  // 13. Nebula Flower
  {
    asset_name: "hoa_tinh_van",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.5, 6, 1.5, "#100e2b", "solid"),
          cube(-1.5, 2.5, 0, 2.5, 0.8, 1.5, "#1a1645", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 20] }),
          cube(1.5, 3.8, 0, 2.5, 0.8, 1.5, "#1a1645", "shaded", { pivot: [0.5, 3.8, 0], rotation: [0, 0, -20] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Calyx
          cube(0, 6.2, 0, 3.8, 1, 3.8, "#281b5c", "bordered"),
          // Center Nebula Core Body
          cube(0, 8.2, 0, 4.5, 3.5, 4.5, "#3d5afe", "shaded"),
          // Branching Cosmic Florets (Multi-colored Pixel Clusters)
          cube(-2.8, 9.2, -1.5, 2.8, 2.8, 2.8, "#2979ff", "shaded"),
          cube(2.8, 9.2, 1.5, 2.8, 2.8, 2.8, "#651fff", "shaded"),
          cube(1.5, 10.5, -2.5, 2.6, 2.6, 2.6, "#00e5ff", "shaded"),
          cube(-1.5, 10.5, 2.5, 2.6, 2.6, 2.6, "#d500f9", "shaded"),
          cube(0, 12, 0, 3.2, 2.5, 3.2, "#7c4dff", "shaded"),
          // Embedded White/Cyan Star Spark Gems
          cube(0, 9, -2.4, 1.2, 1.2, 1.2, "#ffffff", "solid"),
          cube(-2.5, 10.5, 0, 1.2, 1.2, 1.2, "#e0f7fa", "solid"),
          cube(2.5, 11, -1, 1.2, 1.2, 1.2, "#ffffff", "solid"),
          cube(0, 13.4, 0, 1.4, 1.4, 1.4, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 10, 0],
        cubes: [
          cube(-3.8, 12.5, 2, 0.8, 0.8, 0.8, "#00e5ff", "solid"),
          cube(4, 12, -2.5, 0.8, 0.8, 0.8, "#d500f9", "solid"),
          cube(-2, 14.5, -2, 0.7, 0.7, 0.7, "#2979ff", "solid"),
          cube(2.5, 14.2, 2.8, 0.7, 0.7, 0.7, "#80d8ff", "solid"),
          cube(0, 15, -1, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  },

  // 14. Lucky Flower / Four-Leaf Clover
  {
    asset_name: "hoa_may_man",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3.5, 0, 1.6, 7, 1.6, "#1b5e20", "solid"),
          cube(-1.2, 2.5, 0, 1.8, 0.8, 1.2, "#2e7d32", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 7, 0],
        cubes: [
          // Center Clover Node
          cube(0, 7.2, 0, 2.8, 1.6, 2.8, "#2e7d32", "bordered"),
          // Leaf 1: South (Front) Heart Leaflet
          cube(0, 7.8, -3.2, 3.2, 1.2, 3.5, "#4caf50", "shaded"),
          cube(-1.5, 8.2, -4.5, 2.2, 1, 2.2, "#76ff03", "shaded"),
          cube(1.5, 8.2, -4.5, 2.2, 1, 2.2, "#76ff03", "shaded"),
          // Leaf 2: North (Back) Heart Leaflet
          cube(0, 7.8, 3.2, 3.2, 1.2, 3.5, "#4caf50", "shaded"),
          cube(-1.5, 8.2, 4.5, 2.2, 1, 2.2, "#76ff03", "shaded"),
          cube(1.5, 8.2, 4.5, 2.2, 1, 2.2, "#76ff03", "shaded"),
          // Leaf 3: West (Left) Heart Leaflet
          cube(-3.2, 7.8, 0, 3.5, 1.2, 3.2, "#4caf50", "shaded"),
          cube(-4.5, 8.2, -1.5, 2.2, 1, 2.2, "#64dd17", "shaded"),
          cube(-4.5, 8.2, 1.5, 2.2, 1, 2.2, "#64dd17", "shaded"),
          // Leaf 4: East (Right) Heart Leaflet
          cube(3.2, 7.8, 0, 3.5, 1.2, 3.2, "#4caf50", "shaded"),
          cube(4.5, 8.2, -1.5, 2.2, 1, 2.2, "#64dd17", "shaded"),
          cube(4.5, 8.2, 1.5, 2.2, 1, 2.2, "#64dd17", "shaded"),
          // Center Bright Luck Star Core
          cube(0, 8.5, 0, 1.5, 1.2, 1.5, "#b2ff59", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          cube(-4.2, 10.5, -3.2, 0.8, 0.8, 0.8, "#76ff03", "solid"),
          cube(4.2, 10.5, 3.2, 0.8, 0.8, 0.8, "#b2ff59", "solid"),
          cube(3.5, 11.5, -3.5, 0.7, 0.7, 0.7, "#64dd17", "solid"),
          cube(-3.5, 11.5, 3.5, 0.7, 0.7, 0.7, "#b2ff59", "solid")
        ]
      }
    ]
  },

  // 15. Heart Flower
  {
    asset_name: "hoa_trai_tim",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.75, 0, 1.5, 5.5, 1.5, "#1b5e20", "solid"),
          cube(-1.5, 2.2, 0, 2.4, 0.8, 1.4, "#2e7d32", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 18] }),
          cube(1.5, 3.5, 0, 2.4, 0.8, 1.4, "#2e7d32", "shaded", { pivot: [0.5, 3.5, 0], rotation: [0, 0, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 5.5, 0],
        cubes: [
          // Calyx
          cube(0, 5.8, 0, 3.2, 1, 3.2, "#c2185b", "bordered"),
          // 3D Pixel Heart Sculpt:
          // Layer 1: Pointed Bottom V-Tip
          cube(0, 6.8, 0, 2.5, 1.6, 2.8, "#e91e63", "shaded"),
          // Layer 2: Widening Mid-Body
          cube(0, 8.2, 0, 5.5, 1.8, 3.4, "#e91e63", "shaded"),
          // Layer 3: Widest Upper Heart Shoulders
          cube(0, 9.8, 0, 7.2, 2, 3.6, "#f06292", "shaded"),
          // Layer 4: Left Heart Curved Lobe
          cube(-1.8, 11.4, 0, 3.4, 1.8, 3.4, "#ff4081", "shaded"),
          // Layer 4: Right Heart Curved Lobe
          cube(1.8, 11.4, 0, 3.4, 1.8, 3.4, "#ff4081", "shaded"),
          // Top Lobe Caps
          cube(-1.8, 12.5, 0, 2.2, 0.8, 2.5, "#ff80ab", "shaded"),
          cube(1.8, 12.5, 0, 2.2, 0.8, 2.5, "#ff80ab", "shaded"),
          // Cute Shiny Glint Highlight on upper left lobe
          cube(-2.2, 11.5, -1.8, 1.2, 1.2, 0.5, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          // Tiny floating heart particles around
          cube(-4.8, 8.5, 1.8, 0.8, 0.8, 0.8, "#ff4081", "solid"),
          cube(4.8, 9.2, -1.8, 0.8, 0.8, 0.8, "#ff80ab", "solid"),
          cube(-4.5, 12.5, -2, 0.7, 0.7, 0.7, "#f06292", "solid"),
          cube(4.5, 13, 2, 0.7, 0.7, 0.7, "#ff4081", "solid"),
          cube(0, 14, 0, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  },

  // 16. HOA DUNG NHAM (Lava Flower)
  {
    asset_name: "hoa_dung_nham",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 2, 6, 2, "#211510", "solid"),
          // Molten Magma Vein on stem
          cube(-0.2, 3.2, -1.1, 1.2, 3.5, 0.6, "#bf360c", "solid"),
          cube(1.2, 2.5, 0, 2, 0.8, 1.2, "#3e2723", "shaded", { pivot: [0.5, 2.5, 0], rotation: [0, 0, -20] }),
          cube(-1.2, 4, 0, 2, 0.8, 1.2, "#3e2723", "shaded", { pivot: [-0.5, 4, 0], rotation: [0, 0, 20] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Basalt Calyx
          cube(0, 6.2, 0, 4.5, 1.2, 4.5, "#3e2723", "bordered"),
          // Outer Magma Petals (Dark Crimson / Molten)
          cube(0, 8.5, -3.2, 3.4, 4.2, 1.2, "#d84315", "shaded", { pivot: [0, 6.5, -2.5], rotation: [-18, 0, 0] }),
          cube(0, 8.5, 3.2, 3.4, 4.2, 1.2, "#d84315", "shaded", { pivot: [0, 6.5, 2.5], rotation: [18, 0, 0] }),
          cube(-3.2, 8.5, 0, 1.2, 4.2, 3.4, "#d84315", "shaded", { pivot: [-2.5, 6.5, 0], rotation: [0, 0, 18] }),
          cube(3.2, 8.5, 0, 1.2, 4.2, 3.4, "#d84315", "shaded", { pivot: [2.5, 6.5, 0], rotation: [0, 0, -18] }),
          // Diagonal Blazing Orange Petals (45 deg)
          cube(-2.2, 8.2, -2.2, 2.6, 3.8, 1.2, "#ff5722", "shaded", { pivot: [-1.5, 6.5, -1.5], rotation: [-12, 45, 12] }),
          cube(2.2, 8.2, -2.2, 2.6, 3.8, 1.2, "#ff5722", "shaded", { pivot: [1.5, 6.5, -1.5], rotation: [-12, -45, -12] }),
          cube(-2.2, 8.2, 2.2, 2.6, 3.8, 1.2, "#ff5722", "shaded", { pivot: [-1.5, 6.5, 1.5], rotation: [12, -45, 12] }),
          cube(2.2, 8.2, 2.2, 2.6, 3.8, 1.2, "#ff5722", "shaded", { pivot: [1.5, 6.5, 1.5], rotation: [12, 45, -12] }),
          // Inner Blazing Yellow Flame Petals
          cube(0, 9, -1.6, 2.4, 4.5, 1, "#ff9800", "shaded", { pivot: [0, 7, -1.2], rotation: [-6, 0, 0], inflate: 0.01 }),
          cube(0, 9, 1.6, 2.4, 4.5, 1, "#ff9800", "shaded", { pivot: [0, 7, 1.2], rotation: [6, 0, 0], inflate: 0.01 }),
          cube(-1.6, 9, 0, 1, 4.5, 2.4, "#ff9800", "shaded", { pivot: [-1.2, 7, 0], rotation: [0, 0, 6], inflate: 0.01 }),
          cube(1.6, 9, 0, 1, 4.5, 2.4, "#ff9800", "shaded", { pivot: [1.2, 7, 0], rotation: [0, 0, -6], inflate: 0.01 }),
          // Intense Molten Gold Core
          cube(0, 9.2, 0, 2.4, 4.2, 2.4, "#ffeb3b", "bordered", { inflate: -0.01 }),
          cube(0, 10.2, 0, 1.4, 2.5, 1.4, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-3.8, 11.5, 2.5, 0.8, 0.8, 0.8, "#ff9800", "solid"),
          cube(3.8, 12, -2.5, 0.8, 0.8, 0.8, "#ff5722", "solid"),
          cube(-2, 13.8, -2.5, 0.7, 0.7, 0.7, "#ffeb3b", "solid"),
          cube(2.2, 14, 2.2, 0.7, 0.7, 0.7, "#ffd54f", "solid")
        ]
      }
    ]
  },

  // 17. Vortex Cyclone Flower
  {
    asset_name: "hoa_loc_xoay",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.5, 0, 1.6, 5, 1.6, "#004d40", "solid"),
          cube(-1.2, 2.2, 0, 2, 0.8, 1.2, "#006064", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 20] }),
          cube(1.2, 3.5, 0, 2, 0.8, 1.2, "#006064", "shaded", { pivot: [0.5, 3.5, 0], rotation: [0, 0, -20] })
        ]
      },
      {
        name: "spiral_vortex",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          // Calyx
          cube(0, 5.5, 0, 3.5, 1, 3.5, "#00838f", "bordered"),
          // Logarithmic Spiral Swirl Arms (Stepped in dynamic spiral arc)
          // Outer Spiral Tail
          cube(-3.5, 6.8, 0, 1.8, 2, 3.5, "#00bcd4", "shaded"),
          cube(-2.5, 8.5, -3, 3.5, 2, 1.8, "#00e5ff", "shaded"),
          cube(2, 9.8, -2.5, 1.8, 2.2, 3.5, "#18ffff", "shaded"),
          cube(2.8, 11, 1.5, 2.5, 2.2, 2.5, "#18ffff", "shaded"),
          // Top Swirl Arc folding inward
          cube(0.5, 12.2, 3, 3.5, 1.8, 1.8, "#80deea", "shaded"),
          cube(-2.5, 11.8, 1.8, 2, 2, 3, "#00e5ff", "shaded"),
          // Inner Spiral Eye
          cube(-1, 10.5, -0.8, 2.8, 2.2, 2.8, "#00bcd4", "shaded"),
          cube(0, 10.5, 0, 1.8, 2.5, 1.8, "#e0f7fa", "solid"),
          cube(0, 10.8, 0, 1, 1.8, 1, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9.5, 0],
        cubes: [
          cube(-4.5, 8, -2, 0.8, 0.8, 0.8, "#00e5ff", "solid"),
          cube(4.5, 12, -2, 0.8, 0.8, 0.8, "#18ffff", "solid"),
          cube(-3, 13.5, 2.5, 0.7, 0.7, 0.7, "#80deea", "solid"),
          cube(3.5, 13.2, 2.8, 0.7, 0.7, 0.7, "#00bcd4", "solid"),
          cube(0, 14.5, 0, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  },

  // 18. Bird of Paradise Flower
  {
    asset_name: "hoa_thien_dieu",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 3, 0, 1.6, 6, 1.6, "#33691e", "solid"),
          cube(-1.8, 2.5, 0, 2.8, 0.8, 1.4, "#558b2f", "shaded", { pivot: [-0.5, 2.5, 0], rotation: [0, 0, 18] }),
          cube(1.8, 4, 0, 2.8, 0.8, 1.4, "#558b2f", "shaded", { pivot: [0.5, 4, 0], rotation: [0, 0, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Golden Calyx & Beak
          cube(0, 6.2, 0, 3.8, 1.2, 3.8, "#fbc02d", "bordered"),
          cube(0, 6.8, -2.8, 1.8, 1.6, 3.2, "#ffa000", "shaded", { pivot: [0, 6.5, -1], rotation: [-15, 0, 0] }),
          // Majestic Flared Angel Wing Petals (Ivory & Pure White)
          // Center Wing Petal (Tall upright)
          cube(0, 10.5, 0, 1.6, 6.5, 2.8, "#ffffff", "shaded", { pivot: [0, 7, 0], rotation: [10, 0, 0] }),
          // Left Wing Petal (Spreading left/up)
          cube(-2.6, 9.8, -0.5, 2.8, 5.5, 1.8, "#fffde7", "shaded", { pivot: [-1, 7, 0], rotation: [-10, 0, 22] }),
          // Right Wing Petal (Spreading right/up)
          cube(2.6, 9.8, -0.5, 2.8, 5.5, 1.8, "#fffde7", "shaded", { pivot: [1, 7, 0], rotation: [-10, 0, -22] }),
          // Side Crest Petals
          cube(-3.8, 8.5, 0.5, 3.2, 2.2, 1.5, "#fff9c4", "shaded", { pivot: [-2, 8, 0], rotation: [0, 0, 35] }),
          cube(3.8, 8.5, 0.5, 3.2, 2.2, 1.5, "#fff9c4", "shaded", { pivot: [2, 8, 0], rotation: [0, 0, -35] }),
          // Central Golden Stamen Crest
          cube(0, 8.5, -0.8, 1.5, 3.5, 1.5, "#ffd54f", "solid"),
          // Dangling Golden Tassel Chains
          cube(-2.5, 4.5, 0, 0.8, 1.8, 0.8, "#ffd54f", "solid"),
          cube(-2.5, 2.5, 0, 0.8, 1.5, 0.8, "#ffca28", "solid"),
          cube(2.5, 4.5, 0, 0.8, 1.8, 0.8, "#ffd54f", "solid"),
          cube(2.5, 2.5, 0, 0.8, 1.5, 0.8, "#ffca28", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-4.5, 11, -1.5, 0.8, 0.8, 0.8, "#fff59d", "solid"),
          cube(4.5, 11.5, -1.5, 0.8, 0.8, 0.8, "#ffd54f", "solid"),
          cube(0, 14.5, 1, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(-3, 13.5, 2, 0.7, 0.7, 0.7, "#fffde7", "solid")
        ]
      }
    ]
  },

  // 19. Moonlight Flower
  {
    asset_name: "hoa_nguyet_quang",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.75, 0, 1.5, 5.5, 1.5, "#0a1128", "solid"),
          cube(-1.5, 2.2, 0, 2.4, 0.8, 1.4, "#1c2541", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 18] }),
          cube(1.5, 3.5, 0, 2.4, 0.8, 1.4, "#1c2541", "shaded", { pivot: [0.5, 3.5, 0], rotation: [0, 0, -18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 5.5, 0],
        cubes: [
          // Calyx
          cube(0, 5.8, 0, 4.2, 1, 4.2, "#1a237e", "bordered"),
          // Outer Midnight Blue Petals
          cube(0, 8, -3.2, 3.5, 3.8, 1.2, "#1a237e", "shaded", { pivot: [0, 6, -2.5], rotation: [-18, 0, 0] }),
          cube(0, 8, 3.2, 3.5, 3.8, 1.2, "#1a237e", "shaded", { pivot: [0, 6, 2.5], rotation: [18, 0, 0] }),
          cube(-3.2, 8, 0, 1.2, 3.8, 3.5, "#1a237e", "shaded", { pivot: [-2.5, 6, 0], rotation: [0, 0, 18] }),
          cube(3.2, 8, 0, 1.2, 3.8, 3.5, "#1a237e", "shaded", { pivot: [2.5, 6, 0], rotation: [0, 0, -18] }),
          // Diagonal Royal Sapphire Petals (45 deg)
          cube(-2.2, 7.8, -2.2, 2.8, 3.5, 1.2, "#283593", "shaded", { pivot: [-1.5, 6, -1.5], rotation: [-12, 45, 12] }),
          cube(2.2, 7.8, -2.2, 2.8, 3.5, 1.2, "#283593", "shaded", { pivot: [1.5, 6, -1.5], rotation: [-12, -45, -12] }),
          cube(-2.2, 7.8, 2.2, 2.8, 3.5, 1.2, "#283593", "shaded", { pivot: [-1.5, 6, 1.5], rotation: [12, -45, 12] }),
          cube(2.2, 7.8, 2.2, 2.8, 3.5, 1.2, "#283593", "shaded", { pivot: [1.5, 6, 1.5], rotation: [12, 45, -12] }),
          // Inner Deep Violet Petals
          cube(0, 8.5, -1.6, 2.4, 4.2, 1, "#3f51b5", "shaded", { pivot: [0, 6.5, -1.2], rotation: [-6, 0, 0], inflate: 0.01 }),
          cube(0, 8.5, 1.6, 2.4, 4.2, 1, "#3f51b5", "shaded", { pivot: [0, 6.5, 1.2], rotation: [6, 0, 0], inflate: 0.01 }),
          cube(-1.6, 8.5, 0, 1, 4.2, 2.4, "#5c6bc0", "shaded", { pivot: [-1.2, 6.5, 0], rotation: [0, 0, 6], inflate: 0.01 }),
          cube(1.6, 8.5, 0, 1, 4.2, 2.4, "#5c6bc0", "shaded", { pivot: [1.2, 6.5, 0], rotation: [0, 0, -6], inflate: 0.01 }),
          // Brilliant Glowing Full Moon Core (Golden Lunar Stamen)
          cube(0, 8.8, 0, 2.4, 3, 2.4, "#fffde7", "bordered", { inflate: -0.01 }),
          cube(0, 9.5, 0, 1.4, 1.8, 1.4, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 9, 0],
        cubes: [
          cube(-3.8, 11, 2.5, 0.8, 0.8, 0.8, "#5c6bc0", "solid"),
          cube(3.8, 11.5, -2.5, 0.8, 0.8, 0.8, "#fffde7", "solid"),
          cube(-2, 13.5, -2.8, 0.7, 0.7, 0.7, "#ffffff", "solid"),
          cube(2.2, 13.2, 2.2, 0.7, 0.7, 0.7, "#e8eaf6", "solid")
        ]
      }
    ]
  },

  // 20. Rainbow Flower
  {
    asset_name: "hoa_cau_vong",
    mode: "block",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    bones: [
      { name: "root", pivot: [0, 0, 0] },
      {
        name: "stem",
        parent: "root",
        pivot: [0, 0, 0],
        cubes: [
          cube(0, 2.5, 0, 1.5, 5, 1.5, "#0097a7", "solid"),
          cube(-1.2, 2.2, 0, 2, 0.8, 1.2, "#00bcd4", "shaded", { pivot: [-0.5, 2.2, 0], rotation: [0, 0, 18] })
        ]
      },
      {
        name: "bloom",
        parent: "root",
        pivot: [0, 5, 0],
        cubes: [
          // Calyx
          cube(0, 5.2, 0, 3.8, 1, 3.8, "#00838f", "bordered"),
          // Tier 1: Red Petals (South) & Dark Pink (North)
          cube(0, 6.5, -2.5, 3.2, 2.2, 1.4, "#ff1744", "shaded", { pivot: [0, 5.5, -2], rotation: [-15, 0, 0] }),
          cube(0, 6.5, 2.5, 3.2, 2.2, 1.4, "#e91e63", "shaded", { pivot: [0, 5.5, 2], rotation: [15, 0, 0] }),
          // Tier 2: Orange Petals (West) & Deep Orange (East)
          cube(-2.5, 7.5, 0, 1.4, 2.2, 3.2, "#ff9100", "shaded", { pivot: [-2, 6.5, 0], rotation: [0, 0, 15] }),
          cube(2.5, 7.5, 0, 1.4, 2.2, 3.2, "#ff6d00", "shaded", { pivot: [2, 6.5, 0], rotation: [0, 0, -15] }),
          // Tier 3: Yellow Petals (NW & NE diagonals)
          cube(-2, 8.5, -2, 2.4, 2.2, 1.2, "#ffea00", "shaded", { pivot: [-1.5, 7.5, -1.5], rotation: [-10, 45, 10] }),
          cube(2, 8.5, -2, 2.4, 2.2, 1.2, "#ffd600", "shaded", { pivot: [1.5, 7.5, -1.5], rotation: [-10, -45, -10] }),
          // Tier 4: Green Emerald Petals (SW & SE diagonals)
          cube(-2, 9.2, 2, 2.4, 2.2, 1.2, "#00e676", "shaded", { pivot: [-1.5, 8, 1.5], rotation: [10, -45, 10] }),
          cube(2, 9.2, 2, 2.4, 2.2, 1.2, "#76ff03", "shaded", { pivot: [1.5, 8, 1.5], rotation: [10, 45, -10] }),
          // Tier 5: Cyan & Blue Upper Petals
          cube(0, 10.2, -1.6, 2.6, 2.4, 1.2, "#00e5ff", "shaded"),
          cube(0, 10.2, 1.6, 2.6, 2.4, 1.2, "#2979ff", "shaded"),
          // Tier 6: Violet Crown Top Floret
          cube(0, 11.8, 0, 2.8, 2.5, 2.8, "#651fff", "shaded"),
          cube(0, 12.8, 0, 1.8, 1.5, 1.8, "#d500f9", "solid"),
          // Radiant White Prismatic Core Gem
          cube(0, 9.2, 0, 1.6, 2, 1.6, "#ffffff", "solid")
        ]
      },
      {
        name: "particles",
        parent: "root",
        pivot: [0, 10, 0],
        cubes: [
          cube(-3.5, 11.5, 2.2, 0.8, 0.8, 0.8, "#ff1744", "solid"),
          cube(3.5, 11.5, -2.2, 0.8, 0.8, 0.8, "#00e5ff", "solid"),
          cube(-2, 13.8, -2.5, 0.7, 0.7, 0.7, "#ffea00", "solid"),
          cube(2.2, 14, 2.5, 0.7, 0.7, 0.7, "#d500f9", "solid"),
          cube(0, 15, 0, 0.7, 0.7, 0.7, "#ffffff", "solid")
        ]
      }
    ]
  }
];

async function main() {
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`=== BT U TO 20 M HNH HOA FANTASY MINECRAFT BEDROCK ===`);
  const items = [];

  for (let i = 0; i < flowers.length; i++) {
    const f = flowers[i];
    f.format_version = "1.19.0";
    console.log(`[${i + 1}/${flowers.length}] ang to ${f.asset_name}...`);
    const res = buildMinecraftAsset(f, { outputDir });
    console.log(`  -> Thnh cng: ${res.assetName} | Cubes: ${res.cubeCount} | Bones: ${res.boneCount} | Texture: ${res.textureWidth}x${res.textureHeight}`);
    items.push({ assetName: res.assetName, mode: res.mode });
  }

  console.log(`\n===  TO XONG 20 M HNH! TIN HNH NG GI ADDON ===`);
  const addonName = "fantasy_flowers_pack";
  const addonPath = packageAddon({
    addonName,
    items,
    outputDir
  });
  console.log(`ng gi Addon thnh cng: ${addonPath}`);

  // ng b ha sang th mc plugin nu tn ti
  const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';
  if (fs.existsSync(path.dirname(pluginOutputDir))) {
    if (!fs.existsSync(pluginOutputDir)) {
      fs.mkdirSync(pluginOutputDir, { recursive: true });
    }
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
    console.log(` ng b ton b file sang plugin output directory.`);
  }

  console.log(`\nHon thnh 100%!`);
}

main().catch(err => {
  console.error("Li khi to m hnh:", err);
  process.exit(1);
});

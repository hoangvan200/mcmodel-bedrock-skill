const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// Standard NPC interaction / trade component placeholder
const npcComponents = {
  "minecraft:behavior.look_at_player": {
    "priority": 7,
    "look_distance": 6,
    "probability": 0.02
  },
  "minecraft:movement": {
    "value": 0.2
  }
};

const petComponents = {
  "minecraft:movement": {
    "value": 0.25
  }
};

// 10 Animals & NPCs
const models = [
  // 1. Chó cỏ ta (vietnamese_dog)
  {
    asset_name: "vietnamese_dog",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.5, height: 1.2, offset: [0, 0.6, 0] },
    components: petComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Lean muscular canine torso (golden fawn coat / lông vàng cỏ)
          { origin: [-2.5, 4, -5], size: [5, 5.5, 10], material: { color: "#D78B45", style: "shaded" } },
          // Chest brisket
          { origin: [-2, 4.5, 2], size: [4, 5, 3], material: { color: "#FFE0B2", style: "shaded" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 9, 4],
        cubes: [
          // Head skull
          { origin: [-2, 8, 3], size: [4, 4, 4], material: { color: "#D78B45", style: "shaded" } },
          // Snout / muzzle (mõm chó)
          { origin: [-1.2, 8, 7], size: [2.4, 2.2, 3], material: { color: "#D78B45", style: "solid" } },
          // Black nose button (mũi đen)
          { origin: [-0.6, 9.4, 9.8], size: [1.2, 0.8, 0.4], material: { color: "#212121", style: "solid" } },
          // 3D protruding dark eyes
          { origin: [-2.1, 10, 5], size: [0.4, 1.2, 1.2], material: { color: "#3E2723", style: "solid" } },
          { origin: [1.7, 10, 5], size: [0.4, 1.2, 1.2], material: { color: "#3E2723", style: "solid" } },
          // Pricked erect ears (búp tai vểnh hình tam giác)
          { origin: [-2.2, 12, 3.5], size: [1.2, 2.5, 1.5], pivot: [-1.6, 12, 4], rotation: [0, 0, -15], material: { color: "#C67A32", style: "solid" } },
          { origin: [1, 12, 3.5], size: [1.2, 2.5, 1.5], pivot: [1.6, 12, 4], rotation: [0, 0, 15], material: { color: "#C67A32", style: "solid" } }
        ]
      },
      {
        name: "leg_front_left",
        parent: "body",
        pivot: [1.8, 5, 3],
        cubes: [
          { origin: [1.2, 0, 2], size: [1.5, 5, 1.8], material: { color: "#D78B45", style: "solid" } }
        ]
      },
      {
        name: "leg_front_right",
        parent: "body",
        pivot: [-1.8, 5, 3],
        cubes: [
          { origin: [-2.7, 0, 2], size: [1.5, 5, 1.8], material: { color: "#D78B45", style: "solid" } }
        ]
      },
      {
        name: "leg_back_left",
        parent: "body",
        pivot: [1.8, 5, -4],
        cubes: [
          { origin: [1.2, 0, -5], size: [1.5, 5, 2], material: { color: "#D78B45", style: "solid" } }
        ]
      },
      {
        name: "leg_back_right",
        parent: "body",
        pivot: [-1.8, 5, -4],
        cubes: [
          { origin: [-2.7, 0, -5], size: [1.5, 5, 2], material: { color: "#D78B45", style: "solid" } }
        ]
      },
      {
        name: "tail",
        parent: "body",
        pivot: [0, 8.5, -5],
        cubes: [
          // Curved sickle tail (đuôi cong hình lưỡi liềm)
          { origin: [-0.6, 8.5, -8.5], size: [1.2, 4.5, 1.5], pivot: [0, 8.5, -5], rotation: [30, 0, 0], material: { color: "#D78B45", style: "shaded" } }
        ]
      }
    ]
  },

  // 2. Mèo mướp (tabby_cat)
  {
    asset_name: "tabby_cat",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.2, height: 1, offset: [0, 0.5, 0] },
    components: petComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 5, 0],
        cubes: [
          // Striped brown-grey tabby cat torso
          { origin: [-2, 3, -4], size: [4, 4, 8], material: { color: "#8D6E63", style: "shaded" } },
          // Tabby coat tiger stripes (vằn mướp đen)
          { origin: [-2.1, 4, -2], size: [4.2, 2.5, 1.5], material: { color: "#3E2723", style: "solid" } },
          { origin: [-2.1, 4, 1], size: [4.2, 2.5, 1.5], material: { color: "#3E2723", style: "solid" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 6, 3.5],
        cubes: [
          // Round cat head
          { origin: [-1.8, 5, 3], size: [3.6, 3.2, 3], material: { color: "#8D6E63", style: "shaded" } },
          // Muzzle & whiskers
          { origin: [-1, 5, 5.8], size: [2, 1.4, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // Pink nose button
          { origin: [-0.4, 6, 6.4], size: [0.8, 0.5, 0.3], material: { color: "#FFAB91", style: "solid" } },
          // Glowing emerald green eyes (mắt mèo xanh)
          { origin: [-1.8, 6.4, 4.5], size: [0.3, 0.8, 0.8], material: { color: "#66BB6A", style: "solid" } },
          { origin: [1.5, 6.4, 4.5], size: [0.3, 0.8, 0.8], material: { color: "#66BB6A", style: "solid" } },
          // Triangular pointed ears
          { origin: [-1.8, 8.2, 3.5], size: [1, 1.5, 1], material: { color: "#5D4037", style: "solid" } },
          { origin: [0.8, 8.2, 3.5], size: [1, 1.5, 1], material: { color: "#5D4037", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 3, 0],
        cubes: [
          { origin: [1, 0, 2], size: [1, 3.5, 1.2], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [-2, 0, 2], size: [1, 3.5, 1.2], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [1, 0, -3.5], size: [1, 3.5, 1.2], material: { color: "#8D6E63", style: "solid" } },
          { origin: [-2, 0, -3.5], size: [1, 3.5, 1.2], material: { color: "#8D6E63", style: "solid" } }
        ]
      },
      {
        name: "tail",
        parent: "body",
        pivot: [0, 6, -4],
        cubes: [
          // Long curving cat tail
          { origin: [-0.5, 6, -9], size: [1, 1, 5], pivot: [0, 6, -4], rotation: [25, 0, 0], material: { color: "#5D4037", style: "shaded" } },
          { origin: [-0.5, 9, -11], size: [1, 3, 1], pivot: [0, 8, -9], rotation: [-15, 0, 0], material: { color: "#3E2723", style: "solid" } }
        ]
      }
    ]
  },

  // 3. Chuột cống (sewer_rat)
  {
    asset_name: "sewer_rat",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1, height: 0.6, offset: [0, 0.3, 0] },
    components: petComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 2.5, 0],
        cubes: [
          // Hunched dark grey/brown rat body
          { origin: [-1.8, 1, -3], size: [3.6, 3, 6], material: { color: "#3E2723", style: "shaded" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 2.5, 2.5],
        cubes: [
          // Head skull
          { origin: [-1.2, 1.5, 2.5], size: [2.4, 2, 2.5], material: { color: "#4E342E", style: "solid" } },
          // Pointed snout
          { origin: [-0.7, 1.5, 4.8], size: [1.4, 1.2, 1.8], material: { color: "#5D4037", style: "solid" } },
          // Pink nose
          { origin: [-0.3, 2, 6.4], size: [0.6, 0.5, 0.3], material: { color: "#FFAB91", style: "solid" } },
          // Beady black eyes
          { origin: [-1.3, 2.4, 3.5], size: [0.2, 0.6, 0.6], material: { color: "#111111", style: "solid" } },
          { origin: [1.1, 2.4, 3.5], size: [0.2, 0.6, 0.6], material: { color: "#111111", style: "solid" } },
          // Round pinkish rat ears
          { origin: [-1.5, 3.2, 2.8], size: [0.8, 1, 0.6], material: { color: "#FFAB91", style: "solid" } },
          { origin: [0.7, 3.2, 2.8], size: [0.8, 1, 0.6], material: { color: "#FFAB91", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 1, 0],
        cubes: [
          { origin: [1.2, 0, 1.5], size: [0.8, 1.2, 1], material: { color: "#FFAB91", style: "solid" } },
          { origin: [-2, 0, 1.5], size: [0.8, 1.2, 1], material: { color: "#FFAB91", style: "solid" } },
          { origin: [1.2, 0, -2.5], size: [0.8, 1.2, 1], material: { color: "#FFAB91", style: "solid" } },
          { origin: [-2, 0, -2.5], size: [0.8, 1.2, 1], material: { color: "#FFAB91", style: "solid" } }
        ]
      },
      {
        name: "tail",
        parent: "body",
        pivot: [0, 2, -3],
        cubes: [
          // Long scaly pink-grey segmented tail
          { origin: [-0.4, 1.5, -8.5], size: [0.8, 0.8, 5.5], material: { color: "#BCAAA4", style: "solid" } }
        ]
      }
    ]
  },

  // 4. Gián đất (cockroach)
  {
    asset_name: "cockroach",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 0.8, height: 0.4, offset: [0, 0.2, 0] },
    components: petComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 1, 0],
        cubes: [
          // Flat shiny oval mahogany chitin thorax & wings (thân gián nâu bóng)
          { origin: [-1.5, 0.8, -2.5], size: [3, 1, 5], material: { color: "#3E1F17", style: "bordered" } },
          // Elytra wing seam & gradient
          { origin: [-1.2, 1.6, -2.2], size: [2.4, 0.4, 4.2], material: { color: "#5D2B1D", style: "shaded" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 1, 2.5],
        cubes: [
          // Small head tucked under pronotum
          { origin: [-0.8, 0.6, 2.2], size: [1.6, 0.8, 1.2], material: { color: "#2E150F", style: "solid" } },
          // Dual slender curved antennae (râu gián dài vểnh)
          { origin: [-2.2, 1, 3], size: [1.5, 0.2, 2.5], pivot: [-0.6, 1, 2.5], rotation: [0, 25, 0], material: { color: "#8D4E3A", style: "solid" } },
          { origin: [0.7, 1, 3], size: [1.5, 0.2, 2.5], pivot: [0.6, 1, 2.5], rotation: [0, -25, 0], material: { color: "#8D4E3A", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 0.5, 0],
        cubes: [
          // 6 splayed spiny jointed legs on sides
          { origin: [-3, 0.2, 1], size: [1.6, 0.4, 0.5], pivot: [-1.5, 0.5, 1], rotation: [0, 20, 20], material: { color: "#2E150F", style: "solid" } },
          { origin: [1.4, 0.2, 1], size: [1.6, 0.4, 0.5], pivot: [1.5, 0.5, 1], rotation: [0, -20, -20], material: { color: "#2E150F", style: "solid" } },
          { origin: [-3.2, 0.2, -0.2], size: [1.8, 0.4, 0.5], material: { color: "#2E150F", style: "solid" } },
          { origin: [1.4, 0.2, -0.2], size: [1.8, 0.4, 0.5], material: { color: "#2E150F", style: "solid" } },
          { origin: [-3.5, 0.2, -1.5], size: [2.1, 0.4, 0.5], pivot: [-1.5, 0.5, -1.5], rotation: [0, -25, 15], material: { color: "#2E150F", style: "solid" } },
          { origin: [1.4, 0.2, -1.5], size: [2.1, 0.4, 0.5], pivot: [1.5, 0.5, -1.5], rotation: [0, 25, -15], material: { color: "#2E150F", style: "solid" } }
        ]
      }
    ]
  },

  // 5. Chim bồ câu (pigeon)
  {
    asset_name: "pigeon",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1, height: 1, offset: [0, 0.5, 0] },
    components: petComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 4, 0],
        cubes: [
          // Plump slate grey body with iridescent sheen
          { origin: [-2, 2.5, -3.5], size: [4, 4, 7], material: { color: "#607D8B", style: "shaded" } },
          // Iridescent neck feathers (lông cổ xanh tím ánh kim)
          { origin: [-1.6, 4.5, 1], size: [3.2, 3, 3], material: { color: "#00897B", style: "shaded" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 7, 2.5],
        cubes: [
          // Pigeon head
          { origin: [-1.2, 6.5, 1.5], size: [2.4, 2.4, 2.5], material: { color: "#546E7A", style: "solid" } },
          // Black beak with white cere lump (mỏ xám có cục thịt trắng)
          { origin: [-0.5, 6.8, 3.8], size: [1, 0.8, 1.6], material: { color: "#263238", style: "solid" } },
          { origin: [-0.4, 7.4, 3.6], size: [0.8, 0.4, 0.8], material: { color: "#FAFAFA", style: "solid" } },
          // Orange circular eyes
          { origin: [-1.3, 7.5, 2.5], size: [0.2, 0.8, 0.8], material: { color: "#FF6D00", style: "solid" } },
          { origin: [1.1, 7.5, 2.5], size: [0.2, 0.8, 0.8], material: { color: "#FF6D00", style: "solid" } }
        ]
      },
      {
        name: "wings",
        parent: "body",
        pivot: [0, 4.5, 0],
        cubes: [
          // Folded wing feathers left/right with dual black wing bars
          { origin: [2, 3, -4], size: [0.8, 3.2, 6.5], material: { color: "#455A64", style: "bordered" } },
          { origin: [-2.8, 3, -4], size: [0.8, 3.2, 6.5], material: { color: "#455A64", style: "bordered" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 2.5, 0],
        cubes: [
          // Reddish-pink thin bird legs
          { origin: [0.8, 0, -0.5], size: [0.6, 2.5, 0.8], material: { color: "#D81B60", style: "solid" } },
          { origin: [-1.4, 0, -0.5], size: [0.6, 2.5, 0.8], material: { color: "#D81B60", style: "solid" } }
        ]
      },
      {
        name: "tail",
        parent: "body",
        pivot: [0, 4, -3.5],
        cubes: [
          // Fan tail feathers
          { origin: [-1.5, 3.5, -7.5], size: [3, 0.8, 4], material: { color: "#37474F", style: "solid" } }
        ]
      }
    ]
  },

  // 6. Cô bán hàng rong (street_vendor_npc)
  {
    asset_name: "street_vendor_npc",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 2, offset: [0, 1, 0] },
    components: npcComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 12, 0],
        cubes: [
          // Floral bà ba shirt torso (hồng nhạt)
          { origin: [-3, 11, -1.8], size: [6, 8, 3.6], material: { color: "#EC407A", style: "bordered" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 19, 0],
        cubes: [
          // Head face
          { origin: [-2, 19, -2], size: [4, 4, 4], material: { color: "#FFCC80", style: "solid" } },
          // Eyes & gentle smile
          { origin: [-1.5, 20.8, -2.1], size: [0.8, 0.6, 0.3], material: { color: "#3E2723", style: "solid" } },
          { origin: [0.7, 20.8, -2.1], size: [0.8, 0.6, 0.3], material: { color: "#3E2723", style: "solid" } },
          // Conical palm leaf hat (nón lá truyền thống hình nón)
          { origin: [-5.5, 22.5, -5.5], size: [11, 1, 11], material: { color: "#FFE082", style: "bordered" } },
          { origin: [-3.5, 23.5, -3.5], size: [7, 1.5, 7], material: { color: "#FFE082", style: "shaded" } },
          { origin: [-1.5, 25, -1.5], size: [3, 1.5, 3], material: { color: "#FFD54F", style: "solid" } },
          // Hat chin strap (quai nón tím)
          { origin: [-2.1, 19, -0.5], size: [4.2, 3.5, 0.4], material: { color: "#AB47BC", style: "solid" } }
        ]
      },
      {
        name: "carrying_pole",
        parent: "body",
        pivot: [0, 18, 0],
        cubes: [
          // Bamboo shoulder pole (đòn gánh tre uốn cong đặt ngang vai)
          { origin: [-10, 17.5, -0.8], size: [20, 1, 1.6], material: { color: "#C5A059", style: "bordered" } },
          // Left basket suspension ropes & woven basket (quang gánh & thúng tre trái)
          { origin: [-9, 7, -0.4], size: [0.4, 10.5, 0.8], material: { color: "#8D6E63", style: "solid" } },
          { origin: [-12, 1, -3], size: [6, 6, 6], material: { color: "#D7CCC8", style: "bordered" } },
          // Right basket & ropes (thúng tre phải)
          { origin: [8.6, 7, -0.4], size: [0.4, 10.5, 0.8], material: { color: "#8D6E63", style: "solid" } },
          { origin: [6, 1, -3], size: [6, 6, 6], material: { color: "#D7CCC8", style: "bordered" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 11, 0],
        cubes: [
          // Black silk trousers (quần lụa đen)
          { origin: [-2.8, 0, -1.5], size: [2.5, 11, 3], material: { color: "#212121", style: "solid" } },
          { origin: [0.3, 0, -1.5], size: [2.5, 11, 3], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 7. Chú xe ôm (xe_om_driver_npc)
  {
    asset_name: "xe_om_driver_npc",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.5, height: 1.8, offset: [0, 0.9, 0] },
    components: npcComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 12, 0],
        cubes: [
          // Weathered blue windbreaker jacket
          { origin: [-3, 11, -2], size: [6, 8, 4], material: { color: "#1565C0", style: "bordered" } },
          // Cross-body waist satchel bag (túi bao tử đeo chéo đựng tiền lẻ)
          { origin: [-2.5, 12, -2.6], size: [5, 2.5, 1], material: { color: "#3E2723", style: "solid" } },
          { origin: [-3.2, 13, -2.2], size: [6.4, 1, 0.4], pivot: [0, 13, 0], rotation: [0, 0, 30], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 19, 0],
        cubes: [
          // Head face with mustache
          { origin: [-2, 19, -2], size: [4, 4, 4], material: { color: "#FFCC80", style: "solid" } },
          { origin: [-1, 19.8, -2.1], size: [2, 0.5, 0.3], material: { color: "#37474F", style: "solid" } },
          // Eyes
          { origin: [-1.4, 20.8, -2.1], size: [0.7, 0.6, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [0.7, 20.8, -2.1], size: [0.7, 0.6, 0.3], material: { color: "#212121", style: "solid" } },
          // Half-face helmet worn on head (mũ bảo hiểm nửa đầu)
          { origin: [-2.5, 21.5, -2.5], size: [5, 2.5, 5], material: { color: "#37474F", style: "bordered" } },
          { origin: [-2.2, 21.8, -3.2], size: [4.4, 0.8, 1], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "arms",
        parent: "body",
        pivot: [0, 18, 0],
        cubes: [
          { origin: [-4.8, 10, -1.5], size: [1.8, 8, 3], material: { color: "#1565C0", style: "solid" } },
          { origin: [3, 10, -1.5], size: [1.8, 8, 3], material: { color: "#1565C0", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 11, 0],
        cubes: [
          // Khaki pants
          { origin: [-2.8, 0, -1.5], size: [2.5, 11, 3], material: { color: "#8D6E63", style: "solid" } },
          { origin: [0.3, 0, -1.5], size: [2.5, 11, 3], material: { color: "#8D6E63", style: "solid" } }
        ]
      }
    ]
  },

  // 8. Bà bán trà đá vỉa hè (iced_tea_trader)
  {
    asset_name: "iced_tea_trader",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.5, height: 1.8, offset: [0, 0.9, 0] },
    components: npcComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 12, 0],
        cubes: [
          // Patterned cardigan sweater & floral apron (tạp dề hoa)
          { origin: [-3, 11, -2], size: [6, 8, 4], material: { color: "#5E35B1", style: "bordered" } },
          { origin: [-2.8, 10, -2.2], size: [5.6, 7, 0.5], material: { color: "#FFD54F", style: "solid" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 19, 0],
        cubes: [
          // Face
          { origin: [-2, 19, -2], size: [4, 4, 4], material: { color: "#FFCC80", style: "solid" } },
          // Glasses (kính lão)
          { origin: [-1.8, 20.8, -2.2], size: [3.6, 1, 0.4], material: { color: "#CFD8DC", style: "bordered" } },
          // Conical hat / hair bun
          { origin: [-5, 22.5, -5], size: [10, 1.2, 10], material: { color: "#FFE082", style: "bordered" } },
          { origin: [-2.5, 23.7, -2.5], size: [5, 1.5, 5], material: { color: "#FFE082", style: "solid" } }
        ]
      },
      {
        name: "arms",
        parent: "body",
        pivot: [0, 18, 0],
        cubes: [
          { origin: [-4.8, 10, -1.5], size: [1.8, 8, 3], material: { color: "#5E35B1", style: "solid" } },
          // Right arm holding tea ladle / cloth
          { origin: [3, 10, -1.5], size: [1.8, 8, 3], material: { color: "#5E35B1", style: "solid" } },
          { origin: [3.2, 8.5, -2], size: [1.5, 2, 2.5], material: { color: "#ECEFF1", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 11, 0],
        cubes: [
          // Black trousers
          { origin: [-2.8, 0, -1.5], size: [2.5, 11, 3], material: { color: "#212121", style: "solid" } },
          { origin: [0.3, 0, -1.5], size: [2.5, 11, 3], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 9. Anh thợ sửa xe vỉa hè (sidewalk_mechanic_npc)
  {
    asset_name: "sidewalk_mechanic_npc",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.5, height: 1.8, offset: [0, 0.9, 0] },
    components: npcComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 12, 0],
        cubes: [
          // Oil-stained denim work shirt
          { origin: [-3, 11, -2], size: [6, 8, 4], material: { color: "#455A64", style: "bordered" } },
          // Grease marks
          { origin: [-1, 13, -2.1], size: [2, 2, 0.2], material: { color: "#212121", style: "solid" } },
          // Heavy tool belt with holster
          { origin: [-3.2, 10.5, -2.2], size: [6.4, 1.5, 4.4], material: { color: "#5D4037", style: "solid" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 19, 0],
        cubes: [
          // Face
          { origin: [-2, 19, -2], size: [4, 4, 4], material: { color: "#FFCC80", style: "solid" } },
          // Cap backwards (mũ lưỡi trai đội ngược)
          { origin: [-2.2, 22, -2.2], size: [4.4, 1.8, 4.4], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-1.8, 22, 2.2], size: [3.6, 0.6, 2], material: { color: "#D32F2F", style: "solid" } }
        ]
      },
      {
        name: "arms",
        parent: "body",
        pivot: [0, 18, 0],
        cubes: [
          { origin: [-4.8, 10, -1.5], size: [1.8, 8, 3], material: { color: "#FFCC80", style: "solid" } },
          // Right arm holding wrench 10
          { origin: [3, 10, -1.5], size: [1.8, 8, 3], material: { color: "#FFCC80", style: "solid" } },
          { origin: [3.2, 8, -4], size: [1, 1, 6], material: { color: "#90A4AE", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 11, 0],
        cubes: [
          // Rolled-up jeans
          { origin: [-2.8, 0, -1.5], size: [2.5, 11, 3], material: { color: "#1565C0", style: "solid" } },
          { origin: [0.3, 0, -1.5], size: [2.5, 11, 3], material: { color: "#1565C0", style: "solid" } }
        ]
      }
    ]
  },

  // 10. Học sinh cấp 3 (high_school_student_npc)
  {
    asset_name: "high_school_student_npc",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.5, height: 1.8, offset: [0, 0.9, 0] },
    components: npcComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "body",
        parent: "root",
        pivot: [0, 12, 0],
        cubes: [
          // Crisp white school uniform button-up shirt (áo sơ mi trắng đồng phục)
          { origin: [-3, 11, -2], size: [6, 8, 4], material: { color: "#FAFAFA", style: "bordered" } },
          // Red school tie / neckerchief ribbon (khăn quàng / cà vạt đồng phục đỏ)
          { origin: [-0.6, 14, -2.2], size: [1.2, 4, 0.3], material: { color: "#D32F2F", style: "solid" } },
          // School logo badge on left chest pocket (phù hiệu trường)
          { origin: [1, 15, -2.1], size: [1.2, 1.2, 0.2], material: { color: "#1565C0", style: "solid" } },
          // Heavy school backpack on shoulders (ba lô đi học sau lưng)
          { origin: [-2.5, 11, 2], size: [5, 7, 3], material: { color: "#00897B", style: "bordered" } }
        ]
      },
      {
        name: "head",
        parent: "body",
        pivot: [0, 19, 0],
        cubes: [
          // Youthful face
          { origin: [-2, 19, -2], size: [4, 4, 4], material: { color: "#FFE0B2", style: "solid" } },
          // Stylish black modern student haircut
          { origin: [-2.2, 21.8, -2.2], size: [4.4, 2, 4.4], material: { color: "#212121", style: "bordered" } },
          // Big bright eyes
          { origin: [-1.4, 20.8, -2.1], size: [0.7, 0.7, 0.3], material: { color: "#212121", style: "solid" } },
          { origin: [0.7, 20.8, -2.1], size: [0.7, 0.7, 0.3], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "arms",
        parent: "body",
        pivot: [0, 18, 0],
        cubes: [
          // White sleeves
          { origin: [-4.8, 10, -1.5], size: [1.8, 8, 3], material: { color: "#FAFAFA", style: "solid" } },
          // Right arm holding smartphone
          { origin: [3, 10, -1.5], size: [1.8, 8, 3], material: { color: "#FAFAFA", style: "solid" } },
          { origin: [3.2, 9, -2.5], size: [1.2, 2, 0.4], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "legs",
        parent: "body",
        pivot: [0, 11, 0],
        cubes: [
          // Dark navy uniform slacks (quần tây xanh đen)
          { origin: [-2.8, 0, -1.5], size: [2.5, 11, 3], material: { color: "#0D47A1", style: "solid" } },
          { origin: [0.3, 0, -1.5], size: [2.5, 11, 3], material: { color: "#0D47A1", style: "solid" } },
          // White canvas sneakers
          { origin: [-2.8, 0, -2.5], size: [2.5, 1.5, 1], material: { color: "#FAFAFA", style: "solid" } },
          { origin: [0.3, 0, -2.5], size: [2.5, 1.5, 1], material: { color: "#FAFAFA", style: "solid" } }
        ]
      }
    ]
  }
];

// Execution runner
async function main() {
  console.log(`Starting generation for ${models.length} Animals & NPCs Entities...`);
  const outputDir = path.resolve(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const items = [];
  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    console.log(`[${i + 1}/${models.length}] Generating ${model.asset_name}...`);
    const res = buildMinecraftAsset(model, { outputDir });
    console.log(`  -> Built ${res.assetName}: ${res.cubeCount} cubes, ${res.boneCount} bones, texture: ${res.textureWidth}x${res.textureHeight}`);
    items.push({ assetName: res.assetName, mode: res.mode, components: model.components });
  }

  console.log(`\nAll 10 Animals & NPCs built successfully. Packaging into Addon...`);
  const addonName = "vietnam_mobs_npcs_pack";
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

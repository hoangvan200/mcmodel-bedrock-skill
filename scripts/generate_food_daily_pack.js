const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// 35 Items: m Thc & Sinh Hot (Vietnam Food & Daily Life)
const models = [
  // 1. banh_mi_thit
  {
    asset_name: "banh_mi_thit",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Lower crispy golden baguette crust
          { origin: [-6, 0, -3], size: [12, 2.5, 6], material: { color: "#F57F17", style: "bordered" } },
          // Upper crust halves (split open)
          { origin: [-5.5, 3.5, -3.2], size: [11, 2.5, 3], pivot: [0, 3.5, 0], rotation: [-8, 0, 0], material: { color: "#F57F17", style: "bordered" } },
          { origin: [-5.5, 3.5, 0.2], size: [11, 2.5, 3], pivot: [0, 3.5, 0], rotation: [8, 0, 0], material: { color: "#F57F17", style: "bordered" } },
          // Fillings: Sliced pork belly / cha lua
          { origin: [-5, 2.2, -2.5], size: [10, 1.2, 5], material: { color: "#E57373", style: "shaded" } },
          // Cucumber spears
          { origin: [-4.5, 2.6, -2.8], size: [9, 0.8, 1.8], material: { color: "#81C784", style: "solid" } },
          // Pickled julienned daikon & carrots
          { origin: [-4, 2.8, 0.5], size: [8, 0.8, 2], material: { color: "#FF7043", style: "solid" } },
          // Cilantro sprigs
          { origin: [-3, 3.2, -1], size: [6, 0.8, 2], material: { color: "#388E3C", style: "solid" } },
          // Pate / mayonnaise layer
          { origin: [-4.8, 2, -2], size: [9.6, 0.5, 4], material: { color: "#8D6E63", style: "solid" } }
        ]
      }
    ]
  },

  // 2. plain_banh_mi
  {
    asset_name: "plain_banh_mi",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Tapered crispy baguette loaf
          { origin: [-6.5, 0, -3], size: [13, 3, 6], material: { color: "#F57F17", style: "bordered" } },
          { origin: [-5.5, 3, -2.5], size: [11, 2.5, 5], material: { color: "#FFB300", style: "shaded" } },
          // Tapered end tips
          { origin: [-7.5, 0.5, -2], size: [1, 2, 4], material: { color: "#E65100", style: "solid" } },
          { origin: [6.5, 0.5, -2], size: [1, 2, 4], material: { color: "#E65100", style: "solid" } },
          // 3 diagonal slash score cuts on golden crust
          { origin: [-3.5, 5.2, -1.5], size: [2, 0.5, 3], pivot: [-2.5, 5.2, 0], rotation: [0, 25, 0], material: { color: "#FFF8E1", style: "solid" } },
          { origin: [-0.5, 5.2, -1.5], size: [2, 0.5, 3], pivot: [0.5, 5.2, 0], rotation: [0, 25, 0], material: { color: "#FFF8E1", style: "solid" } },
          { origin: [2.5, 5.2, -1.5], size: [2, 0.5, 3], pivot: [3.5, 5.2, 0], rotation: [0, 25, 0], material: { color: "#FFF8E1", style: "solid" } }
        ]
      }
    ]
  },

  // 3. bowl_of_pho_bo
  {
    asset_name: "bowl_of_pho_bo",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Hollow ceramic bowl base & walls
          { origin: [-4.5, 0, -4.5], size: [9, 1.2, 9], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-6, 1.2, -6], size: [12, 4.5, 1.2], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-6, 1.2, 4.8], size: [12, 4.5, 1.2], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-6, 1.2, -4.8], size: [1.2, 4.5, 9.6], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [4.8, 1.2, -4.8], size: [1.2, 4.5, 9.6], material: { color: "#FAFAFA", style: "bordered" } },
          // Golden clear beef broth (hollow recessed liquid)
          { origin: [-4.8, 2, -4.8], size: [9.6, 2.5, 9.6], material: { color: "#D7CCC8", style: "shaded" } },
          // Flat rice noodles
          { origin: [-4, 3.8, -4], size: [8, 1, 8], material: { color: "#FFFFFF", style: "shaded" } },
          // Rare beef slices
          { origin: [-3.5, 4.6, -3], size: [4, 0.6, 3], material: { color: "#B71C1C", style: "shaded" } },
          // Well-done brisket
          { origin: [0, 4.6, -2.5], size: [3.5, 0.6, 3.5], material: { color: "#8D6E63", style: "shaded" } },
          // Scallions & sliced white onions
          { origin: [-2, 4.8, 0.5], size: [4, 0.6, 3], material: { color: "#4CAF50", style: "solid" } },
          // Slanted wooden chopsticks resting on bowl rim (rotation: [0, 22, 0])
          { origin: [-6, 5.8, -1], size: [12, 0.5, 0.5], pivot: [0, 5.8, 0], rotation: [0, 22, 0], material: { color: "#8D6E63", style: "solid" } },
          { origin: [-6, 5.8, -0.3], size: [12, 0.5, 0.5], pivot: [0, 5.8, 0], rotation: [0, 22, 0], material: { color: "#8D6E63", style: "solid" } }
        ]
      }
    ]
  },

  // 4. bowl_of_bun_bo_hue
  {
    asset_name: "bowl_of_bun_bo_hue",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Dark ceramic bowl (hollow cavity)
          { origin: [-4.5, 0, -4.5], size: [9, 1.2, 9], material: { color: "#37474F", style: "bordered" } },
          { origin: [-6, 1.2, -6], size: [12, 4.5, 1.2], material: { color: "#37474F", style: "bordered" } },
          { origin: [-6, 1.2, 4.8], size: [12, 4.5, 1.2], material: { color: "#37474F", style: "bordered" } },
          { origin: [-6, 1.2, -4.8], size: [1.2, 4.5, 9.6], material: { color: "#37474F", style: "bordered" } },
          { origin: [4.8, 1.2, -4.8], size: [1.2, 4.5, 9.6], material: { color: "#37474F", style: "bordered" } },
          // Rich spicy red lemongrass chili broth
          { origin: [-4.8, 2, -4.8], size: [9.6, 2.5, 9.6], material: { color: "#D32F2F", style: "shaded" } },
          // Round thick vermicelli noodles
          { origin: [-4, 3.8, -4], size: [8, 1, 8], material: { color: "#FFFDE7", style: "shaded" } },
          // Crab sausage ball
          { origin: [-3, 4.6, -3], size: [2.5, 1, 2.5], material: { color: "#FF8A65", style: "shaded" } },
          // Beef shank slice
          { origin: [0.5, 4.6, -3], size: [3.5, 0.6, 3], material: { color: "#5D4037", style: "shaded" } },
          // Blood curd cube
          { origin: [-3, 4.6, 0.5], size: [2.5, 1, 2.5], material: { color: "#4A148C", style: "solid" } },
          // Chopped scallions & banana flower
          { origin: [0.5, 4.8, 0.5], size: [3, 0.6, 3], material: { color: "#388E3C", style: "solid" } }
        ]
      }
    ]
  },

  // 5. xoi_xeo_box
  {
    asset_name: "xoi_xeo_box",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Banana leaf wrapper base
          { origin: [-5, 0, -5], size: [10, 1, 10], material: { color: "#2E7D32", style: "bordered" } },
          // Folded angled leaf flaps on sides
          { origin: [-5.5, 0.8, -4.5], size: [1, 2.5, 9], pivot: [-5, 1, 0], rotation: [0, 0, 15], material: { color: "#1B5E20", style: "solid" } },
          { origin: [4.5, 0.8, -4.5], size: [1, 2.5, 9], pivot: [5, 1, 0], rotation: [0, 0, -15], material: { color: "#1B5E20", style: "solid" } },
          // Golden turmeric sticky rice
          { origin: [-4.2, 1, -4.2], size: [8.4, 2, 8.4], material: { color: "#FDD835", style: "shaded" } },
          // Sliced mung bean paste sheets
          { origin: [-3.5, 2.8, -3.5], size: [7, 0.8, 7], material: { color: "#FFEE58", style: "shaded" } },
          // Crispy fried shallots
          { origin: [-2.5, 3.5, -2.5], size: [5, 0.6, 5], material: { color: "#795548", style: "solid" } },
          // Liquid chicken/pork rendered fat drizzle
          { origin: [-3, 3.4, -1], size: [6, 0.4, 2], material: { color: "#FFA000", style: "solid" } }
        ]
      }
    ]
  },

  // 6. banh_bao
  {
    asset_name: "banh_bao",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Paper liner square at bottom
          { origin: [-3.5, 0, -3.5], size: [7, 0.2, 7], material: { color: "#ECEFF1", style: "solid" } },
          // Soft steamed bun lower body (octagonal dome)
          { origin: [-4, 0.2, -4], size: [8, 3.5, 8], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-4, 0.2, -4], size: [8, 3.5, 8], pivot: [0, 2, 0], rotation: [0, 45, 0], material: { color: "#FAFAFA", style: "bordered" } },
          // Tapered upper bun dome
          { origin: [-3, 3.7, -3], size: [6, 2, 6], material: { color: "#F5F5F5", style: "shaded" } },
          { origin: [-3, 3.7, -3], size: [6, 2, 6], pivot: [0, 4.5, 0], rotation: [0, 45, 0], material: { color: "#F5F5F5", style: "shaded" } },
          // Top pleated spiral knot
          { origin: [-1.2, 5.6, -1.2], size: [2.4, 1.2, 2.4], material: { color: "#EEEEEE", style: "solid" } },
          // Red dot food coloring spot on top
          { origin: [-0.6, 6.7, -0.6], size: [1.2, 0.3, 1.2], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 7. banh_gio
  {
    asset_name: "banh_gio",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Pyramid-shaped wrapped banana leaf dumpling (stepped tiers)
          { origin: [-4.5, 0, -4.5], size: [9, 2.5, 9], material: { color: "#1B5E20", style: "bordered" } },
          { origin: [-3.5, 2.5, -3.5], size: [7, 2.5, 7], material: { color: "#2E7D32", style: "bordered" } },
          { origin: [-2.5, 5, -2.5], size: [5, 2.5, 5], material: { color: "#33691E", style: "bordered" } },
          { origin: [-1.2, 7.5, -1.2], size: [2.4, 2, 2.4], material: { color: "#1B5E20", style: "solid" } },
          // Split bamboo tying strings
          { origin: [-4.7, 1.5, -0.6], size: [9.4, 0.6, 1.2], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [-0.6, 1.5, -4.7], size: [1.2, 0.6, 9.4], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [-3.7, 4, -0.6], size: [7.4, 0.6, 1.2], material: { color: "#D7CCC8", style: "solid" } }
        ]
      }
    ]
  },

  // 8. pork_skewer
  {
    asset_name: "pork_skewer",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bamboo skewer stick
          { origin: [-0.4, 0, -0.4], size: [0.8, 14, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // 4 marinated caramelized pork cubes with char marks
          { origin: [-1.8, 3.5, -1.8], size: [3.6, 2.2, 3.6], material: { color: "#5D4037", style: "shaded" } },
          { origin: [-1.6, 6, -1.6], size: [3.2, 2.2, 3.2], pivot: [0, 7, 0], rotation: [0, 15, 0], material: { color: "#6D4C41", style: "shaded" } },
          { origin: [-1.8, 8.5, -1.8], size: [3.6, 2.2, 3.6], pivot: [0, 9.5, 0], rotation: [0, -10, 0], material: { color: "#4E342E", style: "shaded" } },
          { origin: [-1.5, 11, -1.5], size: [3, 2, 3], material: { color: "#3E2723", style: "shaded" } },
          // Toasted sesame speckles & scallion oil
          { origin: [-1, 7.8, -1.8], size: [2, 0.5, 0.5], material: { color: "#FFF9C4", style: "solid" } }
        ]
      }
    ]
  },

  // 9. fish_ball_skewer
  {
    asset_name: "fish_ball_skewer",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bamboo stick
          { origin: [-0.4, 0, -0.4], size: [0.8, 15, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // 4 fried golden fish balls
          { origin: [-1.8, 3.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#FFE082", style: "bordered" } },
          { origin: [-1.8, 6.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#FFD54F", style: "bordered" } },
          { origin: [-1.8, 9.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#FFE082", style: "bordered" } },
          { origin: [-1.8, 12.5, -1.8], size: [3.6, 2.2, 3.6], material: { color: "#FFCA28", style: "bordered" } },
          // Sweet chili sauce glaze drop
          { origin: [-0.8, 11, -2], size: [1.6, 1.5, 0.4], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 10. beef_ball_skewer
  {
    asset_name: "beef_ball_skewer",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bamboo stick
          { origin: [-0.4, 0, -0.4], size: [0.8, 15, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // 4 savory dark beef balls
          { origin: [-1.8, 3.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#4E342E", style: "shaded" } },
          { origin: [-1.8, 6.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#3E2723", style: "shaded" } },
          { origin: [-1.8, 9.5, -1.8], size: [3.6, 2.5, 3.6], material: { color: "#4E342E", style: "shaded" } },
          { origin: [-1.8, 12.5, -1.8], size: [3.6, 2.2, 3.6], material: { color: "#3E2723", style: "shaded" } },
          // Dark hoisin sauce glaze
          { origin: [-0.8, 8, -2], size: [1.6, 1.8, 0.4], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 11. grilled_sausage
  {
    asset_name: "grilled_sausage",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bamboo skewer
          { origin: [-0.4, 0, -0.4], size: [0.8, 15, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // Reddish-brown grilled sausage body
          { origin: [-1.6, 3.5, -1.6], size: [3.2, 10, 3.2], material: { color: "#C62828", style: "bordered" } },
          // Diagonal grill score cuts
          { origin: [-1.8, 5.5, -1.2], size: [3.6, 0.6, 2.4], pivot: [0, 5.8, 0], rotation: [0, 20, 0], material: { color: "#3E2723", style: "solid" } },
          { origin: [-1.8, 8, -1.2], size: [3.6, 0.6, 2.4], pivot: [0, 8.3, 0], rotation: [0, 20, 0], material: { color: "#3E2723", style: "solid" } },
          { origin: [-1.8, 10.5, -1.2], size: [3.6, 0.6, 2.4], pivot: [0, 10.8, 0], rotation: [0, 20, 0], material: { color: "#3E2723", style: "solid" } }
        ]
      }
    ]
  },

  // 12. grilled_corn
  {
    asset_name: "grilled_corn",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Skewer handle
          { origin: [-0.4, 0, -0.4], size: [0.8, 4, 0.8], material: { color: "#D7CCC8", style: "solid" } },
          // Golden sweet corn cob body
          { origin: [-2, 3, -2], size: [4, 11, 4], material: { color: "#FDD835", style: "bordered" } },
          // Tapered top end
          { origin: [-1.5, 14, -1.5], size: [3, 1.5, 3], material: { color: "#FBC02D", style: "solid" } },
          // Charred grill spots
          { origin: [-2.2, 5, -1], size: [0.4, 2, 2], material: { color: "#3E2723", style: "solid" } },
          { origin: [1.8, 8, -1], size: [0.4, 2.5, 2], material: { color: "#3E2723", style: "solid" } },
          // Scallion oil garnish
          { origin: [-1, 7, -2.2], size: [2, 4, 0.4], material: { color: "#2E7D32", style: "solid" } }
        ]
      }
    ]
  },

  // 13. grilled_sweet_potato
  {
    asset_name: "grilled_sweet_potato",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Dark charred purple-brown skin
          { origin: [-6, 0, -2.5], size: [12, 4, 5], material: { color: "#4A148C", style: "bordered" } },
          // Cracked open center revealing steaming golden-orange flesh
          { origin: [-4, 2, -2], size: [8, 2.8, 4], material: { color: "#FFA000", style: "shaded" } },
          // Charred ash spots on skin
          { origin: [-5.5, 0.5, 2.2], size: [4, 2, 0.5], material: { color: "#212121", style: "solid" } },
          { origin: [2, 0.5, -2.7], size: [3.5, 2, 0.5], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 14. grilled_rice_paper
  {
    asset_name: "grilled_rice_paper",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Round crispy charred rice paper disc (octagonal approximation)
          { origin: [-6.5, 0, -6.5], size: [13, 0.8, 13], material: { color: "#FFF9C4", style: "bordered" } },
          { origin: [-6.5, 0, -6.5], size: [13, 0.8, 13], pivot: [0, 0.4, 0], rotation: [0, 45, 0], material: { color: "#FFF9C4", style: "bordered" } },
          // Quail egg & scallion butter spread layer
          { origin: [-5, 0.8, -5], size: [10, 0.6, 10], material: { color: "#FBC02D", style: "shaded" } },
          // Scallion greens
          { origin: [-4.5, 1.4, -4.5], size: [9, 0.4, 9], material: { color: "#388E3C", style: "solid" } },
          // Dried baby shrimp
          { origin: [-3.5, 1.7, -3.5], size: [7, 0.4, 7], material: { color: "#E64A19", style: "solid" } },
          // Zigzag chili sauce & mayonnaise drizzle
          { origin: [-5, 2, -1], size: [10, 0.4, 2], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 15. balut
  {
    asset_name: "balut",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // White ceramic egg cup holder
          { origin: [-3, 0, -3], size: [6, 1.5, 6], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-2.2, 1.5, -2.2], size: [4.4, 1.5, 4.4], material: { color: "#ECEFF1", style: "bordered" } },
          // Mottled egg resting upright in cup
          { origin: [-2.5, 2.5, -2.5], size: [5, 4.5, 5], material: { color: "#CFD8DC", style: "shaded" } },
          // Cracked shell top opening
          { origin: [-2, 7, -2], size: [4, 1, 4], material: { color: "#B0BEC5", style: "solid" } },
          // Side sprig of Vietnamese coriander
          { origin: [2.5, 0.2, -1], size: [3, 1.2, 2], pivot: [2.5, 0.2, 0], rotation: [0, 0, 15], material: { color: "#2E7D32", style: "solid" } },
          // Small dish of salt-pepper-lime
          { origin: [-4.5, 0, 2], size: [2.5, 0.8, 2.5], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-4, 0.8, 2.5], size: [1.5, 0.4, 1.5], material: { color: "#424242", style: "solid" } }
        ]
      }
    ]
  },

  // 16. iced_tea_glass
  {
    asset_name: "iced_tea_glass",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Hollow glass base & walls
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Golden amber iced tea liquid
          { origin: [-2.6, 1, -2.6], size: [5.2, 5.5, 5.2], material: { color: "#FBC02D", style: "shaded" } },
          // 3 clear ice cubes floating inside
          { origin: [-1.8, 4.5, -1.8], size: [2, 2, 2], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [0, 5, -0.5], size: [1.8, 1.8, 1.8], pivot: [0.9, 5.9, 0.4], rotation: [10, 15, -10], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-1.5, 3.5, 0.2], size: [1.8, 1.8, 1.8], material: { color: "#E0F7FA", style: "solid" } }
        ]
      }
    ]
  },

  // 17. nhan_tran_glass
  {
    asset_name: "nhan_tran_glass",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Glass cup
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Deep dark herbal brown liquid
          { origin: [-2.6, 1, -2.6], size: [5.2, 5.5, 5.2], material: { color: "#4E342E", style: "shaded" } },
          // Floating ice cubes
          { origin: [-1.5, 4.5, -1.5], size: [2.2, 2, 2.2], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-0.2, 4.8, 0], size: [2, 1.8, 2], material: { color: "#E0F7FA", style: "solid" } }
        ]
      }
    ]
  },

  // 18. sugarcane_juice_glass
  {
    asset_name: "sugarcane_juice_glass",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Tall ribbed glass cup
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 9, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 9, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 9, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 9, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Vibrant light green sugarcane juice
          { origin: [-2.6, 1, -2.6], size: [5.2, 6.5, 5.2], material: { color: "#9CCC65", style: "shaded" } },
          // White frothy foam top
          { origin: [-2.6, 7.5, -2.6], size: [5.2, 1.2, 5.2], material: { color: "#DCEDC8", style: "solid" } },
          // Floating calamansi/kumquat slice
          { origin: [-1.5, 7.8, -1.5], size: [2, 0.5, 2], material: { color: "#FFB300", style: "solid" } },
          // Tilted red drinking straw (rotation: [15, 0, -10])
          { origin: [-0.4, 2, -0.4], size: [0.8, 10, 0.8], pivot: [0, 5, 0], rotation: [15, 0, -10], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 19. iced_black_coffee
  {
    asset_name: "iced_black_coffee",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Glass tumbler
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 7, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 7, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Dark roasted Robusta coffee liquid
          { origin: [-2.6, 1, -2.6], size: [5.2, 5.5, 5.2], material: { color: "#1A0C08", style: "solid" } },
          // Clear ice cubes
          { origin: [-1.6, 4.5, -1.6], size: [2.2, 2, 2.2], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-0.2, 4.8, -0.2], size: [2, 2, 2], material: { color: "#E0F7FA", style: "solid" } },
          // Plastic black stirrer spoon
          { origin: [1, 2, 0.5], size: [0.6, 8.5, 0.6], pivot: [1, 4, 0.5], rotation: [-12, 0, 8], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 20. iced_milk_coffee
  {
    asset_name: "iced_milk_coffee",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Glass cup
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 7.5, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 7.5, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 7.5, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 7.5, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Condensed milk bottom layer
          { origin: [-2.6, 1, -2.6], size: [5.2, 1.8, 5.2], material: { color: "#FFF9C4", style: "solid" } },
          // Coffee mixed layer on top
          { origin: [-2.6, 2.8, -2.6], size: [5.2, 4, 5.2], material: { color: "#3E2723", style: "shaded" } },
          // Ice cubes
          { origin: [-1.5, 4.5, -1.5], size: [2, 2.2, 2], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [0, 5, -0.2], size: [1.8, 2, 1.8], material: { color: "#E0F7FA", style: "solid" } },
          // Tilted straw
          { origin: [-0.4, 1.5, -0.4], size: [0.8, 9, 0.8], pivot: [0, 4, 0], rotation: [10, 0, -12], material: { color: "#1976D2", style: "solid" } }
        ]
      }
    ]
  },

  // 21. bac_xiu
  {
    asset_name: "bac_xiu",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Glass cup
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#E0F7FA", style: "bordered" } },
          { origin: [-3.5, 1, -3.5], size: [7, 7.5, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, 2.7], size: [7, 7.5, 0.8], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [-3.5, 1, -2.7], size: [0.8, 7.5, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          { origin: [2.7, 1, -2.7], size: [0.8, 7.5, 5.4], material: { color: "#B2EBF2", style: "bordered" } },
          // Layer 1: Condensed milk bottom
          { origin: [-2.6, 1, -2.6], size: [5.2, 1.8, 5.2], material: { color: "#FFF9C4", style: "solid" } },
          // Layer 2: Fresh milk middle
          { origin: [-2.6, 2.8, -2.6], size: [5.2, 2.5, 5.2], material: { color: "#FFFFFF", style: "solid" } },
          // Layer 3: Coffee foam top
          { origin: [-2.6, 5.3, -2.6], size: [5.2, 1.8, 5.2], material: { color: "#5D4037", style: "shaded" } },
          // Ice cubes
          { origin: [-1.2, 4.5, -1.2], size: [2.4, 2.2, 2.4], material: { color: "#E0F7FA", style: "solid" } },
          // Straw
          { origin: [-0.4, 2, -0.4], size: [0.8, 8.5, 0.8], pivot: [0, 4, 0], rotation: [8, 0, 10], material: { color: "#E91E63", style: "solid" } }
        ]
      }
    ]
  },

  // 22. bubble_milk_tea
  {
    asset_name: "bubble_milk_tea",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Clear plastic cup body
          { origin: [-3.5, 0, -3.5], size: [7, 8.5, 7], material: { color: "#B2EBF2", style: "bordered" } },
          // Sealed plastic film lid with colorful rim
          { origin: [-3.8, 8.5, -3.8], size: [7.6, 0.8, 7.6], material: { color: "#E91E63", style: "bordered" } },
          // Creamy caramel milk tea liquid
          { origin: [-3.2, 1.8, -3.2], size: [6.4, 6.5, 6.4], material: { color: "#D7CCC8", style: "shaded" } },
          // Chewy black boba tapioca pearls
          { origin: [-3, 0.4, -3], size: [6, 1.8, 6], material: { color: "#212121", style: "shaded" } },
          // Wide boba straw pierced through lid
          { origin: [-0.6, 1, -0.6], size: [1.2, 10.5, 1.2], pivot: [0, 6, 0], rotation: [10, 0, -8], material: { color: "#FFB300", style: "solid" } }
        ]
      }
    ]
  },

  // 23. vnd_10000
  {
    asset_name: "vnd_10000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Polymer yellow-brown banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#C5A059", style: "bordered" } },
          // Clear transparent oval security window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Greenish security patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#8D6E63", style: "solid" } }
        ]
      }
    ]
  },

  // 24. vnd_20000
  {
    asset_name: "vnd_20000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Vibrant ocean blue banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#1E88E5", style: "bordered" } },
          // Transparent window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Cha Cu motif patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#0D47A1", style: "solid" } }
        ]
      }
    ]
  },

  // 25. vnd_50000
  {
    asset_name: "vnd_50000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Lavender pink-purple banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#AB47BC", style: "bordered" } },
          // Transparent window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Nghnh Lng nh motif patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#7B1FA2", style: "solid" } }
        ]
      }
    ]
  },

  // 26. vnd_100000
  {
    asset_name: "vnd_100000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Forest green banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#2E7D32", style: "bordered" } },
          // Transparent window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Vn Miu motif patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#1B5E20", style: "solid" } }
        ]
      }
    ]
  },

  // 27. vnd_200000
  {
    asset_name: "vnd_200000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Ruby reddish-brown banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#C2185B", style: "bordered" } },
          // Transparent window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Vnh H Long motif patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#880E4F", style: "solid" } }
        ]
      }
    ]
  },

  // 28. vnd_500000
  {
    asset_name: "vnd_500000",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Cyan turquoise banknote
          { origin: [-6.5, 0, -3.5], size: [13, 0.2, 7], material: { color: "#00838F", style: "bordered" } },
          // Transparent window
          { origin: [3.5, 0.2, -1.5], size: [2, 0.1, 3], material: { color: "#ECEFF1", style: "solid" } },
          // Kim Lin motif patch
          { origin: [-5.5, 0.2, -2], size: [3, 0.1, 4], material: { color: "#006064", style: "solid" } }
        ]
      }
    ]
  },

  // 29. lottery_ticket
  {
    asset_name: "lottery_ticket",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Rectangular lottery ticket paper
          { origin: [-6, 0, -3.5], size: [12, 0.2, 7], material: { color: "#FFF9C4", style: "bordered" } },
          // Top colorful header banner (X S KIN THIT)
          { origin: [-5.5, 0.2, 1.5], size: [11, 0.1, 1.6], material: { color: "#D32F2F", style: "solid" } },
          // 6-digit lucky numbers block in bold red
          { origin: [-4, 0.2, -1], size: [8, 0.1, 1.8], material: { color: "#C62828", style: "solid" } },
          // QR / barcode security strip on side
          { origin: [4, 0.2, -3], size: [1.5, 0.1, 4], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 30. cigarette
  {
    asset_name: "cigarette",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Orange cork filter tip
          { origin: [-4, 0, -0.6], size: [2.5, 1.2, 1.2], material: { color: "#D78B45", style: "bordered" } },
          // White paper cigarette cylinder
          { origin: [-1.5, 0, -0.6], size: [6.5, 1.2, 1.2], material: { color: "#FAFAFA", style: "bordered" } },
          // Glowing red cherry ember tip
          { origin: [5, 0, -0.6], size: [0.8, 1.2, 1.2], material: { color: "#E53935", style: "solid" } },
          // Ash tip
          { origin: [5.8, 0.2, -0.4], size: [0.6, 0.8, 0.8], material: { color: "#9E9E9E", style: "solid" } }
        ]
      }
    ]
  },

  // 31. gas_lighter
  {
    asset_name: "gas_lighter",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Translucent red plastic lighter body
          { origin: [-1.5, 0, -1], size: [3, 7, 2], material: { color: "#D32F2F", style: "bordered" } },
          // Chrome windguard metal cap
          { origin: [-1.5, 7, -1], size: [3, 2.5, 2], material: { color: "#B0BEC5", style: "bordered" } },
          // Serrated spark flint wheel
          { origin: [0.2, 9.5, -0.8], size: [1.2, 1.2, 1.6], material: { color: "#455A64", style: "solid" } },
          // Red push lever button
          { origin: [-1.2, 8.8, -0.6], size: [1.2, 0.8, 1.2], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 32. broom
  {
    asset_name: "broom",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bamboo handle shaft
          { origin: [-0.5, 6, -0.5], size: [1, 14, 1], material: { color: "#C5A059", style: "bordered" } },
          // Bound straw broom panicle head
          { origin: [-3.5, 1, -1], size: [7, 5, 2], material: { color: "#D7CCC8", style: "shaded" } },
          // Splayed bottom straw bristles
          { origin: [-5, 0, -1.2], size: [10, 1.2, 2.4], material: { color: "#BCAAA4", style: "solid" } },
          // Red binding plastic twine loops
          { origin: [-3, 4.5, -1.2], size: [6, 0.8, 2.4], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-2.5, 3, -1.2], size: [5, 0.8, 2.4], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 33. plastic_broom
  {
    asset_name: "plastic_broom",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Stainless steel tubular handle
          { origin: [-0.5, 5, -0.5], size: [1, 15, 1], material: { color: "#CFD8DC", style: "bordered" } },
          // Plastic injected head collar (blue)
          { origin: [-3, 3, -1], size: [6, 2, 2], material: { color: "#1565C0", style: "bordered" } },
          // Dense synthetic split bristles (air gap slits)
          { origin: [-5.5, 0, -1.2], size: [11, 3, 2.4], material: { color: "#42A5F5", style: "shaded" } }
        ]
      }
    ]
  },

  // 34. black_plastic_bag
  {
    asset_name: "black_plastic_bag",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Bulging crinkled bag base
          { origin: [-4.5, 0, -3.5], size: [9, 5, 7], material: { color: "#212121", style: "bordered" } },
          // Knotted top neck
          { origin: [-2.5, 5, -1.5], size: [5, 2, 3], material: { color: "#1B1B1B", style: "solid" } },
          // Two tied loop handles dangling with slight rotational tilt
          { origin: [-3, 7, -1.2], size: [2, 3, 2.4], pivot: [-2, 7, 0], rotation: [0, 0, 15], material: { color: "#262626", style: "solid" } },
          { origin: [1, 7, -1.2], size: [2, 3, 2.4], pivot: [2, 7, 0], rotation: [0, 0, -15], material: { color: "#262626", style: "solid" } }
        ]
      }
    ]
  },

  // 35. mens_leather_wallet
  {
    asset_name: "mens_leather_wallet",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Folded dark brown cowhide leather wallet
          { origin: [-5, 0, -3.5], size: [10, 1.8, 7], material: { color: "#3E2723", style: "bordered" } },
          // Stitched perimeter rim
          { origin: [-4.8, 1.8, -3.3], size: [9.6, 0.4, 6.6], material: { color: "#4E342E", style: "solid" } },
          // Protruding blue credit card edges from card slots
          { origin: [-3, 1.9, 0], size: [6, 0.3, 3], material: { color: "#1565C0", style: "solid" } }
        ]
      }
    ]
  }
];

// Execution runner
async function main() {
  console.log(`Starting generation for ${models.length} Food & Daily Life models...`);
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
    items.push({ assetName: res.assetName, mode: res.mode });
  }

  console.log(`\nAll 35 models built successfully. Packaging into Addon...`);
  const addonName = "vietnam_food_daily_pack";
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

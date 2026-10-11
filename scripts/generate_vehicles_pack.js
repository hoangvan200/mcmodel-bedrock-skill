const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// Standard rideable vehicle components
const singleRiderComponents = {
  "minecraft:rideable": {
    "seat_count": 1,
    "family_types": ["player"],
    "pull_in_entities": false,
    "rider_can_interact": false,
    "seats": {
      "position": [0, 0.7, 0]
    }
  },
  "minecraft:input_ground_controlled": {},
  "minecraft:movement": {
    "value": 0.3
  }
};

const cycloComponents = {
  "minecraft:rideable": {
    "seat_count": 2,
    "family_types": ["player"],
    "pull_in_entities": false,
    "rider_can_interact": false,
    "seats": [
      { "position": [0, 0.6, 0.5] },
      { "position": [0, 0.9, -0.6] }
    ]
  },
  "minecraft:input_ground_controlled": {},
  "minecraft:movement": {
    "value": 0.22
  }
};

const handCartComponents = {
  "minecraft:rideable": {
    "seat_count": 1,
    "family_types": ["player"],
    "pull_in_entities": false,
    "rider_can_interact": false,
    "seats": {
      "position": [0, 0.6, 0]
    }
  },
  "minecraft:input_ground_controlled": {},
  "minecraft:movement": {
    "value": 0.2
  }
};

// 10 Vehicles Entities
const models = [
  // 1. Xe máy 50cc dáng Wave (wave_50cc_motorcycle)
  {
    asset_name: "wave_50cc_motorcycle",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.6, offset: [0, 0.8, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "chassis",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Underbone central frame spine (red)
          { origin: [-1.5, 6, -6], size: [3, 7, 12], material: { color: "#C62828", style: "bordered" } },
          // Engine casing (silver/charcoal)
          { origin: [-2.5, 3, -3], size: [5, 4.5, 6], material: { color: "#455A64", style: "bordered" } },
          // Footpegs & kickstand
          { origin: [-4.5, 3, -1], size: [9, 1, 1.5], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "seat",
        parent: "chassis",
        pivot: [0, 13, -3],
        cubes: [
          // Two-person contoured vinyl saddle (black)
          { origin: [-2.5, 12.5, -8], size: [5, 2.5, 12], material: { color: "#212121", style: "bordered" } },
          // Rear grab bar handle (cảng sau bạc)
          { origin: [-2.5, 13, -9.5], size: [5, 1.2, 1.8], material: { color: "#B0BEC5", style: "solid" } }
        ]
      },
      {
        name: "front_fork",
        parent: "chassis",
        pivot: [0, 14, 6],
        cubes: [
          // Front fork stanchions (angled caster rake)
          { origin: [-2, 4, 6], size: [4, 11, 2], pivot: [0, 14, 7], rotation: [-15, 0, 0], material: { color: "#90A4AE", style: "solid" } },
          // Headlight cowl mask (red/clear lens)
          { origin: [-2.5, 14, 5.5], size: [5, 4, 3], material: { color: "#C62828", style: "bordered" } },
          { origin: [-1.5, 15, 8.2], size: [3, 2.5, 0.6], material: { color: "#ECEFF1", style: "solid" } },
          // Handlebars with grips & side mirrors
          { origin: [-6, 17, 5.5], size: [12, 1.2, 1.5], material: { color: "#212121", style: "solid" } },
          { origin: [-5.5, 18.2, 5.5], size: [1.5, 2, 0.4], material: { color: "#37474F", style: "solid" } },
          { origin: [4, 18.2, 5.5], size: [1.5, 2, 0.4], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 5, 8.5],
        cubes: [
          // Front rubber tire & spoke rim
          { origin: [-1, 0, 4.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.6, 2, 6.5], size: [1.2, 6, 4], material: { color: "#CFD8DC", style: "solid" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "chassis",
        pivot: [0, 5, -8.5],
        cubes: [
          // Rear tire
          { origin: [-1, 0, -12.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.6, 2, -10.5], size: [1.2, 6, 4], material: { color: "#CFD8DC", style: "solid" } },
          // Dual rear hydraulic shock absorbers (phuộc sau)
          { origin: [-2.4, 4, -9], size: [1, 7, 1], material: { color: "#D32F2F", style: "solid" } },
          { origin: [1.4, 4, -9], size: [1, 7, 1], material: { color: "#D32F2F", style: "solid" } }
        ]
      },
      {
        name: "exhaust",
        parent: "chassis",
        pivot: [2.5, 4, -4],
        cubes: [
          // Chrome exhaust muffler pipe (ống xả bô)
          { origin: [2.2, 3, -11], size: [1.6, 2, 10], pivot: [2.5, 4, -5], rotation: [-10, 0, 0], material: { color: "#90A4AE", style: "bordered" } }
        ]
      }
    ]
  },

  // 2. Xe máy 50cc dáng Cub cổ điển (cub_50cc_motorcycle)
  {
    asset_name: "cub_50cc_motorcycle",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.6, offset: [0, 0.8, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "chassis",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Classic pressed steel step-through frame (ocean blue)
          { origin: [-1.5, 5, -5], size: [3, 8, 10], material: { color: "#1976D2", style: "bordered" } },
          // Iconic white curved leg shields (yếm trắng Super Cub)
          { origin: [-4.5, 5, 2], size: [9, 9, 3], material: { color: "#FAFAFA", style: "bordered" } },
          // Horizontal engine cylinder
          { origin: [-2, 3, 0], size: [4, 4, 5], material: { color: "#78909C", style: "solid" } }
        ]
      },
      {
        name: "seat",
        parent: "chassis",
        pivot: [0, 13, -3],
        cubes: [
          // Single-rider sprung saddle (da nâu)
          { origin: [-2.5, 12.5, -4], size: [5, 2.5, 6], material: { color: "#6D4C41", style: "bordered" } },
          // Rear chrome luggage rack (baga chở hàng kim loại phía sau)
          { origin: [-2.5, 12, -10], size: [5, 1, 6], material: { color: "#CFD8DC", style: "bordered" } }
        ]
      },
      {
        name: "front_fork",
        parent: "chassis",
        pivot: [0, 14, 5],
        cubes: [
          // Leading-link pressed steel front fork
          { origin: [-1.8, 4, 5], size: [3.6, 11, 2], material: { color: "#1976D2", style: "solid" } },
          // Round chrome teardrop headlight & speedometer
          { origin: [-2, 14, 5], size: [4, 3.5, 3], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-1.2, 14.5, 7.8], size: [2.4, 2.4, 0.5], material: { color: "#FFF9C4", style: "solid" } },
          // Vintage gull-wing handlebars with white grips
          { origin: [-5.5, 16.5, 5], size: [11, 1.2, 1.5], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [-1.5, 17.5, 5], size: [3, 1.5, 2], material: { color: "#FAFAFA", style: "solid" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 5, 7],
        cubes: [
          // Front tire & large spoke wheel
          { origin: [-1, 0, 3], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.6, 2, 5], size: [1.2, 6, 4], material: { color: "#CFD8DC", style: "solid" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "chassis",
        pivot: [0, 5, -8],
        cubes: [
          // Rear tire
          { origin: [-1, 0, -12], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.6, 2, -10], size: [1.2, 6, 4], material: { color: "#CFD8DC", style: "solid" } },
          // Fully enclosed metal chain case (hộp xích kín)
          { origin: [1.2, 3.5, -9], size: [1, 3, 7], material: { color: "#1976D2", style: "solid" } }
        ]
      },
      {
        name: "exhaust",
        parent: "chassis",
        pivot: [-2, 3, -4],
        cubes: [
          // Long straight chrome peashooter muffler
          { origin: [-2.2, 2.5, -11], size: [1.4, 1.8, 10], material: { color: "#B0BEC5", style: "bordered" } }
        ]
      }
    ]
  },

  // 3. Xe tay ga dáng Vision/Lead (scooter)
  {
    asset_name: "scooter",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.6, offset: [0, 0.8, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "chassis",
        parent: "root",
        pivot: [0, 7, 0],
        cubes: [
          // Sleek aerodynamic monocoque body (pearl white)
          { origin: [-2.5, 4, -7], size: [5, 9, 13], material: { color: "#ECEFF1", style: "bordered" } },
          // Flat step-through floorboard (sàn để chân phẳng rộng rãi)
          { origin: [-3, 3.5, 0], size: [6, 1.5, 7], material: { color: "#37474F", style: "bordered" } },
          // Plush wide two-tier saddle (yên xe ga êm ái)
          { origin: [-3, 12.5, -8], size: [6, 2.5, 12], material: { color: "#263238", style: "bordered" } },
          // Rear grab bar wing (tay dắt sau)
          { origin: [-3, 13, -9.5], size: [6, 1, 2], material: { color: "#B0BEC5", style: "solid" } }
        ]
      },
      {
        name: "front_fairing",
        parent: "chassis",
        pivot: [0, 13, 6],
        cubes: [
          // Front apron shield with integrated turn signals
          { origin: [-3, 6, 5], size: [6, 8, 3], material: { color: "#ECEFF1", style: "bordered" } },
          // Handlebar with LED headlight cluster
          { origin: [-5.5, 15, 5], size: [11, 2.5, 2.5], material: { color: "#CFD8DC", style: "bordered" } },
          { origin: [-2, 15.5, 7.3], size: [4, 1.8, 0.5], material: { color: "#FAFAFA", style: "solid" } },
          // Rearview mirrors
          { origin: [-5, 17.5, 5.5], size: [1.8, 1.8, 0.4], material: { color: "#212121", style: "solid" } },
          { origin: [3.2, 17.5, 5.5], size: [1.8, 1.8, 0.4], material: { color: "#212121", style: "solid" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fairing",
        pivot: [0, 4.5, 7],
        cubes: [
          // Cast aluminum 5-spoke front wheel
          { origin: [-1.2, 0, 3], size: [2.4, 9, 8], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "chassis",
        pivot: [0, 4.5, -8],
        cubes: [
          // Enclosed CVT transmission & rear wheel
          { origin: [-1.2, 0, -12], size: [2.4, 9, 8], material: { color: "#212121", style: "bordered" } },
          // Chunky side exhaust muffler with heat shield
          { origin: [2.6, 2.5, -11], size: [1.8, 3.5, 9], material: { color: "#37474F", style: "bordered" } }
        ]
      }
    ]
  },

  // 4. Xe ôm công nghệ Grab (green_tech_motorbike_taxi)
  {
    asset_name: "green_tech_motorbike_taxi",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.8, offset: [0, 0.9, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "chassis",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Black motorcycle underbone frame
          { origin: [-1.5, 6, -6], size: [3, 7, 12], material: { color: "#212121", style: "bordered" } },
          // Seat
          { origin: [-2.5, 12.5, -8], size: [5, 2.5, 12], material: { color: "#1B1B1B", style: "bordered" } },
          // Grab thermal delivery box mounted on rear rack (hộp giao hàng Grab xanh lá cây)
          { origin: [-3.5, 14.5, -10], size: [7, 7, 7], material: { color: "#00B14F", style: "bordered" } },
          // Grab white logo horizontal band
          { origin: [-3.6, 17, -9.5], size: [7.2, 2, 6], material: { color: "#FFFFFF", style: "solid" } }
        ]
      },
      {
        name: "front_fork",
        parent: "chassis",
        pivot: [0, 14, 6],
        cubes: [
          { origin: [-2, 4, 6], size: [4, 11, 2], pivot: [0, 14, 7], rotation: [-15, 0, 0], material: { color: "#00B14F", style: "solid" } },
          { origin: [-6, 17, 5.5], size: [12, 1.2, 1.5], material: { color: "#212121", style: "solid" } },
          // Smartphone holder mounted on handlebar (giá kẹp điện thoại xem bản đồ)
          { origin: [-1, 18, 5.8], size: [2, 3, 0.5], material: { color: "#1E88E5", style: "solid" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 5, 8.5],
        cubes: [
          { origin: [-1, 0, 4.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "chassis",
        pivot: [0, 5, -8.5],
        cubes: [
          { origin: [-1, 0, -12.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } }
        ]
      }
    ]
  },

  // 5. Xe ôm công nghệ Be (yellow_tech_motorbike_taxi)
  {
    asset_name: "yellow_tech_motorbike_taxi",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.8, offset: [0, 0.9, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "chassis",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Blue & yellow motorcycle frame
          { origin: [-1.5, 6, -6], size: [3, 7, 12], material: { color: "#0D47A1", style: "bordered" } },
          // Seat
          { origin: [-2.5, 12.5, -8], size: [5, 2.5, 12], material: { color: "#1B1B1B", style: "bordered" } },
          // Be thermal delivery backpack/box in bright yellow with navy blue accents
          { origin: [-3.5, 14.5, -10], size: [7, 7, 7], material: { color: "#FFD600", style: "bordered" } },
          // Be navy blue stripe
          { origin: [-3.6, 17, -9.5], size: [7.2, 2, 6], material: { color: "#0D47A1", style: "solid" } }
        ]
      },
      {
        name: "front_fork",
        parent: "chassis",
        pivot: [0, 14, 6],
        cubes: [
          { origin: [-2, 4, 6], size: [4, 11, 2], pivot: [0, 14, 7], rotation: [-15, 0, 0], material: { color: "#FFD600", style: "solid" } },
          { origin: [-6, 17, 5.5], size: [12, 1.2, 1.5], material: { color: "#212121", style: "solid" } },
          // Phone mount
          { origin: [-1, 18, 5.8], size: [2, 3, 0.5], material: { color: "#1E88E5", style: "solid" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 5, 8.5],
        cubes: [
          { origin: [-1, 0, 4.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "chassis",
        pivot: [0, 5, -8.5],
        cubes: [
          { origin: [-1, 0, -12.5], size: [2, 10, 8], material: { color: "#212121", style: "bordered" } }
        ]
      }
    ]
  },

  // 6. Xe đạp (bicycle)
  {
    asset_name: "bicycle",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.8, height: 1.6, offset: [0, 0.8, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "frame",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Slender blue steel diamond frame tubes
          { origin: [-0.6, 5, -4], size: [1.2, 8, 1], pivot: [0, 8, -4], rotation: [-20, 0, 0], material: { color: "#1976D2", style: "solid" } },
          { origin: [-0.6, 5, -4], size: [1.2, 1, 9], material: { color: "#1976D2", style: "solid" } },
          { origin: [-0.6, 11, -4], size: [1.2, 1, 9], material: { color: "#1976D2", style: "solid" } },
          // Pedals & crank axle
          { origin: [-2.5, 4.5, -4.5], size: [5, 1, 1], material: { color: "#424242", style: "solid" } },
          // Spring saddle (yên xe đạp)
          { origin: [-2, 13.5, -5.5], size: [4, 1.8, 5], material: { color: "#212121", style: "bordered" } },
          // Rear luggage carrier (gác-ba-ga)
          { origin: [-2, 11.5, -11], size: [4, 0.8, 6], material: { color: "#CFD8DC", style: "solid" } }
        ]
      },
      {
        name: "front_fork",
        parent: "frame",
        pivot: [0, 13, 5],
        cubes: [
          // Fork
          { origin: [-1, 5, 5], size: [2, 10, 1.2], pivot: [0, 13, 5], rotation: [-12, 0, 0], material: { color: "#1976D2", style: "solid" } },
          // Handlebars
          { origin: [-5.5, 15.5, 4.5], size: [11, 1, 1.2], material: { color: "#CFD8DC", style: "solid" } },
          // Signature plastic front basket (giỏ xe nhựa xanh có nan hở)
          { origin: [-3, 11, 6], size: [6, 4, 4], material: { color: "#42A5F5", style: "bordered" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 5, 6.5],
        cubes: [
          // Thin bicycle wheel
          { origin: [-0.6, 0, 1.5], size: [1.2, 10, 10], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.4, 2, 3.5], size: [0.8, 6, 6], material: { color: "#CFD8DC", style: "solid" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "frame",
        pivot: [0, 5, -8.5],
        cubes: [
          { origin: [-0.6, 0, -13.5], size: [1.2, 10, 10], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.4, 2, -11.5], size: [0.8, 6, 6], material: { color: "#CFD8DC", style: "solid" } }
        ]
      }
    ]
  },

  // 7. Xe đạp điện (electric_bicycle)
  {
    asset_name: "electric_bicycle",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 1.8, height: 1.6, offset: [0, 0.8, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "frame",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Low step-through steel frame (red)
          { origin: [-1.2, 4, -4], size: [2.4, 7, 8], material: { color: "#D32F2F", style: "bordered" } },
          // Battery pack box under seat (bình ắc-quy)
          { origin: [-2, 5, -4], size: [4, 6, 4], material: { color: "#263238", style: "bordered" } },
          // Seat
          { origin: [-2, 12, -4], size: [4, 2, 5], material: { color: "#212121", style: "bordered" } },
          // Small rear passenger cushion seat
          { origin: [-1.8, 10.5, -9], size: [3.6, 1.5, 4], material: { color: "#424242", style: "solid" } }
        ]
      },
      {
        name: "front_fork",
        parent: "frame",
        pivot: [0, 13, 5],
        cubes: [
          { origin: [-1.2, 4, 4.5], size: [2.4, 10, 1.5], pivot: [0, 13, 5], rotation: [-12, 0, 0], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-5.5, 15, 4], size: [11, 1, 1.2], material: { color: "#212121", style: "solid" } },
          // Front LED lamp & small basket
          { origin: [-2.5, 10.5, 5], size: [5, 3.5, 3.5], material: { color: "#37474F", style: "bordered" } }
        ]
      },
      {
        name: "front_wheel",
        parent: "front_fork",
        pivot: [0, 4.5, 6],
        cubes: [
          { origin: [-0.8, 0, 1.5], size: [1.6, 9, 9], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "frame",
        pivot: [0, 4.5, -8],
        cubes: [
          // Rear wheel with hub motor drum
          { origin: [-0.8, 0, -12.5], size: [1.6, 9, 9], material: { color: "#212121", style: "bordered" } },
          { origin: [-1.2, 2, -10.5], size: [2.4, 5, 5], material: { color: "#455A64", style: "solid" } }
        ]
      }
    ]
  },

  // 8. Xe xích lô (cyclo)
  {
    asset_name: "cyclo",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2.2, height: 2, offset: [0, 1, 0] },
    components: cycloComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "frame",
        parent: "root",
        pivot: [0, 8, 0],
        cubes: [
          // Rear bicycle half (khung xe đạp phía sau cho bác tài xế)
          { origin: [-0.8, 4, -9], size: [1.6, 9, 8], material: { color: "#37474F", style: "bordered" } },
          // Driver saddle (yên đạp)
          { origin: [-2, 13.5, -9], size: [4, 1.8, 4], material: { color: "#212121", style: "bordered" } },
          // Pedals & crank
          { origin: [-2.5, 3.5, -7], size: [5, 1, 1], material: { color: "#CFD8DC", style: "solid" } }
        ]
      },
      {
        name: "rear_wheel",
        parent: "frame",
        pivot: [0, 6, -14],
        cubes: [
          // Rear single wheel
          { origin: [-0.8, 0, -19], size: [1.6, 12, 10], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "passenger_carriage",
        parent: "frame",
        pivot: [0, 8, 3],
        cubes: [
          // Front passenger carriage seat chassis (thùng xe chở khách phía trước)
          { origin: [-5.5, 4, 0], size: [11, 2, 9], material: { color: "#1976D2", style: "bordered" } },
          // Cushioned seat bench (đệm ghế nệm bọc da cho 2 người ngồi)
          { origin: [-5, 6, 1], size: [10, 2.5, 5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-5, 8.5, 1], size: [10, 5, 1.2], material: { color: "#D32F2F", style: "bordered" } },
          // Footrest footplate (chỗ để chân phía trước)
          { origin: [-4.5, 3, 7], size: [9, 1, 3], material: { color: "#263238", style: "solid" } },
          // Canvas folding canopy roof (mái che bạt gập phía trên)
          { origin: [-5.5, 15, -1], size: [11, 1.5, 9], material: { color: "#FBC02D", style: "bordered" } },
          { origin: [-5.5, 10, -1.2], size: [0.8, 6, 1.2], material: { color: "#37474F", style: "solid" } },
          { origin: [4.7, 10, -1.2], size: [0.8, 6, 1.2], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "front_left_wheel",
        parent: "passenger_carriage",
        pivot: [6.5, 7, 4],
        cubes: [
          // Large carriage wheel left
          { origin: [6, 0, -2], size: [1.4, 14, 12], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "front_right_wheel",
        parent: "passenger_carriage",
        pivot: [-6.5, 7, 4],
        cubes: [
          // Large carriage wheel right
          { origin: [-7.4, 0, -2], size: [1.4, 14, 12], material: { color: "#212121", style: "bordered" } }
        ]
      }
    ]
  },

  // 9. Xe ba gác (three_wheel_cargo_bike)
  {
    asset_name: "three_wheel_cargo_bike",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2.5, height: 1.8, offset: [0, 0.9, 0] },
    components: singleRiderComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "front_bike",
        parent: "root",
        pivot: [0, 8, 4],
        cubes: [
          // Front motorcycle cabin & engine
          { origin: [-1.8, 5, 2], size: [3.6, 7, 6], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-2, 12, 1], size: [4, 2, 4], material: { color: "#212121", style: "bordered" } },
          // Handlebars
          { origin: [-6, 16, 5], size: [12, 1.2, 1.5], material: { color: "#212121", style: "solid" } },
          // Front steering fork & wheel
          { origin: [-1.2, 0, 6], size: [2.4, 10, 8], material: { color: "#212121", style: "bordered" } }
        ]
      },
      {
        name: "cargo_bed",
        parent: "root",
        pivot: [0, 6, -6],
        cubes: [
          // Heavy steel cargo flatbed with drop-sides (thùng sắt chở hàng)
          { origin: [-7, 4, -15], size: [14, 1.5, 14], material: { color: "#1E88E5", style: "bordered" } },
          // Drop-side walls (thành thùng)
          { origin: [-7, 5.5, -15], size: [1, 6, 14], material: { color: "#1565C0", style: "bordered" } },
          { origin: [6, 5.5, -15], size: [1, 6, 14], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-6, 5.5, -15], size: [12, 6, 1], material: { color: "#1565C0", style: "bordered" } },
          // Rear dual wheels
          { origin: [-8.5, 0, -11], size: [2, 8, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [6.5, 0, -11], size: [2, 8, 8], material: { color: "#212121", style: "bordered" } }
        ]
      }
    ]
  },

  // 10. Xe thu gom rác đẩy tay (hand_pushed_garbage_cart)
  {
    asset_name: "hand_pushed_garbage_cart",
    mode: "entity",
    generate_texture: true,
    visible_bounds: { width: 2, height: 1.5, offset: [0, 0.75, 0] },
    components: handCartComponents,
    bones: [
      { name: "root", pivot: [0, 0, 0], cubes: [] },
      {
        name: "hopper_bin",
        parent: "root",
        pivot: [0, 6, 0],
        cubes: [
          // Galvanized sheet metal hopper bin (thùng tôn thu gom rác)
          { origin: [-6, 3, -6], size: [12, 8, 12], material: { color: "#B0BEC5", style: "bordered" } },
          // Reinforcing rim border
          { origin: [-6.5, 10.5, -6.5], size: [13, 1, 13], material: { color: "#78909C", style: "solid" } },
          // Tubular steel push handle frame at rear
          { origin: [-6.5, 8, -9], size: [1, 6, 3], material: { color: "#37474F", style: "solid" } },
          { origin: [5.5, 8, -9], size: [1, 6, 3], material: { color: "#37474F", style: "solid" } },
          { origin: [-6.5, 13.5, -9], size: [13, 1, 1], material: { color: "#D32F2F", style: "solid" } },
          // Front swivel resting foot skid
          { origin: [-1, 0.5, 5], size: [2, 2.5, 1.5], material: { color: "#37474F", style: "solid" } }
        ]
      },
      {
        name: "wheels",
        parent: "hopper_bin",
        pivot: [0, 4, -1],
        cubes: [
          // Large rubber side wheels
          { origin: [-7.8, 0, -4], size: [1.6, 8, 8], material: { color: "#212121", style: "bordered" } },
          { origin: [6.2, 0, -4], size: [1.6, 8, 8], material: { color: "#212121", style: "bordered" } },
          // Center axle
          { origin: [-8, 3.5, -0.5], size: [16, 1, 1], material: { color: "#CFD8DC", style: "solid" } }
        ]
      }
    ]
  }
];

// Execution runner
async function main() {
  console.log(`Starting generation for ${models.length} Vehicle Entities...`);
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

  console.log(`\nAll 10 Vehicle entities built successfully. Packaging into Addon...`);
  const addonName = "vietnam_vehicles_pack";
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

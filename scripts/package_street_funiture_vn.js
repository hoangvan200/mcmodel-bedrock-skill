const fs = require('fs');
const path = require('path');
const { packageAddon } = require('../src/addon_builder.js');

const entityList = [
  // 5 Infrastructure entities
  "square_concrete_utility_pole",
  "round_concrete_utility_pole",
  "led_street_light",
  "vintage_incandescent_street_light",
  "traffic_light_pole",
  // 10 Vehicle entities
  "wave_50cc_motorcycle",
  "cub_50cc_motorcycle",
  "scooter",
  "green_tech_motorbike_taxi",
  "yellow_tech_motorbike_taxi",
  "bicycle",
  "electric_bicycle",
  "cyclo",
  "three_wheel_cargo_bike",
  "hand_pushed_garbage_cart",
  // 10 Mobs & NPCs
  "vietnamese_dog",
  "tabby_cat",
  "sewer_rat",
  "cockroach",
  "pigeon",
  "street_vendor_npc",
  "xe_om_driver_npc",
  "iced_tea_trader",
  "sidewalk_mechanic_npc",
  "high_school_student_npc"
];

const singleRiderComponents = {
  "minecraft:rideable": {
    "seat_count": 1,
    "family_types": ["player"],
    "pull_in_entities": false,
    "rider_can_interact": false,
    "seats": { "position": [0, 0.7, 0] }
  },
  "minecraft:input_ground_controlled": {},
  "minecraft:movement": { "value": 0.3 }
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
  "minecraft:movement": { "value": 0.22 }
};

const handCartComponents = {
  "minecraft:rideable": {
    "seat_count": 1,
    "family_types": ["player"],
    "pull_in_entities": false,
    "rider_can_interact": false,
    "seats": { "position": [0, 0.6, 0] }
  },
  "minecraft:input_ground_controlled": {},
  "minecraft:movement": { "value": 0.2 }
};

const npcComponents = {
  "minecraft:behavior.look_at_player": { "priority": 7, "look_distance": 6, "probability": 0.02 },
  "minecraft:movement": { "value": 0.2 }
};

async function main() {
  const outputDir = path.resolve(__dirname, '..', 'output');
  const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.geo.json'));
  console.log(`Found ${files.length} geometry files in output directory.`);

  const items = [];
  for (const f of files) {
    const id = f.replace('.geo.json', '');
    const isEntity = entityList.includes(id);

    let components = undefined;
    if (id === "cyclo") components = cycloComponents;
    else if (id === "hand_pushed_garbage_cart") components = handCartComponents;
    else if ([
      "wave_50cc_motorcycle", "cub_50cc_motorcycle", "scooter",
      "green_tech_motorbike_taxi", "yellow_tech_motorbike_taxi",
      "bicycle", "electric_bicycle", "three_wheel_cargo_bike"
    ].includes(id)) {
      components = singleRiderComponents;
    } else if (id.endsWith('_npc') || id === 'iced_tea_trader') {
      components = npcComponents;
    }

    items.push({
      assetName: id,
      mode: isEntity ? "entity" : "block",
      components
    });
  }

  const addonName = "street funiture vn";
  console.log(`Packaging all ${items.length} items into single addon: "${addonName}"...`);
  const addonPath = packageAddon({
    addonName,
    items,
    outputDir
  });
  console.log(`Successfully created: ${addonPath}`);

  // Create snake_case copy as well
  const snakePath = path.join(outputDir, "street_funiture_vn.mcaddon");
  fs.copyFileSync(addonPath, snakePath);

  // Sync to plugin
  const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';
  if (fs.existsSync(pluginOutputDir)) {
    const dest1 = path.join(pluginOutputDir, "street funiture vn.mcaddon");
    const dest2 = path.join(pluginOutputDir, "street_funiture_vn.mcaddon");
    fs.copyFileSync(addonPath, dest1);
    fs.copyFileSync(addonPath, dest2);
    console.log(`Synced to plugin output directory: ${dest1}`);
  }

  // Remove old individual .mcaddon files so only the single all-in-one addon remains
  const oldAddons = [
    "vietnam_sidewalk_pack.mcaddon",
    "vietnam_infrastructure_pack.mcaddon",
    "vietnam_food_daily_pack.mcaddon",
    "vietnam_tools_accessories_pack.mcaddon",
    "vietnam_vehicles_pack.mcaddon",
    "vietnam_mobs_npcs_pack.mcaddon",
    "vietnam_mega_life_pack.mcaddon"
  ];

  for (const old of oldAddons) {
    const p1 = path.join(outputDir, old);
    if (fs.existsSync(p1)) fs.unlinkSync(p1);
    const p2 = path.join(pluginOutputDir, old);
    if (fs.existsSync(p2)) fs.unlinkSync(p2);
  }
  console.log("Cleaned up old individual .mcaddon files. Single all-in-one addon ready!");
}

main().catch(err => {
  console.error("Packaging failed:", err);
  process.exit(1);
});

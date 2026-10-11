const fs = require('fs');
const path = require('path');
const { packageAddon } = require('../src/addon_builder.js');

const foodItems = [
  "banh_mi_thit", "plain_banh_mi", "bowl_of_pho_bo", "bowl_of_bun_bo_hue",
  "xoi_xeo_box", "banh_bao", "banh_gio", "pork_skewer", "fish_ball_skewer",
  "beef_ball_skewer", "grilled_sausage", "grilled_corn", "grilled_sweet_potato",
  "grilled_rice_paper", "balut", "iced_tea_glass", "nhan_tran_glass",
  "sugarcane_juice_glass", "iced_black_coffee", "iced_milk_coffee", "bac_xiu",
  "bubble_milk_tea", "vnd_10000", "vnd_20000", "vnd_50000", "vnd_100000",
  "vnd_200000", "vnd_500000", "lottery_ticket", "cigarette", "gas_lighter",
  "broom", "plastic_broom", "black_plastic_bag", "mens_leather_wallet"
].map(id => ({ assetName: id, mode: "block" }));

const toolItems = [
  "motorcycle_key", "half_face_helmet", "three_quarter_helmet",
  "disposable_raincoat", "batwing_raincoat", "wrench_10mm",
  "phillips_screwdriver", "mini_hand_pump", "tire_patch", "drivers_license"
].map(id => ({ assetName: id, mode: "block" }));

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

const vehicleItems = [
  { assetName: "wave_50cc_motorcycle", mode: "entity", components: singleRiderComponents },
  { assetName: "cub_50cc_motorcycle", mode: "entity", components: singleRiderComponents },
  { assetName: "scooter", mode: "entity", components: singleRiderComponents },
  { assetName: "green_tech_motorbike_taxi", mode: "entity", components: singleRiderComponents },
  { assetName: "yellow_tech_motorbike_taxi", mode: "entity", components: singleRiderComponents },
  { assetName: "bicycle", mode: "entity", components: singleRiderComponents },
  { assetName: "electric_bicycle", mode: "entity", components: singleRiderComponents },
  { assetName: "cyclo", mode: "entity", components: cycloComponents },
  { assetName: "three_wheel_cargo_bike", mode: "entity", components: singleRiderComponents },
  { assetName: "hand_pushed_garbage_cart", mode: "entity", components: singleRiderComponents }
];

const npcComponents = {
  "minecraft:behavior.look_at_player": { "priority": 7, "look_distance": 6, "probability": 0.02 },
  "minecraft:movement": { "value": 0.2 }
};

const mobItems = [
  { assetName: "vietnamese_dog", mode: "entity", components: { "minecraft:movement": { "value": 0.25 } } },
  { assetName: "tabby_cat", mode: "entity", components: { "minecraft:movement": { "value": 0.25 } } },
  { assetName: "sewer_rat", mode: "entity", components: { "minecraft:movement": { "value": 0.25 } } },
  { assetName: "cockroach", mode: "entity", components: { "minecraft:movement": { "value": 0.2 } } },
  { assetName: "pigeon", mode: "entity", components: { "minecraft:movement": { "value": 0.2 } } },
  { assetName: "street_vendor_npc", mode: "entity", components: npcComponents },
  { assetName: "xe_om_driver_npc", mode: "entity", components: npcComponents },
  { assetName: "iced_tea_trader", mode: "entity", components: npcComponents },
  { assetName: "sidewalk_mechanic_npc", mode: "entity", components: npcComponents },
  { assetName: "high_school_student_npc", mode: "entity", components: npcComponents }
];

const allItems = [...foodItems, ...toolItems, ...vehicleItems, ...mobItems];

async function main() {
  console.log(`Packaging Mega Pack with ${allItems.length} models...`);
  const outputDir = path.resolve(__dirname, '..', 'output');
  const addonName = "vietnam_mega_life_pack";
  const addonPath = packageAddon({
    addonName,
    items: allItems,
    outputDir
  });
  console.log(`Mega Addon created at: ${addonPath}`);

  // Sync to plugin
  const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';
  if (fs.existsSync(pluginOutputDir)) {
    const dest = path.join(pluginOutputDir, `${addonName}.mcaddon`);
    fs.copyFileSync(addonPath, dest);
    console.log(`Synced ${addonName}.mcaddon to plugin output directory!`);
  }
}

main().catch(err => {
  console.error("Packaging failed:", err);
  process.exit(1);
});

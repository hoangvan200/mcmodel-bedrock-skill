const fs = require('fs');
const path = require('path');
const { packageAddon } = require('../src/addon_builder.js');

const workspaceOut = path.resolve(__dirname, '../output');
const oldModelDir = path.join(workspaceOut, 'old model');
const pluginOut = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';

console.log('=== STEP 1: RESTORING USER-EDITED 8.5/10 MODELS FROM "output/old model" ===');

// List of sidewalk furniture models that the user personally refined or scaled
const userEditedModels = [
  'aluminum_kettle',
  'bamboo_tray',
  'bamboo_water_pipe',
  'banh_mi_cart',
  'beverage_branded_umbrella',
  'chalkboard_sidewalk_sign',
  'charcoal_grill_with_smoke',
  'closed_canvas_umbrella',
  'closed_styrofoam_cooler',
  'condiment_tray',
  'copper_wrapped_water_pipe',
  'folding_stainless_table',
  'fried_fish_ball_cart',
  'glass_food_cabinet',
  'high_plastic_chair',
  'high_plastic_table',
  'hu_tieu_cart',
  'illuminated_light_box_sign',
  'lit_honeycomb_coal_stove',
  'low_plastic_chair',
  'low_plastic_table',
  'open_canvas_umbrella',
  'open_styrofoam_cooler',
  'placed_iced_tea_glass',
  'plastic_chopstick_holder',
  'plastic_vegetable_basket',
  'rang_dong_thermos',
  'sidewalk_tarp',
  'small_plastic_trash_bin',
  'standing_industrial_fan',
  'sugarcane_juice_cart',
  'toilet_paper_roll_napkin',
  'unlit_honeycomb_coal_stove',
  'vintage_elephant_ear_fan',
  'wooden_stool'
];

let restoredCount = 0;
userEditedModels.forEach(name => {
  const oldGeo = path.join(oldModelDir, `${name}.geo.json`);
  const oldPng = path.join(oldModelDir, `${name}.png`);
  const destGeo = path.join(workspaceOut, `${name}.geo.json`);
  const destPng = path.join(workspaceOut, `${name}.png`);

  if (fs.existsSync(oldGeo)) {
    fs.copyFileSync(oldGeo, destGeo);
    restoredCount++;
  }
  if (fs.existsSync(oldPng)) {
    fs.copyFileSync(oldPng, destPng);
  }
});
console.log(`Successfully restored ${restoredCount} hand-crafted models & high-res textures from 'old model/' to 'output/'!`);

console.log('\n=== STEP 2: FIXING ENTITY FORWARD ROTATION (180 DEG Y ROTATION) ===');

// All 25 entities that must face North (-Z)
const allEntityNames = [
  // 10 Vehicles
  'wave_50cc_motorcycle',
  'cub_50cc_motorcycle',
  'scooter',
  'green_tech_motorbike_taxi',
  'yellow_tech_motorbike_taxi',
  'bicycle',
  'electric_bicycle',
  'cyclo',
  'three_wheel_cargo_bike',
  'hand_pushed_garbage_cart',
  // 10 Mobs & NPCs
  'vietnamese_dog',
  'tabby_cat',
  'sewer_rat',
  'cockroach',
  'pigeon',
  'street_vendor_npc',
  'xe_om_driver_npc',
  'iced_tea_trader',
  'sidewalk_mechanic_npc',
  'high_school_student_npc',
  // 5 Infrastructure Entities
  'square_concrete_utility_pole',
  'round_concrete_utility_pole',
  'led_street_light',
  'vintage_incandescent_street_light',
  'traffic_light_pole'
];

allEntityNames.forEach(name => {
  const p = path.join(workspaceOut, `${name}.geo.json`);
  if (!fs.existsSync(p)) return;

  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  const geom = data['minecraft:geometry'][0];
  const bones = geom.bones || [];
  const root = bones.find(b => b.name === 'root');

  if (root) {
    root.rotation = [0, 180, 0];
    root.pivot = [0, 0, 0];
  } else {
    // If no root, create one
    bones.unshift({
      name: 'root',
      pivot: [0, 0, 0],
      rotation: [0, 180, 0]
    });
  }

  fs.writeFileSync(p, JSON.stringify(data, null, '\t'));
});
console.log(`Applied [0, 180, 0] rotation to root bones of all ${allEntityNames.length} entities!`);

console.log('\n=== STEP 3: DEFINING COMPREHENSIVE BEHAVIOR CONFIGURATIONS FOR ENTITIES ===');

const entityConfigurations = {
  // --- VEHICLES ---
  'wave_50cc_motorcycle': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.8, "height": 1.2 },
    "minecraft:health": { "value": 50, "max": 50 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.35 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.75, 0] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'cub_50cc_motorcycle': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.8, "height": 1.2 },
    "minecraft:health": { "value": 50, "max": 50 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.32 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.72, 0] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'scooter': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.85, "height": 1.2 },
    "minecraft:health": { "value": 50, "max": 50 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.35 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.75, 0] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'green_tech_motorbike_taxi': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.8, "height": 1.2 },
    "minecraft:health": { "value": 50, "max": 50 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.35 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 2,
      "family_types": ["player", "human", "villager"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": [
        { "position": [0, 0.75, -0.2] },
        { "position": [0, 0.85, 0.4] }
      ]
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'yellow_tech_motorbike_taxi': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.8, "height": 1.2 },
    "minecraft:health": { "value": 50, "max": 50 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.35 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 2,
      "family_types": ["player", "human", "villager"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": [
        { "position": [0, 0.75, -0.2] },
        { "position": [0, 0.85, 0.4] }
      ]
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'bicycle': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.7, "height": 1.1 },
    "minecraft:health": { "value": 30, "max": 30 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.25 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.75, 0] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'electric_bicycle': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.75, "height": 1.15 },
    "minecraft:health": { "value": 40, "max": 40 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.30 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.75, 0] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'cyclo': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 1.4, "height": 1.3 },
    "minecraft:health": { "value": 60, "max": 60 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.22 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 2,
      "family_types": ["player", "human", "villager"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": [
        { "position": [0, 0.65, -0.5] },
        { "position": [0, 0.95, 0.6] }
      ]
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'three_wheel_cargo_bike': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 1.4, "height": 1.3 },
    "minecraft:health": { "value": 60, "max": 60 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.25 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.8, -0.4] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'hand_pushed_garbage_cart': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 1.2, "height": 1.1 },
    "minecraft:health": { "value": 40, "max": 40 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["inanimate", "vehicle", "rideable"] },
    "minecraft:movement": { "value": 0.20 },
    "minecraft:movement.basic": {},
    "minecraft:can_climb": {},
    "minecraft:jump.static": { "jump_power": 0.42 },
    "minecraft:rideable": {
      "seat_count": 1,
      "family_types": ["player"],
      "pull_in_entities": false,
      "rider_can_interact": false,
      "seats": { "position": [0, 0.6, 0.4] }
    },
    "minecraft:input_ground_controlled": {},
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },

  // --- NPCS ---
  'street_vendor_npc': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 1.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["npc", "mob", "human", "villager"] },
    "minecraft:movement": { "value": 0.2 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "is_amphibious": false, "can_pass_doors": true, "can_open_doors": true },
    "minecraft:behavior.look_at_player": { "priority": 1, "look_distance": 8.0, "probability": 0.5 },
    "minecraft:behavior.random_look_around": { "priority": 2 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 0.6 },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:interact": {
      "interactions": [{
        "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" } },
        "use_item": false,
        "play_sounds": "mob.villager.idle",
        "interact_text": "action.interact.trade"
      }]
    },
    "minecraft:nameable": { "always_show": false },
    "minecraft:persistent": {}
  },
  'xe_om_driver_npc': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 1.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["npc", "mob", "human", "villager"] },
    "minecraft:movement": { "value": 0.2 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "is_amphibious": false, "can_pass_doors": true, "can_open_doors": true },
    "minecraft:behavior.look_at_player": { "priority": 1, "look_distance": 8.0, "probability": 0.5 },
    "minecraft:behavior.random_look_around": { "priority": 2 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 0.6 },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:interact": {
      "interactions": [{
        "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" } },
        "use_item": false,
        "play_sounds": "mob.villager.idle",
        "interact_text": "action.interact.trade"
      }]
    },
    "minecraft:nameable": { "always_show": false },
    "minecraft:persistent": {}
  },
  'iced_tea_trader': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 1.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["npc", "mob", "human", "villager"] },
    "minecraft:movement": { "value": 0.2 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "is_amphibious": false, "can_pass_doors": true, "can_open_doors": true },
    "minecraft:behavior.look_at_player": { "priority": 1, "look_distance": 8.0, "probability": 0.5 },
    "minecraft:behavior.random_look_around": { "priority": 2 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 0.6 },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:interact": {
      "interactions": [{
        "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" } },
        "use_item": false,
        "play_sounds": "mob.villager.idle",
        "interact_text": "action.interact.trade"
      }]
    },
    "minecraft:nameable": { "always_show": false },
    "minecraft:persistent": {}
  },
  'sidewalk_mechanic_npc': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 1.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["npc", "mob", "human", "villager"] },
    "minecraft:movement": { "value": 0.2 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "is_amphibious": false, "can_pass_doors": true, "can_open_doors": true },
    "minecraft:behavior.look_at_player": { "priority": 1, "look_distance": 8.0, "probability": 0.5 },
    "minecraft:behavior.random_look_around": { "priority": 2 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 0.6 },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:interact": {
      "interactions": [{
        "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" } },
        "use_item": false,
        "play_sounds": "mob.villager.idle",
        "interact_text": "action.interact.trade"
      }]
    },
    "minecraft:nameable": { "always_show": false },
    "minecraft:persistent": {}
  },
  'high_school_student_npc': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 1.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["npc", "mob", "human", "villager"] },
    "minecraft:movement": { "value": 0.22 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "is_amphibious": false, "can_pass_doors": true, "can_open_doors": true },
    "minecraft:behavior.look_at_player": { "priority": 1, "look_distance": 8.0, "probability": 0.5 },
    "minecraft:behavior.random_look_around": { "priority": 2 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 0.7 },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:interact": {
      "interactions": [{
        "on_interact": { "filters": { "test": "is_family", "subject": "other", "value": "player" } },
        "use_item": false,
        "play_sounds": "mob.villager.idle",
        "interact_text": "action.interact.trade"
      }]
    },
    "minecraft:nameable": { "always_show": false },
    "minecraft:persistent": {}
  },

  // --- ANIMALS & CRITTERS ---
  'vietnamese_dog': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.6, "height": 0.8 },
    "minecraft:health": { "value": 20, "max": 20 },
    "minecraft:type_family": { "family": ["dog", "canine", "mob", "animal"] },
    "minecraft:movement": { "value": 0.3 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "can_walk": true },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.25 },
    "minecraft:behavior.tempt": { "priority": 4, "speed_multiplier": 1.0, "items": ["porkchop", "beef", "chicken", "bone"] },
    "minecraft:behavior.random_stroll": { "priority": 6, "speed_multiplier": 0.8 },
    "minecraft:behavior.look_at_player": { "priority": 7, "look_distance": 6.0 },
    "minecraft:behavior.random_look_around": { "priority": 8 },
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'tabby_cat': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.5, "height": 0.6 },
    "minecraft:health": { "value": 10, "max": 10 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["cat", "mob", "animal"] },
    "minecraft:movement": { "value": 0.3 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "can_walk": true },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.4 },
    "minecraft:behavior.tempt": { "priority": 3, "speed_multiplier": 1.0, "items": ["fish", "salmon", "cod"] },
    "minecraft:behavior.random_stroll": { "priority": 5, "speed_multiplier": 0.8 },
    "minecraft:behavior.look_at_player": { "priority": 6, "look_distance": 6.0 },
    "minecraft:behavior.random_look_around": { "priority": 7 },
    "minecraft:nameable": {},
    "minecraft:persistent": {}
  },
  'sewer_rat': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.4, "height": 0.3 },
    "minecraft:health": { "value": 6, "max": 6 },
    "minecraft:type_family": { "family": ["rodent", "mob", "animal"] },
    "minecraft:movement": { "value": 0.28 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "can_walk": true },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.5 },
    "minecraft:behavior.random_stroll": { "priority": 4, "speed_multiplier": 1.0 },
    "minecraft:nameable": {}
  },
  'cockroach': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.3, "height": 0.15 },
    "minecraft:health": { "value": 2, "max": 2 },
    "minecraft:type_family": { "family": ["arthropod", "mob"] },
    "minecraft:movement": { "value": 0.32 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "can_walk": true },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.6 },
    "minecraft:behavior.random_stroll": { "priority": 3, "speed_multiplier": 1.2 }
  },
  'pigeon': {
    "minecraft:physics": { "has_gravity": true, "has_collision": true },
    "minecraft:pushable": { "is_pushable": true, "is_pushable_by_piston": true },
    "minecraft:collision_box": { "width": 0.4, "height": 0.5 },
    "minecraft:health": { "value": 6, "max": 6 },
    "minecraft:damage_sensor": { "triggers": [{ "cause": "fall", "deals_damage": false }] },
    "minecraft:type_family": { "family": ["bird", "mob", "animal"] },
    "minecraft:movement": { "value": 0.22 },
    "minecraft:movement.basic": {},
    "minecraft:navigation.walk": { "can_walk": true },
    "minecraft:behavior.panic": { "priority": 1, "speed_multiplier": 1.5 },
    "minecraft:behavior.random_stroll": { "priority": 5, "speed_multiplier": 0.8 },
    "minecraft:behavior.look_at_player": { "priority": 6, "look_distance": 5.0 },
    "minecraft:nameable": {}
  },

  // --- INFRASTRUCTURE ENTITIES ---
  'square_concrete_utility_pole': {
    "minecraft:physics": { "has_gravity": false, "has_collision": true },
    "minecraft:pushable": { "is_pushable": false, "is_pushable_by_piston": false },
    "minecraft:collision_box": { "width": 1.0, "height": 4.5 },
    "minecraft:health": { "value": 100, "max": 100 },
    "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": false } },
    "minecraft:knockback_resistance": { "value": 1.0 },
    "minecraft:type_family": { "family": ["inanimate", "furniture", "infrastructure"] },
    "minecraft:persistent": {}
  },
  'round_concrete_utility_pole': {
    "minecraft:physics": { "has_gravity": false, "has_collision": true },
    "minecraft:pushable": { "is_pushable": false, "is_pushable_by_piston": false },
    "minecraft:collision_box": { "width": 1.0, "height": 4.5 },
    "minecraft:health": { "value": 100, "max": 100 },
    "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": false } },
    "minecraft:knockback_resistance": { "value": 1.0 },
    "minecraft:type_family": { "family": ["inanimate", "furniture", "infrastructure"] },
    "minecraft:persistent": {}
  },
  'led_street_light': {
    "minecraft:physics": { "has_gravity": false, "has_collision": true },
    "minecraft:pushable": { "is_pushable": false, "is_pushable_by_piston": false },
    "minecraft:collision_box": { "width": 1.0, "height": 4.5 },
    "minecraft:health": { "value": 100, "max": 100 },
    "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": false } },
    "minecraft:knockback_resistance": { "value": 1.0 },
    "minecraft:type_family": { "family": ["inanimate", "furniture", "infrastructure"] },
    "minecraft:persistent": {}
  },
  'vintage_incandescent_street_light': {
    "minecraft:physics": { "has_gravity": false, "has_collision": true },
    "minecraft:pushable": { "is_pushable": false, "is_pushable_by_piston": false },
    "minecraft:collision_box": { "width": 1.0, "height": 4.5 },
    "minecraft:health": { "value": 100, "max": 100 },
    "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": false } },
    "minecraft:knockback_resistance": { "value": 1.0 },
    "minecraft:type_family": { "family": ["inanimate", "furniture", "infrastructure"] },
    "minecraft:persistent": {}
  },
  'traffic_light_pole': {
    "minecraft:physics": { "has_gravity": false, "has_collision": true },
    "minecraft:pushable": { "is_pushable": false, "is_pushable_by_piston": false },
    "minecraft:collision_box": { "width": 1.0, "height": 4.5 },
    "minecraft:health": { "value": 100, "max": 100 },
    "minecraft:damage_sensor": { "triggers": { "cause": "all", "deals_damage": false } },
    "minecraft:knockback_resistance": { "value": 1.0 },
    "minecraft:type_family": { "family": ["inanimate", "furniture", "infrastructure"] },
    "minecraft:persistent": {}
  }
};

console.log('\n=== STEP 4: REPACKAGING MASTER "street funiture vn.mcaddon" ===');

// Build master list of all 130 items
const allModelIds = [
  // 1. Sidewalk Furniture (35)
  'low_plastic_chair',
  'high_plastic_chair',
  'low_plastic_table',
  'high_plastic_table',
  'folding_stainless_table',
  'closed_canvas_umbrella',
  'open_canvas_umbrella',
  'beverage_branded_umbrella',
  'closed_styrofoam_cooler',
  'open_styrofoam_cooler',
  'banh_mi_cart',
  'hu_tieu_cart',
  'sugarcane_juice_cart',
  'fried_fish_ball_cart',
  'glass_food_cabinet',
  'unlit_honeycomb_coal_stove',
  'lit_honeycomb_coal_stove',
  'charcoal_grill_with_smoke',
  'chalkboard_sidewalk_sign',
  'illuminated_light_box_sign',
  'sidewalk_tarp',
  'bamboo_tray',
  'plastic_vegetable_basket',
  'placed_iced_tea_glass',
  'bamboo_water_pipe',
  'copper_wrapped_water_pipe',
  'rang_dong_thermos',
  'aluminum_kettle',
  'vintage_elephant_ear_fan',
  'standing_industrial_fan',
  'condiment_tray',
  'toilet_paper_roll_napkin',
  'plastic_chopstick_holder',
  'small_plastic_trash_bin',
  'wooden_stool',

  // 2. Infrastructure & Electrical (30)
  'square_concrete_utility_pole',
  'round_concrete_utility_pole',
  'tangled_cables_on_pole',
  'hanging_power_lines',
  'electric_meter_box',
  'sidewalk_transformer_station',
  'led_street_light',
  'vintage_incandescent_street_light',
  'traffic_light_pole',
  'no_turn_sign',
  'speed_limit_sign',
  'one_way_street_sign',
  'no_parking_sign',
  'speed_bump',
  'concrete_median_barrier',
  'traffic_cone',
  'round_iron_manhole_cover',
  'square_manhole_cover',
  'drain_grate',
  'red_fire_hydrant',
  'old_public_telephone_booth',
  'hexagonal_paving_block',
  'zigzag_paving_block',
  'terrazzo_paving_tile',
  'concrete_curb',
  'solid_white_road_line',
  'dashed_yellow_road_line',
  'zebra_crossing',
  'road_stud',
  'corrugated_iron_barricade',

  // 3. Food & Daily Life (35)
  'banh_mi_thit',
  'plain_banh_mi',
  'bowl_of_pho_bo',
  'bowl_of_bun_bo_hue',
  'xoi_xeo_box',
  'banh_bao',
  'banh_gio',
  'pork_skewer',
  'fish_ball_skewer',
  'beef_ball_skewer',
  'grilled_sausage',
  'grilled_corn',
  'grilled_sweet_potato',
  'grilled_rice_paper',
  'balut',
  'iced_tea_glass',
  'nhan_tran_glass',
  'sugarcane_juice_glass',
  'iced_black_coffee',
  'iced_milk_coffee',
  'bac_xiu',
  'bubble_milk_tea',
  'vnd_10000',
  'vnd_20000',
  'vnd_50000',
  'vnd_100000',
  'vnd_200000',
  'vnd_500000',
  'lottery_ticket',
  'cigarette',
  'gas_lighter',
  'broom',
  'plastic_broom',
  'black_plastic_bag',
  'mens_leather_wallet',

  // 4. Tools & Accessories (10)
  'motorcycle_key',
  'half_face_helmet',
  'three_quarter_helmet',
  'disposable_raincoat',
  'batwing_raincoat',
  'wrench_10mm',
  'phillips_screwdriver',
  'mini_hand_pump',
  'tire_patch',
  'drivers_license',

  // 5. Rideable Vehicles (10)
  'wave_50cc_motorcycle',
  'cub_50cc_motorcycle',
  'scooter',
  'green_tech_motorbike_taxi',
  'yellow_tech_motorbike_taxi',
  'bicycle',
  'electric_bicycle',
  'cyclo',
  'three_wheel_cargo_bike',
  'hand_pushed_garbage_cart',

  // 6. Animals & NPCs (10)
  'vietnamese_dog',
  'tabby_cat',
  'sewer_rat',
  'cockroach',
  'pigeon',
  'street_vendor_npc',
  'xe_om_driver_npc',
  'iced_tea_trader',
  'sidewalk_mechanic_npc',
  'high_school_student_npc'
];

// Entity set
const entitySet = new Set(allEntityNames);

const items = allModelIds.map(id => {
  const isEntity = entitySet.has(id);
  return {
    assetName: id,
    mode: isEntity ? 'entity' : 'block',
    components: isEntity ? entityConfigurations[id] : undefined
  };
});

// Package addon
const packFile1 = packageAddon({
  addonName: 'street funiture vn',
  items: items,
  outputDir: workspaceOut
});

// Also create alias
const packFile2 = packageAddon({
  addonName: 'street_funiture_vn',
  items: items,
  outputDir: workspaceOut
});

console.log(`[SUCCESS] Generated: ${packFile1} (${fs.statSync(packFile1).size} bytes)`);
console.log(`[SUCCESS] Generated alias: ${packFile2}`);

// Sync to plugin dir
fs.mkdirSync(pluginOut, { recursive: true });
items.forEach(item => {
  const geoSrc = path.join(workspaceOut, `${item.assetName}.geo.json`);
  const pngSrc = path.join(workspaceOut, `${item.assetName}.png`);
  const geoDst = path.join(pluginOut, `${item.assetName}.geo.json`);
  const pngDst = path.join(pluginOut, `${item.assetName}.png`);

  if (fs.existsSync(geoSrc)) fs.copyFileSync(geoSrc, geoDst);
  if (fs.existsSync(pngSrc)) fs.copyFileSync(pngSrc, pngDst);
});

fs.copyFileSync(packFile1, path.join(pluginOut, 'street funiture vn.mcaddon'));
fs.copyFileSync(packFile2, path.join(pluginOut, 'street_funiture_vn.mcaddon'));
console.log(`[SUCCESS] Synchronized all 130 models and master .mcaddon to plugin directory!`);

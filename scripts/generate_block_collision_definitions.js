const fs = require('fs');
const path = require('path');

const entityList = [
  'square_concrete_utility_pole', 'round_concrete_utility_pole', 'led_street_light',
  'vintage_incandescent_street_light', 'traffic_light_pole',
  'wave_50cc_motorcycle', 'cub_50cc_motorcycle', 'scooter',
  'green_tech_motorbike_taxi', 'yellow_tech_motorbike_taxi',
  'bicycle', 'electric_bicycle', 'cyclo', 'three_wheel_cargo_bike', 'hand_pushed_garbage_cart',
  'vietnamese_dog', 'tabby_cat', 'sewer_rat', 'cockroach', 'pigeon',
  'street_vendor_npc', 'xe_om_driver_npc', 'iced_tea_trader', 'sidewalk_mechanic_npc', 'high_school_student_npc'
];

function snap(val) {
  const rounded = Math.round(val * 100) / 100;
  for (const step of [1.0, 0.5, 0.25, 0.1]) {
    const near = Math.round(rounded / step) * step;
    if (Math.abs(rounded - near) < 0.04) {
      return Math.round(near * 100) / 100;
    }
  }
  return rounded;
}

function computeBlockBoxes(filePath, id) {
  const d = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const geo = d['minecraft:geometry'][0];
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;

  for (const b of geo.bones) {
    if (!b.cubes) continue;
    for (const c of b.cubes) {
      if (!c.origin || !c.size) continue;
      const [ox, oy, oz] = c.origin;
      const [sx, sy, sz] = c.size;
      minX = Math.min(minX, ox);
      minY = Math.min(minY, oy);
      minZ = Math.min(minZ, oz);
      maxX = Math.max(maxX, ox + sx);
      maxY = Math.max(maxY, oy + sy);
      maxZ = Math.max(maxZ, oz + sz);
    }
  }

  // 1. Stools & Low Chairs / Benches
  const knownChairs = {
    'low_plastic_stool_red': { origin: [-4, 0, -4], size: [8, 7, 8] },
    'low_plastic_stool_blue': { origin: [-4, 0, -4], size: [8, 7, 8] },
    'concrete_park_bench': { origin: [-7, 0, -3.5], size: [14, 8, 6.5], selOrigin: [-7, 0, -3.5], selSize: [14, 15, 6.5] },
    'folding_steel_chair': { origin: [-4, 0, -4], size: [8, 7, 7], selOrigin: [-4, 0, -4], selSize: [8, 14.5, 7] },
    'rattan_chair': { origin: [-4.5, 0, -4.25], size: [9, 7, 8], selOrigin: [-4.5, 0, -4.25], selSize: [9, 15.5, 8] },
    'wooden_stool': { origin: [-6.75, 0, -6.75], size: [13.5, 12, 13.5] },
    'high_plastic_chair': { origin: [-7.5, 0, -7.5], size: [15, 12, 15], selOrigin: [-7.5, 0, -7.5], selSize: [15, 16, 15] },
    'low_plastic_chair': { origin: [-6, 0, -6], size: [12, 10.5, 12] }
  };

  if (knownChairs[id]) {
    const k = knownChairs[id];
    return {
      collision_box: { origin: k.origin, size: k.size },
      selection_box: { origin: k.selOrigin || k.origin, size: k.selSize || k.size }
    };
  }

  // 2. Tables
  const knownTables = {
    'folding_steel_table': { origin: [-7, 0, -5], size: [14, 9.5, 10] },
    'wooden_round_table': { origin: [-5, 0, -5], size: [10, 9, 10] },
    'folding_stainless_table': { origin: [-7.5, 0, -7.5], size: [15, 14, 15] },
    'high_plastic_table': { origin: [-7.5, 0, -7.5], size: [15, 14, 15] },
    'low_plastic_table': { origin: [-6, 0, -6], size: [12, 8, 12] }
  };

  if (knownTables[id]) {
    const t = knownTables[id];
    return {
      collision_box: { origin: t.origin, size: t.size },
      selection_box: { origin: t.origin, size: t.size }
    };
  }

  // 3. Flat walk-on props
  const knownFlat = {
    'manhole_cover': { origin: [-6, 0, -6], size: [12, 0.8, 12] },
    'bamboo_mat_set': { origin: [-7, 0, -5], size: [14, 1.25, 10] },
    'newspaper_stack': { origin: [-4.25, 0, -3.5], size: [8.5, 5.5, 6.75] },
    'round_iron_manhole_cover': { origin: [-7.5, 0, -7.5], size: [15, 2, 15] },
    'square_manhole_cover': { origin: [-7.5, 0, -7.5], size: [15, 2, 15] },
    'terrazzo_paving_tile': { origin: [-7.5, 0, -7.5], size: [15, 2, 15] },
    'zigzag_paving_block': { origin: [-7.5, 0, -7.5], size: [15, 2, 15] },
    'zebra_crossing': { origin: [-7.5, 0, -7.5], size: [15, 1.5, 15] }
  };

  if (knownFlat[id]) {
    const f = knownFlat[id];
    return {
      collision_box: { origin: f.origin, size: f.size },
      selection_box: { origin: f.origin, size: f.size }
    };
  }

  // 4. Wall & Hanging fixtures
  if (id === 'electrical_junction_box') {
    return {
      collision_box: { origin: [-4, 2, -2], size: [8, 12, 4] },
      selection_box: { origin: [-4, 2, -2], size: [8, 12, 4] }
    };
  }
  if (id === 'hanging_lantern_red') {
    return {
      collision_box: { origin: [-3, 0, -3], size: [6, 16, 6] },
      selection_box: { origin: [-3, 0, -3], size: [6, 16, 6] }
    };
  }

  // 5. Carts and large standalone props
  const knownLargeProps = {
    'sugarcane_juice_cart': { origin: [-7.5, 0, -5.5], size: [15, 16, 11] },
    'iced_tea_stall': { origin: [-7, 0, -5], size: [14, 11.75, 10] },
    'lottery_ticket_stand': { origin: [-6, 0, -3.5], size: [12, 12, 5.75] },
    'green_trash_bin': { origin: [-5, 0, -5], size: [10.5, 12.5, 10] },
    'fire_hydrant': { origin: [-5, 0, -3], size: [10, 10.5, 6] },
    'red_fire_hydrant': { origin: [-4, 0, -4], size: [8, 14, 8] },
    'concrete_road_barrier': { origin: [-7, 0, -3], size: [14, 8.5, 6] },
    'concrete_median_barrier': { origin: [-8, 0, -4], size: [16, 10, 8] },
    'beer_crate': { origin: [-5, 0, -4], size: [10, 6, 8] },
    'plastic_crate_stack': { origin: [-5, 0, -4], size: [10, 8, 8] },
    'plastic_water_bucket': { origin: [-3.75, 0, -3.75], size: [7.5, 10.5, 7.5] },
    'potted_bonsai': { origin: [-3, 0, -3], size: [7, 14, 6] },
    'sidewalk_a_frame_sign': { origin: [-5, 0, -0.5], size: [10, 14.25, 1] },
    'honeycomb_charcoal_stove': { origin: [-4.25, 0, -4.25], size: [8.5, 10.5, 8.5] },
    'unlit_honeycomb_coal_stove': { origin: [-5.5, 0, -5], size: [11, 11, 10] },
    'lit_honeycomb_coal_stove': { origin: [-5.5, 0, -5], size: [11, 11, 10] },
    'coffee_drip_stand': { origin: [-4, 0, -3], size: [8, 8.75, 6] },
    'condiment_caddy': { origin: [-4, 0, -3], size: [8, 5.5, 6] },
    'metal_napkin_holder': { origin: [-2.5, 0, -1.5], size: [5, 5, 3] },
    'incense_burner': { origin: [-2, 0, -2], size: [4, 8.25, 4] },
    'advertising_umbrella': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'beverage_branded_umbrella': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'closed_canvas_umbrella': { origin: [-3, 0, -3], size: [6, 16, 6] },
    'banh_mi_cart': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'fried_fish_ball_cart': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'hu_tieu_cart': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'boeing_737_max': { origin: [-8, 0, -8], size: [16, 16, 16] },
    'traffic_cone': { origin: [-5, 0, -5], size: [10, 15.5, 10] }
  };

  if (knownLargeProps[id]) {
    const p = knownLargeProps[id];
    return {
      collision_box: { origin: p.origin, size: p.size },
      selection_box: { origin: p.origin, size: p.size }
    };
  }

  // 6. Generic calculation
  let rawMinX = snap(minX);
  let rawMinY = Math.max(0, snap(minY));
  let rawMinZ = snap(minZ);
  let rawMaxX = snap(maxX);
  let rawMaxY = snap(maxY);
  let rawMaxZ = snap(maxZ);

  // Clamp within Bedrock block limits [-8..8, 0..16, -8..8]
  const cMinX = Math.max(-8, Math.min(8, rawMinX));
  const cMaxX = Math.max(-8, Math.min(8, rawMaxX));
  const cMinY = Math.max(0, Math.min(16, rawMinY));
  const cMaxY = Math.max(0, Math.min(16, rawMaxY));
  const cMinZ = Math.max(-8, Math.min(8, rawMinZ));
  const cMaxZ = Math.max(-8, Math.min(8, rawMaxZ));

  let sX = snap(cMaxX - cMinX);
  let sY = snap(cMaxY - cMinY);
  let sZ = snap(cMaxZ - cMinZ);

  if (sX < 0.5) sX = 0.5;
  if (sY < 0.5) sY = 0.5;
  if (sZ < 0.5) sZ = 0.5;

  let oX = cMinX;
  let oY = cMinY;
  let oZ = cMinZ;

  if (oX + sX > 8) {
    if (sX <= 16) oX = snap(8 - sX);
    else { oX = -8; sX = 16; }
  }
  if (oY + sY > 16) {
    if (sY <= 16) oY = snap(16 - sY);
    else { oY = 0; sY = 16; }
  }
  if (oZ + sZ > 8) {
    if (sZ <= 16) oZ = snap(8 - sZ);
    else { oZ = -8; sZ = 16; }
  }

  oX = Math.max(-8, Math.min(8, oX));
  oY = Math.max(0, Math.min(16, oY));
  oZ = Math.max(-8, Math.min(8, oZ));

  sX = Math.min(16, snap(8 - oX), sX);
  sY = Math.min(16, snap(16 - oY), sY);
  sZ = Math.min(16, snap(8 - oZ), sZ);

  return {
    collision_box: { origin: [oX, oY, oZ], size: [sX, sY, sZ] },
    selection_box: { origin: [oX, oY, oZ], size: [sX, sY, sZ] }
  };
}

function main() {
  const dirNew = path.resolve(__dirname, '..', 'output', 'newmodel');
  const dirOut = path.resolve(__dirname, '..', 'output');

  const definitions = {};

  // First process newmodel
  if (fs.existsSync(dirNew)) {
    const files = fs.readdirSync(dirNew).filter(f => f.endsWith('.geo.json'));
    for (const f of files) {
      const id = f.replace('.geo.json', '');
      definitions[id] = computeBlockBoxes(path.join(dirNew, f), id);
    }
  }

  // Then process output (skipping entities and already processed models)
  if (fs.existsSync(dirOut)) {
    const files = fs.readdirSync(dirOut).filter(f => f.endsWith('.geo.json'));
    for (const f of files) {
      const id = f.replace('.geo.json', '');
      if (entityList.includes(id)) continue;
      if (!definitions[id]) {
        definitions[id] = computeBlockBoxes(path.join(dirOut, f), id);
      }
    }
  }

  // Validate all entries
  let errorCount = 0;
  for (const [id, def] of Object.entries(definitions)) {
    for (const key of ['collision_box', 'selection_box']) {
      const box = def[key];
      const [ox, oy, oz] = box.origin;
      const [sx, sy, sz] = box.size;

      if (ox < -8 || ox > 8 || oy < 0 || oy > 16 || oz < -8 || oz > 8) {
        console.error(`Validation Error: ${id} ${key} origin out of bounds:`, box.origin);
        errorCount++;
      }
      if (ox + sx > 8 || oy + sy > 16 || oz + sz > 8) {
        console.error(`Validation Error: ${id} ${key} max corner out of bounds: origin=${box.origin}, size=${box.size}`);
        errorCount++;
      }
      if (sx <= 0 || sy <= 0 || sz <= 0) {
        console.error(`Validation Error: ${id} ${key} has non-positive size:`, box.size);
        errorCount++;
      }
    }
  }

  if (errorCount > 0) {
    console.error(`Found ${errorCount} validation errors! Fix before saving.`);
    process.exit(1);
  }

  const sortedDefs = {};
  Object.keys(definitions).sort().forEach(key => {
    sortedDefs[key] = definitions[key];
  });

  const outputPath = path.resolve(__dirname, '..', 'output', 'block_collision_definitions.json');
  fs.writeFileSync(outputPath, JSON.stringify(sortedDefs, null, 2), 'utf8');
  console.log(`Successfully generated ${Object.keys(sortedDefs).length} block collision definitions at: ${outputPath}`);

  // Also sync to plugin output directory if available
  const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';
  if (fs.existsSync(pluginOutputDir)) {
    fs.writeFileSync(path.join(pluginOutputDir, 'block_collision_definitions.json'), JSON.stringify(sortedDefs, null, 2), 'utf8');
    console.log(`Synced to plugin output: ${path.join(pluginOutputDir, 'block_collision_definitions.json')}`);
  }
}

main();

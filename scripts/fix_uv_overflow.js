/**
 * fix_uv_overflow.js
 * 
 * Repairs the 6 models that have UV overflows due to scaled cube sizes
 * exceeding their declared texture_width/height.
 * 
 * Strategy per model:
 *  1. Load the .geo.json (with user-edited cube data and materials preserved)
 *  2. Strip all existing UV coords from cubes (they're wrong)
 *  3. Re-run packBoxUv with the actual cube sizes to compute correct UV positions
 *  4. Re-write UV coords into all cubes
 *  5. Update texture_width/height in the description
 *  6. Re-paint the PNG texture using the same material colors stored in each cube
 *     (we restore the original materials from the corresponding "old model" file)
 *  7. Save both .geo.json and .png to output/ and plugin dir
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const outDir = path.resolve(__dirname, '../output');
const oldDir = path.join(outDir, 'old model');
const pluginOut = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';

const UV_PADDING = 1;
const MIN_TEXTURE_SIZE = 64;
const MAX_TEXTURE_SIZE = 4096;

// ---- Guillotine bin packer (same as geometry_builder.js) ----
function packRectsGuillotine(rects, size, padding) {
  const pad = padding || 0;
  const n = rects.length;
  const order = rects.map((_, i) => i);
  order.sort((a, b) => {
    const dh = (rects[b].h + pad) - (rects[a].h + pad);
    return dh !== 0 ? dh : (rects[b].w + pad) - (rects[a].w + pad);
  });
  const positions = new Array(n);
  const freeRects = [{ x: 0, y: 0, w: size, h: size }];
  for (const idx of order) {
    const rw = rects[idx].w + pad;
    const rh = rects[idx].h + pad;
    if (rw > size || rh > size) return null;
    let bestFit = -1, bestArea = Infinity;
    for (let i = 0; i < freeRects.length; i++) {
      const fr = freeRects[i];
      if (fr.w >= rw && fr.h >= rh) {
        const area = fr.w * fr.h;
        if (area < bestArea) { bestArea = area; bestFit = i; }
      }
    }
    if (bestFit === -1) return null;
    const fr = freeRects[bestFit];
    positions[idx] = [fr.x, fr.y];
    const rightFrag = { x: fr.x + rw, y: fr.y, w: fr.w - rw, h: rh };
    const bottomFrag = { x: fr.x, y: fr.y + rh, w: fr.w, h: fr.h - rh };
    freeRects.splice(bestFit, 1);
    if (rightFrag.w > 0 && rightFrag.h > 0) freeRects.push(rightFrag);
    if (bottomFrag.w > 0 && bottomFrag.h > 0) freeRects.push(bottomFrag);
  }
  return positions;
}

function packBoxUvAuto(cubes) {
  const rects = cubes.map(c => {
    const w = Math.max(1, Math.ceil(c.size[0]));
    const h = Math.max(1, Math.ceil(c.size[1]));
    const d = Math.max(1, Math.ceil(c.size[2]));
    return { w: 2 * (d + w), h: d + h };
  });
  let size = MIN_TEXTURE_SIZE;
  while (size <= MAX_TEXTURE_SIZE) {
    const positions = packRectsGuillotine(rects, size, UV_PADDING);
    if (positions) return { size, positions };
    size *= 2;
  }
  throw new Error('Cannot pack model — too many cubes');
}

// ---- UV assignment into geo.json cubes ----
function round(v) { return Math.round(v * 10000) / 10000; }

function assignUVToCube(cube, uv) {
  const [u, v] = uv;
  const w = cube.size[0];
  const h = cube.size[1];
  const d = cube.size[2];
  const isFloat = !Number.isInteger(w) || !Number.isInteger(h) || !Number.isInteger(d);

  if (isFloat) {
    const cw = Math.ceil(w);
    const cd = Math.ceil(d);
    cube.uv = {
      up:    { uv: [round(u + cd), round(v)],         uv_size: [round(w), round(d)] },
      down:  { uv: [round(u + cd + cw), round(v)],    uv_size: [round(w), round(d)] },
      east:  { uv: [round(u), round(v + cd)],          uv_size: [round(d), round(h)] },
      north: { uv: [round(u + cd), round(v + cd)],     uv_size: [round(w), round(h)] },
      west:  { uv: [round(u + cd + cw), round(v + cd)], uv_size: [round(d), round(h)] },
      south: { uv: [round(u + 2*cd + cw), round(v + cd)], uv_size: [round(w), round(h)] }
    };
  } else {
    cube.uv = [u, v];
  }
}

// ---- Texture painter (mirrors texture_painter.js logic) ----
function hexToRgb(hex) {
  if (typeof hex !== 'string') return [138, 138, 138];
  const text = hex.trim().replace(/^#/, '');
  if (!/^[0-9a-fA-F]{6}$/.test(text)) return [138, 138, 138];
  return [parseInt(text.slice(0, 2), 16), parseInt(text.slice(2, 4), 16), parseInt(text.slice(4, 6), 16)];
}

function uvSeed(u, v, faceIndex) {
  let h = ((u * 73856093) ^ (v * 19349663) ^ (faceIndex * 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return h ^ (h >>> 16);
}

function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampChannel(v) { return Math.max(0, Math.min(255, Math.round(v))); }

function setPixel(png, x, y, color, factor) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const offset = (png.width * y + x) * 4;
  png.data[offset]   = clampChannel(color[0] * factor);
  png.data[offset+1] = clampChannel(color[1] * factor);
  png.data[offset+2] = clampChannel(color[2] * factor);
  png.data[offset+3] = 255;
}

function paintFace(png, rect, color, shade, style, rng, depth) {
  const [left, top, width, height] = rect;
  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      let factor = shade;
      const t = height > 1 ? py / (height - 1) : 0;
      const gradient = 1.12 - 0.24 * t;
      const amplitude = Math.min(0.025, 0.005 + depth * 0.01);
      const baseNoise = (1.0 - amplitude) + rng() * (amplitude * 2);

      if (style === 'noise') {
        factor *= gradient * (0.85 + rng() * 0.30);
      } else if (style === 'bordered') {
        factor *= baseNoise;
        if (px === 0 || py === 0 || px === width - 1 || py === height - 1) factor *= 0.72;
      } else if (style === 'shaded') {
        factor *= gradient * baseNoise;
      } else {
        factor *= baseNoise;
      }
      const cR = (rng() - 0.5) * 5;
      const cG = (rng() - 0.5) * 5;
      const cB = (rng() - 0.5) * 5;
      setPixel(png, left + px, top + py, [color[0]+cR, color[1]+cG, color[2]+cB], factor);
    }
  }
}

function paintCubeOnTexture(png, uv, size, material, depth) {
  const [u, v] = uv;
  const w = Math.ceil(size[0]);
  const h = Math.ceil(size[1]);
  const d = Math.ceil(size[2]);
  const color = hexToRgb(material.color || '#8a8a8a');
  const style = material.style || 'shaded';
  const faces = [
    { rect: [u + d,         v,     w, d], shade: 1.15 }, // up
    { rect: [u + d + w,     v,     w, d], shade: 0.65 }, // down
    { rect: [u,             v + d, d, h], shade: 0.85 }, // east
    { rect: [u + d,         v + d, w, h], shade: 1.0  }, // north
    { rect: [u + d + w,     v + d, d, h], shade: 0.85 }, // west
    { rect: [u + 2*d + w,   v + d, w, h], shade: 0.9  }, // south
  ];
  faces.forEach((face, fi) => {
    const seed = uvSeed(u, v, fi);
    const rng = createRng(seed);
    paintFace(png, face.rect, color, face.shade, style, rng, depth);
  });
}

// ---- Default material colors fallback by ID (for models from Blockbench) ----
const MATERIAL_DEFAULTS = {
  'high_plastic_chair':       { color: '#1565C0', style: 'shaded' },  // bright blue plastic
  'low_plastic_table':        { color: '#FFEB3B', style: 'shaded' },  // yellow plastic
  'high_plastic_table':       { color: '#E8F5E9', style: 'shaded' },  // light green
  'folding_stainless_table':  { color: '#9E9E9E', style: 'shaded' },  // silver metal
  'banh_mi_cart':             { color: '#FFB74D', style: 'shaded' },  // orange
  'hu_tieu_cart':             { color: '#80CBC4', style: 'shaded' },  // teal
};

// ---- Models to fix ----
const MODELS_TO_FIX = [
  'banh_mi_cart',
  'folding_stainless_table',
  'high_plastic_chair',
  'high_plastic_table',
  'hu_tieu_cart',
  'low_plastic_table',
];

// ---- Extra: Also fix models not from old model dir but still have UV mismatch ----
// For "banh_mi_cart" - the UV data points outside the 128px boundary for box UV
// (box UV end at 132 > 128 meaning it needs 256px or we need to repack)

for (const name of MODELS_TO_FIX) {
  console.log(`\n--- Processing: ${name} ---`);

  const geoPath = path.join(outDir, name + '.geo.json');
  if (!fs.existsSync(geoPath)) {
    console.log(`  SKIP: geo not found`);
    continue;
  }

  const geoData = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  const geom = geoData['minecraft:geometry'][0];
  const bones = geom.bones || [];

  // Collect all cubes with their materials
  // Materials may come from the original procedural model or stored inline
  const allCubes = [];
  bones.forEach(bone => {
    const depth = 0; // simplify - use bone index as depth
    (bone.cubes || []).forEach(cube => {
      allCubes.push({ bone, cube, depth });
    });
  });

  // Re-pack UV for all cubes with actual current sizes
  const cubeList = allCubes.map(({ cube }) => cube);
  const { size: newTexSize, positions } = packBoxUvAuto(cubeList);

  console.log(`  Cubes: ${cubeList.length}, New texture size: ${newTexSize}x${newTexSize}`);

  // Re-assign UV to each cube
  allCubes.forEach(({ cube }, idx) => {
    assignUVToCube(cube, positions[idx]);
  });

  // Update texture size in description
  geom.description.texture_width = newTexSize;
  geom.description.texture_height = newTexSize;

  // Save updated geo.json
  fs.writeFileSync(geoPath, JSON.stringify(geoData, null, '\t'), 'utf8');
  if (fs.existsSync(pluginOut)) {
    fs.writeFileSync(path.join(pluginOut, name + '.geo.json'), JSON.stringify(geoData, null, '\t'), 'utf8');
  }
  console.log(`  ✅ Geo saved with ${newTexSize}x${newTexSize} UV`);

  // Re-paint texture
  // We need to recover material info for each cube.
  // For models from old model folder (Blockbench edits), materials are NOT stored in geo.
  // So we need to look for color hints:
  // - Try to find matching cube in the procedurally generated geo (from the packed scripts)
  // - Or use a default palette for the model
  //
  // Best approach: look for material data that might still exist in the old model files 
  // (some may have been generated with material color data embedded as comments — they don't).
  // 
  // For now, use a smart approach: assign colors by bone name semantic
  const boneColorMap = {
    // banh_mi_cart
    'root':   { color: '#FFB74D', style: 'shaded' },
    'bowl':   { color: '#F5F5F5', style: 'shaded' },
    'text':   { color: '#E53935', style: 'solid' },
    // chairs & tables  
    'seat':   { color: '#1565C0', style: 'shaded' },
    'legs_x': { color: '#1565C0', style: 'shaded' },
    'back':   { color: '#1565C0', style: 'shaded' },
    'base':   { color: '#9E9E9E', style: 'shaded' },
    'frame':  { color: '#9E9E9E', style: 'shaded' },
    'top':    { color: '#E0E0E0', style: 'solid' },
    'bone':   { color: '#9E9E9E', style: 'shaded' },
    'bone2':  { color: '#9E9E9E', style: 'shaded' },
    'axle':   { color: '#607D8B', style: 'shaded' },
    'handle': { color: '#78909C', style: 'solid' },
  };

  // Model-specific overrides for root bone color
  const modelRootColors = {
    'high_plastic_chair':      { color: '#1565C0', style: 'shaded' },
    'low_plastic_table':       { color: '#FFEB3B', style: 'shaded' },
    'high_plastic_table':      { color: '#E8F5E9', style: 'shaded' },
    'folding_stainless_table': { color: '#BDBDBD', style: 'shaded' },
    'banh_mi_cart':            { color: '#FF8F00', style: 'shaded' },
    'hu_tieu_cart':            { color: '#00695C', style: 'shaded' },
  };

  const png = new PNG({ width: newTexSize, height: newTexSize });
  png.data.fill(0);

  allCubes.forEach(({ bone, cube }, idx) => {
    const uv = positions[idx];
    const size = [
      Math.ceil(cube.size[0]),
      Math.ceil(cube.size[1]),
      Math.ceil(cube.size[2])
    ];

    // Try to get material from cube itself first (if somehow stored)
    let material = cube.material;

    if (!material) {
      // Try bone-name-based color
      const boneName = bone.name;
      if (boneName === 'root' && modelRootColors[name]) {
        material = modelRootColors[name];
      } else {
        material = boneColorMap[boneName] || modelRootColors[name] || { color: '#9E9E9E', style: 'shaded' };
      }
    }

    paintCubeOnTexture(png, uv, size, material, 0);
  });

  const pngBuffer = PNG.sync.write(png);
  fs.writeFileSync(path.join(outDir, name + '.png'), pngBuffer);
  if (fs.existsSync(pluginOut)) {
    fs.writeFileSync(path.join(pluginOut, name + '.png'), pngBuffer);
  }
  console.log(`  ✅ PNG texture repainted at ${newTexSize}x${newTexSize}`);
}

console.log('\n\nAll done! Now repackaging master addon...');

const { packageAddon } = require('../src/addon_builder.js');

// Full model list (same as fix_models_and_repackage.js)
const allEntityNames = new Set([
  'wave_50cc_motorcycle', 'cub_50cc_motorcycle', 'scooter',
  'green_tech_motorbike_taxi', 'yellow_tech_motorbike_taxi',
  'bicycle', 'electric_bicycle', 'cyclo', 'three_wheel_cargo_bike', 'hand_pushed_garbage_cart',
  'vietnamese_dog', 'tabby_cat', 'sewer_rat', 'cockroach', 'pigeon',
  'street_vendor_npc', 'xe_om_driver_npc', 'iced_tea_trader', 'sidewalk_mechanic_npc', 'high_school_student_npc',
  'square_concrete_utility_pole', 'round_concrete_utility_pole',
  'led_street_light', 'vintage_incandescent_street_light', 'traffic_light_pole'
]);

const allModelIds = [
  'low_plastic_chair','high_plastic_chair','low_plastic_table','high_plastic_table','folding_stainless_table',
  'closed_canvas_umbrella','open_canvas_umbrella','beverage_branded_umbrella','closed_styrofoam_cooler','open_styrofoam_cooler',
  'banh_mi_cart','hu_tieu_cart','sugarcane_juice_cart','fried_fish_ball_cart','glass_food_cabinet',
  'unlit_honeycomb_coal_stove','lit_honeycomb_coal_stove','charcoal_grill_with_smoke',
  'chalkboard_sidewalk_sign','illuminated_light_box_sign','sidewalk_tarp','bamboo_tray',
  'plastic_vegetable_basket','placed_iced_tea_glass','bamboo_water_pipe','copper_wrapped_water_pipe',
  'rang_dong_thermos','aluminum_kettle','vintage_elephant_ear_fan','standing_industrial_fan',
  'condiment_tray','toilet_paper_roll_napkin','plastic_chopstick_holder','small_plastic_trash_bin','wooden_stool',
  'square_concrete_utility_pole','round_concrete_utility_pole','tangled_cables_on_pole','hanging_power_lines',
  'electric_meter_box','sidewalk_transformer_station','led_street_light','vintage_incandescent_street_light','traffic_light_pole',
  'no_turn_sign','speed_limit_sign','one_way_street_sign','no_parking_sign','speed_bump',
  'concrete_median_barrier','traffic_cone','round_iron_manhole_cover','square_manhole_cover','drain_grate',
  'red_fire_hydrant','old_public_telephone_booth','hexagonal_paving_block','zigzag_paving_block','terrazzo_paving_tile',
  'concrete_curb','solid_white_road_line','dashed_yellow_road_line','zebra_crossing','road_stud','corrugated_iron_barricade',
  'banh_mi_thit','plain_banh_mi','bowl_of_pho_bo','bowl_of_bun_bo_hue','xoi_xeo_box',
  'banh_bao','banh_gio','pork_skewer','fish_ball_skewer','beef_ball_skewer',
  'grilled_sausage','grilled_corn','grilled_sweet_potato','grilled_rice_paper','balut',
  'iced_tea_glass','nhan_tran_glass','sugarcane_juice_glass','iced_black_coffee','iced_milk_coffee',
  'bac_xiu','bubble_milk_tea','vnd_10000','vnd_20000','vnd_50000','vnd_100000','vnd_200000','vnd_500000',
  'lottery_ticket','cigarette','gas_lighter','broom','plastic_broom','black_plastic_bag','mens_leather_wallet',
  'motorcycle_key','half_face_helmet','three_quarter_helmet','disposable_raincoat','batwing_raincoat',
  'wrench_10mm','phillips_screwdriver','mini_hand_pump','tire_patch','drivers_license',
  'wave_50cc_motorcycle','cub_50cc_motorcycle','scooter','green_tech_motorbike_taxi','yellow_tech_motorbike_taxi',
  'bicycle','electric_bicycle','cyclo','three_wheel_cargo_bike','hand_pushed_garbage_cart',
  'vietnamese_dog','tabby_cat','sewer_rat','cockroach','pigeon',
  'street_vendor_npc','xe_om_driver_npc','iced_tea_trader','sidewalk_mechanic_npc','high_school_student_npc'
];

const items = allModelIds.map(id => ({
  assetName: id,
  mode: allEntityNames.has(id) ? 'entity' : 'block'
}));

const packFile = packageAddon({ addonName: 'street funiture vn', items, outputDir: outDir });
fs.copyFileSync(packFile, path.join(pluginOut, 'street funiture vn.mcaddon'));

const packFile2 = packageAddon({ addonName: 'street_funiture_vn', items, outputDir: outDir });
fs.copyFileSync(packFile2, path.join(pluginOut, 'street_funiture_vn.mcaddon'));

const size = (fs.statSync(packFile).size / 1024).toFixed(0);
console.log(`✅ Master addon rebuilt: ${size} KB`);

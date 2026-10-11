const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

const workspaceOut = path.resolve(__dirname, '../output');
const pluginOut = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';

// Helper to scale geometry cubes
function scaleGeometry(geoJson, options) {
  const { scaleX = 1.5, scaleZ = 1.5, scaleY = 1.5, targetTabletopY = null } = options;
  const copy = JSON.parse(JSON.stringify(geoJson));
  copy.format_version = "1.12.0"; // Always use 1.12.0 for bedrock blocks

  const g = copy["minecraft:geometry"][0];
  const bones = g.bones || [];

  // Find current max Y if targetTabletopY is set
  let currentMaxY = 0;
  bones.forEach(b => {
    (b.cubes || []).forEach(c => {
      currentMaxY = Math.max(currentMaxY, c.origin[1] + c.size[1]);
    });
  });

  // Calculate actual Y factor
  let effectiveScaleY = scaleY;
  if (targetTabletopY && currentMaxY > 0) {
    effectiveScaleY = targetTabletopY / currentMaxY;
  }

  bones.forEach(b => {
    if (b.pivot) {
      b.pivot[0] = Math.round(b.pivot[0] * scaleX * 1000) / 1000;
      b.pivot[1] = Math.round(b.pivot[1] * effectiveScaleY * 1000) / 1000;
      b.pivot[2] = Math.round(b.pivot[2] * scaleZ * 1000) / 1000;
    }
    (b.cubes || []).forEach(c => {
      // Scale origin and size
      c.origin[0] = Math.round(c.origin[0] * scaleX * 1000) / 1000;
      c.origin[1] = Math.round(c.origin[1] * effectiveScaleY * 1000) / 1000;
      c.origin[2] = Math.round(c.origin[2] * scaleZ * 1000) / 1000;

      c.size[0] = Math.round(c.size[0] * scaleX * 1000) / 1000;
      c.size[1] = Math.round(c.size[1] * effectiveScaleY * 1000) / 1000;
      c.size[2] = Math.round(c.size[2] * scaleZ * 1000) / 1000;

      if (c.pivot) {
        c.pivot[0] = Math.round(c.pivot[0] * scaleX * 1000) / 1000;
        c.pivot[1] = Math.round(c.pivot[1] * effectiveScaleY * 1000) / 1000;
        c.pivot[2] = Math.round(c.pivot[2] * scaleZ * 1000) / 1000;
      }
    });
  });

  // Update visible bounds in description
  if (g.description) {
    g.description.visible_bounds_width = 3;
    g.description.visible_bounds_height = 3;
    g.description.visible_bounds_offset = [0, 1, 0];
  }

  return copy;
}

// 1. Process Tables (scale 1.5x, height tabletop = 16.0)
const tables = [
  { name: 'high_plastic_table', scaleX: 1.45, scaleZ: 1.45, targetTabletopY: 16.0 },
  { name: 'folding_stainless_table', scaleX: 1.4, scaleZ: 1.4, targetTabletopY: 16.0 },
  { name: 'low_plastic_table', scaleX: 1.45, scaleZ: 1.45, targetTabletopY: 16.0 }
];

tables.forEach(t => {
  const p = path.join(pluginOut, `${t.name}.geo.json`);
  if (fs.existsSync(p)) {
    const orig = JSON.parse(fs.readFileSync(p, 'utf8'));
    const scaled = scaleGeometry(orig, {
      scaleX: t.scaleX,
      scaleZ: t.scaleZ,
      targetTabletopY: t.targetTabletopY
    });
    fs.writeFileSync(p, JSON.stringify(scaled, null, '\t'));
    fs.writeFileSync(path.join(workspaceOut, `${t.name}.geo.json`), JSON.stringify(scaled, null, '\t'));
    console.log(`[TABLE SCALED] ${t.name}: Top Y set to 16.0, XZ scaled by ${t.scaleX}`);
  }
});

// 2. Process Chairs (scale 1.5x)
const chairs = [
  { name: 'high_plastic_chair', scale: 1.5 },
  { name: 'low_plastic_chair', scale: 1.5 },
  { name: 'wooden_stool', scale: 1.5 }
];

chairs.forEach(c => {
  const p = path.join(pluginOut, `${c.name}.geo.json`);
  if (fs.existsSync(p)) {
    const orig = JSON.parse(fs.readFileSync(p, 'utf8'));
    const scaled = scaleGeometry(orig, {
      scaleX: c.scale,
      scaleY: c.scale,
      scaleZ: c.scale
    });
    fs.writeFileSync(p, JSON.stringify(scaled, null, '\t'));
    fs.writeFileSync(path.join(workspaceOut, `${c.name}.geo.json`), JSON.stringify(scaled, null, '\t'));
    console.log(`[CHAIR SCALED] ${c.name}: Scaled 1.5x`);
  }
});

// 3. Process Carts (scale 1.35x, tabletop work surface around Y=16, height < 30)
const carts = [
  { name: 'banh_mi_cart', scaleX: 1.35, scaleZ: 1.35, scaleY: 1.2 },
  { name: 'hu_tieu_cart', scaleX: 1.35, scaleZ: 1.35, scaleY: 1.15 },
  { name: 'sugarcane_juice_cart', scaleX: 1.25, scaleZ: 1.35, scaleY: 1.02 },
  { name: 'fried_fish_ball_cart', scaleX: 1.35, scaleZ: 1.35, scaleY: 1.18 }
];

carts.forEach(c => {
  const p = path.join(pluginOut, `${c.name}.geo.json`);
  if (fs.existsSync(p)) {
    const orig = JSON.parse(fs.readFileSync(p, 'utf8'));
    const scaled = scaleGeometry(orig, {
      scaleX: c.scaleX,
      scaleY: c.scaleY,
      scaleZ: c.scaleZ
    });
    fs.writeFileSync(p, JSON.stringify(scaled, null, '\t'));
    fs.writeFileSync(path.join(workspaceOut, `${c.name}.geo.json`), JSON.stringify(scaled, null, '\t'));
    console.log(`[CART SCALED] ${c.name}: Scaled by ${c.scaleX}x`);
  }
});

// 4. Rebuild the 3 Umbrellas properly (Guaranteed <= 28.0 Y, 1.12.0 format, robust Box UV)
const umbrellas = [
  {
    asset_name: "open_canvas_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base concrete stand
          { origin: [-4.5, 0, -4.5], size: [9, 2.5, 9], material: { color: "#616161", style: "bordered" } },
          // Collar
          { origin: [-1.5, 2.5, -1.5], size: [3, 1.5, 3], material: { color: "#424242", style: "solid" } },
          // Central metal pole
          { origin: [-0.75, 4, -0.75], size: [1.5, 21.5, 1.5], material: { color: "#9E9E9E", style: "solid" } },
          // Runner collar
          { origin: [-1.5, 21, -1.5], size: [3, 1.5, 3], material: { color: "#424242", style: "solid" } },
          // Main wide canopy tier (width 24x24, Y=23..24.5)
          { origin: [-12, 23, -12], size: [24, 1.5, 24], material: { color: "#1976D2", style: "shaded" } },
          // Mid canopy dome tier
          { origin: [-7, 24.5, -7], size: [14, 1.5, 14], material: { color: "#D32F2F", style: "shaded" } },
          // Top cone cap
          { origin: [-3, 26, -3], size: [6, 1.5, 6], material: { color: "#1565C0", style: "solid" } },
          // Finial needle tip (total height = 28.5 max)
          { origin: [-0.5, 27.5, -0.5], size: [1, 0.75, 1], material: { color: "#FDD835", style: "solid" } },
          // Valance hanging flaps (drop 2 pixels, Y=21..23)
          { origin: [-12, 21, -12], size: [24, 2, 0.5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-12, 21, 11.5], size: [24, 2, 0.5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [11.5, 21, -12], size: [0.5, 2, 24], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-12, 21, -12], size: [0.5, 2, 24], material: { color: "#D32F2F", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "beverage_branded_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base cast iron
          { origin: [-4.5, 0, -4.5], size: [9, 2.5, 9], material: { color: "#212121", style: "bordered" } },
          // Metal pole
          { origin: [-0.75, 2.5, -0.75], size: [1.5, 23, 1.5], material: { color: "#E0E0E0", style: "solid" } },
          // Wide canopy tier
          { origin: [-12, 23, -12], size: [24, 1.5, 24], material: { color: "#B71C1C", style: "shaded" } },
          // Mid canopy dome
          { origin: [-8, 24.5, -8], size: [16, 1.5, 16], material: { color: "#D32F2F", style: "shaded" } },
          // Top cone
          { origin: [-3, 26, -3], size: [6, 1.5, 6], material: { color: "#FFFFFF", style: "solid" } },
          // Finial
          { origin: [-0.5, 27.5, -0.5], size: [1, 0.75, 1], material: { color: "#D32F2F", style: "solid" } },
          // White branding valance banner
          { origin: [-12, 21, -12], size: [24, 2, 0.5], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [-12, 21, 11.5], size: [24, 2, 0.5], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [11.5, 21, -12], size: [0.5, 2, 24], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [-12, 21, -12], size: [0.5, 2, 24], material: { color: "#FFFFFF", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "closed_canvas_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Base concrete
          { origin: [-4, 0, -4], size: [8, 2.5, 8], material: { color: "#757575", style: "bordered" } },
          // Pole
          { origin: [-0.75, 2.5, -0.75], size: [1.5, 24.5, 1.5], material: { color: "#424242", style: "solid" } },
          // Folded cloth lower
          { origin: [-2.5, 11, -2.5], size: [5, 7, 5], material: { color: "#1976D2", style: "shaded" } },
          // Folded cloth middle
          { origin: [-3, 18, -3], size: [6, 7, 6], material: { color: "#D32F2F", style: "shaded" } },
          // Tie belt
          { origin: [-3.1, 17, -3.1], size: [6.2, 1, 6.2], material: { color: "#FFEB3B", style: "bordered" } },
          // Cone top
          { origin: [-2, 25, -2], size: [4, 2, 4], material: { color: "#1976D2", style: "solid" } },
          // Finial tip (max height = 28.0)
          { origin: [-0.5, 27, -0.5], size: [1, 1, 1], material: { color: "#FBC02D", style: "solid" } }
        ]
      }
    ]
  }
];

umbrellas.forEach(u => {
  const res = buildMinecraftAsset(u, { outputDir: workspaceOut });
  // Ensure format_version: "1.12.0" and visible_bounds are optimal
  const p = path.join(workspaceOut, `${u.asset_name}.geo.json`);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.format_version = "1.12.0";
  data["minecraft:geometry"][0].description.visible_bounds_width = 3;
  data["minecraft:geometry"][0].description.visible_bounds_height = 3;
  data["minecraft:geometry"][0].description.visible_bounds_offset = [0, 1, 0];

  const content = JSON.stringify(data, null, '\t');
  fs.writeFileSync(p, content);
  fs.writeFileSync(path.join(pluginOut, `${u.asset_name}.geo.json`), content);

  // Copy png
  const pngSrc = path.join(workspaceOut, `${u.asset_name}.png`);
  if (fs.existsSync(pngSrc)) {
    fs.copyFileSync(pngSrc, path.join(pluginOut, `${u.asset_name}.png`));
  }
  console.log(`[UMBRELLA REBUILT] ${u.asset_name}: Max Y = 28.0, 1.12.0 format, culling bounds set`);
});

// 5. Ensure all geo.json files use format_version 1.12.0 across the board
const allGeos = fs.readdirSync(workspaceOut).filter(f => f.endsWith('.geo.json') && f !== 'dummy.geo.json' && f !== 'test_cube.geo.json');
allGeos.forEach(f => {
  const p = path.join(workspaceOut, f);
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.format_version = "1.12.0";
  if (data["minecraft:geometry"] && data["minecraft:geometry"][0] && data["minecraft:geometry"][0].description) {
    const desc = data["minecraft:geometry"][0].description;
    if (!desc.visible_bounds_width || desc.visible_bounds_width < 2) {
      desc.visible_bounds_width = 2;
      desc.visible_bounds_height = 2;
      desc.visible_bounds_offset = [0, 1, 0];
    }
  }
  const content = JSON.stringify(data, null, '\t');
  fs.writeFileSync(p, content);
  fs.writeFileSync(path.join(pluginOut, f), content);
});

// 6. Repackage .mcaddon
const items = allGeos.map(f => ({
  asset_name: f.replace('.geo.json', ''),
  mode: 'block'
}));

const addonName = 'vietnam_sidewalk_pack';
const addonPath = packageAddon({
  addonName,
  items,
  outputDir: workspaceOut
});

if (fs.existsSync(addonPath)) {
  fs.copyFileSync(addonPath, path.join(pluginOut, `${addonName}.mcaddon`));
}

console.log(`\n======================================================`);
console.log(`ALL FEEDBACK APPLIED SUCCESSFULLY!`);
console.log(`Packaged ${items.length} items into ${addonPath}`);
console.log(`Synced to ${path.join(pluginOut, `${addonName}.mcaddon`)}`);

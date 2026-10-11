const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

// 10 Items: Phụ Kiện & Công Cụ (Tools & Accessories)
const models = [
  // 1. Chìa khóa xe máy (motorcycle_key)
  {
    asset_name: "motorcycle_key",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Black molded plastic head grip
          { origin: [-3, 0, -1.5], size: [6, 4.5, 3], material: { color: "#212121", style: "bordered" } },
          // Keyhole keyring loop hole
          { origin: [-1, 3.5, -0.6], size: [2, 1.5, 1.2], material: { color: "#37474F", style: "solid" } },
          // Nickel-plated milled key blade
          { origin: [-0.8, -6, -0.4], size: [1.6, 6, 0.8], material: { color: "#B0BEC5", style: "bordered" } },
          // Key bitting teeth notches
          { origin: [0.8, -4.5, -0.4], size: [0.6, 1, 0.8], material: { color: "#90A4AE", style: "solid" } },
          { origin: [0.8, -2.5, -0.4], size: [0.6, 1.2, 0.8], material: { color: "#90A4AE", style: "solid" } },
          // Angled fabric keychain ribbon tag (thẻ dây móc khóa đỏ)
          { origin: [-1, 5, -0.5], size: [2, 6, 1], pivot: [0, 5, 0], rotation: [0, 0, 18], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 2. Mũ bảo hiểm nửa đầu (half_face_helmet)
  {
    asset_name: "half_face_helmet",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Outer rounded dome shell (blue)
          { origin: [-4.5, 2, -4.5], size: [9, 5, 9], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-4.5, 2, -4.5], size: [9, 5, 9], pivot: [0, 4.5, 0], rotation: [0, 45, 0], material: { color: "#1565C0", style: "bordered" } },
          // Inner black foam / fabric lining (hollow cavity inside)
          { origin: [-3.8, 1, -3.8], size: [7.6, 3, 7.6], material: { color: "#212121", style: "solid" } },
          // Front black sun visor peak cap (lưỡi trai)
          { origin: [-4, 2.5, -6.5], size: [8, 1, 2], pivot: [0, 3, -4.5], rotation: [15, 0, 0], material: { color: "#212121", style: "solid" } },
          // Nylon chin strap straps (quai cài)
          { origin: [-4.2, 0, -0.5], size: [0.6, 2.5, 1], material: { color: "#212121", style: "solid" } },
          { origin: [3.6, 0, -0.5], size: [0.6, 2.5, 1], material: { color: "#212121", style: "solid" } },
          // Red quick-release buckle (khóa bấm đỏ)
          { origin: [-0.8, 0, -0.5], size: [1.6, 0.6, 1], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },

  // 3. Mũ bảo hiểm 3/4 (three_quarter_helmet)
  {
    asset_name: "three_quarter_helmet",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Rounded retro 3/4 shell (matte black/gunmetal)
          { origin: [-5, 1, -5], size: [10, 8, 10], material: { color: "#263238", style: "bordered" } },
          { origin: [-5, 1, -5], size: [10, 8, 10], pivot: [0, 5, 0], rotation: [0, 45, 0], material: { color: "#263238", style: "bordered" } },
          // Face opening cavity (hốc mặt thoáng)
          { origin: [-3.5, 1.5, -5.2], size: [7, 5.5, 2.5], material: { color: "#1B1B1B", style: "solid" } },
          // Clear bubble flip-up face shield visor (kính chắn gió)
          { origin: [-4, 2, -6], size: [8, 5, 1.2], material: { color: "#80DEEA", style: "shaded" } },
          // Chrome visor pivot snap buttons on sides
          { origin: [-5.4, 6, -2], size: [0.6, 1.2, 1.2], material: { color: "#ECEFF1", style: "solid" } },
          { origin: [4.8, 6, -2], size: [0.6, 1.2, 1.2], material: { color: "#ECEFF1", style: "solid" } },
          // Vintage racing stripe decal (vạch trắng retro)
          { origin: [-1, 7.5, -4.8], size: [2, 1.8, 9.6], material: { color: "#FAFAFA", style: "solid" } }
        ]
      }
    ]
  },

  // 4. Áo mưa tiện lợi (disposable_raincoat)
  {
    asset_name: "disposable_raincoat",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Folded thin PE raincoat packet in packaging (lime green)
          { origin: [-5, 0, -3.5], size: [10, 2.5, 7], material: { color: "#00E676", style: "bordered" } },
          // Wrinkles and folded creases
          { origin: [-4.5, 2.5, -3], size: [9, 0.6, 6], material: { color: "#69F0AE", style: "shaded" } },
          // Hood drawstring peek
          { origin: [-2, 2.8, -0.5], size: [4, 0.4, 1], material: { color: "#FAFAFA", style: "solid" } }
        ]
      }
    ]
  },

  // 5. Áo mưa cánh dơi (batwing_raincoat)
  {
    asset_name: "batwing_raincoat",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Folded heavy oxford poncho packet (dark blue)
          { origin: [-6, 0, -4], size: [12, 3, 8], material: { color: "#0D47A1", style: "bordered" } },
          // Clear headlight oval plastic window (kính bóng đèn xe máy)
          { origin: [-3, 3, -2], size: [6, 0.3, 4], material: { color: "#E0F7FA", style: "solid" } },
          // Reflective warning stripe on back
          { origin: [-5.5, 2.8, 2], size: [11, 0.3, 1.5], material: { color: "#EEFF41", style: "solid" } },
          // Collar drawstrings
          { origin: [-1.5, 3.2, -3], size: [3, 0.5, 1], material: { color: "#ECEFF1", style: "solid" } }
        ]
      }
    ]
  },

  // 6. Cờ lê 10 (wrench_10mm)
  {
    asset_name: "wrench_10mm",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Chrome-vanadium flat handle beam
          { origin: [-1, 0, -5], size: [2, 1, 10], material: { color: "#90A4AE", style: "bordered" } },
          // Open-jaw wrench head (đầu hở)
          { origin: [-2.2, 0, -7.5], size: [4.4, 1, 3], material: { color: "#B0BEC5", style: "bordered" } },
          // Open slot cutout (hốc miệng ngậm 10mm)
          { origin: [-1, 0, -8], size: [2, 1.2, 2], material: { color: "#37474F", style: "solid" } },
          // Ring box wrench head (đầu tròng 12 cạnh)
          { origin: [-2, 0, 4.5], size: [4, 1, 3.5], material: { color: "#B0BEC5", style: "bordered" } },
          // Inner hollow hole for box end
          { origin: [-1, 0, 5.2], size: [2, 1.2, 2], material: { color: "#37474F", style: "solid" } },
          // Embossed size marking "10" on shaft
          { origin: [-0.6, 1, -1], size: [1.2, 0.2, 2], material: { color: "#CFD8DC", style: "solid" } }
        ]
      }
    ]
  },

  // 7. Tua vít 4 cạnh (phillips_screwdriver)
  {
    asset_name: "phillips_screwdriver",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Ergonomic fluted bi-color handle (yellow/black rubber grip)
          { origin: [-1.8, 0, -2], size: [3.6, 6, 4], material: { color: "#FDD835", style: "bordered" } },
          // Black rubber fluted grip ribs
          { origin: [-2, 0.8, -1.8], size: [4, 4.5, 3.6], material: { color: "#212121", style: "solid" } },
          // Steel bolster collar
          { origin: [-1, 6, -1], size: [2, 1.5, 2], material: { color: "#90A4AE", style: "solid" } },
          // Round chrome vanadium steel shank
          { origin: [-0.5, 7.5, -0.5], size: [1, 7.5, 1], material: { color: "#CFD8DC", style: "bordered" } },
          // Blackened magnetic Phillips cross tip (mũi 4 cạnh)
          { origin: [-0.6, 15, -0.6], size: [1.2, 1.5, 1.2], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },

  // 8. Bơm tay mini (mini_hand_pump)
  {
    asset_name: "mini_hand_pump",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Main aluminum pump cylinder barrel
          { origin: [-1, 2, -1], size: [2, 12, 2], material: { color: "#37474F", style: "bordered" } },
          // Fold-out T-handle at top
          { origin: [-3, 14, -0.8], size: [6, 1.5, 1.6], material: { color: "#212121", style: "bordered" } },
          // Foot stirrup stand fold at base
          { origin: [-2.5, 0, -2], size: [5, 2, 4], material: { color: "#212121", style: "bordered" } },
          // Flexible rubber air hose clamped to side
          { origin: [1, 2, -0.5], size: [0.8, 10, 1], material: { color: "#212121", style: "solid" } },
          // Brass Schrader thumb-lock valve nozzle
          { origin: [1, 12, -0.6], size: [1.2, 2, 1.2], material: { color: "#FFB300", style: "solid" } }
        ]
      }
    ]
  },

  // 9. Miếng vá săm xe (tire_patch)
  {
    asset_name: "tire_patch",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Black vulcanized beveled outer rubber disc
          { origin: [-3.5, 0, -3.5], size: [7, 0.4, 7], material: { color: "#212121", style: "bordered" } },
          { origin: [-3.5, 0, -3.5], size: [7, 0.4, 7], pivot: [0, 0.2, 0], rotation: [0, 45, 0], material: { color: "#212121", style: "bordered" } },
          // Bright orange chemical vulcanizing bonding face
          { origin: [-2.2, 0.4, -2.2], size: [4.4, 0.3, 4.4], material: { color: "#FF6D00", style: "solid" } },
          { origin: [-2.2, 0.4, -2.2], size: [4.4, 0.3, 4.4], pivot: [0, 0.5, 0], rotation: [0, 45, 0], material: { color: "#FF6D00", style: "solid" } },
          // Silver peelable protective foil tab
          { origin: [2, 0.4, -1], size: [2, 0.2, 2], pivot: [2, 0.4, 0], rotation: [0, 0, 20], material: { color: "#ECEFF1", style: "solid" } }
        ]
      }
    ]
  },

  // 10. Giấy phép lái xe (drivers_license)
  {
    asset_name: "drivers_license",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          // Laminated PET plastic card in pale yellow/tan
          { origin: [-6, 0, -3.5], size: [12, 0.2, 7], material: { color: "#FFF9C4", style: "bordered" } },
          // National emblem header ribbon in red
          { origin: [-5.5, 0.2, 2], size: [11, 0.1, 1.2], material: { color: "#D32F2F", style: "solid" } },
          // Driver portrait photo square box
          { origin: [-5, 0.2, -2.5], size: [2.5, 0.1, 3.5], material: { color: "#90A4AE", style: "bordered" } },
          // Text lines (Full name, DoB, class A1/A2)
          { origin: [-1.8, 0.2, -0.5], size: [6.8, 0.1, 0.6], material: { color: "#212121", style: "solid" } },
          { origin: [-1.8, 0.2, -1.8], size: [6.8, 0.1, 0.6], material: { color: "#212121", style: "solid" } },
          // Class A1 badge stamp
          { origin: [3.5, 0.2, 0.5], size: [1.8, 0.1, 1], material: { color: "#C62828", style: "solid" } }
        ]
      }
    ]
  }
];

// Execution runner
async function main() {
  console.log(`Starting generation for ${models.length} Tools & Accessories models...`);
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

  console.log(`\nAll 10 models built successfully. Packaging into Addon...`);
  const addonName = "vietnam_tools_accessories_pack";
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

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");

let collisionDefsCache = null;

function loadCollisionDefinitions() {
  if (collisionDefsCache) return collisionDefsCache;
  const candidates = [
    path.resolve(__dirname, '..', 'output', 'block_collision_definitions.json'),
    path.resolve(process.cwd(), 'output', 'block_collision_definitions.json'),
    'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output\\block_collision_definitions.json'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        collisionDefsCache = JSON.parse(fs.readFileSync(p, 'utf8'));
        return collisionDefsCache;
      } catch (e) {}
    }
  }
  return null;
}

function getCollisionDefinition(assetName) {
  const defs = loadCollisionDefinitions();
  if (defs && defs[assetName]) return defs[assetName];
  return null;
}

function generateUuid() {
  return crypto.randomUUID();
}

function buildManifest(name, description, rpUuid, bpUuid) {
  const manifest = {
    format_version: 2,
    header: {
      name,
      description,
      uuid: rpUuid || generateUuid(),
      version: [1, 0, 0],
      min_engine_version: [1, 19, 0]
    },
    modules: [
      {
        type: rpUuid ? "resources" : "data",
        uuid: generateUuid(),
        version: [1, 0, 0]
      }
    ]
  };

  if (bpUuid) {
    manifest.dependencies = [
      {
        uuid: bpUuid,
        version: [1, 0, 0]
      }
    ];
  }

  return JSON.stringify(manifest, null, 2);
}

function buildTerrainTextureJson(blockIds) {
  const textureData = {};
  blockIds.forEach(id => {
    textureData[id] = {
      textures: `textures/blocks/${id}`
    };
  });

  return JSON.stringify({
    resource_pack_name: "custom_blocks",
    texture_name: "atlas.terrain",
    texture_data: textureData
  }, null, 2);
}

function buildBlocksJson(blockIds) {
  const blocks = {};
  blockIds.forEach(id => {
    blocks[id] = {
      textures: id,
      sound: "wood"
    };
  });
  return JSON.stringify(blocks, null, 2);
}

function buildEntityClientJson(shortId, fullId, geoIdentifier) {
  return JSON.stringify({
    format_version: "1.10.0",
    "minecraft:client_entity": {
      description: {
        identifier: fullId,
        materials: { default: "entity_alphatest" },
        textures: { default: `textures/entity/${shortId}` },
        geometry: { default: geoIdentifier },
        render_controllers: ["controller.render.default"]
      }
    }
  }, null, 2);
}

function buildBlockBehaviorJson(fullId, geoIdentifier, collisionDef) {
  let collisionComponent = {
    "minecraft:collision_box": true,
    "minecraft:selection_box": true
  };

  if (collisionDef) {
    collisionComponent = {
      "minecraft:collision_box": {
        origin: collisionDef.collision_box.origin,
        size: collisionDef.collision_box.size
      },
      "minecraft:selection_box": {
        origin: collisionDef.selection_box.origin,
        size: collisionDef.selection_box.size
      }
    };
  }

  return JSON.stringify({
    format_version: "1.19.0",
    "minecraft:block": {
      description: {
        identifier: fullId,
        properties: {
          "custom:facing": [0, 1, 2, 3]
        }
      },
      components: {
        "minecraft:geometry": geoIdentifier,
        "minecraft:material_instances": {
          "*": {
            texture: fullId.split(":")[1],
            render_method: "blend"
          }
        },
        "minecraft:destructible_by_mining": {
          seconds_to_destroy: 1.5
        },
        "minecraft:destructible_by_explosion": {
          explosion_resistance: 1.5
        },
        "minecraft:on_player_placing": {
          event: "custom:set_facing"
        },
        ...collisionComponent
      },
      events: {
        "custom:set_facing": {
          set_block_property: {
            "custom:facing": "query.cardinal_facing_2d"
          }
        }
      },
      permutations: [
        {
          condition: "query.block_property('custom:facing') == 2",
          components: {
            "minecraft:transformation": { rotation: [0, 0, 0] }
          }
        },
        {
          condition: "query.block_property('custom:facing') == 3",
          components: {
            "minecraft:transformation": { rotation: [0, 180, 0] }
          }
        },
        {
          condition: "query.block_property('custom:facing') == 4",
          components: {
            "minecraft:transformation": { rotation: [0, 90, 0] }
          }
        },
        {
          condition: "query.block_property('custom:facing') == 5",
          components: {
            "minecraft:transformation": { rotation: [0, 270, 0] }
          }
        }
      ]
    }
  }, null, 2);
}

function buildEntityBehaviorJson(fullId) {
  return JSON.stringify({
    format_version: "1.19.0",
    "minecraft:entity": {
      description: {
        identifier: fullId,
        is_spawnable: true,
        is_summonable: true,
        is_experimental: false
      },
      components: {
        "minecraft:physics": {},
        "minecraft:movement": { value: 0.25 },
        "minecraft:movement.basic": {},
        "minecraft:jump.static": {},
        "minecraft:can_climb": {},
        "minecraft:collision_box": { width: 1.0, height: 1.0 },
        "minecraft:health": { value: 20, max: 20 }
      }
    }
  }, null, 2);
}

function findAssetFile(baseDir, assetName, extension) {
  const direct = path.join(baseDir, `${assetName}${extension}`);
  if (fs.existsSync(direct)) return direct;

  const root = path.resolve(baseDir.includes("output") ? baseDir.substring(0, baseDir.indexOf("output") + 6) : baseDir);
  if (fs.existsSync(root)) {
    const subs = fs.readdirSync(root, { withFileTypes: true })
      .filter(d => d.isDirectory() && (d.name === assetName || d.name.startsWith(`${assetName}_v`)))
      .map(d => d.name)
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));

    for (const sub of subs) {
      const p = path.join(root, sub, `${assetName}${extension}`);
      if (fs.existsSync(p)) return p;
    }
  }

  const alt = path.join(baseDir, 'newmodel', `${assetName}${extension}`);
  if (fs.existsSync(alt)) return alt;

  return direct;
}

function packageAddon(options) {
  const { addonName, items, outputDir } = options;
  const zip = new AdmZip();
  const bpFolder = `${addonName}_BP/`;
  const rpFolder = `${addonName}_RP/`;

  const rpUuid = generateUuid();
  const bpUuid = generateUuid();

  zip.addFile(rpFolder + "manifest.json", Buffer.from(buildManifest(`${addonName} RP`, "Generated Resource Pack", rpUuid, bpUuid)));
  zip.addFile(bpFolder + "manifest.json", Buffer.from(buildManifest(`${addonName} BP`, "Generated Behavior Pack", bpUuid, rpUuid)));

  const blockIds = [];
  let hasTexture = false;
  let firstTexturePath = null;

  items.forEach(item => {
    const shortId = item.assetName || item.asset_name;
    const fullId = `custom:${shortId}`;
    const geoIdentifier = `geometry.${shortId}`;

    const geoPath = findAssetFile(outputDir, shortId, ".geo.json");
    const texturePath = findAssetFile(outputDir, shortId, ".png");
    const textureExists = fs.existsSync(texturePath);

    if (textureExists) {
      hasTexture = true;
      if (!firstTexturePath) firstTexturePath = texturePath;
    }

    if (item.mode === "block") {
      blockIds.push(shortId);
      const colDef = item.collisionDef || item.collision || getCollisionDefinition(shortId);
      zip.addFile(bpFolder + `blocks/${shortId}.json`, Buffer.from(buildBlockBehaviorJson(fullId, geoIdentifier, colDef)));
      if (fs.existsSync(geoPath)) zip.addLocalFile(geoPath, rpFolder + "models/blocks/");
      if (textureExists) zip.addLocalFile(texturePath, rpFolder + "textures/blocks/", `${shortId}.png`);
    } else {
      zip.addFile(rpFolder + `entity/${shortId}.entity.json`, Buffer.from(buildEntityClientJson(shortId, fullId, geoIdentifier)));
      zip.addFile(bpFolder + `entities/${shortId}.json`, Buffer.from(buildEntityBehaviorJson(fullId)));
      if (fs.existsSync(geoPath)) zip.addLocalFile(geoPath, rpFolder + "models/entity/");
      if (textureExists) zip.addLocalFile(texturePath, rpFolder + "textures/entity/", `${shortId}.png`);
    }
  });

  if (blockIds.length > 0) {
    zip.addFile(rpFolder + "textures/terrain_texture.json", Buffer.from(buildTerrainTextureJson(blockIds)));
    zip.addFile(rpFolder + "blocks.json", Buffer.from(buildBlocksJson(blockIds)));
  }

  if (firstTexturePath && fs.existsSync(firstTexturePath)) {
    zip.addLocalFile(firstTexturePath, bpFolder, "pack_icon.png");
    zip.addLocalFile(firstTexturePath, rpFolder, "pack_icon.png");
  } else {
    zip.addFile(bpFolder + "pack_icon.png", Buffer.from(""));
    zip.addFile(rpFolder + "pack_icon.png", Buffer.from(""));
  }

  const addonPath = path.join(outputDir, `${addonName}.mcaddon`);
  zip.writeZip(addonPath);
  return addonPath;
}

function createAddon(options) {
  return packageAddon({
    addonName: options.assetName,
    items: [{ assetName: options.assetName, mode: options.mode }],
    outputDir: options.outputDir
  });
}

module.exports = {
  packageAddon,
  createAddon
};

const fs = require("fs");
const path = require("path");
const { parseCommand } = require("./command_parser");
const { buildGeometry, saveGeometry } = require("./geometry_builder");
const { paintTexture, saveTexture } = require("./texture_painter");
const { createAddon } = require("./addon_builder");
const { resolveModelOutputDir } = require("./output_manager");
const skillManifest = require("../skill_manifest.json");

const SAMPLE_PAYLOAD_PATH = path.join(__dirname, "..", "examples", "sample_payload.json");

function buildMinecraftAsset(input, options) {
  const settings = options || {};
  let payload = input;

  if (typeof payload === "string") {
    payload = JSON.parse(payload);
  }

  const built = buildGeometry(payload, {
    mode: settings.mode,
    generateTexture: settings.generateTexture
  });

  let outputDir;
  let version = null;
  const rawOut = settings.outputDir ? path.resolve(settings.outputDir) : null;

  if (rawOut && (rawOut.endsWith(built.assetName) || rawOut.match(new RegExp(`${built.assetName}_v\\d+$`, "i")))) {
    outputDir = rawOut;
    const vMatch = rawOut.match(/_v(\d+)$/i);
    version = vMatch ? `v${vMatch[1]}` : "v1";
    fs.mkdirSync(outputDir, { recursive: true });
  } else {
    const baseRoot = rawOut || path.join(process.cwd(), "output");
    const resolved = resolveModelOutputDir(baseRoot, built.assetName, {
      isRevision: Boolean(settings.is_revision || settings.isRevision || payload.is_revision || payload.isRevision),
      explicitVersion: settings.version || payload.version
    });
    outputDir = resolved.dirPath;
    version = resolved.version;
  }

  const geoPath = saveGeometry(built.geometry, outputDir, built.assetName);
  let texturePath = null;

  if (built.generateTexture) {
    const buffer = paintTexture({
      width: built.textureWidth,
      height: built.textureHeight,
      cubeRecords: built.cubeRecords
    });
    texturePath = saveTexture(buffer, outputDir, built.assetName);
  }

  const description = built.geometry["minecraft:geometry"][0].description;
  let addonPath = null;

  if (payload.build_addon) {
    addonPath = createAddon({
      assetName: built.assetName,
      identifier: description.identifier,
      mode: built.mode,
      geoPath,
      texturePath,
      outputDir
    });
  }

  return {
    assetName: built.assetName,
    version,
    outputDirectory: outputDir,
    identifier: description.identifier,
    mode: built.mode,
    geoPath,
    texturePath,
    addonPath,
    textureWidth: built.textureWidth,
    textureHeight: built.textureHeight,
    boneCount: built.geometry["minecraft:geometry"][0].bones.length,
    cubeCount: built.cubeRecords.length,
    visibleBounds: {
      width: description.visible_bounds_width,
      height: description.visible_bounds_height,
      offset: description.visible_bounds_offset
    },
    geometry: built.geometry
  };
}

function readArgument(args, flag) {
  const index = args.indexOf(flag);
  if (index === -1 || index + 1 >= args.length) {
    return null;
  }
  return args[index + 1];
}

function runCli(args) {
  const outputDir = readArgument(args, "--out") || path.join(process.cwd(), "output");
  const payloadPath = args.includes("--test") ? SAMPLE_PAYLOAD_PATH : readArgument(args, "--payload");

  if (!payloadPath) {
    console.error("Usage: node src/index.js --test | --payload <file.json> [--out <dir>]");
    return 1;
  }

  const payload = JSON.parse(fs.readFileSync(path.resolve(payloadPath), "utf8"));
  const result = buildMinecraftAsset(payload, { outputDir });

  console.log("asset:       " + result.assetName);
  console.log("version:     " + result.version);
  console.log("directory:   " + result.outputDirectory);
  console.log("mode:        " + result.mode);
  console.log("bones:       " + result.boneCount);
  console.log("cubes:       " + result.cubeCount);
  console.log("texture:     " + result.textureWidth + "x" + result.textureHeight);
  console.log("geometry:    " + result.geoPath);
  console.log("png:         " + (result.texturePath || "not generated"));
  if (result.addonPath) {
    console.log("addon:       " + result.addonPath);
  }
  return 0;
}

module.exports = { parseCommand, buildMinecraftAsset, skillManifest };

if (require.main === module) {
  try {
    process.exitCode = runCli(process.argv.slice(2));
  } catch (error) {
    console.error("mcmodel-bedrock-skill error: " + error.message);
    process.exitCode = 1;
  }
}

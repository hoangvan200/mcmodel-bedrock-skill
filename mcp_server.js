const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { buildMinecraftAsset, skillManifest } = require(".");
const { buildArmorAttachable, buildArmorBehaviorItem } = require("./src/armor_builder");
const { resolveModelOutputDir } = require("./src/output_manager");
const { packageAddon } = require("./src/addon_builder");
const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const server = new Server({ name: "mcmodel-bedrock-skill", version: "1.0.0" }, { capabilities: { tools: {}, prompts: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: skillManifest.name,
      description: skillManifest.description,
      inputSchema: skillManifest.input_schema
    },
    {
      name: "package_addon",
      description: "Packages multiple previously generated models into a single .mcaddon file. Call this once after building all models.",
      inputSchema: {
        type: "object",
        properties: {
          addon_name: { type: "string", description: "Name of the addon." },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                asset_name: { type: "string" },
                mode: { type: "string", enum: ["block", "entity"] }
              },
              required: ["asset_name", "mode"]
            }
          },
          is_revision: { type: "boolean", description: "Set to true if this is an updated revision of an existing addon." },
          version: { type: "string", description: "Explicit version tag e.g. 'v1', 'v2'." }
        },
        required: ["addon_name", "items"]
      }
    },
    {
      name: "build_armor_attachable",
      description: "Generates the Attachable JSON and optional Behavior Pack Item JSON for a custom armor piece. Call this after build_minecraft_asset for each armor piece.",
      inputSchema: {
        type: "object",
        properties: {
          asset_name: { type: "string", description: "Full asset name e.g. 'warden_armor_helmet'" },
          piece: {
            type: "string",
            enum: ["helmet", "chestplate", "leggings", "boots"],
            description: "Which armor piece this is."
          },
          geo_identifier: { type: "string", description: "Geometry identifier from the .geo.json e.g. 'geometry.warden_armor_helmet'" },
          namespace: { type: "string", description: "Addon namespace e.g. 'my_pack'" },
          output_dir: { type: "string", description: "Base output directory (defaults to ./output)" },
          is_revision: { type: "boolean", description: "Set to true if this is an updated revision of an existing model." },
          version: { type: "string", description: "Explicit version tag e.g. 'v1', 'v2'." }
        },
        required: ["asset_name", "piece", "geo_identifier", "namespace"]
      }
    },
    {
      name: "generate_skin",
      description: "Generates a Minecraft player skin PNG (64x64 or 128x128) with 2-layer support (base skin + overlay for hair/clothes/accessories with 3D raised effect) and back ponytail cascade support.",
      inputSchema: {
        type: "object",
        properties: {
          output_name: { type: "string", description: "Output file name without extension e.g. 'warden_skin'" },
          resolution: {
            type: "number",
            enum: [16, 32],
            description: "Skin resolution: 16 = 64x64px (standard), 32 = 128x128px (HD). Default: 16"
          },
          arm_style: {
            type: "string",
            enum: ["classic", "slim"],
            description: "Arm width style: classic (4px) or slim/Alex (3px). Default: classic"
          },
          skin_color: { type: "string", description: "Base skin tone hex color e.g. '#F5C99A'. Passed as --base-color to skin_painter.py" },
          hair_color: { type: "string", description: "Hair color hex e.g. '#1A1A2E'" },
          hair_style: {
            type: "string",
            enum: ["auto", "loose", "ponytail", "braid", "twintails", "short"],
            description: "Hair styling: 'auto', 'loose' (untied flowing), 'ponytail' (tied back cascade), 'braid', 'twintails', or 'short'. Default: auto"
          },
          outfit_colors: {
            type: "object",
            description: "Colors for each outfit region",
            properties: {
              top: { type: "string", description: "Shirt/top color hex" },
              bottom: { type: "string", description: "Pants/bottom color hex" },
              shoes: { type: "string", description: "Shoes/boots color hex" }
            }
          },
          layer2_style: {
            type: "string",
            enum: ["raised", "flat"],
            description: "Layer 2 rendering: raised = 3D effect with edge darken/hair strands, flat = simple copy. Default: raised"
          },
          description: { type: "string", description: "Full character description for context" },
          is_revision: { type: "boolean", description: "Set to true if this is an updated revision of an existing skin." },
          version: { type: "string", description: "Explicit version tag e.g. 'v1', 'v2'." }
        },
        required: ["output_name"]
      }
    }
  ]
}));

server.setRequestHandler(ListPromptsRequestSchema, async () => ({
  prompts: [
    {
      name: "mcmodel-bedrock",
      description: "Prompt for the Minecraft Bedrock Model Architect",
      arguments: []
    }
  ]
}));

server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  if (request.params.name !== "mcmodel-bedrock") {
    throw new Error(`Unknown prompt: ${request.params.name}`);
  }
  const promptText = fs.readFileSync("./prompts/system_prompt.md", "utf8");
  return {
    description: "Minecraft Bedrock Model Architect Prompt",
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptText
        }
      }
    ]
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  // ── package_addon ────────────────────────────────────────────────────────
  if (name === "package_addon") {
    const { addon_name, items } = args;
    const baseDir = path.resolve("./output");
    const { dirPath: outDir, version } = resolveModelOutputDir(baseDir, addon_name, {
      isRevision: Boolean(args.is_revision || args.isRevision),
      explicitVersion: args.version
    });

    const addonPath = packageAddon({ addonName: addon_name, items, outputDir: outDir });
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          addon_name,
          version,
          output_directory: outDir,
          addon_path: addonPath,
          items_count: items.length
        }, null, 2)
      }]
    };
  }

  // ── build_armor_attachable ───────────────────────────────────────────────
  if (name === "build_armor_attachable") {
    const { asset_name, piece, geo_identifier, namespace, output_dir } = args;
    const baseDir = path.resolve(output_dir || "./output");
    const { dirPath: outDir, version } = resolveModelOutputDir(baseDir, asset_name, {
      isRevision: Boolean(args.is_revision || args.isRevision),
      explicitVersion: args.version
    });

    // Generate attachable JSON
    const attachableJson = buildArmorAttachable(asset_name, piece, geo_identifier, namespace);
    const attachableDir = path.join(outDir, "attachables");
    fs.mkdirSync(attachableDir, { recursive: true });
    const attachablePath = path.join(attachableDir, `${asset_name}.json`);
    fs.writeFileSync(attachablePath, JSON.stringify(attachableJson, null, 2) + "\n", "utf8");

    // Generate BP item JSON
    const itemJson = buildArmorBehaviorItem(asset_name, piece, namespace, piece);
    const itemBpDir = path.join(outDir, "bp_items");
    fs.mkdirSync(itemBpDir, { recursive: true });
    const itemBpPath = path.join(itemBpDir, `${asset_name}.json`);
    fs.writeFileSync(itemBpPath, JSON.stringify(itemJson, null, 2) + "\n", "utf8");

    const result = {
      success: true,
      asset_name,
      version,
      piece,
      output_directory: outDir,
      attachable_path: attachablePath,
      item_bp_path: itemBpPath,
      namespace,
      geo_identifier
    };
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }

  // ── generate_skin ────────────────────────────────────────────────────────
  if (name === "generate_skin") {
    const {
      output_name,
      resolution = 16,
      arm_style = "classic",
      skin_color = "#F5C99A",
      hair_color = "#3D2B1F",
      hair_style = "auto",
      outfit_colors = {},
      layer2_style = "raised",
      description = ""
    } = args;

    const baseDir = path.resolve("./output");
    const { dirPath: outDir, version } = resolveModelOutputDir(baseDir, output_name, {
      isRevision: Boolean(args.is_revision || args.isRevision),
      explicitVersion: args.version
    });

    const outputPath = path.join(outDir, `${output_name}.png`);
    const descLower = (description || "").toLowerCase();
    const nameLower = (output_name || "").toLowerCase();
    const isRaiden = descLower.includes("raiden") || nameLower.includes("raiden") ||
                     descLower.includes("shogun") || descLower.includes("baal") ||
                     descLower.includes("loi than") || descLower.includes("electro archon");
    const isKeqing = descLower.includes("keqing") || nameLower.includes("keqing") ||
                     descLower.includes("yuheng") || descLower.includes("khac tinh");
    const isYae = descLower.includes("yae") || nameLower.includes("yae") ||
                  descLower.includes("miko") || descLower.includes("guuji");

    let scriptPath = path.resolve(__dirname, "scripts", "skin_painter.py");
    let argv = [];

    if (isRaiden) {
      scriptPath = path.resolve(__dirname, "scripts", "generate_raiden_skin.py");
      argv = [
        scriptPath,
        "--output", outputPath,
        "--resolution", String(resolution),
        "--arm-style", arm_style
      ];
    } else if (isKeqing) {
      scriptPath = path.resolve(__dirname, "scripts", "generate_keqing_skin.py");
      argv = [
        scriptPath,
        "--output", outputPath,
        "--resolution", String(resolution),
        "--arm-style", arm_style
      ];
    } else if (isYae) {
      scriptPath = path.resolve(__dirname, "scripts", "generate_yae_miko_skin.py");
      argv = [
        scriptPath,
        "--output", outputPath,
        "--resolution", String(resolution)
      ];
    } else {
      argv = [
        scriptPath,
        "--output", outputPath,
        "--resolution", String(resolution),
        "--arm-style", arm_style,
        "--base-color", skin_color,
        "--hair-color", hair_color,
        "--hair-style", hair_style,
        "--outfit-colors", JSON.stringify(outfit_colors),
        "--layer2-style", layer2_style
      ];
      if (description) argv.push("--description", description);
    }

    const proc = spawnSync("python", argv, { encoding: "utf8", cwd: __dirname });
    const stdout = (proc.stdout || "").trim();
    const stderr = (proc.stderr || "").trim();

    if (proc.status !== 0) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ success: false, error: stderr || proc.error?.message || "Unknown error" }, null, 2)
        }]
      };
    }

    const canvasSize = resolution === 32 ? 128 : 64;
    return {
      content: [{
        type: "text",
        text: JSON.stringify({
          success: true,
          output_name,
          version,
          output_directory: outDir,
          skin_path: outputPath,
          resolution: `${canvasSize}x${canvasSize}px`,
          arm_style,
          layers: 2,
          layer1: "Base skin (inner body, hair base, outfit base)",
          layer2: `Overlay with ${layer2_style} 3D effect (hair strands, clothing folds, accessories)`,
          notes: stdout || "Skin generated successfully."
        }, null, 2)
      }]
    };
  }

  // ── build_minecraft_asset ────────────────────────────────────────────────
  if (name !== skillManifest.name) {
    throw new Error(`Unknown tool: ${name}`);
  }

  const result = buildMinecraftAsset(args, {
    outputDir: "./output",
    isRevision: Boolean(args.is_revision || args.isRevision),
    version: args.version
  });

  const summary = {
    success: true,
    asset_name: result.assetName,
    version: result.version,
    output_directory: result.outputDirectory,
    mode: result.mode,
    geometry_path: result.geoPath,
    texture_path: result.texturePath,
    addon_path: result.addonPath,
    texture_size: `${result.textureWidth}x${result.textureHeight}`,
    bone_count: result.boneCount,
    cube_count: result.cubeCount,
    visible_bounds: result.visibleBounds
  };

  return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
});

async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

run().catch(console.error);

# mcmodel-bedrock-skill — Installation and Usage Guide

`mcmodel-bedrock-skill` lets a vision-language AI agent turn a 2D reference image plus a command into a Minecraft Bedrock `.geo.json` model and an optional procedural `.png` texture.

```
/mcmodel [--block | --entity] [--texture] <description>
```

| Flag | Meaning |
| --- | --- |
| `--block` | Static block model, 16x16x16 standard box, hard limit 30x30x30. Default. |
| `--entity` | Animatable entity with a bone hierarchy and visible bounds. |
| `--texture` | Also generate a procedural `.png` texture. |

How it works: the agent receives `prompts/system_prompt.md`, reasons in a `<spatial_analysis>` block, then calls the tool `build_minecraft_asset` (schema in `skill_manifest.json`). `src/index.js` validates the payload, packs Box UV, writes the files, and paints the texture.

## 1. System requirements and installation

- Node.js 16 or newer and npm.
- A vision-capable model that supports tool calling (OpenAI, Claude, or any MCP client).
- Runtime dependency: `pngjs` (installed by npm).

```bash
cd mcmodel-bedrock-skill
npm install
```

Use it inside another project:

```bash
npm install ./mcmodel-bedrock-skill
```

```js
const { parseCommand, buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");
```

## 2. Running the verification test

```bash
npm test
```

The test loads `examples/sample_payload.json` (a medieval lantern with rotated cubes, pivots, inflate values, and hex materials) and writes these files into `./output`:

- `medieval_lantern.geo.json`
- `medieval_lantern.png`

You can also build from your own payload:

```bash
node src/index.js --payload my_payload.json --out ./output
```

## 3. Integrating with an agent

All three integrations use the same three assets:

- System prompt: `prompts/system_prompt.md`
- Tool definition: `skillManifest` (`name`, `description`, `input_schema`)
- Executor: `buildMinecraftAsset(toolInput, { outputDir, mode, generateTexture })`

Pass `mode` and `generateTexture` from `parseCommand` so the command flags always override the model's values.

### 3.1 OpenAI Function Calling

```js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { parseCommand, buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");

const client = new OpenAI();
const skillRoot = path.dirname(require.resolve("mcmodel-bedrock-skill/package.json"));
const systemPrompt = fs.readFileSync(path.join(skillRoot, "prompts", "system_prompt.md"), "utf8");

async function run(userText, imagePath) {
  const parsed = parseCommand(userText);
  const imageBase64 = fs.readFileSync(imagePath).toString("base64");

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: `Mode: ${parsed.mode}\nTexture: ${parsed.generateTexture}\nRequest: ${parsed.cleanPrompt}` },
          { type: "image_url", image_url: { url: `data:image/png;base64,${imageBase64}` } }
        ]
      }
    ],
    tools: [
      {
        type: "function",
        function: {
          name: skillManifest.name,
          description: skillManifest.description,
          parameters: skillManifest.input_schema
        }
      }
    ],
    tool_choice: "auto"
  });

  const call = response.choices[0].message.tool_calls[0];
  return buildMinecraftAsset(JSON.parse(call.function.arguments), {
    outputDir: "./output",
    mode: parsed.mode,
    generateTexture: parsed.generateTexture
  });
}
```

Keep `tool_choice` on `"auto"` so the model can write the `<spatial_analysis>` block before the tool call.

### 3.2 Claude Tool Use

```js
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");
const { parseCommand, buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");

const client = new Anthropic();
const skillRoot = path.dirname(require.resolve("mcmodel-bedrock-skill/package.json"));
const systemPrompt = fs.readFileSync(path.join(skillRoot, "prompts", "system_prompt.md"), "utf8");

async function run(userText, imagePath) {
  const parsed = parseCommand(userText);
  const imageBase64 = fs.readFileSync(imagePath).toString("base64");

  const response = await client.messages.create({
    model: "claude-sonnet-5-5",
    max_tokens: 8000,
    system: systemPrompt,
    tools: [
      {
        name: skillManifest.name,
        description: skillManifest.description,
        input_schema: skillManifest.input_schema
      }
    ],
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: "image/png", data: imageBase64 } },
          { type: "text", text: `Mode: ${parsed.mode}\nTexture: ${parsed.generateTexture}\nRequest: ${parsed.cleanPrompt}` }
        ]
      }
    ]
  });

  const toolUse = response.content.find((block) => block.type === "tool_use" && block.name === skillManifest.name);
  return buildMinecraftAsset(toolUse.input, {
    outputDir: "./output",
    mode: parsed.mode,
    generateTexture: parsed.generateTexture
  });
}
```

### 3.3 MCP server (stdio)

```bash
npm install @modelcontextprotocol/sdk
```

```js
const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");

const server = new Server({ name: "mcmodel-bedrock-skill", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: skillManifest.name,
      description: skillManifest.description,
      inputSchema: skillManifest.input_schema
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const result = buildMinecraftAsset(request.params.arguments, { outputDir: "./output" });
  const summary = { ...result };
  delete summary.geometry;
  return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
});

server.connect(new StdioServerTransport());
```

Register the server in your MCP client with `command: "node"` and `args: ["path/to/mcp_server.js"]`. Add `prompts/system_prompt.md` to the client's system prompt or project instructions.

### 3.4 Custom Node.js agent backend

Wrap any model client in one function and let the skill do the rest.

```js
const fs = require("fs");
const path = require("path");
const { parseCommand, buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");

const skillRoot = path.dirname(require.resolve("mcmodel-bedrock-skill/package.json"));
const systemPrompt = fs.readFileSync(path.join(skillRoot, "prompts", "system_prompt.md"), "utf8");

async function handleMessage({ text, imageBase64, mediaType, callModel }) {
  const parsed = parseCommand(text);
  if (!parsed.isCommand) {
    return null;
  }
  const toolInput = await callModel({
    systemPrompt,
    tool: skillManifest,
    imageBase64,
    mediaType,
    userText: `Mode: ${parsed.mode}\nTexture: ${parsed.generateTexture}\nRequest: ${parsed.cleanPrompt}`
  });
  return buildMinecraftAsset(toolInput, {
    outputDir: "./output",
    mode: parsed.mode,
    generateTexture: parsed.generateTexture
  });
}
```

`callModel` is your own function. It must return the arguments object of the `build_minecraft_asset` tool call. `buildMinecraftAsset` also accepts the arguments as a JSON string.

The return value of `buildMinecraftAsset` contains `geoPath`, `texturePath` (null without `--texture`), `textureWidth`, `textureHeight`, `boneCount`, `cubeCount`, `visibleBounds`, and the full `geometry` object.

## 4. Importing into Blockbench and Minecraft Bedrock Add-ons

### 4.1 Blockbench

1. Open Blockbench and choose **File → Open Model** (or drag the file into the window). Select `<asset_name>.geo.json`.
2. If asked, choose the **Bedrock Entity** or **Bedrock Block** format that matches the mode you generated.
3. Import the texture: in the **Textures** panel choose **Import Texture** (or drag `<asset_name>.png` onto the model). The texture size is already stored in the model, so UVs line up without changes.
4. Check the pivots in **Animate** mode before animating an entity.

### 4.2 Resource pack for an entity

```
my_pack_RP/
├── manifest.json
├── entity/
│   └── mini_pig.entity.json
├── models/
│   └── entity/
│       └── mini_pig.geo.json
└── textures/
    └── entity/
        └── mini_pig.png
```

`entity/mini_pig.entity.json`:

```json
{
  "format_version": "1.10.0",
  "minecraft:client_entity": {
    "description": {
      "identifier": "mypack:mini_pig",
      "materials": { "default": "entity_alphatest" },
      "textures": { "default": "textures/entity/mini_pig" },
      "geometry": { "default": "geometry.mini_pig" },
      "render_controllers": ["controller.render.default"]
    }
  }
}
```

The geometry identifier is always `geometry.<asset_name>`.

### 4.3 Custom block

Copy the files into the resource pack:

- `models/blocks/<asset_name>.geo.json`
- `textures/blocks/<asset_name>.png`

Register the texture in `textures/terrain_texture.json`:

```json
{
  "resource_pack_name": "mypack",
  "texture_name": "atlas.terrain",
  "texture_data": {
    "medieval_lantern": { "textures": "textures/blocks/medieval_lantern" }
  }
}
```

Reference the geometry in the behavior pack block file `blocks/medieval_lantern.json`:

```json
{
  "format_version": "1.21.0",
  "minecraft:block": {
    "description": { "identifier": "mypack:medieval_lantern" },
    "components": {
      "minecraft:geometry": "geometry.medieval_lantern",
      "minecraft:material_instances": {
        "*": { "texture": "medieval_lantern", "render_method": "alpha_test" }
      }
    }
  }
}
```

Match `format_version` values to the Minecraft version you target. Enable the Holiday Creator Features or the matching experimental toggle only if your game version still requires it for custom blocks.

## 5. Behavior notes

- The tool never trusts the model's output blindly: it clamps negative sizes, drops empty cubes, repairs unknown parents and cycles, adds a `root` bone, and orders parents before children.
- In block mode the geometry is shifted up if it dips below Y = 0, and each cuboid is clamped to X -15..15, Y 0..30, Z -15..15.
- Box UV is packed per cube with footprint `2*(D+W)` by `D+H` (integer ceiling sizes) onto a 64, 128, 256, ... square canvas.
- Texture faces use shade multipliers: top 1.15, bottom 0.65, west and east 0.85, north 1.00, south 0.90.
- Every generated `.geo.json` is written with `"format_version": "1.19.0"`, whatever value the payload contains.
- Computed visible bounds use the rotated geometry and are padded for either rotation sign convention. If the agent supplies valid `visible_bounds`, they are used as given.

## 6. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Cannot find module 'pngjs'` | Run `npm install` inside `mcmodel-bedrock-skill`. |
| `Payload must contain a non-empty bones array` | The model did not fill the tool arguments. Re-send with the system prompt attached. |
| Model appears too small or large in game | Check cube sizes in pixels (16 pixels = 1 block) and `visible_bounds`. |
| Texture looks shifted in Blockbench | Import the PNG generated together with the `.geo.json`. Do not resize it. |
| Flickering faces | Add `inflate` of 0.01 or -0.01 to one of the overlapping cuboids. |

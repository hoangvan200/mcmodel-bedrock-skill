# mcmodel-bedrock-skill — Installation and Usage Guide / Hướng dẫn cài đặt và sử dụng

**Languages / Ngôn ngữ:** [English](#english) · [Tiếng Việt](#tiếng-việt)

---

<a id="english"></a>

# English

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

---

<a id="tiếng-việt"></a>

# Tiếng Việt

`mcmodel-bedrock-skill` giúp một AI agent có khả năng nhìn ảnh biến một ảnh tham chiếu 2D cùng một câu lệnh thành model Minecraft Bedrock `.geo.json` và (tùy chọn) texture `.png` được vẽ tự động.

```
/mcmodel [--block | --entity] [--texture] <mô tả>
```

| Cờ | Ý nghĩa |
| --- | --- |
| `--block` | Model block tĩnh, khung chuẩn 16x16x16, giới hạn cứng 30x30x30. Là mặc định. |
| `--entity` | Entity có thể animate, có hệ xương cha-con và visible bounds. |
| `--texture` | Tạo thêm texture `.png` tự động. |

Cách hoạt động: agent nhận `prompts/system_prompt.md`, suy luận trong khối `<spatial_analysis>`, sau đó gọi tool `build_minecraft_asset` (schema nằm trong `skill_manifest.json`). `src/index.js` kiểm tra payload, xếp Box UV, ghi file và vẽ texture.

## 1. Yêu cầu hệ thống và cài đặt

- Node.js 16 trở lên và npm.
- Một model có khả năng nhìn ảnh và hỗ trợ tool calling (OpenAI, Claude hoặc bất kỳ MCP client nào).
- Thư viện chạy: `pngjs` (npm tự cài).

```bash
cd mcmodel-bedrock-skill
npm install
```

Dùng trong dự án khác:

```bash
npm install ./mcmodel-bedrock-skill
```

```js
const { parseCommand, buildMinecraftAsset, skillManifest } = require("mcmodel-bedrock-skill");
```

## 2. Chạy bài kiểm tra

```bash
npm test
```

Bài kiểm tra nạp `examples/sample_payload.json` (một chiếc đèn lồng thời trung cổ có cube xoay, pivot, inflate và màu hex) và ghi các file sau vào thư mục `./output`:

- `medieval_lantern.geo.json`
- `medieval_lantern.png`

Bạn cũng có thể build từ payload riêng:

```bash
node src/index.js --payload my_payload.json --out ./output
```

## 3. Tích hợp vào agent

Cả ba cách tích hợp đều dùng chung ba thành phần:

- System prompt: `prompts/system_prompt.md`
- Định nghĩa tool: `skillManifest` (`name`, `description`, `input_schema`)
- Hàm thực thi: `buildMinecraftAsset(toolInput, { outputDir, mode, generateTexture })`

Hãy truyền `mode` và `generateTexture` từ `parseCommand` để các cờ trong câu lệnh luôn ghi đè giá trị do model trả về.

### 3.1 OpenAI Function Calling

Dùng đúng đoạn mã ở mục 3.1 phần English. Điểm cần nhớ:

- `tools[0].function.parameters` nhận `skillManifest.input_schema`.
- Giữ `tool_choice: "auto"` để model viết khối `<spatial_analysis>` trước khi gọi tool.
- Đọc `response.choices[0].message.tool_calls[0].function.arguments`, dùng `JSON.parse` rồi đưa vào `buildMinecraftAsset`.

### 3.2 Claude Tool Use

Dùng đúng đoạn mã ở mục 3.2 phần English. Điểm cần nhớ:

- `tools[0].input_schema` nhận `skillManifest.input_schema`.
- Ảnh gửi dưới dạng khối `image` base64, câu lệnh đã làm sạch gửi dưới dạng khối `text`.
- Tìm khối `tool_use` có `name` là `build_minecraft_asset`, rồi đưa `toolUse.input` vào `buildMinecraftAsset`.

### 3.3 MCP server (stdio)

Cài SDK:

```bash
npm install @modelcontextprotocol/sdk
```

Dùng đúng đoạn mã ở mục 3.3 phần English, lưu thành `mcp_server.js`. Đăng ký server trong MCP client với `command: "node"` và `args: ["đường/dẫn/mcp_server.js"]`. Thêm nội dung `prompts/system_prompt.md` vào system prompt hoặc hướng dẫn dự án của client.

### 3.4 Backend Node.js tự xây dựng

Bọc client của model bạn dùng trong một hàm `callModel` và để skill xử lý phần còn lại. Hàm `handleMessage` ở mục 3.4 phần English thực hiện các bước:

1. `parseCommand(text)` tách cờ và làm sạch mô tả. Nếu `isCommand` là `false` thì bỏ qua tin nhắn.
2. Gọi `callModel` với system prompt, `skillManifest`, ảnh và văn bản `Mode / Texture / Request`.
3. `callModel` phải trả về object tham số của tool `build_minecraft_asset`.
4. `buildMinecraftAsset(toolInput, { outputDir, mode, generateTexture })` ghi file và trả về kết quả.

Kết quả của `buildMinecraftAsset` gồm `geoPath`, `texturePath` (là `null` nếu không có `--texture`), `textureWidth`, `textureHeight`, `boneCount`, `cubeCount`, `visibleBounds` và toàn bộ object `geometry`.

## 4. Nhập vào Blockbench và Minecraft Bedrock Add-on

### 4.1 Blockbench

1. Mở Blockbench, chọn **File → Open Model** (hoặc kéo thả file vào cửa sổ) và chọn `<asset_name>.geo.json`.
2. Nếu được hỏi, chọn định dạng **Bedrock Entity** hoặc **Bedrock Block** tương ứng với chế độ đã tạo.
3. Nhập texture: trong bảng **Textures** chọn **Import Texture** (hoặc kéo `<asset_name>.png` vào model). Kích thước texture đã được lưu trong model nên UV khớp mà không cần chỉnh.
4. Kiểm tra pivot ở chế độ **Animate** trước khi làm animation cho entity.

### 4.2 Resource pack cho entity

Cấu trúc thư mục và file `entity/mini_pig.entity.json` giống mục 4.2 phần English. Lưu ý:

- `models/entity/<asset_name>.geo.json` chứa model.
- `textures/entity/<asset_name>.png` chứa texture.
- Identifier của geometry luôn là `geometry.<asset_name>`.

### 4.3 Block tùy chỉnh

Chép file vào resource pack:

- `models/blocks/<asset_name>.geo.json`
- `textures/blocks/<asset_name>.png`

Khai báo texture trong `textures/terrain_texture.json` và tham chiếu geometry trong file block của behavior pack `blocks/<asset_name>.json`, đúng như hai đoạn JSON ở mục 4.3 phần English. Hãy chỉnh các giá trị `format_version` cho khớp với phiên bản Minecraft bạn nhắm tới. Chỉ bật Holiday Creator Features hoặc công tắc thử nghiệm tương ứng nếu phiên bản game của bạn vẫn yêu cầu cho block tùy chỉnh.

## 5. Lưu ý về hành vi

- Tool không tin tuyệt đối vào đầu ra của model: nó ép kích thước âm về 0, bỏ cube rỗng, sửa parent không tồn tại và vòng lặp cha-con, tự thêm bone `root` và sắp xếp cha trước con.
- Ở chế độ block, toàn bộ model được nâng lên nếu thấp hơn Y = 0, và mỗi cuboid bị cắt về X -15..15, Y 0..30, Z -15..15.
- Box UV được xếp cho từng cube với kích thước vùng `2*(D+W)` x `D+H` (kích thước làm tròn lên) trên canvas vuông 64, 128, 256, ...
- Hệ số sáng tối cho từng mặt texture: trên 1.15, dưới 0.65, tây và đông 0.85, bắc 1.00, nam 0.90.
- Mọi file `.geo.json` được tạo ra đều có `"format_version": "1.19.0"`, bất kể payload truyền giá trị nào.
- Visible bounds tự tính dựa trên hình học sau khi xoay và có dư địa cho cả hai quy ước dấu của phép xoay. Nếu agent cung cấp `visible_bounds` hợp lệ thì dùng nguyên giá trị đó.

## 6. Xử lý sự cố

| Triệu chứng | Cách xử lý |
| --- | --- |
| `Cannot find module 'pngjs'` | Chạy `npm install` trong thư mục `mcmodel-bedrock-skill`. |
| `Payload must contain a non-empty bones array` | Model chưa điền tham số cho tool. Gửi lại và đính kèm system prompt. |
| Model trong game quá nhỏ hoặc quá lớn | Kiểm tra kích thước cube theo pixel (16 pixel = 1 block) và `visible_bounds`. |
| Texture bị lệch trong Blockbench | Nhập đúng file PNG được tạo cùng `.geo.json` và không đổi kích thước. |
| Mặt bị nhấp nháy | Thêm `inflate` 0.01 hoặc -0.01 cho một trong các cuboid chồng nhau. |

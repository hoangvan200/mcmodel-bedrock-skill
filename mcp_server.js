const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema, ListPromptsRequestSchema, GetPromptRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { buildMinecraftAsset, skillManifest } = require(".");
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
          }
        },
        required: ["addon_name", "items"]
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

const { packageAddon } = require("./src/addon_builder");

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "package_addon") {
    const { addon_name, items } = request.params.arguments;
    const outputDir = "./output";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    const addonPath = packageAddon({ addonName: addon_name, items, outputDir });
    return { content: [{ type: "text", text: `Successfully packaged ${items.length} items into ${addonPath}` }] };
  }

  if (request.params.name !== skillManifest.name) {
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
  
  if (!fs.existsSync("./output")) {
    fs.mkdirSync("./output", { recursive: true });
  }

  const result = buildMinecraftAsset(request.params.arguments, { outputDir: "./output" });
  const summary = { ...result };
  delete summary.geometry;
  return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] };
});

async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
}

run().catch(console.error);

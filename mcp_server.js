const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { ListToolsRequestSchema, CallToolRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { buildMinecraftAsset, skillManifest } = require(".");
const fs = require("fs");

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

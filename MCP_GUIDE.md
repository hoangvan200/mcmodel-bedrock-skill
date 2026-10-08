# MCP Integration Guide for IDEs and AI CLIs

The `mcmodel-bedrock-skill` acts as a standard Model Context Protocol (MCP) server. It exposes both the `build_minecraft_asset` tool and the `mcmodel-bedrock` prompt. You can seamlessly integrate it into modern AI IDEs and CLIs like Cursor, Claude Desktop, Roo Code (Cline), and others.

## Prerequisites
Ensure you have run `npm install` inside the `mcmodel-bedrock-skill` directory so that dependencies (like `@modelcontextprotocol/sdk`) are installed.

---

## 1. Claude Desktop
To add this skill to Claude Desktop, you need to edit your Claude Desktop configuration file.

**Location of config file:**
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration:**
Add the following to your `mcpServers` object (replace `<ABSOLUTE_PATH>` with the actual path to your `mcmodel-bedrock-skill` folder):

```json
{
  "mcpServers": {
    "mcmodel-bedrock": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH>/mcp_server.js"]
    }
  }
}
```
Restart Claude Desktop. You can now type "Use the mcmodel-bedrock prompt to generate a Minecraft model of a tree" and attach an image!

---

## 2. Cursor IDE
Cursor has built-in MCP support.

1. Open Cursor Settings (`Ctrl + ,` or `Cmd + ,`).
2. Navigate to **Features** > **MCP**.
3. Click **+ Add new MCP server**.
4. Set the following values:
   - **Name:** `mcmodel-bedrock`
   - **Type:** `command`
   - **Command:** `node <ABSOLUTE_PATH>/mcp_server.js` (replace with actual absolute path)
5. Save. Cursor will automatically detect the tool and prompt.

---

## 3. Roo Code (formerly Cline) / VSCode AI Extensions
If you use Roo Code or Cline in VSCode:

1. Open the Roo Code MCP settings file by clicking the MCP icon in the Roo Code panel and selecting "Edit MCP Settings".
2. Add the server configuration to `cline_mcp_settings.json`:

```json
{
  "mcpServers": {
    "mcmodel-bedrock": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH>/mcp_server.js"]
    }
  }
}
```
3. Save the file. Roo Code will instantly connect. You can now use the `/prompt mcmodel-bedrock` command (or let Roo Code discover the tools automatically) when providing a 2D image.

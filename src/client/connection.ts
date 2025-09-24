import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import type { MCPClient } from "../../index.js";

export async function connectToServer(
  this: MCPClient,
  serverScriptPath: string
) {
  try {
    // check if the server script path is a valid file
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");
    if (!isJs && !isPy) {
      throw new Error("Server script must be a .js or .py file");
    }

    const command = isPy
      ? process.platform === "win32"
        ? "python"
        : "python3"
      : process.execPath;
    // create a new transport
    this.transport = new StdioClientTransport({
      command,
      args: [serverScriptPath],
      env: {
        ...process.env,
        ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL as string,
      },
    });
    await this.mcp.connect(this.transport);
    // list the tools
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map((tool) => {
      return {
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema,
      };
    });
    // log the tools
    console.log(
      "Connected to server with tools:",
      this.tools.map(({ name }) => name)
    );
  } catch (e) {
    console.error("Failed to connect to MCP server:", e);
    throw e;
  }
}

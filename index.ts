import { Anthropic } from "@anthropic-ai/sdk";
import { Tool } from "@anthropic-ai/sdk/resources/messages/messages.mjs";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import dotenv from "dotenv";
import { connectToServer } from "./src/client/connection.js";
import { chatLoop } from "./src/client/chat-loop.js";
import { cleanup } from "./src/client/chat-loop.js";
dotenv.config();

// Check if the environment variables are set
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is not set");
}

class MCPClient {
  protected mcp: Client;
  protected anthropic: Anthropic;
  protected transport: StdioClientTransport | null = null;
  protected tools: Tool[] = [];

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }
  // methods will go here
  connectToServer(serverScriptPath: string) {
    return connectToServer.call(this, serverScriptPath);
  }
  chatLoop() {
    return chatLoop.call(this);
  }
  cleanup() {
    return cleanup.call(this);
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node index.ts <path_to_server_script>");
    return;
  }
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();

export type { MCPClient };

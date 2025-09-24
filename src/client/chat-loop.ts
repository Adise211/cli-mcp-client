import readline from "readline/promises";
import type { MCPClient } from "../../index.js";
import { processQuery } from "./handlers.js";

export async function chatLoop(this: MCPClient) {
  // create a new readline interface
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    console.log("\nMCP Client Started!");
    console.log("Type your queries or 'quit' to exit.");
    // loop through the readline interface
    while (true) {
      const message = await rl.question("\nQuery: ");
      if (message.toLowerCase() === "quit") {
        break;
      }
      console.log("The message is: " + message);
      // call the processQuery function
      const response = await processQuery.call(this, message);
      console.log("\n" + response);
      console.log("The response is: " + response);
    }
  } finally {
    // close the readline interface
    rl.close();
  }
}

export async function cleanup(this: MCPClient) {
  // close the MCP client
  await this.mcp.close();
}

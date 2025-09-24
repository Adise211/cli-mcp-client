import { MCPClient } from "../../index.js";
import { MessageParam } from "@anthropic-ai/sdk/resources/messages/messages.mjs";

/**
 * Processes a user query using the MCP (Model Context Protocol) with Claude.
 *
 * This function implements a two-step API call pattern required by the MCP protocol:
 *
 * 1. FIRST API CALL: Initial request to Claude with available tools
 *    - Sends user query along with available MCP tools
 *    - Claude decides whether to use tools and returns either text or tool requests
 *
 * 2. SECOND API CALL: Follow-up after tool execution (if tools were used)
 *    - Executes any requested tools via MCP
 *    - Sends tool results back to Claude for final processing
 *    - Claude generates natural language response based on tool results
 *
 * @param this - The MCPClient instance
 * @param query - The user's query string
 * @returns Promise<string> - The final response combining text and tool results
 */

export async function processQuery(this: MCPClient, query: string) {
  console.log(
    "In processQuery: " + query,
    `tools: ${this.tools.map((tool) => tool.name)}`
  );

  // Create a new messages array for the conversation
  const messages: MessageParam[] = [
    {
      role: "user",
      content: query,
    },
  ];
  console.log("The messages array is: " + JSON.stringify(messages));

  try {
    // FIRST API CALL: Initial request with available tools
    // This allows Claude to see what tools are available and decide whether to use them
    const response = await this.anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL as string,
      max_tokens: 1000,
      messages,
      tools: this.tools, // This is key - tells Claude what tools are available
    });
    console.log(
      "The response from the anthropic api is:",
      JSON.stringify(response, null, 2)
    );

    // Create a new final text array to collect all response parts
    const finalText = [];

    // Process Claude's response content
    // Claude can return either text or tool use requests
    for (const content of response.content) {
      if (content.type === "text") {
        // Direct text response - no tools needed
        finalText.push(content.text);
      } else if (content.type === "tool_use") {
        // Claude wants to use a tool - execute the MCP tool call
        const toolName = content.name;
        const toolArgs = content.input as { [x: string]: unknown } | undefined;

        // Execute the tool via MCP
        const result = await this.mcp.callTool({
          name: toolName,
          arguments: toolArgs,
        });

        // Log the tool execution
        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`
        );

        // Add the tool result to the conversation history
        // This is crucial for the second API call to understand the context
        messages.push({
          role: "user",
          content: result.content as string,
        });

        // SECOND API CALL: Process tool results and generate final response
        // This call doesn't include tools since we're just processing results
        const followUpResponse = await this.anthropic.messages.create({
          model: process.env.ANTHROPIC_MODEL as string,
          max_tokens: 1000,
          messages, // Now includes the tool result
        });

        // Extract the final response text from Claude's processing of tool results
        finalText.push(
          followUpResponse.content[0].type === "text"
            ? followUpResponse.content[0].text
            : ""
        );
      }
    }

    // Combine all response parts (text + tool execution logs + final responses)
    return finalText.join("\n");
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    return `Error: ${
      error instanceof Error ? error.message : "Unknown error occurred"
    }`;
  }
}

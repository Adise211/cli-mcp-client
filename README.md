# MCP Client TypeScript

A TypeScript client for the Model Context Protocol (MCP) that enables seamless integration between Anthropic's Claude AI and MCP servers. This client acts as a bridge, allowing Claude to interact with external tools and services through the MCP protocol.

## Features

- 🔌 **Easy MCP Server Integration**: Connect to any MCP server (Python or JavaScript)
- 🤖 **Claude AI Integration**: Seamless communication with Anthropic's Claude API
- 🛠️ **Dynamic Tool Discovery**: Automatically discovers and exposes server tools to Claude
- 💬 **Interactive Chat Interface**: Command-line interface for real-time interaction
- 🔄 **Two-Phase Processing**: Handles the complex MCP workflow with tool execution and response processing
- 📝 **Comprehensive Logging**: Built-in logging for debugging and monitoring

## Installation

### Prerequisites

- Node.js 18+
- TypeScript 5.0+
- An Anthropic API key

### Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd mcp_client_typescript
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Anthropic API key:

   ```
   ANTHROPIC_API_KEY=your_api_key_here
   ANTHROPIC_MODEL=claude-3-5-sonnet-20241022
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

## Usage

### Basic Usage

Run the client with an MCP server:

```bash
npm start <path_to_server_script>
```

Examples:

```bash
# Python MCP server
npm start ./servers/my_python_server.py

# JavaScript MCP server
npm start ./servers/my_js_server.js
```

### Interactive Mode

Once connected, you can interact with Claude through the command-line interface:

```
MCP Client Started!
Type your queries or 'quit' to exit.

Query: What tools are available?
[Calling tool list_tools with args {}]
Available tools: file_operations, database_query, web_search

Query: Search for information about TypeScript
[Calling tool web_search with args {"query": "TypeScript"}]
Based on the search results, TypeScript is a strongly typed programming language...
```

### Programmatic Usage

You can also use the client as a library:

```typescript
import { MCPClient } from "@adise/mcp-client-typescript";

const client = new MCPClient();

try {
  // Connect to an MCP server
  await client.connectToServer("./servers/my_server.py");

  // Start interactive chat
  await client.chatLoop();
} finally {
  // Clean up connections
  await client.cleanup();
}
```

## How It Works

The MCP Client implements a sophisticated two-phase communication pattern:

1. **Tool Discovery**: Connects to MCP server and retrieves available tools
2. **Query Processing**:
   - Sends user query + tool descriptions to Claude
   - Claude decides which tools to use (if any)
   - Executes tool calls through MCP server
   - Processes results and generates final response

See [HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) for detailed technical explanation.

## API Reference

### MCPClient Class

#### Constructor

```typescript
new MCPClient();
```

Creates a new MCP client instance.

#### Methods

##### `connectToServer(serverScriptPath: string): Promise<void>`

Connects to an MCP server and discovers available tools.

**Parameters:**

- `serverScriptPath`: Path to the MCP server script (.py or .js file)

**Throws:** Error if connection fails or server script is invalid

##### `chatLoop(): Promise<void>`

Starts an interactive chat loop with the user.

##### `cleanup(): Promise<void>`

Closes connections and cleans up resources.

### Environment Variables

| Variable            | Description            | Required | Default                      |
| ------------------- | ---------------------- | -------- | ---------------------------- |
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Yes      | -                            |
| `ANTHROPIC_MODEL`   | Claude model to use    | No       | `claude-3-5-sonnet-20241022` |

## Project Structure

```
mcp_client_typescript/
├── src/
│   ├── client/
│   │   ├── connection.ts    # MCP server connection logic
│   │   ├── handlers.ts      # Query processing and tool execution
│   │   └── chat-loop.ts     # Interactive chat interface
│   ├── types.ts             # Type definitions
│   └── utils/
│       └── logger.ts        # Logging utilities
├── docs/
│   └── HOW_IT_WORKS.md      # Technical documentation
├── dist/                    # Compiled JavaScript output
├── index.ts                 # Main entry point
└── package.json
```

## Development

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run dev`: Build and run the client
- `npm run start`: Run the compiled client
- `npm run clean`: Remove build artifacts

### Building

```bash
npm run build
```

### Running in Development

```bash
npm run dev <path_to_server_script>
```

## Examples

### Example MCP Server (Python)

```python
#!/usr/bin/env python3
import json
import sys
from mcp.server import Server
from mcp.server.stdio import stdio_server

server = Server("example-server")

@server.list_tools()
async def list_tools() -> list:
    return [
        {
            "name": "echo",
            "description": "Echo back the input",
            "inputSchema": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"}
                },
                "required": ["message"]
            }
        }
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> str:
    if name == "echo":
        return f"Echo: {arguments['message']}"
    else:
        raise ValueError(f"Unknown tool: {name}")

if __name__ == "__main__":
    stdio_server(server)
```

### Example MCP Server (JavaScript)

```javascript
#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "example-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "echo",
        description: "Echo back the input",
        inputSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
          required: ["message"],
        },
      },
    ],
  };
});

server.setRequestHandler("tools/call", async (request) => {
  if (request.params.name === "echo") {
    return {
      content: [
        {
          type: "text",
          text: `Echo: ${request.params.arguments.message}`,
        },
      ],
    };
  }
  throw new Error(`Unknown tool: ${request.params.name}`);
});

const transport = new StdioServerTransport();
server.connect(transport);
```

## Troubleshooting

### Common Issues

1. **"ANTHROPIC_API_KEY is not set"**

   - Ensure your `.env` file contains a valid Anthropic API key
   - Check that the `.env` file is in the project root

2. **"Failed to connect to MCP server"**

   - Verify the server script path is correct
   - Ensure the server script is executable
   - Check that the server script implements the MCP protocol correctly

3. **"Server script must be a .js or .py file"**
   - Only Python (.py) and JavaScript (.js) server scripts are supported
   - Ensure your server script has the correct file extension

### Debug Mode

Enable verbose logging by setting the `DEBUG` environment variable:

```bash
DEBUG=* npm start ./servers/my_server.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

- Create an issue in the repository
- Check the troubleshooting section
- Review the [HOW_IT_WORKS.md](docs/HOW_IT_WORKS.md) documentation

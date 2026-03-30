import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { GeoapifyActivityProvider } from "./providers/geoapify.provider.js";
import { searchActivitiesTool } from "./tools/searchActivities.tool.js";

const server = new Server(
  {
    name: "activity-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const provider = new GeoapifyActivityProvider();

// 1. Register Tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [searchActivitiesTool],
  };
});

// 2. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_activities") {
      const city = String(args?.city);
      const activities = await provider.searchActivities(city);
      
      return {
        content: [{ type: "text", text: JSON.stringify(activities, null, 2) }],
      };
    }

    throw new Error("Tool not found");
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// 3. Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Activity MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
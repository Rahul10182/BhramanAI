import "dotenv/config"; // Loads the .env file
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { searchFlightsDefinition, executeSearchFlights } from "./tools/searchFlights.tool.js";

// Initialize the MCP Server
const server = new Server({
  name: "flights-mcp",
  version: "1.0.0"
}, {
  capabilities: {
    tools: {}
  }
});

// Register the tool
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [searchFlightsDefinition]
  };
});

// Execute the tool when requested
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "search_flights") {
    return await executeSearchFlights(request.params.arguments);
  }
  throw new Error(`Tool not found: ${request.params.name}`);
});

// Start the server
async function run() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("✈️ Flights MCP Server running on stdio");
}

run().catch(console.error);
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { forecastToolDefinition, executeForecastTool } from "./tools/forecast.tool.js";
// Initialize the MCP Server
const server = new Server({
    name: "weather-mcp",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
// Register the available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [forecastToolDefinition]
    };
});
// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get_weather_forecast") {
        return await executeForecastTool(request.params.arguments);
    }
    throw new Error(`Tool not found: ${request.params.name}`);
});
// Start the server over standard I/O
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Weather MCP Server running on stdio");
}
run().catch(console.error);

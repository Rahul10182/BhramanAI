import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { getRoutingDef, getRoutingHandler } from "./tools/routing.tool.js";
import { getTimezoneDef, getTimezoneHandler } from "./tools/timezone.tool.js";
const server = new Server({
    name: "routing-time-mcp",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {}
    }
});
// List tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            getRoutingDef,
            getTimezoneDef
        ]
    };
});
// Execute tools
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        switch (name) {
            case "calculate_routing_distance_and_time":
                return await getRoutingHandler(args);
            case "get_time_and_timezone":
                return await getTimezoneHandler(args);
            default:
                throw new Error(`Tool not found: ${name}`);
        }
    }
    catch (error) {
        return {
            content: [{
                    type: "text",
                    text: `Error executing ${name}: ${error.message}`
                }],
            isError: true
        };
    }
});
// Start server
async function run() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("🌍 Routing & Time MCP Server running on stdio");
}
run().catch((error) => {
    console.error("Fatal error running server:", error);
    process.exit(1);
});

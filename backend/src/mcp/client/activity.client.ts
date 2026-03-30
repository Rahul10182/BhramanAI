import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from "path";
import { fileURLToPath } from "url";

// Helper to get current directory in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ActivityMCPClient {
    private client: Client;
    private transport: StdioClientTransport;
    public serverName = "ActivityMCP";

    constructor() {
        // Initialize the LangGraph client side
        this.client = new Client(
            { name: "bhraman-backend-activity-client", version: "1.0.0" },
            { capabilities: {} }
        );

        // Point directly to the compiled server.js of your new MCP server
        // Adjust the path depth (../../..) if your folder structure differs slightly
        const serverPath = path.resolve(__dirname, "../../../../mcp-servers/activity-mcp/dist/server.js");

        this.transport = new StdioClientTransport({
            command: "node",
            args: [serverPath],
        });
    }

    public async connect(): Promise<void> {
        try {
            await this.client.connect(this.transport);
            console.log(`[MCP] Successfully connected to ${this.serverName} server.`);
        } catch (error) {
            console.error(`[MCP] Failed to connect to ${this.serverName} server.`, error);
            throw error;
        }
    }

    // Direct helper method for your activities.node.ts to use
    public async searchActivities(city: string) {
        return await this.client.callTool({
            name: "search_activities",
            arguments: { city }
        });
    }

    // Required by ToolRegistry to dynamically read available tools
    public async listTools() {
        return await this.client.listTools();
    }

    // Required by ToolRegistry to execute the tools from LangGraph
    public async callTool(name: string, args: any) {
        return await this.client.callTool({ name, arguments: args });
    }
}
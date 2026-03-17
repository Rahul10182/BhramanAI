import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

export class BaseMCPClient {
    public client: Client;
    private transport: StdioClientTransport;
    public serverName: string;

    constructor(serverName: string, command: string, args: string[]) {
        this.serverName = serverName;
        
        this.transport = new StdioClientTransport({
            command,
            args,
        });

        this.client = new Client(
            {
                name: `bhraman-backend-${serverName}`,
                version: "1.0.0",
            },
            {
                capabilities: {},
            }
        );
    }

    public async connect(): Promise<void> {
        try {
            await this.client.connect(this.transport);
            console.log(`[MCP] Successfully connected to ${this.serverName} server.`);
        } catch (error) {
            console.error(`[MCP] Failed to connect to ${this.serverName}:`, error);
            throw error;
        }
    }

    public async callTool(toolName: string, args: Record<string, any>) {
        try {
            return await this.client.callTool({
                name: toolName,
                arguments: args,
            });
        } catch (error) {
            console.error(`[MCP] Error calling tool ${toolName} on ${this.serverName}:`, error);
            throw error;
        }
    }

    public async listTools() {
        try {
            return await this.client.listTools();
        } catch (error) {
            console.error(`[MCP] Error listing tools on ${this.serverName}:`, error);
            throw error;
        }
    }
}
import { serverRegistry } from './server.registry.js';

export class ToolRegistry {
    
    /**
     * Retrieves all available tools from a specific MCP server and 
     * formats them for easy consumption by LangGraph/LangChain.
     */
    public static async getServerTools(serverClient: any) {
        try {
            const response = await serverClient.listTools();
            return response.tools.map((tool: any) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                // The actual execution function that the LLM agent will trigger
                execute: async (args: any) => {
                    const result = await serverClient.callTool(tool.name, args);
                    return result.content;
                }
            }));
        } catch (error) {
            console.error(`[ToolRegistry] Failed to load tools for ${serverClient.serverName}`, error);
            return [];
        }
    }

    /**
     * Aggregates all tools across all connected MCP servers.
     */
    public static async getAllAvailableTools() {
        // Fixed destructuring to exactly match the array inside Promise.all
        const [hotelTools, currencyTools, activityTools] = await Promise.all([
            // this.getServerTools(serverRegistry.flights),
            this.getServerTools(serverRegistry.hotels),
            this.getServerTools(serverRegistry.weather),
            this.getServerTools(serverRegistry.currency),
            this.getServerTools(serverRegistry.activities) // <-- Added Activity tools
        ]);

        return [
            // ...flightTools,
            ...hotelTools,
            ...currencyTools,
            ...activityTools // <-- Added Activity tools to the final list
            // ...weatherTools,
        ];
    }
}
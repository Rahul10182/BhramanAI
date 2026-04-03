import { serverRegistry } from './server.registry.js';

export class ToolRegistry {
    
    public static async getServerTools(serverClient: any) {
        try {
            const response = await serverClient.listTools();
            return response.tools.map((tool: any) => ({
                name: tool.name,
                description: tool.description,
                inputSchema: tool.inputSchema,
                execute: async (args: any) => {
                    const result = await serverClient.callTool(tool.name, args);
                    return result.content;
                }
            }));
        } catch (error) {
            console.error(`[ToolRegistry] Failed to load tools for server`, error);
            return [];
        }
    }

    public static async getAllAvailableTools() {
        const [hotelTools, currencyTools, activityTools, weatherTools, flightTools] = await Promise.all([
            this.getServerTools(serverRegistry.flights),
            this.getServerTools(serverRegistry.hotels),
            this.getServerTools(serverRegistry.weather),
            this.getServerTools(serverRegistry.currency),
            this.getServerTools(serverRegistry.activities)
        ]);

        return [
            ...flightTools,
            ...hotelTools,
            ...currencyTools,
            ...activityTools,
            ...weatherTools
        ];
    }

    // THIS IS THE METHOD THAT WAS MISSING OR UNSAVED
    public static async getTool(toolName: string) {
        const allTools = await this.getAllAvailableTools();
        const tool = allTools.find(t => t.name === toolName);
        if (!tool) {
            throw new Error(`Tool '${toolName}' not found in registry. Are the MCP servers running?`);
        }
        return tool;
    }
}
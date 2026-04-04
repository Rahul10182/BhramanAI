import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Adjust this import path depending on where distanceTime.tool.ts is located
import { ToolRegistry } from "../../mcp/registry/tool.registry.js"; 

// 1. Tool for Routing (Distance and Time)
export const getRoutingTool = new DynamicStructuredTool({
    name: "calculate_routing_distance_and_time",
    description: "Calculate the real driving distance and estimated travel time between two places using OpenStreetMap.",
    schema: z.object({
        source: z.string()
            .describe("The starting location (e.g., 'London, UK', 'New York')"),
        destination: z.string()
            .describe("The destination location (e.g., 'Paris, France', 'Los Angeles')")
    }),
    func: async (args) => {
        console.log("🚨 [DEBUG] Raw args from LLM (Routing):", args);
        
        try {
            // Call the MCP client
            const mcptool = await ToolRegistry.getTool("calculate_routing_distance_and_time");
            
            if (!mcptool) {
                throw new Error("Tool 'calculate_routing_distance_and_time' not found in ToolRegistry.");
            }

            const result = await mcptool.execute(args);
            
            console.log("✅ [DEBUG] Routing MCP Result success.");
            return JSON.stringify(result);
        } catch (error: any) {
            console.error("❌ [DEBUG] MCP Execution Error (Routing):", error);
            return `Failed to calculate routing: ${error.message}`;
        }
    }
});

// 2. Tool for Time and Timezone
export const getTimezoneTool = new DynamicStructuredTool({
    name: "get_time_and_timezone",
    description: "Get the current time, timezone, and UTC offset for a specific place name.",
    schema: z.object({
        placeName: z.string()
            .describe("The pure city name ONLY. Do NOT include state codes, country codes, or commas (e.g., use 'Chicago' instead of 'Chicago, IL', or 'Tokyo' instead of 'Tokyo, Japan').")
    }),
    func: async (args) => {
        console.log("🚨 [DEBUG] Raw args from LLM (Timezone):", args);
        
        try {
            // Call the MCP client
            const mcptool = await ToolRegistry.getTool("get_time_and_timezone");
            
            if (!mcptool) {
                throw new Error("Tool 'get_time_and_timezone' not found in ToolRegistry.");
            }

            const result = await mcptool.execute(args);
            
            console.log("✅ [DEBUG] Timezone MCP Result success.");
            return JSON.stringify(result);
        } catch (error: any) {
            console.error("❌ [DEBUG] MCP Execution Error (Timezone):", error);
            return `Failed to get timezone: ${error.message}`;
        }
    }
});

// Export the array of tools so you can easily merge it into your LangGraph agent
export const distanceTimeTools = [getRoutingTool, getTimezoneTool];
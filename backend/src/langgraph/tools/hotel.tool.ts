import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolRegistry } from "../../mcp/registry/tool.registry.js";

// Helper for logging consistency
const logToolExecution = async (toolName: string, args: any, executeFn: () => Promise<any>) => {
    console.log(`\n🔍 [TOOL CALL: ${toolName}]`);
    console.log(`👉 INPUT FROM AGENT:`, JSON.stringify(args, null, 2));
    try {
        const responseContent = await executeFn();
        if (!responseContent || responseContent.length === 0) {
            console.log(`⚠️ OUTPUT FROM MCP: [Empty Content]`);
            return "[]";
        }
        const rawText = responseContent[0].text;
        if (rawText.includes("Error:") || rawText.includes("401")) {
            console.log(`❌ OUTPUT FROM MCP (FAILURE):`, rawText);
        } else {
            console.log(`✅ OUTPUT FROM MCP (SUCCESS): Data received.`);
        }
        return rawText;
    } catch (error: any) {
        console.error(`❌ TOOL SYSTEM ERROR:`, error.message);
        return `Error: ${error.message}`;
    }
};

export const createSearchHotelsTool = () => {
    return new DynamicStructuredTool({
        name: "search_hotels",
        description: "Search for hotels in a specific city.",
        schema: z.object({
            city: z.string().describe("City name"),
            checkIn: z.string().optional(),
            checkOut: z.string().optional(),
            guests: z.number().optional()
        }),
        func: async (args) => {
            const mcpTool = await ToolRegistry.getTool("search_hotels");
            return logToolExecution("search_hotels", args, () => mcpTool.execute(args));
        }
    });
};

export const createGetNearbyFoodTool = () => {
    return new DynamicStructuredTool({
        name: "get_nearby_food",
        description: "Find food options near coordinates.",
        schema: z.object({ lat: z.number(), lon: z.number() }),
        func: async (args) => {
            const mcpTool = await ToolRegistry.getTool("get_nearby_food");
            return logToolExecution("get_nearby_food", args, () => mcpTool.execute(args));
        }
    });
};

export const createGetHotelDetailsTool = () => {
    return new DynamicStructuredTool({
        name: "get_hotel_details",
        description: "Detailed hotel info via ID.",
        schema: z.object({ hotelId: z.string() }),
        func: async (args) => {
            const mcpTool = await ToolRegistry.getTool("get_hotel_details");
            return logToolExecution("get_hotel_details", args, () => mcpTool.execute(args));
        }
    });
};

export const createCheckHotelAvailabilityTool = () => {
    return new DynamicStructuredTool({
        name: "check_hotel_availability",
        description: "Check availability dates.",
        schema: z.object({
            hotelId: z.string(),
            checkIn: z.string(),
            checkOut: z.string()
        }),
        func: async (args) => {
            const mcpTool = await ToolRegistry.getTool("check_hotel_availability");
            return logToolExecution("check_hotel_availability", args, () => mcpTool.execute(args));
        }
    });
};

export const createHotelTools = () => [
    createSearchHotelsTool(), 
    createGetNearbyFoodTool(), 
    createGetHotelDetailsTool(), 
    createCheckHotelAvailabilityTool()
];
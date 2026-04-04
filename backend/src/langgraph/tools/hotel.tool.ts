import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Adjust this import path depending on where hotel.tool.ts is located relative to hotel.client.ts
import { HotelMCPClient } from "../../mcp/client/hotel.client.js"; 
import { ToolRegistry } from "../../mcp/registry/tool.registry.js";

// Initialize the client
export const hotelClient = new HotelMCPClient();

export const searchHotelsTool = new DynamicStructuredTool({
    name: "search_hotels",
    description: "Search for hotels in a specific city or location.",
    schema: z.object({
        location: z.string()
            .describe("The city or location to search for hotels (e.g., 'Paris', 'Tokyo')"),
        checkIn: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
            .optional()
            .describe("Optional check-in date in YYYY-MM-DD format"),
        checkOut: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
            .optional()
            .describe("Optional check-out date in YYYY-MM-DD format"),
        guests: z.number()
            .int()
            .positive()
            .optional()
            .describe("Optional number of guests")
    }),
    func: async (args) => {
        try {
            const mcptool = await ToolRegistry.getTool("search_hotels");
            const result = await mcptool.execute(args);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to search hotels: ${error.message}`;
        }
    }
});

export const getNearbyFoodTool = new DynamicStructuredTool({
    name: "get_nearby_food",
    description: "Find restaurants and food options near a specific latitude and longitude.",
    schema: z.object({
        lat: z.number()
            .min(-90)
            .max(90)
            .describe("The latitude coordinate (-90 to 90)"),
        lon: z.number()
            .min(-180)
            .max(180)
            .describe("The longitude coordinate (-180 to 180)")
    }),
    func: async (args) => {
        try {
            const mcptool = await ToolRegistry.getTool("get_nearby_food");
            const result = await mcptool.execute(args);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to get nearby food: ${error.message}`;
        }
    }
});

export const getHotelDetailsTool = new DynamicStructuredTool({
    name: "get_hotel_details",
    description: "Get comprehensive details, amenities, and information for a specific hotel using its unique ID.",
    schema: z.object({
        hotelId: z.string()
            .describe("The unique identifier of the hotel")
    }),
    func: async (args) => {
        try {
            const mcptool = await ToolRegistry.getTool("get_hotel_details");
            const result = await mcptool.execute(args);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to get hotel details: ${error.message}`;
        }
    }
});

export const checkHotelAvailabilityTool = new DynamicStructuredTool({
    name: "check_hotel_availability",
    description: "Check if a specific hotel has available rooms for a given check-in and check-out date.",
    schema: z.object({
        hotelId: z.string()
            .describe("The unique identifier of the hotel"),
        checkIn: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
            .describe("The check-in date strictly in YYYY-MM-DD format"),
        checkOut: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
            .describe("The check-out date strictly in YYYY-MM-DD format")
    }),
    func: async (args) => {
        try {
            const mcptool = await ToolRegistry.getTool("check_hotel_availability");
            const result = await mcptool.execute(args);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to check hotel availability: ${error.message}`;
        }
    }
});

// Export all tools in an array to easily bind them to your LangChain agent
export const hotelTools = [
    searchHotelsTool, 
    getNearbyFoodTool, 
    getHotelDetailsTool, 
    checkHotelAvailabilityTool
];
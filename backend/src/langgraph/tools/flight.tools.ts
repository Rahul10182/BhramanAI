import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Adjust this import path depending on where your registry is located
import { ToolRegistry } from "../../mcp/registry/tool.registry.js"; 

export const searchFlightsTool = new DynamicStructuredTool({
    name: "search_flights",
    description: "Search for available flights between two locations on a specific date. You must use valid 3-letter IATA airport codes.",
    schema: z.object({
        originIata: z.string()
            .length(3, "Must be exactly 3 characters")
            .toUpperCase()
            .describe("The 3-letter IATA code for the departure airport (e.g., IXD, JFK)"),
        destinationIata: z.string()
            .length(3, "Must be exactly 3 characters")
            .toUpperCase()
            .describe("The 3-letter IATA code for the destination airport (e.g., BLR, LHR)"),
        departureDate: z.string()
            .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be in YYYY-MM-DD format")
            .describe("The date of departure strictly in YYYY-MM-DD format (e.g., 2026-04-15)")
    }),
    func: async (args) => {
        try {
            // 1. Dynamically fetch the tool from your central registry
            const mcptool = await ToolRegistry.getTool("search_flights");
            
            if (!mcptool) {
                throw new Error("Tool 'search_flights' not found in ToolRegistry.");
            }

            // 2. Map the Zod args (camelCase) to MCP args (snake_case)
            const mcpPayload = {
                origin_iata: args.originIata,
                destination_iata: args.destinationIata,
                departure_date: args.departureDate
            };

            // 3. Execute via the dynamically fetched tool
            const result = await mcptool.execute(mcpPayload);

            return JSON.stringify(result);
        } catch (error: any) {
            console.error("❌ [MCP Error]:", error.message);
            return `Failed to search flights: ${error.message}`;
        }
    }
});

export const flightTools = [searchFlightsTool];
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Adjust this import path depending on where weather.tool.ts is located relative to weather.client.ts
import { ToolRegistry } from "../../mcp/registry/tool.registry.js"; 

export const getWeatherForecastTool = new DynamicStructuredTool({
    name: "get_weather_forecast",
    description: "Get the weather forecast for a specific location over a number of days starting from a specific date.",
    schema: z.object({
        location: z.string()
            .describe("The city or location name to get the weather for (e.g., 'London', 'Tokyo')"),
        start_date: z.string()
            .describe("The starting date for the weather forecast (e.g., '2026-04-05', 'April 5, 2026')."),
        days: z.number()
            .int()
            .positive()
            .optional()
            .default(3)
            .describe("The number of days to forecast. Defaults to 3 if not provided.")
    }),
    func: async (args) => {
        // DEBUG: See exactly what the LLM tried to pass
        console.log("🚨 [DEBUG] Raw args from LLM:", args);
        
        try {
            // 1. Convert whatever string the LLM gave us into a Date object
            const d = new Date(args.start_date);
            
            // 2. Prevent "Invalid time value" crashes by checking if the date is valid first
            if (isNaN(d.getTime())) {
                return `Error: The date provided by the agent ('${args.start_date}') is invalid. Please try again with a valid date.`;
            }
            
            // 3. Force it into strict YYYY-MM-DD
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const strictFormattedDate = `${year}-${month}-${day}`;
            
            // 4. Override the original start_date with the strict format
            const finalArgs = {
                ...args,
                start_date: strictFormattedDate
            };
            
            // DEBUG: Verify the strict format before it hits the MCP server
            console.log("✅ [DEBUG] Sending to MCP:", finalArgs);

            // 5. Call the MCP client
            const mcptool = await ToolRegistry.getTool("get_weather_forecast");
            const result = await mcptool.execute(finalArgs);
            
            return JSON.stringify(result);
        } catch (error: any) {
            console.error("❌ [DEBUG] MCP Execution Error:", error);
            return `Failed to get weather forecast: ${error.message}`;
        }
    }
});

export const weatherTools = [getWeatherForecastTool];
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolRegistry } from "../../mcp/registry/tool.registry.js";

export const createSearchActivitiesTool = () => {
    return new DynamicStructuredTool({
        name: "search_activities",
        description: "Search for popular tourist attractions, museums, parks, and sights in a specific city.",
        schema: z.object({
            city: z.string().describe("The name of the city to search for activities in (e.g., 'Paris', 'Jaipur')")
        }),
        func: async (args) => {
            console.log(`\n🔍 [TOOL CALL: search_activities]`);
            console.log(`👉 INPUT FROM AGENT:`, JSON.stringify(args, null, 2));

            try {
                const mcpTool = await ToolRegistry.getTool("search_activities");
                const responseContent = await mcpTool.execute(args);
                
                if (!responseContent || responseContent.length === 0) {
                    console.log(`⚠️ OUTPUT FROM MCP: [Empty Content]`);
                    return "[]";
                }

                const rawText = responseContent[0].text;
                
                // Detection for common MCP errors
                if (rawText.includes("Error:") || rawText.includes("401") || rawText.includes("Unauthorized")) {
                    console.log(`❌ OUTPUT FROM MCP (FAILURE):`, rawText);
                } else {
                    console.log(`✅ OUTPUT FROM MCP (SUCCESS): Received data.`);
                }

                return rawText;
            } catch (error: any) {
                console.error(`❌ TOOL SYSTEM ERROR:`, error.message);
                return `Error: ${error.message}`;
            }
        }
    });
};

export const createActivityTools = () => [createSearchActivitiesTool()];

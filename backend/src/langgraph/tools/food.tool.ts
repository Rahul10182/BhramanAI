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

export const createFoodTools = () => [createGetNearbyFoodTool()];

import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ToolRegistry } from "../../mcp/registry/tool.registry.js";

export const convertCurrencyTool = new DynamicStructuredTool({
    name: "convert_currency",
    description: "Convert an amount of money from one currency to another to help the user with budgeting.",
    schema: z.object({
        amount: z.number().describe("The numerical amount to convert"),
        from: z.string().describe("The 3-letter currency code to convert from (e.g., USD, EUR)"),
        to: z.string().describe("The 3-letter currency code to convert to (e.g., JPY, GBP)")
    }),
    func: async (args) => {
        // 1. Log exactly what the LLM is trying to pass to your tool
        console.log(`\n💱 [Currency Executing]:`, args);
        
        try {
            const mcpTool = await ToolRegistry.getTool("convert_currency");
            const result = await mcpTool.execute(args);
            
            // 2. Log success if it works
            console.log(`✅ [Currency Success]:`, result);
            return JSON.stringify(result);
            
        } catch (error: any) {
            // 3. FORCE the console to print the exact reason it crashed
            console.error(`\n❌ [Currency Tool Failed]:`, error);
            
            return `Failed to convert currency: ${error.message}`;
        }
    }
});

export const currencyTools = [convertCurrencyTool];
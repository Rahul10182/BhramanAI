import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { CurrencyMCPClient } from "../../mcp/client/currency.client.js";

// Initialize the client
export const currencyClient = new CurrencyMCPClient();

export const convertCurrencyTool = new DynamicStructuredTool({
    name: "convert_currency",
    description: "Convert an amount of money from one currency to another to help the user with budgeting.",
    schema: z.object({
        amount: z.number().describe("The numerical amount to convert"),
        fromCurrency: z.string().describe("The 3-letter currency code to convert from (e.g., USD, EUR)"),
        toCurrency: z.string().describe("The 3-letter currency code to convert to (e.g., JPY, GBP)")
    }),
    func: async ({ amount, fromCurrency, toCurrency }) => {
        try {
            // Assuming your MCP client has a convert method
            const result = await currencyClient.convertCurrency(amount, fromCurrency, toCurrency);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to convert currency: ${error.message}`;
        }
    }
});

export const currencyTools = [convertCurrencyTool];
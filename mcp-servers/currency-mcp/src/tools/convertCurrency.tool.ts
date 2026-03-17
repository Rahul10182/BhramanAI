import { z } from 'zod';
import { ForexProvider } from '../providers/forex.provider.js';

// The new SDK uses Zod to tell the AI how to use this tool
export const convertCurrencySchema = {
  amount: z.number().describe("The numerical amount of money to convert."),
  from: z.string().describe("The 3-letter currency code to convert from (e.g., USD, EUR, INR)."),
  to: z.string().describe("The 3-letter currency code to convert to (e.g., JPY, GBP, AUD).")
};

// The execution logic (notice how much cleaner this is without the manual type checking!)
export async function handleConvertCurrency(args: { amount: number; from: string; to: string }) {
  const { amount, from, to } = args;

  try {
    const provider = new ForexProvider();
    const { rate, result } = await provider.convertCurrency(from, to, amount);

    return {
      content: [{
        type: "text" as const,
        text: `💰 ${amount} ${from.toUpperCase()} is equal to ${result.toFixed(2)} ${to.toUpperCase()}.\n(Exchange Rate: 1 ${from.toUpperCase()} = ${rate} ${to.toUpperCase()})`
      }]
    };
  } catch (error: any) {
    throw new Error(`Error converting currency: ${error.message}`);
  }
}
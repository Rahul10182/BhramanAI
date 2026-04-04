import { ChatOpenAI } from "@langchain/openai";
import { searchTools } from "../tools/search.tool.js";
import { currencyTools } from "../tools/currency.tool.js";

// Combine tools and bypass TS union type issues using `as any[]`
export const plannerTools = [...searchTools, ...currencyTools] as any[];

// Ensure process.env.OPENAI_API_KEY is available in your environment
export const plannerLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini", // Fast and cheap for development
    temperature: 0.2,
}).bindTools(plannerTools);
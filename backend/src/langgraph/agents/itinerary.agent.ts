import { ChatOpenAI } from "@langchain/openai";
import { itineraryTools } from "../tools/itinerary.tool.js";

export const itineraryLLM = new ChatOpenAI({
    modelName: "gpt-4o", // Upgrading to gpt-4o (instead of mini) here is often worth it for the final writing quality
    temperature: 0.6,    // Higher temperature for creative, engaging writing
}).bindTools(itineraryTools as any[]);
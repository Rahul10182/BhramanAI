import { ChatOpenAI } from "@langchain/openai";
import { distanceTimeTools } from "../tools/distance-time.tool.js";

export const distanceTimeLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini", // Fast and cheap, perfect for simple parameter parsing
    temperature: 0,           // 0 temperature for strict factual retrieval
}).bindTools(distanceTimeTools);
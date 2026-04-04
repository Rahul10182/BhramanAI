import { ChatOpenAI } from "@langchain/openai";
import { weatherTools } from "../tools/weather.tool.js";

// Ensure process.env.OPENAI_API_KEY is available in your environment
export const weatherLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini", 
    temperature: 0.2,
}).bindTools(weatherTools);
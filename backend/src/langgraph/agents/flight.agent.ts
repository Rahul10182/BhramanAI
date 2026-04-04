import { ChatOpenAI } from "@langchain/openai";
import { flightTools } from "../tools/flight.tools.js";

// Ensure process.env.OPENAI_API_KEY is available in your environment
export const flightLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini",
    temperature: 0,      
}).bindTools(flightTools);
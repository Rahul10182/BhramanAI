import { PlannerStateAnnotation } from "../state/planner.state.js";
import { ChatOpenAI } from "@langchain/openai";
import { currencyTools } from "../tools/currency.tool.js";
import { searchTools } from "../tools/search.tool.js";

// Combine the tools we actually have ready
const availableTools = [...currencyTools, ...searchTools];

const plannerLLM = new ChatOpenAI({
    modelName: "gpt-4o-mini", 
    temperature: 0.2, 
}).bindTools(availableTools); 

export const plannerNode = async (state: typeof PlannerStateAnnotation.State) => {
    const { messages, tripContext } = state;

    const systemMessage = {
        role: "system",
        content: `You are an expert travel planner. You are currently planning a trip for ${tripContext.travelerCount} traveler(s).
        Current destinations: ${tripContext.destinations.join(", ") || "Not decided yet"}.
        User preferences: ${tripContext.preferences.join(", ") || "None specified"}.
        Base Budget: ${tripContext.totalBudget ? `${tripContext.totalBudget} ${tripContext.baseCurrency}` : "Not specified"}.
        
        Your job is to research the destination using the web_search tool and help the user plan their budget using the convert_currency tool.
        Do not invent or hallucinate specific activities; rely strictly on the tools provided.`
    };

    const response = await plannerLLM.invoke([systemMessage, ...messages]);

    return { 
        messages: [response] 
    };
};
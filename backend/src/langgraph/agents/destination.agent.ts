import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
// Import the updated webSearchTool
import { webSearchTool } from "../tools/search.tool.js";

/**
 * Destination Agent:
 * Uses the Tavily-powered webSearchTool to research and identify 
 * a specific city based on the user's travel request.
 */
export const runDestinationAgent = async (userPrompt: string, preferences: string[]) => {
    console.log(`🤖 [Agent] Discovering destination for: "${userPrompt}"...`);

    const llm = new ChatOpenAI({ 
        modelName: "gpt-4o-mini", 
        temperature: 0.2 
    });
    
    // Explicitly cast to 'any' or ensure it matches the Expected Tool type
    // In LangGraph prebuilt agents, standard LangChain tools are accepted.
    // If your project uses a custom 'ServerTool' type, we cast to bypass the strict check
    // since TavilySearch is functionally compatible with the Agent's execution loop.
    const tools = [webSearchTool as any];

    const systemPromptText = `
        You are the Expert Destination Discovery Agent for BhramanAI.
        
        TASK:
        Suggest exactly ONE primary city destination that best matches the user's request.
        
        CRITICAL RULES:
        1. USE THE web_search TOOL if the user's request is vague or requires up-to-date research.
        2. Format output as a raw JSON object: { "destination": "City Name", "country": "Country Name", "reasoning": "string" }.
        3. NO conversation. NO markdown code blocks. NO backticks.
        4. If the search tool returns results, pick the most relevant city based on those results.
    `;

    const destinationAgent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPromptText
    });

    const prompt = `User Request: "${userPrompt}". Preferences: ${preferences.join(", ")}. Find the best city destination.`;

    try {
        const result = await destinationAgent.invoke({
            messages: [{ role: "user", content: prompt }]
        });

        const finalMessage = result.messages[result.messages.length - 1]?.content;
        
        const rawContent = typeof finalMessage === 'string' 
            ? finalMessage 
            : JSON.stringify(finalMessage);

        const cleanedMessage = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const parsed = JSON.parse(cleanedMessage);
            console.log(`🧠 [Agent] Selected: ${parsed.destination}, ${parsed.country}`);
            return parsed;
        } catch (parseError) {
            console.error("❌ [Agent] JSON Parse Error. Output was:", cleanedMessage);
            return null;
        }
        
    } catch (error: any) {
        console.error("❌ [Agent] Destination Agent Error:", error.message);
        return null; 
    }
};
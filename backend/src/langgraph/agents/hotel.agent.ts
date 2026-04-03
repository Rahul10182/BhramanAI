import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt"; 
import { createHotelTools } from "../tools/hotel.tool.js";

export const runHotelAgent = async (destination: string, startDate?: string, endDate?: string) => {
    console.log(`🤖 [Agent] Researching hotels for ${destination}...`);

    const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
    const tools = createHotelTools();

    const systemPromptText = `
        You are a luxury travel researcher for BhramanAI. 
        Your goal is to find the top 3 hotels for the user's destination using the search_hotels tool.
        
        CRITICAL RULES:
        1. You MUST return your final answer as a raw JSON array of hotel objects.
        2. Do NOT wrap the JSON in markdown code blocks (e.g., no \`\`\`json).
        3. Do NOT include any conversational text.
        4. Your entire output must strictly be the JSON array starting with [ and ending with ].
        5. IF THE TOOL RETURNS AN ERROR, FAILS, OR RETURNS NO HOTELS, DO NOT RETRY. Immediately output [] and stop.
    `;

    const hotelAgent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPromptText // Use stateModifier for LangGraph's createReactAgent
    });

    const prompt = `Please find the top 3 hotels in ${destination}. Dates: ${startDate || 'Flexible'} to ${endDate || 'Flexible'}.`;

    try {
        const result = await hotelAgent.invoke({
            messages: [{ role: "user", content: prompt }]
        });

        const finalMessage = result.messages[result.messages.length - 1]?.content;
        
// Safely convert to string for the debug log so TypeScript doesn't complain
        const debugText = typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage);
        console.log(`🧠 [Agent] Raw LLM Output:`, debugText?.substring(0, 100) + "..."); // DEBUG LOG
        if (!finalMessage || (typeof finalMessage === 'string' && finalMessage.trim() === "")) {
            return []; 
        }

        let cleanedMessage = typeof finalMessage === 'string' 
            ? finalMessage.replace(/```json/gi, '').replace(/```/g, '').trim()
            : finalMessage;

        try {
            return typeof cleanedMessage === 'string' ? JSON.parse(cleanedMessage) : cleanedMessage;
        } catch (parseError) {
            console.error("❌ [Agent] Failed to parse JSON. Cleaned message was:", cleanedMessage);
            return []; 
        }
        
    } catch (error: any) {
        console.error("❌ [Agent] Critical failure:", error.message);
        return []; 
    }
};
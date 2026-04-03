import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt"; 
import { createActivityTools } from "../tools/activity.tool.js";

export const runActivityAgent = async (destination: string) => {
    console.log(`🤖 [Agent] Researching activities for ${destination}...`);

    const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
    const tools = createActivityTools();

    const systemPromptText = `
        You are an expert travel researcher for BhramanAI. 
        Your goal is to find the top 5 tourist attractions, activities, or sights for the user's destination using the search_activities tool.
        
        CRITICAL RULES:
        1. You MUST return your final answer as a raw JSON array of activity objects.
        2. Do NOT wrap the JSON in markdown code blocks (e.g., no \`\`\`json).
        3. Do NOT include any conversational text.
        4. Your entire output must strictly be the JSON array starting with [ and ending with ].
        5. IF THE TOOL RETURNS AN ERROR, FAILS, OR RETURNS NO ACTIVITIES, DO NOT RETRY. Immediately output [] and stop.
    `;

    const activityAgent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPromptText
    });

    const prompt = `Please find the top 5 must-do activities and attractions in ${destination}.`;

    try {
        const result = await activityAgent.invoke({
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
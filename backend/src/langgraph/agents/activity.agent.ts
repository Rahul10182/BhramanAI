import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt"; 
import { createActivityTools } from "../tools/activity.tool.js";

export const runActivityAgent = async (destination: string) => {
    console.log(`🤖 [Agent] Researching activities for ${destination}...`);

    const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
    const tools = createActivityTools();

    const systemPromptText = `
        You are an expert travel researcher for BhramanAI. 
        Your goal is to find the top 5 UNIQUE and high-quality tourist attractions for the destination.
        
        CRITICAL RULES:
        1. You MUST return your final answer as a raw JSON array of activity objects.
        2. Each object MUST contain: "name", "address", "categories", "lat", "lon", and "website".
        3. NO DUPLICATES: Do not list the same attraction more than once.
        4. DATA INTEGRITY: Only include attractions that have a valid "name". Do not include empty or broken objects.
        5. FORMATTING: No markdown code blocks, no conversational text. Start with [ and end with ].
        6. If the tool returns no data, return an empty array [].
    `;

    const activityAgent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPromptText
    });

    const prompt = `Please find the top 5 must-visit unique attractions in ${destination}.`;

    try {
        const result = await activityAgent.invoke({
            messages: [{ role: "user", content: prompt }]
        });

        const finalMessage = result.messages[result.messages.length - 1]?.content;
        
        const debugText = typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage);
        console.log(`🧠 [Agent] Raw LLM Output:`, debugText?.substring(0, 100) + "..."); 

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
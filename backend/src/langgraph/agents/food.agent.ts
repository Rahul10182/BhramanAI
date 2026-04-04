import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { createHotelTools } from "../tools/hotel.tool.js";

export const runFoodAgent = async (lat: number, lon: number, destination: string) => {
    console.log(`🤖 [Agent] Finding food options near coordinates (${lat}, ${lon}) in ${destination}...`);

    const llm = new ChatOpenAI({ modelName: "gpt-4o-mini", temperature: 0 });
    
    // We use hotel tools because that's where createGetNearbyFoodTool lives
    const tools = createHotelTools();

    const systemPromptText = `
        You are a culinary expert for BhramanAI. 
        Your goal is to find the top 5 restaurants or cafes near the provided coordinates using the get_nearby_food tool.
        
        CRITICAL RULES:
        1. You MUST return your final answer as a raw JSON array of restaurant objects.
        2. Each object MUST contain: "name", "address", "cuisine", "rating", "lat", and "lon".
        3. If a field like cuisine or rating is missing from the tool data, use "N/A" or null.
        4. NO DUPLICATES. NO CONVERSATION. NO MARKDOWN.
        5. Your output must strictly start with [ and end with ].
        6. IF THE TOOL FAILS OR RETURNS NO DATA, RETURN [].
    `;

    const foodAgent = createReactAgent({
        llm,
        tools,
        stateModifier: systemPromptText
    });

    const prompt = `Find the best 5 food options near latitude ${lat} and longitude ${lon} in ${destination}.`;

    try {
        const result = await foodAgent.invoke({
            messages: [{ role: "user", content: prompt }]
        });

        const finalMessage = result.messages[result.messages.length - 1]?.content;
        
        const debugText = typeof finalMessage === 'string' ? finalMessage : JSON.stringify(finalMessage);
        console.log(`🧠 [Agent] Raw Food Output:`, debugText?.substring(0, 100) + "..."); 

        if (!finalMessage || (typeof finalMessage === 'string' && finalMessage.trim() === "")) {
            return []; 
        }

        let cleanedMessage = typeof finalMessage === 'string' 
            ? finalMessage.replace(/```json/gi, '').replace(/```/g, '').trim()
            : finalMessage;

        try {
            return typeof cleanedMessage === 'string' ? JSON.parse(cleanedMessage) : cleanedMessage;
        } catch (parseError) {
            console.error("❌ [Agent] Failed to parse Food JSON:", cleanedMessage);
            return []; 
        }
        
    } catch (error: any) {
        console.error("❌ [Agent] Food Agent Critical failure:", error.message);
        return []; 
    }
};
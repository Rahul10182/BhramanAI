import { SystemMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { itineraryLLM } from "../agents/itinerary.agent.js";
import { TravelStateAnnotation } from "../state/travel.state.js"; 
import { saveItineraryTool } from "../tools/itinerary.tool.js"; 

export const itineraryNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("\n📝 [Node: Itinerary] Structuring and Auto-Executing DB Save...");

    const { 
        tripContext, 
        selectedFlights, 
        selectedHotels, 
        selectedActivities, 
        selectedFood, 
        estimatedCost,
        messages // Pulling messages so it can read weather/flight notes!
    } = state;

    // Extract the last few AI thoughts to get Weather and Flight data
    const recentAgentNotes = messages
        .slice(-6)
        .map(m => m.content)
        .join("\n--- ");

    const systemPrompt = `You are the Lead Data Architect for BhramanAI. 
    Your job is to take raw JSON travel data and agent notes to organize a perfect chronological timeline.
    
    CRITICAL RULES:
    1. You MUST generate EXACTLY 5 days of itinerary. Do not stop at Day 2.
    2. If you do not have enough activities/food/hotels provided, you MUST INVENT luxurious suggestions appropriate for ${tripContext?.destinations?.[0]} (e.g., "Relax at a 5-star beachfront resort", "Dinner at a premium local seafood restaurant").
    3. Include Flight/Arrival info on Day 1, and Departure info on Day 5.
    4. Incorporate Weather notes if available.
    5. Use the 'save_final_itinerary' tool to finalize the output.
    
    You MUST pass the exact tripId (${tripContext?.tripId}) and startDate (${tripContext?.start_date}) to the tool.`;

    const rawDataMessage = `
    ### Trip Context
    Trip ID: ${tripContext?.tripId || "UNKNOWN_ID"}
    Start Date: ${tripContext?.start_date || "UNKNOWN_DATE"}
    Destinations: ${tripContext?.destinations?.join(", ") || "Unknown"}
    Preferences: ${tripContext?.preferences?.join(", ")}
    
    ### Agent Research Notes (Contains Weather & Flights):
    ${recentAgentNotes}

    ### Structured Data:
    - Hotels: ${selectedHotels?.length > 0 ? JSON.stringify(selectedHotels) : "None provided. Invent a luxurious stay."}
    - Activities: ${selectedActivities?.length > 0 ? JSON.stringify(selectedActivities) : "None provided."}
    - Food: ${selectedFood?.length > 0 ? JSON.stringify(selectedFood) : "None provided. Suggest premium dining."}
    `;

    try {
        const aiResponse = await itineraryLLM.invoke([
            new SystemMessage(systemPrompt),
            new HumanMessage(rawDataMessage)
        ]);

        const toolCall = aiResponse.tool_calls?.[0];

        if (toolCall && toolCall.name === "save_final_itinerary") {
            console.log(`🛠️ [Node: Itinerary] Manually executing tool: ${toolCall.name}`);

            const toolInput = toolCall.args as unknown as Parameters<typeof saveItineraryTool.invoke>[0];
            const toolOutput = await saveItineraryTool.invoke(toolInput);

            const toolMessage = new ToolMessage({
                content: typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput),
                tool_call_id: toolCall.id!,
            });

            console.log("✅ [Node: Itinerary] Tool execution finished and state updated.");

            return { 
                messages: [aiResponse, toolMessage],
                currentStage: "completed" 
            };
        }

        return { messages: [aiResponse], currentStage: "completed" };

    } catch (error: any) {
        console.error(`❌ [Node: Itinerary] Failed to generate/save itinerary:`, error);
        throw error;
    }
};
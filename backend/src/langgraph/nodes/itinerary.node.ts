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
        messages 
    } = state;

    // Extract the last few AI thoughts to get Weather and Flight data
    const recentAgentNotes = messages
        .slice(-6)
        .map(m => m.content)
        .join("\n--- ");

    // Calculate dynamic variables for the prompt
    const tripDuration = tripContext?.totalDays || 5; 
    // Fallback to check multiple possible preference keys
    const travelStyle = tripContext?.preferences?.join(", ") || (tripContext as any)?.travelStyle || "standard";
    const destinations = tripContext?.destinations?.join(", ") || "the destination";

    // THE OPTIMIZED PRODUCTION-GRADE PROMPT
    const systemPrompt = `You are the Lead Travel Architect for BhramanAI. 
    Your objective is to synthesize raw JSON travel data and agent research notes into a flawless, chronological, and engaging ${tripDuration}-day itinerary.

    CRITICAL INSTRUCTIONS:
    1. EXACT DURATION: You MUST generate exactly ${tripDuration} days of itinerary. Do not stop early.
    2. THEMATIC CONSISTENCY: The user's preferred travel style is "${travelStyle}". Tailor descriptions, pacing, and any invented filler activities specifically to this vibe.
    3. DATA PRIORITIZATION: Use the provided JSON data (Hotels, Flights, Activities, Food) first. If you run out of provided items, you MUST INVENT highly realistic, context-appropriate suggestions for ${destinations} that match the "${travelStyle}" vibe.
    4. LOGICAL LOGISTICS: 
       - Day 1 MUST include Arrival/Flight info and Hotel Check-in.
       - Day ${tripDuration} MUST include Hotel Check-out and Departure/Flight info.
       - Ensure reasonable travel time between activities (e.g., do not schedule a beach trip at 2:00 PM and a museum at 2:15 PM).
       - If exact flight data wasn't provided by the flight node, INVENT a realistic flight itinerary using the nearest major airports (e.g., "Drive from Kanpur to Lucknow Airport, then fly IndiGo to Goa").
       - Ensure reasonable travel time between activities.
    5. WEATHER AWARENESS: Read the agent research notes. If weather warnings exist, adjust the itinerary accordingly.

    CRITICAL SCHEMA RULES (DO NOT VIOLATE):
    - You MUST use the 'save_final_itinerary' tool to finalize the output.
    - The 'category' field for each activity MUST be strictly chosen from this exact list: "flight", "hotel", "food", "attraction", "transport", "leisure", "shopping", "other".
    - You MUST pass the exact tripId (${tripContext?.tripId}) and startDate (${tripContext?.start_date}) to the tool.

    Your final output must be a masterclass in travel planning: immersive descriptions, realistic pacing, and strict adherence to the data structure.`;

    const rawDataMessage = `
    ### Trip Context
    Trip ID: ${tripContext?.tripId || "UNKNOWN_ID"}
    Start Date: ${tripContext?.start_date || "UNKNOWN_DATE"}
    Total Days: ${tripDuration}
    Destinations: ${destinations}
    Travel Style/Vibe: ${travelStyle}
    Estimated Budget: ${tripContext?.totalBudget || (tripContext as any)?.budget || "Unknown"}
    
    ### Agent Research Notes (Contains Weather & Flights):
    ${recentAgentNotes}

    ### Structured Data:
    - Hotels: ${selectedHotels?.length > 0 ? JSON.stringify(selectedHotels) : `None provided. Invent a ${travelStyle} stay.`}
    - Activities: ${selectedActivities?.length > 0 ? JSON.stringify(selectedActivities) : `None provided. Suggest ${travelStyle} activities.`}
    - Food: ${selectedFood?.length > 0 ? JSON.stringify(selectedFood) : `None provided. Suggest dining fitting a ${travelStyle} vibe.`}
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
        
        console.log("⚠️ [Node: Itinerary] No tool call made by AI. Proceeding to end state.");
        return { messages: [aiResponse], currentStage: "completed" };

    } catch (error: any) {
        console.error(`❌ [Node: Itinerary] Failed to generate/save itinerary:`, error);
        throw error;
    }
};
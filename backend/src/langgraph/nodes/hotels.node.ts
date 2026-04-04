import { PlannerState } from "../state/planner.state.js";
import { runHotelAgent } from "../agents/hotel.agent.js";

export const hotelsNode = async (state: PlannerState) => {
    console.log("🏨 [Node] Executing Hotels Node...");
    
    // 1. Extract the destination from the whiteboard
    const destination = state.tripContext?.destinations?.[0];

    // Safety check: skip if we don't know where they are going
    if (!destination) {
        console.log("⚠️ No destination found in tripContext, skipping hotels.");
        return {};
    }

    try {
        // 2. Hand the context over to the specialized Hotel Agent
        // The Agent will autonomously fetch the tools, talk to the LLM, and format the JSON.
        const topHotels = await runHotelAgent(
            destination, 
            state.tripContext?.start_date, 
            state.tripContext?.endDate
        );

        // 3. Save the clean data back to the LangGraph State
        return {
            // Ensure it's an array just in case the agent failed gracefully
            selectedHotels: Array.isArray(topHotels) ? topHotels : []
        };
        
    } catch (error) {
        console.error("❌ [Node] Failed to execute hotels node:", error);
        return {
            selectedHotels: [] // Return an empty array so the graph continues without crashing
        };
    }
};
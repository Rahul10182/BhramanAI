import { PlannerState } from "../state/planner.state.js";
import { runActivityAgent } from "../agents/activity.agent.js";

export const activitiesNode = async (state: PlannerState) => {
    console.log("🎢 [Node] Executing Activities Node...");
    
    const destination = state.tripContext?.destinations?.[0];

    if (!destination) {
        console.log("⚠️ No destination found in tripContext, skipping activities.");
        return {};
    }

    try {
        // Hand the context over to the specialized Activity Agent
        const topActivities = await runActivityAgent(destination);

        // Save the clean data back to the LangGraph State
        return {
            selectedActivities: Array.isArray(topActivities) ? topActivities : []
        };
        
    } catch (error) {
        console.error("❌ [Node] Failed to execute activities node:", error);
        return {
            selectedActivities: [] 
        };
    }
};
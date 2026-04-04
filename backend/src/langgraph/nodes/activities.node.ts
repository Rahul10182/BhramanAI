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
        const topActivities = await runActivityAgent(destination);

        // --- SAFETY FILTER: Clean, Unique, and Validated ---
        let uniqueActivities = [];
        
        if (Array.isArray(topActivities)) {
            uniqueActivities = topActivities
                .filter(act => act && act.name && act.name !== "Unknown Attraction") // 1. Must have a name
                .filter((act, index, self) => 
                    index === self.findIndex((t) => t.name === act.name) // 2. Remove duplicates by name
                )
                .slice(0, 5); // 3. Ensure we don't exceed the limit
        }

        console.log(`✅ [Node] Successfully processed ${uniqueActivities.length} unique activities.`);

        return {
            selectedActivities: uniqueActivities
        };
        
    } catch (error) {
        console.error("❌ [Node] Failed to execute activities node:", error);
        return {
            selectedActivities: [] 
        };
    }
};
import { PlannerState } from "../state/planner.state.js";
import { runFoodAgent } from "../agents/food.agent.js";

export const foodNode = async (state: PlannerState) => {
    console.log("🍱 [Node] Executing Food Node...");
    
    const destination = state.tripContext?.destinations?.[0];
    
    // Logic: Find food near the first selected hotel. 
    // Fallback: If no hotels, find food near the first selected activity.
    const baseLocation = state.selectedHotels?.[0] || state.selectedActivities?.[0];

    if (!baseLocation || !baseLocation.lat || !baseLocation.lon) {
        console.log("⚠️ No base coordinates (hotel/activity) found to search for food. Skipping.");
        return { selectedFood: [] };
    }

    try {
        const foodOptions = await runFoodAgent(
            baseLocation.lat, 
            baseLocation.lon, 
            destination || "the destination"
        );

        // Safety Filter: Clean and Deduplicate
        let cleanFood = [];
        if (Array.isArray(foodOptions)) {
            cleanFood = foodOptions
                .filter(f => f && f.name)
                .filter((f, index, self) => 
                    index === self.findIndex((t) => t.name === f.name)
                )
                .slice(0, 5);
        }

        console.log(`✅ [Node] Found ${cleanFood.length} food options near ${baseLocation.name}.`);

        return {
            selectedFood: cleanFood
        };
        
    } catch (error) {
        console.error("❌ [Node] Failed to execute food node:", error);
        return { selectedFood: [] };
    }
};
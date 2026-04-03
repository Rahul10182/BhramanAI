import * as dotenv from "dotenv";
dotenv.config();

import { hotelsNode } from "./langgraph/nodes/hotels.node.js";
import { activitiesNode } from "./langgraph/nodes/activities.node.js";
import { foodNode } from "./langgraph/nodes/food.node.js"; // Import the food node
import { PlannerState } from "./langgraph/state/planner.state.js";
import { initializeMCP } from "./config/mcp.config.js";

async function runNodeTests() {
    try {
        console.log("🔌 [1/3] Booting up MCP Tool Servers...");
        await initializeMCP(); 
        console.log("✅ MCP ecosystem fully initialized!\n");

        console.log("📝 [2/3] Creating Mock Planner State...");
        let mockState: PlannerState = {
            messages: [],
            tripContext: {
                destinations: ["Jaipur"],
                startDate: "2024-12-01",
                endDate: "2024-12-05",
                baseCurrency: "INR",
                travelerCount: 2,
                preferences: ["luxury", "history"]
            },
            researchNotes: [],
            selectedHotels: [],
            selectedActivities: [],
            selectedFood: [], // Added food array
            proposedItinerary: [],
            plannerPhase: "attraction_research"
        };
        console.log("✅ State created for destination: Jaipur\n");

        console.log("🧪 [3/3] Executing Nodes...\n");

        // --- 1. TEST HOTELS NODE ---
        const hotelUpdate = await hotelsNode(mockState);
        console.log("🏨 Hotels Node Output:");
        if (hotelUpdate.selectedHotels && hotelUpdate.selectedHotels.length > 0) {
            console.log(`✅ Success! Extracted ${hotelUpdate.selectedHotels.length} hotels.`);
            // Update state for the next nodes to use
            mockState.selectedHotels = hotelUpdate.selectedHotels;
        } else {
            console.log("❌ Failed to extract hotels.");
        }
        console.log("--------------------------------------------------\n");

        // --- 2. TEST ACTIVITIES NODE ---
        const activityUpdate = await activitiesNode(mockState);
        console.log("🎢 Activities Node Output:");
        if (activityUpdate.selectedActivities && activityUpdate.selectedActivities.length > 0) {
            console.log(`✅ Success! Extracted ${activityUpdate.selectedActivities.length} activities.`);
            mockState.selectedActivities = activityUpdate.selectedActivities;
        } else {
            console.log("❌ Failed to extract activities.");
        }
        console.log("--------------------------------------------------\n");

        // --- 3. TEST FOOD NODE ---
        console.log("🍱 [Testing Food Node] Finding food near:", mockState.selectedHotels[0]?.name || "Destination center");
        const foodUpdate = await foodNode(mockState);
        console.log("🍱 Food Node Output:");
        console.log(foodUpdate.selectedFood);
        
        if (foodUpdate.selectedFood && foodUpdate.selectedFood.length > 0) {
            console.log(`✅ Success! Extracted ${foodUpdate.selectedFood.length} food options.`);
            console.log(`   First Restaurant: ${foodUpdate.selectedFood[0].name}`);
        } else {
            console.log("❌ Failed to extract food options.");
        }
        console.log("--------------------------------------------------\n");

        console.log("🎉 ALL NODE TESTS COMPLETE!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Fatal Error during node execution:");
        console.error(error);
        process.exit(1);
    }
}

runNodeTests();
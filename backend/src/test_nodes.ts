import * as dotenv from "dotenv";
dotenv.config();

import { hotelsNode } from "./langgraph/nodes/hotels.node.js";
import { activitiesNode } from "./langgraph/nodes/activities.node.js";
import { PlannerState } from "./langgraph/state/planner.state.js";

// Import your new configuration wrapper
import { initializeMCP } from "./config/mcp.config.js";

async function runNodeTests() {
    try {
        console.log("🔌 [1/3] Booting up MCP Tool Servers...");
        
        // This will connect the servers AND fetch the tools via ToolRegistry
        await initializeMCP(); 
        console.log("✅ MCP ecosystem fully initialized!\n");

        console.log("📝 [2/3] Creating Mock Planner State...");
        // This simulates what the AI would have figured out in previous steps
        const mockState: PlannerState = {
            messages: [],
            tripContext: {
                destinations: ["Jaipur"], // The agents will read this destination!
                startDate: "2024-12-01",
                endDate: "2024-12-05",
                baseCurrency: "INR",
                travelerCount: 2,
                preferences: ["luxury", "history"]
            },
            researchNotes: [],
            selectedHotels: [],
            selectedActivities: [],
            proposedItinerary: [],
            plannerPhase: "attraction_research"
        };
        console.log("✅ State created for destination: Jaipur\n");

        console.log("🧪 [3/3] Executing Nodes (with Autonomous Agents)...\n");

        // --- TEST HOTELS NODE ---
        const hotelUpdate = await hotelsNode(mockState);
        console.log("🏨 Hotels Node Output:");

        console.log(hotelUpdate.selectedHotels);
        if (hotelUpdate.selectedHotels && hotelUpdate.selectedHotels.length > 0) {
            console.log(`✅ Success! Extracted ${hotelUpdate.selectedHotels.length} hotels.`);
            console.log(`   First Hotel: ${hotelUpdate.selectedHotels[0].name}`);
        } else {
            console.log("❌ Failed to extract hotels.");
        }
        console.log("--------------------------------------------------\n");

        // --- TEST ACTIVITIES NODE ---
        const activityUpdate = await activitiesNode(mockState);
        console.log("🎢 Activities Node Output:");
        console.log(activityUpdate.selectedActivities);
        if (activityUpdate.selectedActivities && activityUpdate.selectedActivities.length > 0) {
            console.log(`✅ Success! Extracted ${activityUpdate.selectedActivities.length} activities.`);
            console.log(`   First Activity: ${activityUpdate.selectedActivities[0].name}`);
        } else {
            console.log("❌ Failed to extract activities.");
        }
        console.log("--------------------------------------------------\n");

        console.log("🎉 NODE TESTING COMPLETE!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Fatal Error during node execution:");
        console.error(error);
        process.exit(1);
    }
}

runNodeTests();
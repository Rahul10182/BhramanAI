import 'dotenv/config';
import * as dotenv from "dotenv";
dotenv.config();

import { HumanMessage } from "@langchain/core/messages";
import { destinationNode } from "./langgraph/nodes/destination.node.js";
import { hotelsNode } from "./langgraph/nodes/hotels.node.js";
import { activitiesNode } from "./langgraph/nodes/activities.node.js";
import { foodNode } from "./langgraph/nodes/food.node.js";
import { PlannerState } from "./langgraph/state/planner.state.js";
import { initializeMCP } from "./config/mcp.config.js";

/**
 * Unified Test Script
 * -------------------
 * Tests the entire planning sequence with the updated Tavily tool.
 */
async function runNodeTests() {
    try {
        console.log("🔌 [1/3] Booting up MCP Tool Servers...");
        await initializeMCP(); 
        console.log("✅ MCP ecosystem fully initialized!\n");

        console.log("📝 [2/3] Creating Vague Mock Planner State...");
        let mockState: PlannerState = {
            messages: [
                new HumanMessage("I want a 5-day trip to a city in INDIA famous for its Snowfall.")
            ],
            tripContext: {
                destinations: [], // Empty to trigger discovery
                startDate: "2024-12-01",
                endDate: "2024-12-05",
                baseCurrency: "INR",
                travelerCount: 2,
                preferences: ["history", "culture", "luxury"]
            },
            researchNotes: [],
            selectedHotels: [],
            selectedActivities: [],
            selectedFood: [],
            proposedItinerary: [],
            plannerPhase: "destination_discovery"
        };

        console.log("🧪 [3/3] Executing Full Node Sequence...\n");

        // --- 1. TEST DESTINATION NODE ---
        const destUpdate = await destinationNode(mockState);
        const updatedDestinations = destUpdate.tripContext?.destinations || [];
        
        if (updatedDestinations.length > 0) {
            mockState.tripContext.destinations = updatedDestinations;
            mockState.plannerPhase = destUpdate.plannerPhase!;
            console.log(`✅ Success! Destination Discovered: ${mockState.tripContext.destinations[0]}`);
        } else {
            console.log("❌ Failed to discover destination.");
            process.exit(1);
        }
        console.log("--------------------------------------------------\n");

        // --- 2. TEST HOTELS NODE ---
        const hotelUpdate = await hotelsNode(mockState);
        const updatedHotels = hotelUpdate.selectedHotels || [];

        if (updatedHotels.length > 0) {
            mockState.selectedHotels = updatedHotels;
            console.log(`✅ Success! Extracted ${mockState.selectedHotels.length} hotels.`);
        } else {
            console.log("❌ Failed to extract hotels.");
        }
        console.log("--------------------------------------------------\n");

        // --- 3. TEST ACTIVITIES NODE ---
        const activityUpdate = await activitiesNode(mockState);
        const updatedActivities = activityUpdate.selectedActivities || [];

        if (updatedActivities.length > 0) {
            mockState.selectedActivities = updatedActivities;
            console.log(`✅ Success! Extracted ${mockState.selectedActivities.length} activities.`);
        } else {
            console.log("❌ Failed to extract activities.");
        }
        console.log("--------------------------------------------------\n");

        // --- 4. TEST FOOD NODE ---
        const foodUpdate = await foodNode(mockState);
        const updatedFood = foodUpdate.selectedFood || [];

        if (updatedFood.length > 0) {
            mockState.selectedFood = updatedFood;
            console.log(`✅ Success! Extracted ${mockState.selectedFood.length} food options near ${mockState.selectedHotels[0]?.name || "the area"}.`);
        } else {
            console.log("❌ Failed to extract food.");
        }

        console.log("\n🎉 ALL NODE TESTS COMPLETE!");
        process.exit(0);

    } catch (error) {
        console.error("\n❌ Fatal Error during node execution:");
        console.error(error);
        process.exit(1);
    }
}

runNodeTests();
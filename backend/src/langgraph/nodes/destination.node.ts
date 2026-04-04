import { PlannerState } from "../state/planner.state.js";
import { runDestinationAgent } from "../agents/destination.agent.js";

/**
 * Destination Node:
 * The entry point for the Planning Graph.
 * Ensures the 'destinations' array in tripContext is populated.
 */
export const destinationNode = async (state: PlannerState) => {
    console.log("📍 [Node] Starting Destination Discovery phase...");

    // 1. Check if the destination is already provided by the user
    const existingDestinations = state.tripContext?.destinations || [];
    
    // If the user already said "I want to go to Jaipur", we skip discovery
    if (existingDestinations.length > 0 && existingDestinations[0] !== "" && existingDestinations[0] !== "Unknown") {
        console.log(`✅ Destination already set: ${existingDestinations[0]}`);
        return {
            plannerPhase: "attraction_research" as const
        };
    }

    // 2. Determine what the user wants based on the last message
    const lastMessage = state.messages[state.messages.length - 1]?.content;
    const userPrompt = typeof lastMessage === 'string' ? lastMessage : "Suggest a popular travel destination";

    try {
        // 3. Call the Agent to discover a city
        const discoveryResult = await runDestinationAgent(
            userPrompt,
            state.tripContext?.preferences || []
        );

        if (!discoveryResult || !discoveryResult.destination) {
            console.warn("⚠️ [Node] Agent could not find a destination.");
            return {
                plannerPhase: "destination_discovery" as const // Stay in this phase to try again
            };
        }

        const destination = discoveryResult.destination;
        const reasoning = discoveryResult.reasoning;

        console.log(`✅ [Node] Successfully discovered: ${destination}`);

        // 4. Update the state with the discovered city
        return {
            tripContext: {
                ...state.tripContext,
                destinations: [destination]
            },
            researchNotes: [
                ...(state.researchNotes || []), 
                `Destination Discovered: ${destination}. Reasoning: ${reasoning}`
            ],
            plannerPhase: "attraction_research" as const // Move the graph to the next phase
        };
        
    } catch (error) {
        console.error("❌ [Node] Destination Node failure:", error);
        return {
            plannerPhase: "destination_discovery" as const
        };
    }
};
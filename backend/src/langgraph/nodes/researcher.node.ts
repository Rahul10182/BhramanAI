import { TravelStateAnnotation } from "../state/travel.state.js";

export const researcherNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("🕵️‍♂️ [Node: Researcher] Gathering initial context...");
    const { tripContext } = state;
    
    // Create baseline notes to pass to the planner
    const initialNote = `SYSTEM PRE-CHECK: Preparing a trip for ${tripContext?.travelerCount} traveler(s) to ${tripContext?.destinations?.join(", ")}. Priorities include: ${tripContext?.preferences?.join(", ")}.`;

    return { 
        researchNotes: [initialNote],
        currentStage: "planning" as const
    };
};
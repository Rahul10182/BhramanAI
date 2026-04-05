import { SystemMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js"; 
import { personalizationAgent } from "../agents/personalization.agent.js";

export const onboardingNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("🗣️ [Node: Onboarding] Analyzing chat to extract trip details...");

    const systemPrompt = new SystemMessage(`You are BhramanAI's friendly travel concierge. 
    Analyze the conversation and extract trip requirements. Be conversational, not robotic.
    Current known data: ${JSON.stringify(state.tripContext)}`);

    // Invoke the agent with the system prompt and the entire chat history
    const aiResponse = await personalizationAgent.invoke([systemPrompt, ...state.messages]);
    const extracted = aiResponse.extractedData;

    // FIX: Safely map the extracted 'destination' string into the 'destinations' array
    const updatedDestinations = extracted.destination 
        ? [extracted.destination] 
        : state.tripContext.destinations;

    return {
        // We write the extracted data directly into your existing tripContext!
        tripContext: {
            ...state.tripContext,
            ...extracted,
            destinations: updatedDestinations // Assign the clean array here
        },
        isComplete: aiResponse.isComplete,
        aiResponse: aiResponse.nextQuestion
    };
};
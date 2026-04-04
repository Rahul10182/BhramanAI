import { SystemMessage } from "@langchain/core/messages";
import { PlannerStateAnnotation } from "../state/planner.state.js";
import { plannerLLM } from "../agents/planner.agent.js";

export const plannerNode = async (state: typeof PlannerStateAnnotation.State) => {
    console.log("🧠 [Node: Planner] LLM is evaluating the request...");
    const { messages, tripContext, researchNotes } = state;

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Planner Architect.
        
        [TRIP CONTEXT]
        Destinations: ${tripContext?.destinations?.join(", ") || "Not set"}
        Budget: ${tripContext?.totalBudget || "Not set"} ${tripContext?.baseCurrency}
        Preferences: ${tripContext?.preferences?.join(", ") || "None"}
        
        [RESEARCH NOTES]
        ${researchNotes?.length ? researchNotes.join("\n") : "No prior notes."}

        [INSTRUCTIONS]
        Use your tools to find accurate information. Draft a logical, brief itinerary based on the user's prompt. Do not hallucinate currency rates or attractions without using your tools.`
    });

    // We pass the system message first, followed by the conversation history
    const response = await plannerLLM.invoke([systemMessage, ...messages]);
    
    return { messages: [response] };
};
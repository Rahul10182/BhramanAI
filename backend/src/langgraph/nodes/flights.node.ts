import { SystemMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { flightLLM } from "../agents/flight.agent.js";

export const flightNode = async (state: typeof TravelStateAnnotation.State) => {
    console.error("✈️ [Node: Flight] Accessing MCP Flight Server...");
    const { messages, tripContext } = state;

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Flight Specialist.
        Current Trip: ${tripContext.destinations.join(" -> ")}
        Budget: ${tripContext.totalBudget} ${tripContext.baseCurrency}

        Instructions:
        1. Search for flights using 'search_flights' with 3-letter IATA codes.
        2. If you find a suitable flight, summarize the airline, price, and duration.
        3. Aim to stay within the user's budget.`
    });

    const response = await flightLLM.invoke([systemMessage, ...messages]);

    // Example of how to update the 'selectedFlights' annotation
    // In a production scenario, you'd parse the 'response' to extract structured data
    return { 
        messages: [response],
        currentStage: "planning" 
    };
};
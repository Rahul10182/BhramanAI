import { SystemMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { distanceTimeLLM } from "../agents/distance-time.agent.js";

export const distanceTimeNode = async (state: typeof TravelStateAnnotation.State) => {
    console.error("🚗 [Node: DistanceTime] Accessing OpenRouteService MCP...");
    const { messages, tripContext } = state;

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Logistics Expert.
        Locations to connect: ${tripContext.destinations.join(", ")}

        Instructions:
        1. Use 'calculate_routing_distance_and_time' for driving logistics between cities.
        2. Use 'get_time_and_timezone' to check local times for arrival/departure planning.
        3. Provide distances in KM and time in hours/minutes.`
    });

    const response = await distanceTimeLLM.invoke([systemMessage, ...messages]);

    return { 
        messages: [response]
    };
};
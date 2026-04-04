import { SystemMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { weatherLLM } from "../agents/weather.agent.js";

/**
 * Weather Node: Checks weather forecasts for all destinations in the trip.
 * This helps the planner suggest appropriate activities and packing lists.
 */
export const weatherNode = async (state: typeof TravelStateAnnotation.State) => {
    console.error("🌤️ [Node: Weather] Fetching forecasts for destinations...");
    
    const { messages, tripContext } = state;

    // We pull the destinations and start date directly from the state
    const destinations = tripContext.destinations.join(", ") || "the requested locations";
    const startDate = tripContext.start_date || "today";

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Weather Specialist.
        
        [TRIP CONTEXT]
        Destinations: ${destinations}
        Start Date: ${startDate}
        
        [INSTRUCTIONS]
        1. Use 'get_weather_forecast' to retrieve the weather for each destination.
        2. Provide a 3-day forecast starting from the departure date if possible.
        3. Identify any weather warnings (heavy rain, extreme heat, snow) that might impact travel.
        4. Be precise with temperatures and sky conditions.
        
        Keep your update concise so the Planner Architect can easily integrate it into the final itinerary.`
    });

    // Invoke the weather agent which has weatherTools bound to it
    const response = await weatherLLM.invoke([systemMessage, ...messages]);
    
    return { 
        messages: [response]
    };
};
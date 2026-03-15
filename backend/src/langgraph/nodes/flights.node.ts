import { TravelStateType } from "../state/travel.state.js";
// This imports the SerpApi or Amadeus logic you will migrate to TypeScript
import { searchFlights } from "../tools/flight.tools.js"; 

export async function flightNode(state: TravelStateType): Promise<Partial<TravelStateType>> {
  console.log("✈️ [Flight Node] Executing...");

  // 1. Read from the Shared Whiteboard
  const { source_city, destination_city, travel_date } = state;

  // 2. Safety Check
  // The Planner Agent should have filled these in, but we verify just in case
  if (!source_city || !destination_city || !travel_date) {
    console.log("⚠️ Missing required flight parameters.");
    return {
      flight_data: "Error: Missing source, destination, or date. Cannot fetch flights.",
    };
  }

  try {
    console.log(`Fetching flights from ${source_city} to ${destination_city} for ${travel_date}`);
    
    // 3. Call your actual API logic
    // (This is where your SerpApi Google Flights or Amadeus code runs)
    const flightResults = await searchFlights(source_city, destination_city, travel_date);
    
    // 4. Write back to the Whiteboard
    // Notice we ONLY return the 'flight_data' field. 
    // LangGraph's reducer will automatically merge this into the main state.
    return {
      flight_data: flightResults,
    };
    
  } catch (error) {
    console.error("Flight API Error:", error);
    return {
      flight_data: `Failed to fetch flights: ${error}`,
    };
  }
}
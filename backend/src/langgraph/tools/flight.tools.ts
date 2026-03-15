// src/tools/flight.tools.ts

export async function searchFlights(origin_iata: string, destination_iata: string, departure_date: string): Promise<string> {
  const apiKey = process.env.SERPAPI_KEY || "fa049a8374b8697572df97456bc11f4349929f086b5ec89fe7265aefcf70429a"; 
  
  // Construct the URL with query parameters
  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "google_flights");
  url.searchParams.append("departure_id", origin_iata);
  url.searchParams.append("arrival_id", destination_iata);
  url.searchParams.append("outbound_date", departure_date);
  url.searchParams.append("type", "2"); // One-way flight
  url.searchParams.append("currency", "INR");
  url.searchParams.append("hl", "en");
  url.searchParams.append("api_key", apiKey);

  try {
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    // FIX: Typecast the parsed JSON to 'any' so TypeScript lets us read its properties
    const data = await response.json() as any;
    const bestFlights = data.best_flights || [];

    if (bestFlights.length === 0) {
      return "No flights found.";
    }

    let result = `Flight data from ${origin_iata} to ${destination_iata} on ${departure_date}:\n`;
    
    // Loop through the top 3 flights
    bestFlights.slice(0, 3).forEach((flight: any, index: number) => {
      const price = flight.price || "Price unknown";
      // Extract airlines from the nested flight segments
      const airlines = flight.flights 
        ? flight.flights.map((f: any) => f.airline || "Unknown").join(", ") 
        : "Unknown";
        
      result += `${index + 1}. Airlines: ${airlines} | Price: ${price} INR\n`;
    });

    return result;

  } catch (error) {
    return `API Error: ${error instanceof Error ? error.message : String(error)}`;
  }
}
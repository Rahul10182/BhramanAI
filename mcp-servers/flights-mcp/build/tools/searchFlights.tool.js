import { fetchFlightData } from "../providers/serpapi.provider.js";
// 1. Define the tool schema
export const searchFlightsDefinition = {
    name: "search_flights",
    description: "Searches for flights using Google Flights. IMPORTANT: You MUST convert city names to 3-letter IATA airport codes (e.g., IXD for Prayagraj, BLR for Bangalore) before calling this tool.",
    inputSchema: {
        type: "object",
        properties: {
            origin_iata: {
                type: "string",
                description: "The 3-letter IATA code for the departure city."
            },
            destination_iata: {
                type: "string",
                description: "The 3-letter IATA code for the arrival city."
            },
            departure_date: {
                type: "string",
                description: "The date of departure in YYYY-MM-DD format."
            }
        },
        required: ["origin_iata", "destination_iata", "departure_date"]
    }
};
// 2. Define the execution logic
export async function executeSearchFlights(args) {
    const { origin_iata, destination_iata, departure_date } = args;
    try {
        const data = await fetchFlightData(origin_iata, destination_iata, departure_date);
        const bestFlights = data.best_flights || [];
        if (bestFlights.length === 0) {
            return { content: [{ type: "text", text: "No flights found for this route and date." }] };
        }
        let resultText = `Flight data from ${origin_iata} to ${destination_iata} on ${departure_date}:\n`;
        // Loop through the top 3 flights exactly like your Python script
        bestFlights.slice(0, 3).forEach((flight, index) => {
            const price = flight.price || "Price unknown";
            const airlines = flight.flights
                ? flight.flights.map((f) => f.airline || "Unknown").join(", ")
                : "Unknown";
            resultText += `${index + 1}. Airlines: ${airlines} | Price: ${price} INR\n`;
        });
        return { content: [{ type: "text", text: resultText }] };
    }
    catch (error) {
        return {
            content: [{ type: "text", text: `API Error: ${error instanceof Error ? error.message : String(error)}` }],
            isError: true
        };
    }
}

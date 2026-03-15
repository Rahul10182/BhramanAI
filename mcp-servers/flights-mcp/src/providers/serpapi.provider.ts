export async function fetchFlightData(origin_iata: string, destination_iata: string, departure_date: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    throw new Error("SERPAPI_KEY environment variable is missing.");
  }

  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "google_flights");
  url.searchParams.append("departure_id", origin_iata);
  url.searchParams.append("arrival_id", destination_iata);
  url.searchParams.append("outbound_date", departure_date);
  url.searchParams.append("type", "2"); // One-way flight
  url.searchParams.append("currency", "INR");
  url.searchParams.append("hl", "en");
  url.searchParams.append("api_key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`SerpApi HTTP Error: ${response.status}`);
  }

  return await response.json() as any;
}
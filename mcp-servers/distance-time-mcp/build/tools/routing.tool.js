import "dotenv/config";
export const getRoutingDef = {
    name: "calculate_routing_distance_and_time",
    description: "Calculate the real driving distance and estimated travel time between two places.",
    inputSchema: {
        type: "object",
        properties: {
            source: { type: "string", description: "Starting location (e.g., 'New York')" },
            destination: { type: "string", description: "Destination location (e.g., 'Chicago')" }
        },
        required: ["source", "destination"]
    }
};
// 1. Helper function to get coordinates from OpenRouteService
async function getCoordinates(place, apiKey) {
    // IMPORTANT: Using console.error so we don't break the MCP stdio pipe
    console.error(`🔍 [Geocoding] Looking up: ${place}...`);
    const url = `https://api.openrouteservice.org/geocode/search?api_key=${apiKey}&text=${encodeURIComponent(place)}&size=1`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Geocoding failed for ${place} (Status: ${response.status})`);
    }
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
        throw new Error(`Could not find coordinates for: ${place}`);
    }
    // ORS returns coordinates in [longitude, latitude] order
    const lon = data.features[0].geometry.coordinates[0];
    const lat = data.features[0].geometry.coordinates[1];
    const name = data.features[0].properties.label;
    console.error(`📍 [Geocoding] Found: ${name}`);
    return { lat, lon, name };
}
// 2. Main handler
export async function getRoutingHandler(args) {
    const { source, destination } = args;
    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
        throw new Error("Missing ORS_API_KEY environment variable. Please add it to your .env file.");
    }
    try {
        // Step A: Geocode both locations
        const srcCoords = await getCoordinates(source, apiKey);
        const destCoords = await getCoordinates(destination, apiKey);
        console.error(`🚗 [Routing] Calculating path from ${source} to ${destination}...`);
        // Step B: Fetch driving route from OpenRouteService
        const osrmUrl = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${srcCoords.lon},${srcCoords.lat}&end=${destCoords.lon},${destCoords.lat}`;
        const startTimer = Date.now();
        const osrmResponse = await fetch(osrmUrl);
        if (!osrmResponse.ok) {
            throw new Error(`Routing failed (Status: ${osrmResponse.status})`);
        }
        const osrmData = await osrmResponse.json();
        console.error(`⏱️ [Routing] OpenRouteService responded in ${Date.now() - startTimer}ms`);
        if (!osrmData.features || osrmData.features.length === 0) {
            throw new Error("Could not calculate a route between these locations.");
        }
        // Step C: Extract distance and time
        const summary = osrmData.features[0].properties.summary;
        // Convert distance from meters to kilometers
        const distanceKm = (summary.distance / 1000).toFixed(2);
        // Convert duration from seconds to hours and minutes
        const totalMinutes = Math.round(summary.duration / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        const formattedTime = `${hours}h ${minutes}m`;
        return {
            content: [{
                    type: "text",
                    text: JSON.stringify({
                        source: srcCoords.name,
                        destination: destCoords.name,
                        drivingDistanceKm: parseFloat(distanceKm),
                        estimatedDrivingTime: formattedTime
                    }, null, 2)
                }]
        };
    }
    catch (error) {
        console.error(`❌ [Routing Tool Error]:`, error.message);
        throw error;
    }
}

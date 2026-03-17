export const nearbyFoodTool = {
  name: "get_nearby_food",
  description: "Get nearby restaurants, cafes, and fast food near specific latitude and longitude coordinates.",
  inputSchema: {
    type: "object",
    properties: {
      lat: {
        type: "number",
        description: "Latitude of the location"
      },
      lon: {
        type: "number",
        description: "Longitude of the location"
      }
    },
    required: ["lat", "lon"]
  }
};
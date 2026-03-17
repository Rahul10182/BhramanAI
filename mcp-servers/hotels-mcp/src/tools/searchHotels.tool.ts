export const searchHotelsTool = {
  name: "search_hotels",
  description: "Search for hotels in a specific city using Geoapify.",
  inputSchema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The name of the city to search for hotels in (e.g., 'Jaipur')"
      }
    },
    required: ["city"]
  }
};
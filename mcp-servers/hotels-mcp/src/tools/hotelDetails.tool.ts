export const hotelDetailsTool = {
  name: "get_hotel_details",
  description: "Get detailed information about a specific hotel using its unique ID.",
  inputSchema: {
    type: "object",
    properties: {
      hotelId: {
        type: "string",
        description: "The unique identifier of the hotel (e.g., the place ID returned from the search_hotels tool)"
      }
    },
    required: ["hotelId"]
  }
};
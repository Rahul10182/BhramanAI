export const checkAvailabilityTool = {
  name: "check_hotel_availability",
  description: "Check room availability for a specific hotel given check-in and check-out dates.",
  inputSchema: {
    type: "object",
    properties: {
      hotelId: {
        type: "string",
        description: "The unique identifier of the hotel (e.g., place ID from Geoapify)"
      },
      checkIn: {
        type: "string",
        description: "Check-in date in YYYY-MM-DD format"
      },
      checkOut: {
        type: "string",
        description: "Check-out date in YYYY-MM-DD format"
      }
    },
    required: ["hotelId", "checkIn", "checkOut"]
  }
};
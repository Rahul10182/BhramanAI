export const searchActivitiesTool = {
  name: "search_activities",
  description: "Find popular tourist attractions, museums, parks, and sights in a specific city.",
  inputSchema: {
    type: "object",
    properties: {
      city: {
        type: "string",
        description: "The name of the city to search for activities in (e.g., 'Jaipur', 'Paris')"
      }
    },
    required: ["city"]
  }
};
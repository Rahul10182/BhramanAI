import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { GeoapifyProvider } from "./providers/geoapify.provider.js";
import { searchHotelsTool } from "./tools/searchHotels.tool.js";
import { nearbyFoodTool } from "./tools/searchFood.tool.js";
import { hotelDetailsTool } from "./tools/hotelDetails.tool.js";
import { checkAvailabilityTool } from "./tools/checkAvailability.tool.js";

const server = new Server(
  {
    name: "hotels-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const provider = new GeoapifyProvider();

// 2. Register all 4 tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      searchHotelsTool, 
      nearbyFoodTool, 
      hotelDetailsTool, 
      checkAvailabilityTool
    ],
  };
});

// 3. Handle Tool Execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "search_hotels") {
      const city = String(args?.city);
      const hotels = await provider.searchHotels(city);
      
      return {
        content: [{ type: "text", text: JSON.stringify(hotels, null, 2) }],
      };
    } 
    
    else if (name === "get_nearby_food") {
      const lat = Number(args?.lat);
      const lon = Number(args?.lon);
      const food = await provider.getFoodNearHotel(lat, lon);
      
      return {
        content: [{ type: "text", text: JSON.stringify(food, null, 2) }],
      };
    }

    // NEW: Hotel Details Block
    else if (name === "get_hotel_details") {
      const hotelId = String(args?.hotelId);
      const details = await provider.getHotelDetails(hotelId);
      
      return {
        content: [{ type: "text", text: JSON.stringify(details, null, 2) }],
      };
    }

    // NEW: Check Availability Block
    else if (name === "check_hotel_availability") {
      const hotelId = String(args?.hotelId);
      const checkIn = String(args?.checkIn);
      const checkOut = String(args?.checkOut);
      
      const availability = await provider.checkAvailability(hotelId, checkIn, checkOut);
      
      return {
        content: [{ type: "text", text: JSON.stringify(availability, null, 2) }],
      };
    }

    throw new Error("Tool not found");
  } catch (error: any) {
    return {
      content: [{ type: "text", text: `Error: ${error.message}` }],
      isError: true,
    };
  }
});

// Start Server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Hotels MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
import { convertCurrencyTool } from './currency.tool.js';
import { searchFlightsTool } from './flight.tools.js';
import { getWeatherForecastTool } from './weather.tool.js';
import { 
    searchHotelsTool, 
    getNearbyFoodTool, 
    getHotelDetailsTool, 
    checkHotelAvailabilityTool 
} from './hotel.tool.js';
import { searchActivitiesTool, activityClient } from './activity.tool.js';
import { webSearchTool } from './search.tool.js';

async function runAllTests() {
    console.log("🚀 Starting comprehensive tool tests...\n");

    try {
        // 0. INITIALIZATION
        console.log("--- 0. Initializing Connections ---");
        // Remember: Activity MCP requires a manual connect!
        await activityClient.connect(); 
        console.log("✅ Activity client connected.\n");

        // 1. CURRENCY TOOL
        console.log("--- 1. Testing Currency Tool ---");
        const currencyResult = await convertCurrencyTool.invoke({
            amount: 500,
            fromCurrency: "USD",
            toCurrency: "EUR"
        });
        console.log("Result:", currencyResult, "\n");

        // 2. FLIGHT TOOL
        console.log("--- 2. Testing Flight Tool ---");
        const flightResult = await searchFlightsTool.invoke({
            originIata: "JFK",
            destinationIata: "LHR",
            departureDate: "2026-06-15" // Must be YYYY-MM-DD
        });
        console.log("Result:", flightResult, "\n");

        // 3. WEATHER TOOL
        console.log("--- 3. Testing Weather Tool ---");
        const weatherResult = await getWeatherForecastTool.invoke({
            location: "Tokyo",
            start_date: "2026-04-10",
            days: 5 // Optional, but good to test
        });
        console.log("Result:", weatherResult, "\n");

        // 4. HOTEL TOOLS (Testing a couple of them)
        console.log("--- 4a. Testing Hotel Search Tool ---");
        const hotelSearchResult = await searchHotelsTool.invoke({
            location: "Paris",
            guests: 2,
            checkIn: "2026-05-01",
            checkOut: "2026-05-07"
        });
        console.log("Result:", hotelSearchResult, "\n");

        console.log("--- 4b. Testing Hotel Nearby Food Tool ---");
        const foodResult = await getNearbyFoodTool.invoke({
            lat: 48.8566, // Paris coordinates
            lon: 2.3522
        });
        console.log("Result:", foodResult, "\n");

        // 5. ACTIVITY TOOL
        console.log("--- 5. Testing Activity Tool ---");
        const activityResult = await searchActivitiesTool.invoke({
            city: "Rome"
        });
        console.log("Result:", activityResult, "\n");

        // 6. SEARCH TOOL (DuckDuckGo)
        console.log("--- 6. Testing Web Search Tool ---");
        const searchResult = await webSearchTool.invoke({
            query: "Do I need a visa to visit Japan from the US?"
        });
        console.log("Result:", searchResult, "\n");

        console.log("🎉 All tool invocations completed successfully!");

    } catch (error) {
        console.error("\n❌ A test failed!");
        console.error(error);
    }
}

// Execute the tests
runAllTests();
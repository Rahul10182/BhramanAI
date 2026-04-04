import 'dotenv/config';
import { getWeatherForecastTool } from './weather.tool.js';
// Import your server registry so you can connect the MCP server
import { serverRegistry } from '../../mcp/registry/server.registry.js'; 

async function testWeatherTool() {
    console.log("🚀 Starting Dynamic Weather Tool Test...\n");

    try {
        // 1. Connect the specific MCP server
        console.log("--- 1. Connecting to Weather MCP Server ---");
        // Assuming your serverRegistry clients have a .connect() method
        await serverRegistry.weather.connect();
        console.log("✅ Weather server connected.\n");

        // 2. Invoke the LangChain Tool
        console.log("--- 2. Invoking the Tool ---");
        const result = await getWeatherForecastTool.invoke({
            location: "Tokyo",
            start_date: "10 April 2025",
            days: 3
        });

        // 3. Print Results
        console.log("\n✅ Tool Execution Successful!");
        console.log("Result output:");
        console.log(result);

    } catch (error) {
        console.error("\n❌ Test failed!");
        console.error(error);
    }
}

// Run the test
testWeatherTool();
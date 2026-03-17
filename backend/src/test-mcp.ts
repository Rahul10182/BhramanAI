import { serverRegistry } from './mcp/registry/server.registry.js';
import { ToolRegistry } from './mcp/registry/tool.registry.js';

async function runTests() {
    console.log('🚀 Starting MCP Integration Tests...\n');

    try {
        // Step 1: Test the connections
        console.log('--- Test 1: Connecting to Servers ---');
        await serverRegistry.initializeAll();
        console.log('✅ All servers connected successfully!\n');

        // Step 2: Test fetching tools from the servers
        console.log('--- Test 2: Fetching Available Tools ---');
        const allTools = await ToolRegistry.getAllAvailableTools();
        console.log(`✅ Found ${allTools.length} total tools registered across all servers:`);
        
        allTools.forEach(tool => {
            console.log(`   - 🛠️  ${tool.name}: ${tool.description}`);
        });
        console.log('\n');

        // Step 3: Test a specific tool execution (Optional)
        // Note: Uncomment and modify parameters based on how your MCP servers are mocked/implemented
        /*
        console.log('--- Test 3: Executing Weather Tool ---');
        const weatherResult = await serverRegistry.weather.getCurrentWeather('Prayagraj');
        console.log('✅ Weather Result:', weatherResult);
        */

    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
    } finally {
        // Force exit to close the STDIO streams
        console.log('\n🏁 Tests complete. Shutting down.');
        process.exit(0);
    }
}

runTests();
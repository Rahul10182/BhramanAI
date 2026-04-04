import * as dotenv from "dotenv";
dotenv.config();
import { HumanMessage } from "@langchain/core/messages"; 
import { plannerGraph } from "../src/langgraph/graph/planner.graph.js"; 
import { currencyClient } from "../src/langgraph/tools/currency.tool.js";

async function runTest() {
    console.log("🚀 Booting up BhramanAI Agent...\n");

    console.log("🔌 Connecting to Currency MCP Server...");
    try {
        await currencyClient.connect(); 
        console.log("✅ MCP Connected!");
    } catch (error) {
        console.error("❌ Failed to connect to MCP server:", error);
        return; // Stop the test if it can't connect
    }

    // 1. Define the user's prompt
    const userQuery = "I want to visit Paris. Can you find 3 highly-rated historical sites to visit?";
    console.log(`👤 User: ${userQuery}\n`);

    // 2. Mock the tripContext
    const mockTripContext = {
        travelerCount: 2,
        destinations: ["Paris", "France"],
        preferences: ["history", "sightseeing", "budget-friendly"],
        totalBudget: 2000,
        baseCurrency: "USD"
    };

    try {
        console.log("🧠 Agent is thinking and using tools...\n");

        // 3. Invoke the graph
        const finalState = await plannerGraph.invoke({
            messages: [new HumanMessage(userQuery)], 
            tripContext: mockTripContext 
        });

        // 👇 NEW: Tool Execution Audit Log 👇
        console.log("\n========================================");
        console.log("🛠️  TOOL EXECUTION AUDIT LOG");
        console.log("========================================");
        
        finalState.messages.forEach((msg: any) => {
            // 1. Check if the Agent asked to use a tool
            if (msg.tool_calls && msg.tool_calls.length > 0) {
                msg.tool_calls.forEach((call: any) => {
                    console.log(`\n🤖 [AGENT] Requested Tool: ${call.name}`);
                    console.log(`📥 [INPUT PARAMS]:`, JSON.stringify(call.args, null, 2));
                });
            }
            
            // 2. Check if a Tool returned a response back to the Agent
            if (msg._getType() === "tool") {
                console.log(`📤 [OUTPUT from ${msg.name}]:\n`, msg.content);
            }
        });
        console.log("========================================\n");
        // 👆 END OF NEW LOGGING 👆

        // 4. Extract the final message
        const finalMessage = finalState.messages[finalState.messages.length - 1];
        
        if (!finalMessage) {
            console.log("❌ No response was returned from the graph.");
            return;
        }
        
        console.log(`✈️ BhramanAI Final Output:\n`);
        console.log(finalMessage.content);
        
    } catch (error) {
        console.error("❌ Error running the agent:", error);
    }
}

// Execute the test
runTest();
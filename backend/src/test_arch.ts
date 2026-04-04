import 'dotenv/config';

import { HumanMessage } from "@langchain/core/messages";
import { travelGraph } from "./langgraph/graph/travel.graph.js";
import { initializeMCP } from './config/mcp.config.js';

async function runTravelSystem() {
    console.log("🔌 Initializing MCP Servers...");
    await initializeMCP();
    
    console.log("🚀 Starting BhramanAI Master Graph (Debug Mode)...\n");

    const userPrompt = "I am planning a trip to Paris. Can you find 3 historical sites for me to visit, and convert 500 USD to Euros to see my spending money?";
    console.log(`👤 User: ${userPrompt}\n`);

    try {
        const initialState = {
            messages: [new HumanMessage(userPrompt)],
            tripContext: {
                destinations: ["Paris"],
                baseCurrency: "USD",
                travelerCount: 2,
                preferences: ["history", "culture"],
                totalBudget: 2000
            }
        };

        // 1. Change .invoke() to .stream() for step-by-step debugging
        const stream = await travelGraph.stream(initialState, {
            streamMode: "updates" // Tells LangGraph to only emit what changed
        });

        let latestMessages: any[] = [];

        // 2. Loop through the stream chunks to see exactly which node is running
        for await (const chunk of stream) {
            // chunk is an object where the key is the Node name, and the value is the State update
            for (const [nodeName, stateUpdate] of Object.entries(chunk)) {
                
                // Print a clear indicator of which node just finished
                console.log(`\n✅ [Graph Event] Node finished: \x1b[36m${nodeName}\x1b[0m`);
                
                // Safely capture the latest messages array if this node updated it
                if ((stateUpdate as any).messages) {
                    latestMessages = (stateUpdate as any).messages;
                    
                    // Debug: Print the exact tool calls the LLM requested
                    const lastMsg = latestMessages[latestMessages.length - 1];
                    if (lastMsg.tool_calls && lastMsg.tool_calls.length > 0) {
                         console.log(`   🛠️  Tool Calls Triggered:`, lastMsg.tool_calls.map((t: any) => t.name));
                    }
                }
            }
        }

        console.log("\n🎉 Graph execution finished completely.\n");

        // 3. Extract the final response
        const finalMessage = latestMessages[latestMessages.length - 1];
        
        if (!finalMessage) {
            console.log("❌ No response received.");
            return;
        }

        console.log(`✈️ BhramanAI Final Output:\n`);
        console.log(finalMessage.content);
        
    } catch (error) {
        console.error("\n❌ Agent execution failed:", error);
    }
}

// Ensure you run this with: npx tsx src/test_architecture.ts
runTravelSystem();
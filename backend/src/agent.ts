import 'dotenv/config';
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// 1. Import your new tools (adjust path to match where you saved distanceTime.tool.ts)
import { distanceTimeTools } from '../src/langgraph/tools/distance-time.tool.js';
import { initializeMCP } from './config/mcp.config.js';

async function runDistanceTimeAgent() {
    console.log("🔌 Initializing MCP servers...");
    // Ensure all your servers (including the new distanceTime server) boot up
    await initializeMCP();

    // 2. Setup your LLM
    const llm = new ChatOpenAI({ 
        model: "gpt-4o", 
        temperature: 0 
    });

    // 3. Load only the distance and time tools for this test
    const allTools = [...distanceTimeTools];

    // 4. Create the ReAct Agent
    const agent = createReactAgent({
        llm: llm,
        tools: allTools,
        // Update the system prompt to reflect its new capabilities
        stateModifier: `You are a helpful logistics and travel assistant. 
        You have access to tools to calculate driving distances/times and check timezones.
        - When calculating routes, provide the exact distance in kilometers and estimated driving time.
        - When checking timezones, provide the local time and the timezone name.
        - Format your final response nicely using bullet points.`
    });

    console.log("🚗 Logistics Agent is ready! Let's test...\n");
    
    // 5. A User Prompt designed to trigger BOTH tools
    const userPrompt = "I am planning a road trip from New York to Chicago. Can you calculate the driving distance and estimated travel time? Also, check what the current time is in Chicago right now.";
    
    console.log(`👤 User: ${userPrompt}\n`);
    console.log("⏳ Agent is thinking and searching tools...\n");

    try {
        // 6. Invoke the agent
        const response = await agent.invoke({
            messages: [
                { 
                    role: "user", 
                    content: userPrompt
                }
            ]
        });

        // 7. Extract and print the final answer
        const finalMessage = response.messages[response.messages.length - 1];
        console.log("🤖 Agent's Final Answer:\n");
        console.log(finalMessage?.content);

    } catch (error) {
        console.error("❌ Fatal Error running agent:", error);
    }
}

// Execute the function
runDistanceTimeAgent();
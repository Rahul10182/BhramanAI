// src/test.ts
import "dotenv/config"; // This loads your .env file automatically
import { HumanMessage } from "@langchain/core/messages";
import { travelApp } from "./langgraph/graph/travel.graph.js";

async function testAgent() {
  console.log("🚀 Booting up Travel Agent Graph...\n");

  // 1. The input exactly as a user would type it in a chat
  const userPrompt = "I need to book a flight from Delhi to Mumbai for tomorrow.";
  console.log(`👤 User: "${userPrompt}"\n`);
  console.log("-".repeat(40));

  // 2. Create the initial state
  const initialState = {
    messages: [new HumanMessage(userPrompt)],
  };

  try {
    // 3. Trigger the LangGraph loop!
    const finalState = await travelApp.invoke(initialState);

    // 4. Print the final whiteboard (State) to see what the agents did
    console.log("\n✅ Graph Execution Complete!");
    console.log("-".repeat(40));
    console.log("🧠 Final Routing Flag :", finalState.next_worker);
    console.log("📍 Extracted Source   :", finalState.source_city);
    console.log("📍 Extracted Dest     :", finalState.destination_city);
    console.log("📅 Extracted Date     :", finalState.travel_date);
    
    console.log("\n✈️  Flight API Result:");
    console.log(finalState.flight_data);

  } catch (error) {
    console.error("\n❌ Test Failed:", error);
  }
}

testAgent();
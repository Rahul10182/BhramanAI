import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelState, TravelStateType } from "../state/travel.state.js";
import { plannerNode } from "../agents/planner.agent.js";
import { flightNode } from "../nodes/flights.node.js";
// Import your other nodes as you build them
// import { weatherNode } from "../nodes/weather.node.js";
// import { hotelNode } from "../nodes/hotels.node.js";

// 1. Define the routing logic
// This function looks at the 'next_worker' flag the LLM set and tells the graph where to go
function routeDecision(state: TravelStateType) {
  if (state.next_worker === "flights") {
    return "flights";
  } else if (state.next_worker === "weather") {
    return "weather";
  } else if (state.next_worker === "hotels") {
    return "hotels";
  } else if (state.next_worker === "ask_user" || state.next_worker === "itinerary") {
    // If the planner needs more info or is completely done, we end the internal loop
    return END; 
  }
  // Fallback
  return END;
}

// 2. Initialize, Build, and Compile the Graph using Method Chaining
const workflow = new StateGraph(TravelState)
  // Add Nodes
  .addNode("planner", plannerNode)
  .addNode("flights", flightNode)
  // .addNode("weather", weatherNode)
  // .addNode("hotels", hotelNode)
  
  // Draw Edges
  // Every time the graph starts, it MUST go to the planner first
  .addEdge(START, "planner")
  
  // After the planner runs, use our routing function to decide where to go
  .addConditionalEdges("planner", routeDecision)
  
  // After a worker finishes its API call, route BACK to the planner
  // This allows the planner to check if it needs to trigger another worker
  .addEdge("flights", "planner");
  // .addEdge("weather", "planner")
  // .addEdge("hotels", "planner");

// 3. Compile the Graph
// This turns your setup into an executable function
export const travelApp = workflow.compile();
import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelStateAnnotation } from "../state/travel.state.js";

// Import Individual Nodes
import { researcherNode } from "../nodes/researcher.node.js"; 
import { distanceTimeNode } from "../nodes/distance-time.node.js";
// import { budgetingNode } from "../nodes/budgeting.node.js";
import { itineraryNode } from "../nodes/itinerary.node.js";

// Import Compiled Sub-Graphs
import { plannerGraph } from "./planner.graph.js";

const workflow = new StateGraph(TravelStateAnnotation)
    // 1. Register all nodes and sub-graphs
    .addNode("researcher", researcherNode)      // Can be swapped for researchGraph later
    .addNode("planner", plannerGraph)           // Runs the entire flights/hotels/food pipeline
    .addNode("logistics", distanceTimeNode)     // Calculates travel times between selected locations
    // .addNode("budgeting", budgetingNode)        // Calculates final costs and currency conversions
    .addNode("itinerary", itineraryNode)        // Synthesizes the final markdown/JSON output

    // 2. Define the Master Flow
    .addEdge(START, "researcher")
    .addEdge("researcher", "planner")
    .addEdge("planner", "logistics")
    // .addEdge("logistics", "budgeting")
    // .addEdge("budgeting", "itinerary")
    .addEdge("logistics", "itinerary")// remove this one after budgeting node
    .addEdge("itinerary", END);

export const travelGraph = workflow.compile();
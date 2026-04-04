
import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { researcherNode } from "../nodes/researcher.node.js";
import { plannerGraph } from "./planner.graph.js"; // Import the compiled sub-graph

const workflow = new StateGraph(TravelStateAnnotation)
  .addNode("researcher", researcherNode)
  .addNode("planner", plannerGraph) 
  
  .addEdge(START, "researcher")
  .addEdge("researcher", "planner")
  .addEdge("planner", END);

export const travelGraph = workflow.compile();
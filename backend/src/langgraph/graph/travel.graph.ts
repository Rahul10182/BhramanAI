import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { researcherNode } from "../nodes/researcher.node.js";
import { plannerNode } from "../nodes/planner.node.js";

const workflow = new StateGraph(TravelStateAnnotation)
  .addNode("researcher", researcherNode)
  .addNode("planner", plannerNode)
  .addEdge(START, "researcher")
  .addEdge("researcher", "planner")
  .addEdge("planner", END);

export const travelGraph = workflow.compile();
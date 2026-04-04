import { StateGraph, START, END } from "@langchain/langgraph";
import { PlannerStateAnnotation } from "../state/planner.state.js";
import { flightNode } from "../nodes/flights.node.js";
import { hotelsNode } from "../nodes/hotels.node.js";
import { activitiesNode } from "../nodes/activities.node.js";
import { foodNode } from "../nodes/food.node.js";

const builder = new StateGraph(PlannerStateAnnotation)
    .addNode("flights", flightNode)
    .addNode("hotels", hotelsNode)
    .addNode("activities", activitiesNode)
    .addNode("food", foodNode)

    // Sequential execution ensures data dependency (e.g., flights dictate hotel dates)
    .addEdge(START, "flights")
    .addEdge("flights", "hotels")
    .addEdge("hotels", "activities")
    .addEdge("activities", "food")
    .addEdge("food", END);

export const plannerGraph = builder.compile();
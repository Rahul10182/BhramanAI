import { StateGraph, START, END } from "@langchain/langgraph";
import { PlannerStateAnnotation } from "../state/planner.state.js";
import { flightNode } from "../nodes/flights.node.js";
import { hotelsNode } from "../nodes/hotels.node.js";
import { activitiesNode } from "../nodes/activities.node.js";
import { foodNode } from "../nodes/food.node.js";
import { budgetNode } from "../nodes/budget.node.js";

const builder = new StateGraph(PlannerStateAnnotation)
    .addNode("flights", flightNode)
    .addNode("hotels", hotelsNode)
    .addNode("activities", activitiesNode)
    .addNode("food", foodNode)
    .addNode("budget", budgetNode)

    // Run hotels and activities in parallel
    .addEdge(START, "flights")
    .addEdge("flights", "hotels")
    .addEdge("flights", "activities")
    .addEdge("hotels", "food")
    .addEdge("activities", "food")
    .addEdge("food", "budget")
    .addEdge("budget", END);

export const plannerGraph = builder.compile();
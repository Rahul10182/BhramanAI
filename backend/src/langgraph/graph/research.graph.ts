import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { destinationNode } from "../nodes/destination.node.js";
import { weatherNode } from "../nodes/weather.node.js";

const builder = new StateGraph(TravelStateAnnotation)
    .addNode("destination", destinationNode)
    .addNode("weather", weatherNode)
    
    // The flow: Pick a destination -> Check the weather -> Done
    .addEdge(START, "destination")
    .addEdge("destination", "weather")
    .addEdge("weather", END);

export const researchGraph = builder.compile();
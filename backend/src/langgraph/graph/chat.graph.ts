import { StateGraph, START, END } from "@langchain/langgraph";
import { TravelStateAnnotation } from "../state/travel.state.js"; 
import { onboardingNode } from "../nodes/onboarding.node.js";

const workflow = new StateGraph(TravelStateAnnotation)
    .addNode("onboard", onboardingNode)
    .addEdge(START, "onboard")
    .addEdge("onboard", END);

export const chatGraph = workflow.compile();
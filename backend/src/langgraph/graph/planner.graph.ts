import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import { PlannerStateAnnotation } from "../state/planner.state.js";
import { plannerNode } from "../nodes/planner.node.js";
import { currencyTools } from "../tools/currency.tool.js";
import { searchTools } from "../tools/search.tool.js";

// 1. Create a ToolNode with our active tools
const plannerToolsNode = new ToolNode([...currencyTools, ...searchTools] as any[]);

// 2. Define the routing logic safely for TypeScript
const routePlanner = (state: typeof PlannerStateAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1];
    
    // Cast to AIMessage to safely access tool_calls without TS complaining
    const aiMessage = lastMessage as AIMessage;
    
    if (aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        return "tools";
    }
    
    return END;
};

// 3. Construct the graph
const builder = new StateGraph(PlannerStateAnnotation)
    .addNode("planner_agent", plannerNode)
    .addNode("tools", plannerToolsNode)
    
    .addEdge(START, "planner_agent")
    .addConditionalEdges("planner_agent", routePlanner)
    .addEdge("tools", "planner_agent");

export const plannerGraph = builder.compile();
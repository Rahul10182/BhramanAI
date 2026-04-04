import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { AIMessage } from "@langchain/core/messages";
import { PlannerStateAnnotation } from "../state/planner.state.js";
import { plannerNode } from "../nodes/planner.node.js";
import { plannerTools } from "../agents/planner.agent.js";

const toolsNode = new ToolNode(plannerTools);

const routePlanner = (state: typeof PlannerStateAnnotation.State) => {
    const lastMessage = state.messages[state.messages.length - 1] as AIMessage;
    
    // If the LLM returns tool calls, route to the tools node
    if (lastMessage?.tool_calls && lastMessage.tool_calls.length > 0) {
        return "tools";
    }
    
    return END;
};

const builder = new StateGraph(PlannerStateAnnotation)
    .addNode("planner_agent", plannerNode)
    .addNode("tools", toolsNode)
    
    .addEdge(START, "planner_agent")
    .addConditionalEdges("planner_agent", routePlanner)
    .addEdge("tools", "planner_agent"); 

export const plannerGraph = builder.compile();
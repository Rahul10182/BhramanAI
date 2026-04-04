import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { distanceTimeLLM } from "../agents/distance-time.agent.js";

// 👉 IMPORT YOUR ROUTING TOOLS HERE (Adjust path to match your actual tools file)
import { distanceTimeTools } from "../tools/distance-time.tool.js"; 

export const distanceTimeNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("🚗 [Node: DistanceTime] Accessing OpenRouteService MCP...");
    const { messages, tripContext } = state;

    // 1. SANITIZE STATE
    const safeMessages = messages.filter(m => !(m as any).tool_calls?.length);

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Logistics Expert.
        Destination: ${tripContext.destinations.join(", ")}

        CRITICAL INSTRUCTIONS:
        1. NEVER ask the user for clarification. Make reasonable assumptions.
        2. Use your routing tools to check distances/times.
        3. Provide a brief summary of the logistics.`
    });

    // 2. Initial LLM Call
    let response = await distanceTimeLLM.invoke([systemMessage, ...safeMessages]);

    // 3. LOCAL TOOL EXECUTION LOOP
    if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`🛠️ [Node: DistanceTime] Executing ${response.tool_calls.length} tools locally...`);
        const toolMessages = [];
        
        for (const toolCall of response.tool_calls) {
            const tool = distanceTimeTools.find((t: any) => t.name === toolCall.name);
            if (tool) {
                const result = await tool.invoke(toolCall.args);
                toolMessages.push(new ToolMessage({
                    tool_call_id: toolCall.id!,
                    content: typeof result === 'string' ? result : JSON.stringify(result)
                }));
            }
        }
        
        // 4. Summarize tool data
        response = await distanceTimeLLM.invoke([systemMessage, ...safeMessages, response, ...toolMessages]);
    }

    return { 
        messages: [response]
    };
};
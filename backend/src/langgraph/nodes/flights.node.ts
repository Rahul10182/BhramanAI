import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { flightLLM } from "../agents/flight.agent.js";

// 👉 IMPORT YOUR FLIGHT TOOLS HERE (Adjust path to match your actual tools file)
import { flightTools } from "../tools/flight.tools.js"; 

export const flightNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("✈️ [Node: Flight] Accessing MCP Flight Server...");
    const { messages, tripContext } = state;

    // 1. SANITIZE STATE: Strip out any unresolved tool calls from previous nodes
    // This immediately prevents the OpenAI 400 Error.
    const safeMessages = messages.filter(m => !(m as any).tool_calls?.length);

    const systemMessage = new SystemMessage({
        content: `You are the BhramanAI Flight Specialist.
        Route: ${tripContext.source} to ${tripContext.destinations.join(", ")}
        Budget: ${tripContext.totalBudget } ${tripContext.baseCurrency}

        CRITICAL INSTRUCTIONS:
        1. NEVER ask the user for clarification.
        2. Search for flights using 'search_flights'.
        3. Summarize the best flight option found. Be decisive.`
    });

    // 2. Initial LLM Call
    let response = await flightLLM.invoke([systemMessage, ...safeMessages]);

    // 3. LOCAL TOOL EXECUTION LOOP
    if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`🛠️ [Node: Flight] Executing ${response.tool_calls.length} tools locally...`);
        const toolMessages = [];
        
        for (const toolCall of response.tool_calls) {
            // Find the matching tool from your imported array
            const tool = flightTools.find((t: any) => t.name === toolCall.name);
            if (tool) {
                const result = await tool.invoke(toolCall as any);
                toolMessages.push(new ToolMessage({
                    tool_call_id: toolCall.id!,
                    content: typeof result === 'string' ? result : JSON.stringify(result)
                }));
            }
        }
        
        // 4. Send the tool results back to the LLM to get a final, clean text summary
        response = await flightLLM.invoke([systemMessage, ...safeMessages, response, ...toolMessages]);
    }

    return { 
        messages: [response], // Now we are only returning a clean text summary to the global state!
        currentStage: "planning" 
    };
};
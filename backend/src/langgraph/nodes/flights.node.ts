import { SystemMessage, ToolMessage } from "@langchain/core/messages";
import { TravelStateAnnotation } from "../state/travel.state.js";
import { flightLLM } from "../agents/flight.agent.js";

// 👉 IMPORT YOUR FLIGHT TOOLS HERE (Adjust path to match your actual tools file)
import { flightTools } from "../tools/flight.tools.js"; 

export const flightNode = async (state: typeof TravelStateAnnotation.State) => {
    console.log("✈️ [Node: Flight] Accessing MCP Flight Server...");
    const { messages, tripContext } = state;

    // 1. SANITIZE STATE: Strip out any unresolved tool calls from previous nodes
    // This immediately prevents the OpenAI 400 "Unresolved Tool Call" Error.
    const safeMessages = messages.filter(m => !(m as any).tool_calls?.length);

    // Extract variables cleanly for the prompt
    const source = tripContext.source || "Unknown";
    const destination = tripContext.destinations[0] || "Unknown";
    const startDate = tripContext.start_date || "Unknown";
    const endDate = tripContext.endDate || "One-way";
    const travelers = tripContext.travelerCount || 1;
    const budget = tripContext.totalBudget || "Flexible";
    const currency = tripContext.baseCurrency || "INR";

    // 2. THE OPTIMIZED PRODUCTION FLIGHT PROMPT
    const systemMessage = new SystemMessage({
        content: `You are the Lead Aviation Specialist for BhramanAI.
        Your objective is to use the flight search tools to find the best routes from the user's source to their destination.

        TRIP DETAILS:
        - Source: ${source}
        - Destination: ${destination}
        - Outbound Date: ${startDate}
        - Return Date: ${endDate}
        - Travelers: ${travelers}
        - Budget: ${budget} ${currency}

        CRITICAL RULES (FOLLOW STRICTLY):
        1. IATA CODE RESOLUTION: You must determine the correct 3-letter IATA codes for the source and destination before calling the tool.
        2. THE "NEAREST AIRPORT" MANDATE: If the user's source or destination city does not have a major commercial airport , you MUST autonomously find the nearest major commercial hub and search flights from there.
        3. NEVER GIVE UP: If a flight search returns no results, do NOT give up. You MUST try again using an alternative nearby airport. If the travel distance is over 400km, a flight MUST be found.
        4. NO USER INTERACTION: NEVER ask the user for clarification or missing data. Make the most logical assumption and proceed.
        5. FINAL SUMMARY: Once you find the flights, summarize the best option decisively. If you had to use a nearby airport (like Lucknow for Kanpur), explicitly mention this in your summary so the itinerary node knows to schedule a taxi/drive to that airport.
        `
    });

    try {
        // 3. Initial LLM Call
        let response = await flightLLM.invoke([systemMessage, ...safeMessages]);

        // 4. LOCAL TOOL EXECUTION LOOP
        if (response.tool_calls && response.tool_calls.length > 0) {
            console.log(`🛠️ [Node: Flight] Executing ${response.tool_calls.length} tools locally...`);
            const toolMessages = [];
            
            for (const toolCall of response.tool_calls) {
                // Find the matching tool from your imported array
                const tool = flightTools.find((t: any) => t.name === toolCall.name);
                if (tool) {
                    try {
                        const result = await tool.invoke(toolCall as any);
                        toolMessages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: typeof result === 'string' ? result : JSON.stringify(result)
                        }));
                    } catch (toolError: any) {
                        console.error(`❌ [Node: Flight] Tool execution failed for ${toolCall.name}:`, toolError.message);
                        // Send the error back to the LLM so it knows to try a different airport/tool
                        toolMessages.push(new ToolMessage({
                            tool_call_id: toolCall.id!,
                            content: `Error executing tool: ${toolError.message}. Try an alternative nearby airport IATA code.`
                        }));
                    }
                } else {
                    console.warn(`⚠️ [Node: Flight] Tool ${toolCall.name} not found in flightTools array.`);
                }
            }
            
            // 5. Send the tool results back to the LLM to get a final, clean text summary
            response = await flightLLM.invoke([systemMessage, ...safeMessages, response, ...toolMessages]);
        }

        console.log("✅ [Node: Flight] Flight research complete.");

        return { 
            messages: [response], // Returning a clean text summary to the global state
            currentStage: "planning" 
        };

    } catch (error: any) {
        console.error("❌ [Node: Flight] Critical Error:", error);
        throw error;
    }
};
import { ToolMessage } from "@langchain/core/messages";

export const executeToolLoop = async (
    llm: any,
    systemMessage: any,
    safeMessages: any[],
    initialResponse: any,
    tools: any[],
    nodeName: string
) => {
    let response = initialResponse;

    if (response.tool_calls && response.tool_calls.length > 0) {
        console.log(`🛠️ [Node: ${nodeName}] Executing ${response.tool_calls.length} tools locally...`);
        const toolMessages = [];
        
        for (const toolCall of response.tool_calls) {
            const tool = tools.find((t: any) => t.name === toolCall.name);
            if (tool) {
                try {
                    // tool.invoke can take args or the whole toolCall depending on Langchain version
                    // Safe approach is to pass args if available, or the toolCall itself
                    const result = await tool.invoke(toolCall.args ? toolCall.args : toolCall);
                    toolMessages.push(new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: typeof result === 'string' ? result : JSON.stringify(result)
                    }));
                } catch (toolError: any) {
                    console.error(`❌ [Node: ${nodeName}] Tool execution failed for ${toolCall.name}:`, toolError.message);
                    toolMessages.push(new ToolMessage({
                        tool_call_id: toolCall.id!,
                        content: `Error executing tool: ${toolError.message}.`
                    }));
                }
            } else {
                console.warn(`⚠️ [Node: ${nodeName}] Tool ${toolCall.name} not found.`);
            }
        }
        
        response = await llm.invoke([systemMessage, ...safeMessages, response, ...toolMessages]);
    }

    return response;
};

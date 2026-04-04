import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
// Adjust this import path depending on where activity.tool.ts is located relative to activity.client.ts
import { ActivityMCPClient } from "../../mcp/client/activity.client.js";

// Initialize the client
export const activityClient = new ActivityMCPClient();

/* * IMPORTANT: Because ActivityMCPClient uses a manual connect() method,
 * ensure you call `await activityClient.connect();` somewhere in your 
 * application's startup/initialization flow before passing these tools to the LLM.
 */

export const searchActivitiesTool = new DynamicStructuredTool({
    name: "search_activities",
    description: "Search for tourist activities, attractions, and things to do in a specific city.",
    schema: z.object({
        city: z.string()
            .describe("The name of the city to search for activities (e.g., 'Paris', 'Tokyo', 'New York')")
    }),
    func: async ({ city }) => {
        try {
            // Call the specific helper method defined in your client
            const result = await activityClient.searchActivities(city);
            return JSON.stringify(result);
        } catch (error: any) {
            return `Failed to search activities: ${error.message}`;
        }
    }
});

// Export all tools in an array to easily bind them to your LangChain agent
export const activityTools = [searchActivitiesTool];
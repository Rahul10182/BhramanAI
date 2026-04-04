import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";
import { clear } from "node:console";

// 1. Initialize the search tool once outside the function for better performance
const ddgSearch = new DuckDuckGoSearch({
    maxResults: 3,
});

export const webSearchTool = new DynamicStructuredTool({
    name: "web_search",
    description: "Search the web for general information about a travel destination, local culture, or travel advice.",
    schema: z.object({
        query: z.string().describe("The specific search query")
    }),
    func: async ({ query }) => {
        try {
            console.log(`[Search Tool] Executing DuckDuckGo search for: "${query}"`);
            
            // 2. Execute the search
            const results = await ddgSearch.invoke(query);
            
            // 3. Ensure the result is always a string (prevents agent crashing)
            return typeof results === 'string' ? results : JSON.stringify(results);
            
        } catch (error: any) {
            console.error(`[Search Tool Error]:`, error.message);
            return `Search failed: ${error.message}`;
        }
    }
});

export const searchTools = [webSearchTool];
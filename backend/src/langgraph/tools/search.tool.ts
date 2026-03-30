import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { DuckDuckGoSearch } from "@langchain/community/tools/duckduckgo_search";

export const webSearchTool = new DynamicStructuredTool({
    name: "web_search",
    description: "Search the web for general information about a travel destination, local culture, or travel advice.",
    schema: z.object({
        query: z.string().describe("The specific search query")
    }),
    func: async ({ query }) => {
        try {
            console.log(`[Search Tool] Executing DuckDuckGo search for: ${query}`);
            
            const ddgTool = new DuckDuckGoSearch({
                 maxResults: 3, 
            });
            
            const results = await ddgTool.invoke(query);
            return results;
            
        } catch (error: any) {
             console.error(`[Search Tool Error]:`, error);
            return `Search failed: ${error.message}`;
        }
    }
});

export const searchTools = [webSearchTool];
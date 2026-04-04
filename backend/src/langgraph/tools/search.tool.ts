import { TavilySearch } from "@langchain/tavily";

// 1. Instantiate the pre-built tool directly
export const webSearchTool = new TavilySearch({
    maxResults: 3,
    callbacks: [
        {
            // This will automatically fire right before the tool runs
            handleToolStart: (tool, input) => {
                console.log(`\n🔍 [Search Executing]:`, input);
            },
            // This will catch any API errors
            handleToolError: (err) => {
                console.error(`❌ Search Tool Failed:`, err.message);
            }
        }
    ]
});

webSearchTool.name = "web_search";
webSearchTool.description = "Search the web for up-to-date information, highly-rated places, and historical sites.";

// 3. Export it in the array just like before!
export const searchTools = [webSearchTool];
// src/config/mcp.config.ts
import { serverRegistry } from '../mcp/registry/server.registry.js';
import { ToolRegistry } from '../mcp/registry/tool.registry.js';

export const initializeMCP = async () => {
    try {
        console.log('[MCP Config] Initializing Model Context Protocol ecosystem...');
        
        // 1. Connect to all local/remote MCP servers
        await serverRegistry.initializeAll();
        
        // 2. Verify and cache the available tools
        console.log('[MCP Config] Fetching available tools from all connected servers...');
        const allTools = await ToolRegistry.getAllAvailableTools();
        
        console.log(`[MCP Config] Successfully loaded ${allTools.length} tools across all registries.`);
        
        return allTools;
    } catch (error) {
        console.error('[MCP Config] ❌ Fatal error initializing MCP servers:', error);
        throw error; // Throwing here allows server.ts to catch it and stop the boot process
    }
};
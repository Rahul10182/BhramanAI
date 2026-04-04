import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ActivityMCPClient extends BaseMCPClient {
    constructor() {
        // 1. Resolve the paths for the Activity MCP server
        // Ensure the path points to 'build/server.js' (the compiled output)
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/activity-mcp/dist/server.js');
        const envPath = path.resolve(__dirname, '../../../../mcp-servers/activity-mcp/.env');

        // 2. Call the parent constructor (BaseMCPClient)
        // super(serverName, command, args[])
        super('activity', 'node', [
            `--env-file=${envPath}`, // Injects API keys from the .env file
            serverPath
        ]);
    }

    /**
     * Specialized helper to search for activities in a city.
     * This calls the 'search_activities' tool on the Activity MCP server.
     */
    public async searchActivities(city: string) {
        return this.callTool('search_activities', { 
            city: city 
        });
    }
}
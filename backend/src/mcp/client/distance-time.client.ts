import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class DistanceTimeMCPClient extends BaseMCPClient {
    constructor() {
        // Ensure this path matches the folder name where you created the new server
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/distance-time-mcp/build/server.js');
        super('distance-time', 'node', [serverPath]);
    }

    /**
     * Calls the 'calculate_routing_distance_and_time' tool on the MCP server.
     * Matches the inputSchema defined in routing.tool.ts:
     * - source: string (e.g., 'London, UK')
     * - destination: string (e.g., 'Paris, France')
     */
    public async getRoutingDistanceAndTime(source: string, destination: string) {
        return this.callTool('calculate_routing_distance_and_time', { 
            source: source, 
            destination: destination 
        });
    }

    /**
     * Calls the 'get_time_and_timezone' tool on the MCP server.
     * Matches the inputSchema defined in timezone.tool.ts:
     * - placeName: string (e.g., 'Tokyo', 'New York')
     */
    public async getTimeAndTimezone(placeName: string) {
        return this.callTool('get_time_and_timezone', { 
            placeName: placeName 
        });
    }
}
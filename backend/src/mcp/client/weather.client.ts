import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WeatherMCPClient extends BaseMCPClient {
    constructor() {
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/weather-mcp/build/server.js');
        super('weather', 'node', [serverPath]);
    }

    /**
     * Calls the 'get_weather_forecast' tool on the MCP server.
     * Matches the inputSchema defined in forecast.tool.ts:
     * - location: string
     * - start_date: string (YYYY-MM-DD)
     * - days: number
     */
    public async getForecast(location: string, start_date: string, days: number = 3) {
        return this.callTool('get_weather_forecast', { 
            location: location, 
            start_date: start_date, 
            days: days 
        });
    }
}
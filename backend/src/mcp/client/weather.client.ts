import { BaseMCPClient } from './mcp.client.js';
import path from 'path';

export class WeatherMCPClient extends BaseMCPClient {
    constructor() {
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/weather-mcp/dist/server.js');
        super('weather', 'node', [serverPath]);
    }

    public async getCurrentWeather(location: string) {
        return this.callTool('currentWeather', { location });
    }

    public async getForecast(location: string, days: number) {
        return this.callTool('forecast', { location, days });
    }
}
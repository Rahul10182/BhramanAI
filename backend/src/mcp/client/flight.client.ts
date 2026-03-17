import { BaseMCPClient } from './mcp.client.js';
import path from 'path';

export class FlightMCPClient extends BaseMCPClient {
    constructor() {
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/flights-mcp/dist/server.js');
        super('flights', 'node', [serverPath]);
    }

    public async searchFlights(origin: string, destination: string, date: string) {
        return this.callTool('searchFlights', { origin, destination, date });
    }

    public async getFlightPrices(flightId: string) {
        return this.callTool('flightPrices', { flightId });
    }

    public async checkSeatAvailability(flightId: string) {
        return this.callTool('seatAvailability', { flightId });
    }
}
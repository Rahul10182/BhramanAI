import { BaseMCPClient } from './mcp.client.js';
import path from 'path';

export class HotelMCPClient extends BaseMCPClient {
    constructor() {
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/hotels-mcp/dist/server.js');
        super('hotels', 'node', [serverPath]);
    }

    public async searchHotels(location: string, checkIn: string, checkOut: string, guests: number) {
        return this.callTool('searchHotels', { location, checkIn, checkOut, guests });
    }

    public async getHotelDetails(hotelId: string) {
        return this.callTool('hotelDetails', { hotelId });
    }

    public async checkHotelAvailability(hotelId: string, checkIn: string, checkOut: string) {
        return this.callTool('hotelAvailability', { hotelId, checkIn, checkOut });
    }
}
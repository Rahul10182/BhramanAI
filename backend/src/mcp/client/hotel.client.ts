import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class HotelMCPClient extends BaseMCPClient {
    constructor() {
        // Now __dirname will work perfectly!
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/hotels-mcp/dist/server.js');
        const envPath = path.resolve(__dirname, '../../../../mcp-servers/hotels-mcp/.env');
        super('hotels', 'node', [
            `--env-file=${envPath}`, 
            serverPath
        ]);
    }

    public async searchHotels(location: string, checkIn?: string, checkOut?: string, guests?: number) {
        return this.callTool('search_hotels', { city: location });
    }

    public async getNearbyFood(lat: number, lon: number) {
        return this.callTool('get_nearby_food', { lat, lon });
    }

    public async getHotelDetails(hotelId: string) {
        return this.callTool('get_hotel_details', { hotelId });
    }

    public async checkHotelAvailability(hotelId: string, checkIn: string, checkOut: string) {
        return this.callTool('check_hotel_availability', { hotelId, checkIn, checkOut });
    }
}
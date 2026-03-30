import { BaseMCPClient } from './mcp.client.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class FlightMCPClient extends BaseMCPClient {
    constructor() {
        // Adjust 'flight-mcp' if your server folder is pluralized (e.g., 'flights-mcp')
        const serverPath = path.resolve(__dirname, '../../../../mcp-servers/flights-mcp/build/server.js');
        super('flight', 'node', [serverPath]);
    }

    /**
     * Calls the 'search_flights' tool on the MCP server.
     * IMPORTANT: originIata and destinationIata MUST be 3-letter IATA codes.
     * * @param originIata 3-letter IATA code (e.g., "IXD")
     * @param destinationIata 3-letter IATA code (e.g., "BLR")
     * @param departureDate Date in YYYY-MM-DD format
     */
    public async searchFlights(originIata: string, destinationIata: string, departureDate: string) {
        return this.callTool('search_flights', { 
            origin_iata: originIata, 
            destination_iata: destinationIata, 
            departure_date: departureDate 
        });
    }
}
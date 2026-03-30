import { FlightMCPClient } from '../client/flight.client.js';
import { HotelMCPClient } from '../client/hotel.client.js';
import { WeatherMCPClient } from '../client/weather.client.js';
import { CurrencyMCPClient } from '../client/currency.client.js';
import { ActivityMCPClient } from '../client/activity.client.js'; // <-- Uncommented

class ServerRegistry {
    public flights: FlightMCPClient;
    public hotels: HotelMCPClient;
    public weather: WeatherMCPClient;
    public currency: CurrencyMCPClient;
    public activities: ActivityMCPClient; // <-- Uncommented

    constructor() {
        this.flights = new FlightMCPClient();
        this.hotels = new HotelMCPClient();
        this.weather = new WeatherMCPClient();
        this.currency = new CurrencyMCPClient();
        this.activities = new ActivityMCPClient(); // <-- Uncommented
    }

    public async initializeAll(): Promise<void> {
        console.log('[MCP] Booting up BhramanAI tool servers...');
        
        try {
            await Promise.all([
                this.flights.connect(),
                this.hotels.connect(),
                this.weather.connect(),
                this.currency.connect(),
                this.activities.connect() // <-- Uncommented
            ]);
            console.log('[MCP] All tool servers connected and ready.');
        } catch (error) {
            console.error('[MCP] Critical failure during server initialization.', error);
            process.exit(1); 
        }
    }
}

export const serverRegistry = new ServerRegistry();
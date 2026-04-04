import { FlightMCPClient } from '../client/flight.client.js';
import { HotelMCPClient } from '../client/hotel.client.js';
import { WeatherMCPClient } from '../client/weather.client.js';
import { CurrencyMCPClient } from '../client/currency.client.js';
import { ActivityMCPClient } from '../client/activity.client.js';
// 1. Import the new client
import { DistanceTimeMCPClient } from '../client/distance-time.client.js'; 

class ServerRegistry {
    public flights: FlightMCPClient;
    public hotels: HotelMCPClient;
    public weather: WeatherMCPClient;
    public currency: CurrencyMCPClient;
    public activities: ActivityMCPClient;
    // 2. Declare the new property
    public distanceTime: DistanceTimeMCPClient; 

    constructor() {
        this.flights = new FlightMCPClient();
        this.hotels = new HotelMCPClient();
        this.weather = new WeatherMCPClient();
        this.currency = new CurrencyMCPClient();
        this.activities = new ActivityMCPClient();
        // 3. Instantiate the client
        this.distanceTime = new DistanceTimeMCPClient(); 
    }

    public async initializeAll(): Promise<void> {
        console.log('[MCP] Booting up BhramanAI tool servers...');
        
        try {
            await Promise.all([
                this.flights.connect(),
                this.hotels.connect(),
                this.weather.connect(),
                this.currency.connect(),
                this.activities.connect(),
                // 4. Connect the client during boot up
                this.distanceTime.connect() 
            ]);
            console.log('[MCP] All tool servers connected and ready.');
        } catch (error) {
            console.error('[MCP] Critical failure during server initialization.', error);
            process.exit(1); 
        }
    }
}

export const serverRegistry = new ServerRegistry();
import { Response } from 'express';

class SSEManager {
    private clients: Map<string, Response> = new Map();

    /**
     * Register a new client for SSE
     */
    public addClient(tripId: string, req: any, res: Response) {
        // Setup headers for SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Add to clients map
        this.clients.set(tripId, res);

        // Remove client when connection closes
        req.on('close', () => {
            this.clients.delete(tripId);
        });

        // Send initial connection success message
        this.sendEvent(tripId, 'connected', { message: 'SSE connection established for trip ' + tripId });
    }

    /**
     * Send an event to a specific trip's client
     */
    public sendEvent(tripId: string, event: string, data: any) {
        const client = this.clients.get(tripId);
        if (client) {
            client.write(`event: ${event}\n`);
            client.write(`data: ${JSON.stringify(data)}\n\n`);
            
            // If the trip is complete or failed, we can optionally close the connection
            if (event === 'complete' || event === 'error') {
                client.end();
                this.clients.delete(tripId);
            }
        }
    }
    
    /**
     * Close the connection for a specific trip
     */
    public closeClient(tripId: string) {
        const client = this.clients.get(tripId);
        if (client) {
            client.end();
            this.clients.delete(tripId);
        }
    }
}

export const SseService = new SSEManager();

import { TripRepository } from '../database/repositories/trip.repository.js';
import { travelGraph } from '../langgraph/graph/travel.graph.js';
import { SseService } from './sse.service.js';
import { HumanMessage } from "@langchain/core/messages";

export class TripService {
    /**
     * Executes the LangGraph orchestration in the background.
     */
    public static async generateAITrip(tripId: string, tripDetails: any): Promise<void> {
        console.log(`\n🚀 [TripService] Starting background AI generation for Trip ID: ${tripId}`);

        try {
            // 1. Normalize tripDetails
            const destination = tripDetails.destination || (tripDetails.destinations && tripDetails.destinations[0]) || "Unknown";
            const budget = tripDetails.budget || tripDetails.totalBudget || 0;
            const travelers = tripDetails.travelers || tripDetails.travelerCount || 1;
            const source = tripDetails.source || "DEL";
            const travelStyle = tripDetails.travelStyle || (tripDetails.preferences && tripDetails.preferences[0]) || "standard";
            const baseCurrency = tripDetails.baseCurrency || "INR";

            // 2. Calculate Duration
            const start = new Date(tripDetails.start_date);
            const end = new Date(tripDetails.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // 3. Construct a High-Context Prompt
            const prompt = `
                Plan a ${totalDays}-day ${travelStyle} trip to ${destination} for ${travelers} people.
                Departure: ${source}
                Dates: ${start.toDateString()} to ${end.toDateString()}
                Total Budget: ${budget} ${baseCurrency}
                
                Requirements:
                - Create a logical daily itinerary for exactly ${totalDays} days.
                - Prioritize ${travelStyle} accommodations and activities.
                - Keep the total estimated cost within the budget.
            `.trim();

            // 4. Initialize Graph State
            const initialState = {
                messages: [new HumanMessage(prompt)],
                tripContext: {
                    tripId: tripId,
                    source: source,
                    start_date: start.toISOString(),
                    endDate: end.toISOString(),
                    totalDays: totalDays,
                    destinations: [destination],
                    totalBudget: Number(budget),
                    baseCurrency: baseCurrency,
                    travelerCount: Number(travelers),
                    preferences: [travelStyle, "sightseeing", "food"],
                },
                selectedFlights: [],
                selectedHotels: [],
                selectedActivities: [],
                selectedFood: [],
                estimatedCost: 0,
                currentStage: "planning" as const
            };

            // 4. Execute the Graph with Streaming
            SseService.sendEvent(tripId, 'progress', { step: 'Initialization', status: 'started' });
            
            const stream = await travelGraph.stream(initialState);
            
            for await (const chunk of stream) {
                // Determine which node just finished
                const nodeName = Object.keys(chunk)[0];
                
                let message = `Finished processing ${nodeName}`;
                if (nodeName === 'plannerGraph') message = 'Finished planning flights, hotels, and activities';
                if (nodeName === 'researcherNode') message = 'Finished gathering destination context';
                if (nodeName === 'distanceTimeNode') message = 'Calculated travel logistics';
                if (nodeName === 'itineraryNode') message = 'Generated and saved daily itinerary';
                
                SseService.sendEvent(tripId, 'progress', { step: nodeName, message, status: 'in-progress' });
                console.log(`📡 [TripService SSE] Streamed progress for ${nodeName}`);
            }

            // 5. Success - Finalize Trip Status
            await TripRepository.markAsCompleted(tripId);
            SseService.sendEvent(tripId, 'complete', { message: 'Trip generation successful', tripId });
            console.log(`✅ [TripService] Trip generation successful for ID: ${tripId}`);

        } catch (error: any) {
            console.error(`❌ [TripService] AI Generation failed for Trip ID: ${tripId}`, error);
            // 6. Failure - Update Status so UI stops loading
            await TripRepository.markAsFailed(tripId);
            SseService.sendEvent(tripId, 'error', { message: error.message || 'Generation failed' });
        }
    }
}
import { TripRepository } from '../database/repositories/trip.repository.js';
import { travelGraph } from '../langgraph/graph/travel.graph.js';
import { HumanMessage } from "@langchain/core/messages";

export class TripService {
    /**
     * Executes the LangGraph orchestration in the background.
     */
    public static async generateAITrip(tripId: string, tripDetails: any): Promise<void> {
        console.log(`\n🚀 [TripService] Starting background AI generation for Trip ID: ${tripId}`);

        try {
            // 1. Calculate Duration
            const start = new Date(tripDetails.start_date);
            const end = new Date(tripDetails.endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            // 2. Construct a High-Context Prompt
            const prompt = `
                Plan a ${totalDays}-day ${tripDetails.travelStyle} trip to ${tripDetails.destination} for ${tripDetails.travelers} people.
                Departure: ${tripDetails.source }
                Dates: ${start.toDateString()} to ${end.toDateString()}
                Total Budget: ${tripDetails.budget} ${tripDetails.baseCurrency || "INR"}
                
                Requirements:
                - Create a logical daily itinerary for exactly ${totalDays} days.
                - Prioritize ${tripDetails.travelStyle} accommodations and activities.
                - Keep the total estimated cost within the budget.
            `.trim();

            // 3. Initialize Graph State
            const initialState = {
                messages: [new HumanMessage(prompt)],
                tripContext: {
                    tripId: tripId,
                    source: tripDetails.source || "DEL",
                    start_date: start.toISOString(),
                    endDate: end.toISOString(),
                    totalDays: totalDays,
                    destinations: [tripDetails.destination],
                    totalBudget: Number(tripDetails.budget),
                    baseCurrency: tripDetails.baseCurrency || "INR",
                    travelerCount: Number(tripDetails.travelers),
                    preferences: [tripDetails.travelStyle, "sightseeing", "food"],
                },
                selectedFlights: [],
                selectedHotels: [],
                selectedActivities: [],
                selectedFood: [],
                estimatedCost: 0,
                currentStage: "planning" as const
            };

            // 4. Execute the Graph
            // The graph will call tools that update the DB with specific itinerary items
            await travelGraph.invoke(initialState);

            // 5. Success - Finalize Trip Status
            await TripRepository.markAsCompleted(tripId);
            console.log(`✅ [TripService] Trip generation successful for ID: ${tripId}`);

        } catch (error) {
            console.error(`❌ [TripService] AI Generation failed for Trip ID: ${tripId}`, error);
            // 6. Failure - Update Status so UI stops loading
            await TripRepository.markAsFailed(tripId);
        }
    }
}
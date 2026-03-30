import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

// Define the core trip metadata that agents need to respect
export interface TripContext {
    destinations: string[];
    startDate?: string;
    endDate?: string;
    totalBudget?: number;
    baseCurrency: string; // Used for the currency MCP client
    travelerCount: number;
    preferences: string[]; // e.g., ["luxury", "vegan", "museums"]
}

// The root annotation for the entire travel graph
export const TravelStateAnnotation = Annotation.Root({
    // Standard message history for the LLM
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    
    // Core details about the trip being planned
    tripContext: Annotation<TripContext>({
        reducer: (curr, update) => ({ ...curr, ...update }),
        default: () => ({ 
            destinations: [], 
            baseCurrency: "USD", 
            travelerCount: 1, 
            preferences: [] 
        }),
    }),

    // Data gathered from the Hotel MCP client
    selectedHotels: Annotation<any[]>({
        reducer: (curr, update) => [...curr, ...update], // Append new hotel selections
        default: () => [],
    }),

    // Data gathered from the Attraction/Activity MCP client
    selectedActivities: Annotation<any[]>({
        reducer: (curr, update) => [...curr, ...update], // Append new activities
        default: () => [],
    }),

    // Global tracking of estimated costs to validate against totalBudget
    estimatedCost: Annotation<number>({
        reducer: (curr, update) => update ?? curr, // Overwrite with latest calculation
        default: () => 0,
    }),

    // Tracks the overall progress of the system
    currentStage: Annotation<"planning" | "booking" | "completed">({
        reducer: (curr, update) => update,
        default: () => "planning",
    })
});
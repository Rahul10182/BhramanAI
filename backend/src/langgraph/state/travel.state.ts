import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export interface TripContext {
    destinations: string[];
    startDate?: string;
    endDate?: string;
    totalBudget?: number;
    baseCurrency: string;
    travelerCount: number;
    preferences: string[];
}

export const TravelStateAnnotation = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),
    
    tripContext: Annotation<TripContext>({
        reducer: (curr, update) => ({ ...curr, ...update }),
        default: () => ({ 
            destinations: [], 
            baseCurrency: "USD", 
            travelerCount: 1, 
            preferences: [] 
        }),
    }),

    selectedHotels: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    selectedActivities: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    // --- NEW: Final storage for food recommendations ---
    selectedFood: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    estimatedCost: Annotation<number>({
        reducer: (curr, update) => update ?? curr,
        default: () => 0,
    }),

    currentStage: Annotation<"planning" | "booking" | "completed">({
        reducer: (curr, update) => update,
        default: () => "planning",
    })
});

export type TravelState = typeof TravelStateAnnotation.State;
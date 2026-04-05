import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export interface TripContext {
    tripId: string;         // Required for DB linking
    source: string;        
    start_date: string;     // Required for DB date calculation
    destinations: string[];
    endDate?: string;
    totalDays: number;
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
            tripId: "",    
            source: "",             
            start_date: "",       
            destinations: [], 
            totalDays: 0,
            totalBudget:0,
            baseCurrency: "INR", 
            travelerCount: 1, 
            preferences: []  
        }),
    }),

    // ---  Chat Onboarding Tracking ---
    isComplete: Annotation<boolean>({
        reducer: (curr, update) => update,
        default: () => false,
    }),

    aiResponse: Annotation<string>({
        reducer: (curr, update) => update,
        default: () => "",
    }),

    selectedHotels: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    selectedActivities: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    selectedFood: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),
    
    selectedFlights: Annotation<any[]>({
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
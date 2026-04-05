import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { TripContext } from "./travel.state.js"; // Pulls the updated interface

export const PlannerStateAnnotation = Annotation.Root({
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
            baseCurrency: "USD", 
            travelerCount: 1, 
            preferences: [] 
        }),
    }),

    researchNotes: Annotation<string[]>({
        reducer: (curr, update) => [...curr, ...update],
        default: () => [],
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

    proposedItinerary: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    plannerPhase: Annotation<"destination_discovery" | "attraction_research" | "itinerary_drafting" | "ready_for_review">({
        reducer: (curr, update) => update,
        default: () => "destination_discovery",
    })
});

export type PlannerState = typeof PlannerStateAnnotation.State;
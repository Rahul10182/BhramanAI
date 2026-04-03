import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { TripContext } from "./travel.state.js";

export const PlannerStateAnnotation = Annotation.Root({
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

    researchNotes: Annotation<string[]>({
        reducer: (curr, update) => [...curr, ...update],
        default: () => [],
    }),

    // The temporary bridge to pass data up to TravelState
    selectedHotels: Annotation<any[]>({
        reducer: (curr, update) => update, 
        default: () => [],
    }),

    selectedActivities: Annotation<any[]>({
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
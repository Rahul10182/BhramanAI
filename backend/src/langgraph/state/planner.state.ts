import { Annotation, messagesStateReducer } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";
import { TripContext } from "./travel.state.js";

// The planner state handles the drafting phase before bookings happen
export const PlannerStateAnnotation = Annotation.Root({
    // Needs its own message state or inherits from parent
    messages: Annotation<BaseMessage[]>({
        reducer: messagesStateReducer,
        default: () => [],
    }),

    // Inherited from parent graph to know what we are planning
    tripContext: Annotation<TripContext>({
        reducer: (curr, update) => ({ ...curr, ...update }),
        default: () => ({ 
            destinations: [], 
            baseCurrency: "USD", 
            travelerCount: 1, 
            preferences: [] 
        }),
    }),

    // Temporary storage for data pulled from Search and Attraction MCPs
    researchNotes: Annotation<string[]>({
        reducer: (curr, update) => [...curr, ...update],
        default: () => [],
    }),

    // The drafting of the day-by-day itinerary
    proposedItinerary: Annotation<any[]>({
        reducer: (curr, update) => update, // We overwrite this as the LLM refines the draft
        default: () => [],
    }),

    // To track where the planner agent is in its specific workflow
    plannerPhase: Annotation<"destination_discovery" | "attraction_research" | "itinerary_drafting" | "ready_for_review">({
        reducer: (curr, update) => update,
        default: () => "destination_discovery",
    })
});
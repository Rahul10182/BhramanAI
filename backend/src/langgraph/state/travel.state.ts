import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// This is the "Shared Whiteboard" for all your agents
export const TravelState = Annotation.Root({
  // 1. Conversation History (Appends new messages to the array)
  messages: Annotation<BaseMessage[]>({
    reducer: (currentState, newMessages) => currentState.concat(newMessages),
    default: () => [],
  }),
  
  // 2. Extracted Trip Details (Overwrites old data with new data)
  source_city: Annotation<string>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => "",
  }),
  destination_city: Annotation<string>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => "",
  }),
  travel_date: Annotation<string>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => "",
  }),
  
  // 3. Worker Agent Outputs (Stores the JSON responses from your APIs)
  flight_data: Annotation<any>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => null,
  }),
  hotel_data: Annotation<any>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => null,
  }),
  weather_data: Annotation<any>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => null,
  }),

  // 4. Orchestration / Routing Flag
  // The supervisor will update this to tell the graph where to go next
  next_worker: Annotation<string>({
    reducer: (currentState, newValue) => newValue ?? currentState,
    default: () => "planner",
  })
});

// Export the type so your nodes know what structure to expect
export type TravelStateType = typeof TravelState.State;
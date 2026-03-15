import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { z } from "zod";
import { TravelStateType } from "../state/travel.state.js";
import { HumanMessage } from "@langchain/core/messages";

// 1. Initialize your LLM
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0, 
  apiKey: process.env.GOOGLE_API_KEY || "AIzaSyCvVJA1TppP8g2fIHvh9V1CDAyd7-fep5I", // <-- Added here
});

// 2. Define the exact JSON structure we want the LLM to output
const plannerSchema = z.object({
  source_city: z.string().describe("The 3-letter IATA airport code of the departure city (e.g., IXD for Prayagraj, DEL for Delhi). Leave empty if not mentioned."),
  destination_city: z.string().describe("The 3-letter IATA airport code of the arrival city. Leave empty if not mentioned."),
  travel_date: z.string().describe("The date of travel in YYYY-MM-DD format. Leave empty if not mentioned."),
  next_worker: z.enum(["flights", "weather", "hotels", "itinerary", "ask_user"]).describe("Which node should run next? If data is missing, output 'ask_user'. If all data is gathered, route to the appropriate worker API."),
  message_to_user: z.string().optional().describe("If next_worker is 'ask_user', what question should we ask to get the missing details?")
});

// Bind the schema to the model so it is forced to return this exact object
const plannerAgent = llm.withStructuredOutput(plannerSchema, {
  name: "planner_decision",
});

// 3. The Planner Node Function
export async function plannerNode(state: TravelStateType): Promise<Partial<TravelStateType>> {
  console.log("🧠 [Planner Node] Analyzing state and user input...");

  const messages = state.messages;
  const lastUserMessage = messages.filter(m => m instanceof HumanMessage).pop()?.content || "";

  // 1. Get the real-world current date so "tomorrow" works correctly
  const today = new Date().toISOString().split('T')[0];

  // 2. Check what data we already have so the LLM doesn't repeat itself
  const hasFlights = state.flight_data && state.flight_data !== "null" ? "✅ Already fetched" : "❌ Missing";
  // const hasWeather = state.weather_data ? "✅ Already fetched" : "❌ Missing";
  // const hasHotels = state.hotel_data ? "✅ Already fetched" : "❌ Missing";

  const decision = await plannerAgent.invoke([
    { 
      role: "system", 
      content: `You are a travel supervisor. Today's date is ${today}.
      
      Current Known State:
      - Source: ${state.source_city || "Unknown"}
      - Destination: ${state.destination_city || "Unknown"}
      - Date: ${state.travel_date || "Unknown"}
      
      Data Status:
      - Flights: ${hasFlights}
      
      RULES:
      1. Extract any new info from the user's message and convert cities to IATA codes.
      2. If "Flights" are "✅ Already fetched", DO NOT output 'flights' as the next_worker.
      3. If all requested data is fetched, output 'itinerary' to finish the task.
      4. If data is missing (like missing date or cities), output 'ask_user'.` 
    },
    { role: "user", content: lastUserMessage.toString() }
  ]);

  console.log(`🧭 Routing decision: Next step is -> ${decision.next_worker}`);

  return {
    source_city: decision.source_city || state.source_city,
    destination_city: decision.destination_city || state.destination_city,
    travel_date: decision.travel_date || state.travel_date,
    next_worker: decision.next_worker,
  };
}
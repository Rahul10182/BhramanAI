import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";

const ExtractionSchema = z.object({
  extractedData: z.object({
    source: z.string().nullable().describe("Origin city. Return null if unknown."),
    destination: z.string().nullable().describe("Destination city. Return null if unknown."),
    start_date: z.string().nullable().describe("Start date (YYYY-MM-DD). Return null if unknown."),
    endDate: z.string().nullable().describe("End date (YYYY-MM-DD). Return null if unknown."),
    travelerCount: z.number().nullable().describe("Number of travelers. Return null if unknown."),
    totalBudget: z.number().nullable().describe("Total budget. Return null if unknown."),
    travelStyle: z.string().nullable().describe("Travel style preference. Return null if unknown."),
  }),
  isComplete: z.boolean().describe("True ONLY IF source, destination, start_date, travelers, and totalBudget are all populated (not null)."),
  nextQuestion: z.string().describe("If isComplete is false, ask a friendly question to get the missing fields. If true, say 'Perfect! I am generating your itinerary now.'")
});

export const personalizationAgent = new ChatOpenAI({
  modelName: "gpt-4o-mini", // Fast and cheap for real-time chat
  temperature: 0.3,
}).withStructuredOutput(ExtractionSchema);
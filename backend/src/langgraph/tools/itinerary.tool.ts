import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { ItineraryService } from "../../services/itinerary.service.js";

export const saveItineraryTool = new DynamicStructuredTool({
  name: "save_final_itinerary",
  description:
    "Output the finalized, structured travel itinerary to the console and save it to the database.",
  schema: z.object({
    tripId: z
      .string()
      .describe("The exact tripId provided in the trip context"),
    startDate: z
      .string()
      .describe(
        "The start date of the trip provided in the context (YYYY-MM-DD)",
      ),
    title: z.string().describe("A catchy title for the trip"),
    totalEstimatedCost: z.number(),
    days: z.array(
      z.object({
        dayNumber: z.number().describe("Day 1, Day 2, etc."),
        activities: z.array(
          z.object({
            time: z
              .string()
              .describe("Exact estimated time (e.g., '09:00 AM', '02:30 PM')"),
            category: z
              .enum([
                "flight",
                "hotel",
                "food",
                "attraction",
                "transport",
                "leisure",
                "shopping", 
                "other", 
              ])
              .describe("The type of activity"),
            title: z.string().describe("Name of the place or activity"),
            description: z
              .string()
              .describe("Engaging description, including vibe or tips"),
            location: z.string().optional(),
          }),
        ),
      }),
    ),
  }),
  func: async (args) => {
    // 1. PRINT TO CONSOLE (Kept exactly as you requested)
    console.log(`\n==================================================`);
    console.log(`✨  [STRUCTURED ITINERARY GENERATED]  ✨`);
    console.log(`==================================================\n`);
    console.log(JSON.stringify(args, null, 2));
    console.log(`\n==================================================\n`);

    try {
      // 2. STORE IN DATABASE USING SERVICE
      await ItineraryService.saveGeneratedItinerary(
        args.tripId,
        args.startDate,
        args.days,
      );

      return JSON.stringify({
        success: true,
        message:
          "Structured Itinerary printed to console and saved to database.",
        status: "complete",
      });
    } catch (error: any) {
      // If the DB isn't connected during testing, we catch the error so LangGraph doesn't crash
      console.error(`❌ [Database Save Error]:`, error.message);
      return `Console output succeeded, but failed to save to DB: ${error.message}`;
    }
  },
});

export const itineraryTools = [saveItineraryTool];

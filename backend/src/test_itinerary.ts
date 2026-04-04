import "dotenv/config";
import mongoose from "mongoose";
import { StateGraph, START, END } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";

// LangGraph Imports
import { TravelStateAnnotation } from "./langgraph/state/travel.state.js";
import { itineraryNode } from "./langgraph/nodes/itinerary.node.js";
import { itineraryTools } from "./langgraph/tools/itinerary.tool.js";

// Database Models
import { UserModel } from "./database/models/user.model.js";
import { TripModel } from "./database/models/trip.model.js";
import { ItineraryModel } from "./database/models/itinerary.model.js";

async function testDatabaseStorage() {
    console.log("🚀 Booting up Itinerary + Database Test Engine...\n");

    // 1. CONNECT TO DATABASE
    const mongoUri = process.env.MONGODB_URI || " ";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB.");

    try {
        // 2. CREATE FAKE USER & TRIP FOR FOREIGN KEYS
        console.log("👤 Creating mock User and Trip in database...");
        
        const testUser = await UserModel.create({
            name: "Test Traveler 2",
            email: `test_${Date.now()}@example.com`,
            passwordHash: "hashed_password_mock"
        });

        const testTrip = await TripModel.create({
            userId: testUser._id,
            destination: "Paris, France",
            start_date: new Date("2026-10-10"),
            endDate: new Date("2026-10-15"),
            budget: 3500,
            travelers: 2,
            travelStyle: "moderate",
            status: "planning"
        });

        console.log(`🎫 Mock Trip Created! ID: ${testTrip._id}`);

        // 3. BUILD THE LANGGRAPH WORKFLOW
        const workflow = new StateGraph(TravelStateAnnotation)
            .addNode("itinerary", itineraryNode)
            .addNode("tools", new ToolNode(itineraryTools))
            .addEdge(START, "itinerary")
            .addEdge("itinerary", "tools")
            .addEdge("tools", END);

        const testApp = workflow.compile();

        // 4. INJECT THE REAL DATABASE IDs INTO THE MOCK STATE
        const mockState = {
            messages: [],
            tripContext: {
                tripId: testTrip._id.toString(), // Injecting the real DB ID!
                start_date: "2026-10-10",
                destinations: ["Paris, France"],
                baseCurrency: "USD",
                travelerCount: 2,
                preferences: ["history", "romantic", "foodie"],
            },
            selectedFlights: [
                { airline: "Air France", departure: "JFK at 8:00 PM (Oct 10)", arrival: "CDG at 9:00 AM (Oct 11)", cost: 1200 }
            ],
            selectedHotels: [
                { name: "The Hoxton, Paris", checkIn: "Oct 11", checkOut: "Oct 15", totalCost: 1100 }
            ],
            selectedActivities: [
                { name: "Musée du Louvre", time: "Morning", cost: 40 },
                { name: "Seine River Dinner Cruise", time: "Evening", cost: 150 }
            ],
            selectedFood: [
                { name: "Buvette Paris", cuisine: "French Bistro" }
            ],
            estimatedCost: 2490,
            currentStage: "planning" as const
        };

        // 5. RUN THE GRAPH
        console.log("\n🧠 Sending data to the Itinerary Agent...\n");
        await testApp.invoke(mockState);

        // 6. VERIFY THE DATABASE
        console.log("\n🔍 Verifying Database Storage...");
        
        // Fetch the newly updated trip
        const updatedTrip = await TripModel.findById(testTrip._id);
        console.log(`Trip Status is now: ${updatedTrip?.status} (Expected: completed)`);

        // Fetch the generated itinerary days
        const savedDays = await ItineraryModel.find({ tripId: testTrip._id }).sort({ dayNumber: 1 });
        
        console.log(`\n✅ Found ${savedDays.length} itinerary days saved in the database!`);
        
        // Print the first day to prove the dates and activities mapped correctly
        if (savedDays.length > 0) {
            console.log("\nSample of Day 1 from Database:");
            console.log({
                dayNumber: savedDays[0]?.dayNumber,
                calendarDate: savedDays[0]?.date?.toDateString(),
                activityCount: savedDays[0]?.activities?.length,
                // ADDED THE OPTIONAL CHAINING HERE (?)
                firstActivity: savedDays[0]?.activities?.[0]?.title || "No activities scheduled for today"
            });
        }

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    } finally {
        // 7. CLEANUP
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB.");
    }
}

testDatabaseStorage();
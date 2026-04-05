import "dotenv/config";
import mongoose from "mongoose";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

// Import your compiled Master Graph
import { travelGraph } from "./langgraph/graph/travel.graph.js";

// Database Models
import { UserModel } from "./database/models/user.model.js";
import { TripModel } from "./database/models/trip.model.js";
import { ItineraryModel } from "./database/models/itinerary.model.js";
import { initializeMCP } from "./config/mcp.config.js";

async function testMasterOrchestrator() {
    console.log("🚀 Booting up the BhramanAI Master Orchestrator...\n");
    
    await initializeMCP();

    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/bhraman_test";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB.");

    try {
        // 1. SETUP MOCK DB RELATIONS
        console.log("👤 Creating mock User and Trip...");
        const testUser = await UserModel.create({
            name: "Master Tester",
            email: `master_${Date.now()}@example.com`,
            passwordHash: "mock_hash"
        });

        const testTrip = await TripModel.create({
            userId: testUser._id,
            destination: "Goa",
            start_date: new Date("2026-11-01"),
            endDate: new Date("2026-11-05"),
            budget: 25000,
            travelers: 2,
            travelStyle: "luxury",
            status: "planning"
        });

        console.log(`🎫 Trip ID: ${testTrip._id}\n`);

        // 2. INITIALIZE THE STARTING STATE
        const initialState = {
            messages: [
                new HumanMessage("Plan a luxurious 5-day trip to Goa for 2 people. We love adventure, fun, club parties, and beaches. Our budget is Rs. 25000.")
            ],
            tripContext: {
                tripId: testTrip._id.toString(),
                start_date: "2026-11-01",
                source: "DEL",
                destinations: ["Goa"], 
                baseCurrency: "INR",
                travelerCount: 2,
                preferences: ["luxury", "beaches", "fun", "clubs","parties", "adventure"],
            },
            selectedFlights: [],
            selectedHotels: [],
            selectedActivities: [],
            selectedFood: [],
            estimatedCost: 0,
            currentStage: "planning" as const
        };

        // 3. RUN THE MASTER GRAPH WITH STATE LOGGING
        console.log("🧠 Executing Master Travel Graph...\n");
        
        // We use 'values' streamMode to see the full state at each step
        const stream = await travelGraph.stream(initialState, { streamMode: "updates" });

        for await (const chunk of stream) {
            const nodeName = Object.keys(chunk)[0];
            const nodeOutput = chunk[nodeName];

            console.log(`\n--------------------------------------------------`);
            console.log(`✅ [NODE COMPLETED]: ${nodeName}`);
            console.log(`--------------------------------------------------`);

            // Log State Changes
            if (nodeOutput.selectedFlights?.length) console.log(`✈️ Flights: ${nodeOutput.selectedFlights.length} found`);
            if (nodeOutput.selectedHotels?.length) console.log(`🏨 Hotels: ${nodeOutput.selectedHotels.length} found`);
            if (nodeOutput.selectedActivities?.length) console.log(`🎢 Activities: ${nodeOutput.selectedActivities.length} found`);
            if (nodeOutput.selectedFood?.length) console.log(`🍱 Food Options: ${nodeOutput.selectedFood.length} found`);
            if (nodeOutput.estimatedCost) console.log(`💰 Running Total: Rs. ${nodeOutput.estimatedCost}`);
            
            // Print the last AI message if this node produced one (useful for debugging logic)
            if (nodeOutput.messages) {
                const lastMsg = nodeOutput.messages[nodeOutput.messages.length - 1];
                if (lastMsg instanceof AIMessage && lastMsg.content) {
                    console.log(`🤖 Agent Thought: "${lastMsg.content.toString().substring(0, 100)}..."`);
                }
            }
        }
        
        console.log(`\n==================================================`);

        // 4. VERIFY FINAL DATABASE STORAGE
        console.log("\n🔍 FINAL DATABASE VERIFICATION");
        const savedDays = await ItineraryModel.find({ tripId: testTrip._id }).sort({ dayNumber: 1 });

        if (savedDays.length > 0) {
            console.log(`✨ SUCCESS! Found ${savedDays.length} days in MongoDB.\n`);
            
            savedDays.forEach(day => {
                console.log(`📅 Day ${day.dayNumber} - ${day.date.toDateString()}`);
                day.activities.forEach((act: any) => {
                    console.log(`   - [${act.time}] ${act.title} (${act.location})`);
                });
            });
        } else {
            console.log("❌ ERROR: No itinerary records found in database.");
        }

        console.log("\n🎉 Master Graph Execution Complete!");

    } catch (error) {
        console.error("\n❌ Master Test Failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB.");
    }
}

testMasterOrchestrator();
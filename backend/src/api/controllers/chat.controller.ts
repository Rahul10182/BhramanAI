import { Request, Response } from 'express';
import { HumanMessage, AIMessage } from "@langchain/core/messages";
import { chatGraph } from '../../langgraph/graph/chat.graph.js';
import { TripModel } from '../../database/models/trip.model.js';
import { TripService } from '../../services/trip.service.js';

export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { chatId } = req.params;
    const { userId, messages } = req.body; 

    // 1. Format messages for LangChain
    const formattedMessages = messages.map((msg: any) => 
        msg.role === 'user' ? new HumanMessage(msg.content) : new AIMessage(msg.content)
    );

    // 2. Run the Chat Graph
    const chatState = await chatGraph.invoke({
        messages: formattedMessages
    });

    // 3. If missing information, return the AI's question to the frontend
    if (!chatState.isComplete) {
        res.status(200).json({
            status: "chatting",
            reply: chatState.aiResponse,
            extractedData: chatState.tripContext 
        });
        return;
    }

    // 4. If complete, save to Database and trigger the Master Graph!
    const tripData = chatState.tripContext;
    
    // FIX: Safely extract the first destination string from the array for Mongoose
    const finalDestination = (tripData.destinations && tripData.destinations.length > 0) 
        ? tripData.destinations[0] 
        : "Unknown";

    // We use fallback dates/styles just in case the AI misses something
    const trip = new TripModel({
      userId, 
      chatId,
      source: tripData.source || "Unknown",
      destination: finalDestination, // Pass the safe string to Mongoose
      start_date: new Date(tripData.start_date || Date.now()),
      endDate: tripData.endDate ? new Date(tripData.endDate) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      budget: tripData.totalBudget || 0, // Fallback handling
      travelers: tripData.travelerCount || 1, // Fallback handling
      travelStyle: (tripData.preferences && tripData.preferences[0]) || "standard",
      status: 'planning'
    });

    await trip.save();

    // Fire & Forget the heavy background Orchestrator!
    // Since we used the unified state, tripData is already perfectly formatted for the service.
    TripService.generateAITrip(trip._id.toString(), tripData);

    // 5. Tell the frontend to switch from "Chat Mode" to "Loading Mode"
    res.status(202).json({
        status: "planning_initiated",
        tripId: trip._id,
        reply: chatState.aiResponse 
    });

  } catch (error) {
    console.error("Chat Controller Error:", error);
    res.status(500).json({ error: "Failed to process chat message" });
  }
};
// src/database/models/itinerary.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IItinerary extends Document {
  tripId: mongoose.Types.ObjectId;
  dayNumber: number;
  date: Date;
  activities: {
    time: string;
    title: string;
    description: string;
    location: string;
    aiGenerated: boolean;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema: Schema = new Schema(
  {
    tripId: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    dayNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    activities: [
      {
        time: { type: String, required: true }, // e.g., "10:00 AM"
        title: { type: String, required: true }, // e.g., "Louvre Museum Tour"
        description: { type: String }, // AI's detailed explanation of why to go here
        location: { type: String },
        aiGenerated: { type: Boolean, default: true } // Useful to track if the user manually edited an AI suggestion
      }
    ]
  },
  { 
    timestamps: true 
  }
);

export const ItineraryModel = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
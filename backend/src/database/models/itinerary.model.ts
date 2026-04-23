// src/database/models/itinerary.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity {
  time: string;
  title: string;
  description: string;
  location: string;
  category: string;
  estimatedCost: number;
  aiGenerated: boolean;
}

export interface IWeather {
  condition: string;
  tempHigh: number;
  tempLow: number;
  icon: string;
}

export interface IItinerary extends Document {
  tripId: mongoose.Types.ObjectId;
  dayNumber: number;
  date: Date;
  activities: IActivity[];
  weather?: IWeather;
  dailyBudget: number;
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
        time: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        location: { type: String },
        category: { type: String, default: 'other' },
        estimatedCost: { type: Number, default: 0 },
        aiGenerated: { type: Boolean, default: true }
      }
    ],
    weather: {
      type: {
        condition: { type: String },
        tempHigh: { type: Number },
        tempLow: { type: Number },
        icon: { type: String }
      },
      required: false
    },
    dailyBudget: { type: Number, default: 0 }
  },
  { 
    timestamps: true 
  }
);

export const ItineraryModel = mongoose.model<IItinerary>('Itinerary', ItinerarySchema);
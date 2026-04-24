// src/database/models/trip.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  chatId?: string;
  source?: string;
  destination: string;
  start_date: Date;
  endDate: Date;
  budget: number;
  travelers: number;
  travelStyle: string; 
  status: 'planning' | 'booked' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const TripSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    chatId: { type: String, required: false },
    source: { type: String, default: '' },
    destination: { type: String, required: true },
    start_date: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number, required: true },
    travelers: { type: Number, required: true, default: 1 },
    travelStyle: { type: String, default: 'balanced' }, 
    status: { 
      type: String, 
      enum: ['planning', 'booked', 'completed', 'failed'], 
      default: 'planning' 
    },
  },
  { 
    timestamps: true 
  }
);

export const TripModel = mongoose.model<ITrip>('Trip', TripSchema);
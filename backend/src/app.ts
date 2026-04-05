// src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";

// Import Routes
import authRoutes from './api/routes/auth.routes.js';
import tripRoutes from './api/routes/trip.routes.js';
import itineraryRoutes from './api/routes/itinerary.routes.js';
import userRoutes from './api/routes/user.routes.js';
import chatRoutes from './api/routes/chat.routes.js'

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json()); // Parses incoming JSON payloads

// Mount Routes
// Using /api/v1 prefix establishes a standard versioning pattern for your API
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trips', tripRoutes);
app.use('/api/v1/itineraries', itineraryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chat', chatRoutes);

// Root / Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
      status: "success",
      message: "BhramanAI Backend Running 🚀",
      version: "1.0.0"
  });
});

// Optional: Catch-all for undefined routes (404)
app.use((req: Request, res: Response) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

export default app;
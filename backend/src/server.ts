// src/server.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js"

// Load environment variables from the .env file
dotenv.config();

const PORT = process.env.PORT || 3000;
// Fetch the URI exactly as you named it in your .env
const MONGODB_URI = process.env.MONGODB_URI; 

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env file");
  process.exit(1);
}

// 1. Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully to Atlas Cluster");
    
    // 2. Start the Express server ONLY after DB connects
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  });
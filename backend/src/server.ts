// src/server.ts
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { initializeMCP } from "./config/mcp.config.js"; 

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI; 

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env file");
  process.exit(1);
}

const bootServer = async () => {
    try {
        // 1. Initialize MCP Servers FIRST
        await initializeMCP();

        // 2. Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully to Atlas Cluster");
        
        // 3. Start the Express server ONLY after MCP and DB are ready
        app.listen(PORT, () => {
          console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("❌ Fatal Boot Error:", error);
        process.exit(1);
    }
};

// Start the boot sequence
bootServer();
import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
// import { initializeMCP } from "./config/mcp.config.js"; // Comment if not needed

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bhramanai';

const bootServer = async () => {
    try {
        // 1. Initialize MCP Servers FIRST (if you have MCP)
        await initializeMCP();

        // 2. Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log("✅ MongoDB connected successfully");
        
        // 3. Start the Express server
        app.listen(PORT, () => {
          console.log(`\n🌍 Server is running at http://localhost:${PORT}`);
          console.log(`📌 Base API URL: http://localhost:${PORT}/api/v1\n`);
          console.log(`📝 Google OAuth enabled`);
          console.log(`🔗 Login with Google: http://localhost:${PORT}/api/auth/google`);
          console.log(`✅ Ready to accept requests\n`);
        });

    } catch (error) {
        console.error(" Fatal Boot Error:", error);
        process.exit(1);
    }
};

// Start the boot sequence
bootServer();
// src/app.ts
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from './api/routes/auth.routes.js';

const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);


app.get("/", (req: Request, res: Response) => {
  res.send("BhramanAI Backend Running 🚀");
});

export default app;
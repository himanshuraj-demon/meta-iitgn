import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import routes from "./index.js";
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL || ""].filter(
      Boolean,
    ),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use("/api", routes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Express Wiki API" });
});

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled Error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  },
);

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});



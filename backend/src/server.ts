import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env variables before any other imports to ensure Cloudinary config resolves correctly
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./index.js";
import cookieParser from 'cookie-parser';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3001;

// Resolve directory paths

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Dynamically allow any requesting origin to resolve all CORS issues
      callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));
app.use("/api", routes);
app.use("/", routes);

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

import { startMediaCleanupCron } from "./utils/cleanup.js";

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
  startMediaCleanupCron();
});



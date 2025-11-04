import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUI from "swagger-ui-express";

import connectDB from "./config/db";
import { openApiDocument } from "./docs/swagger";
import auth from "./routes/auth";
import path from "node:path";

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cookie parser
app.use(cookieParser());
// Cors
app.use(cors());
// Helmet
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 1000 * 60 * 10, //10 mins
  max: 100,
});
app.use(limiter);

// OpenAPI JSON
app.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(openApiDocument);
});

// Swagger UI
app.use("/swagger", swaggerUI.serve);
app.get("/swagger", swaggerUI.setup(openApiDocument));

// Scalar UI
app.get("/scalar", (req, res) => {
  res.setHeader(
    "Content-Security-Policy",
    "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline';"
  );
  res.sendFile(path.join(__dirname, "routes", "scalar.html"));
});

app.use("/api/v1/auth", auth);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(
    "Server running in ",
    process.env.NODE_ENV,
    " mode on port ",
    PORT
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

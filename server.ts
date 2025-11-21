import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import connectDB from "./config/db";
import auth from "./routes/auth";
import hotels from "./routes/hotels";
import bookings from "./routes/bookings";
import docs from "./routes/docs";

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

app.use("", docs);
app.use("/api/v1/auth", auth);
app.use("/api/v1/hotels", hotels);
app.use("/api/v1/bookings", bookings);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(
    `📚 Access Scalar UI at \x1b[1mhttp://localhost:${PORT}/scalar\x1b[0m`
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

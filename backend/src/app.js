require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const connectDB = require("./config/db");
const { apiLimiter } = require("./middleware/rateLimiter");
const errorHandler = require("./middleware/errorHandler");

const authRouter = require("./routes/auth");
const hackathonsRouter = require("./routes/hackathons");
const adminRouter = require("./routes/admin");
const participantsRouter = require("./routes/participants");
const reviewsRouter = require("./routes/reviews");

const startCronJob = require("./jobs/hackathonStatusCron");

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Database Connection and Background Systems
connectDB();
startCronJob();

// Core Middleware Configuration
app.use(helmet()); 
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // Required for secure cookie context transmission (CSRF & Refresh Tokens)
}));
app.use(express.json());
app.use(cookieParser());

// Dynamic CSRF Protection Setup
const csrfProtection = csrf({ cookie: true });

// Environment Check: Provide a selective bypass middleware shell for development convenience
const conditionalCsrf = (req, res, next) => {
  if (process.env.NODE_ENV === "development") {
    return next(); // Skip CSRF assertion passes during fast local debugging cycles
  }
  return csrfProtection(req, res, next);
};

// Endpoint to issue the CSRF token for production frontend architectures
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api", apiLimiter); // Apply API resource throttling protections globally

// Base Health Probe Route Context
app.get("/health", (req, res) => res.json({ status: "ok", service: "fairjudge-backend" }));

// Route Mount Matrix with dynamic development-safe environment filtering parameters
app.use("/api/auth", conditionalCsrf, authRouter);
app.use("/api/hackathons", conditionalCsrf, hackathonsRouter);
app.use("/api/admin", conditionalCsrf, adminRouter);
app.use("/api/participants", conditionalCsrf, participantsRouter);
app.use("/api/reviews", conditionalCsrf, reviewsRouter);
app.use("/api/teams", conditionalCsrf, require("./routes/userTeams"));
app.use("/api/projects", conditionalCsrf, require("./routes/projects"));
app.use("/api/evaluations", conditionalCsrf, require("./routes/evaluations"));
app.use("/api/certificates", conditionalCsrf, require("./routes/certificates"));

// Global Error Catchment Interceptor Layer
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FAIRJUDGE backend completely online and listening on port ${PORT}`);
});
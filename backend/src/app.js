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

connectDB();
startCronJob();

// Core Middleware
app.use(helmet()); // Sets CSP and other security headers
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true, // Required for cookies (CSRF & Refresh Tokens)
}));
app.use(express.json());
app.use(cookieParser());

// CSRF Protection (Double-submit cookie)
const csrfProtection = csrf({ cookie: true });
// Endpoint to issue the CSRF token for the frontend to read and send back
app.get("/api/csrf-token", csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.use("/api", apiLimiter); // Apply general rate limit to all /api routes

// Routes
app.get("/health", (req, res) => res.json({ status: "ok", service: "fairjudge-backend" }));

app.use("/api/auth", csrfProtection, authRouter);
app.use("/api/hackathons", csrfProtection, hackathonsRouter);
app.use("/api/admin", csrfProtection, adminRouter);
app.use("/api/participants", csrfProtection, participantsRouter);
app.use("/api/reviews", csrfProtection, reviewsRouter);
app.use("/api/teams", csrfProtection, require("./routes/userTeams"));
app.use("/api/projects", csrfProtection, require("./routes/projects"));
app.use("/api/evaluations", csrfProtection, require("./routes/evaluations"));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FAIRJUDGE backend running on port ${PORT}`);
});

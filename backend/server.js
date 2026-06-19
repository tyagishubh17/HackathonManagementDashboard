require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const participantsRouter = require("./routes/participants");
const reviewsRouter = require("./routes/reviews");
const errorHandler = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", service: "fairjudge-backend" }));

app.use("/api/participants", participantsRouter);
app.use("/api/reviews", reviewsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`FAIRJUDGE backend running on port ${PORT}`);
});

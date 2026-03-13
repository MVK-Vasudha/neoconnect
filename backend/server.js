require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const pollRoutes = require("./routes/pollRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const minutesRoutes = require("./routes/minutesRoutes");
const { startEscalationJob } = require("./utils/escalationJob");

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "NeoConnect API running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/polls", pollRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/minutes", minutesRoutes);

app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: "Server error." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startEscalationJob();
});

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const emergencyRoutes = require("./routes/emergencyRoutes");
const volunteerRoutes = require("./routes/volunteerRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

const PORT = 4000;

/* =========================================================
   DATABASE
========================================================= */

connectDB();

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(
  cors({
    origin: "http://localhost:3000"
  })
);

app.use(express.json());

/* =========================================================
   ROUTES
========================================================= */

app.use("/api/auth", authRoutes);
app.use("/api/emergencies", emergencyRoutes);
app.use("/api/volunteers", volunteerRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

/* =========================================================
   TEST ROUTES
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Emergency Volunteer Network API is running",
    server: "Node.js + Express.js",
    port: PORT
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "EVN server is healthy",
    database: "MongoDB"
  });
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

/* =========================================================
   ERROR HANDLER
========================================================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: "Internal server error"
  });
});

/* =========================================================
   START SERVER
========================================================= */

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});
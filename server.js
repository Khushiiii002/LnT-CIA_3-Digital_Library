const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const User = require("./models/User");
const seedData = require("./seed");

// Connect to MongoDB and auto-seed if database is empty
connectDB().then(async (connected) => {
  if (connected) {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log("Database is empty. Automatically seeding initial users and catalog...");
        await seedData(false);
      }
    } catch (err) {
      console.error("Auto-seed check error:", err.message);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/books", require("./routes/books"));
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/holds", require("./routes/holds"));
app.use("/api/fines", require("./routes/fines"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/memberships", require("./routes/memberships"));
app.use("/api/admin/reports", require("./routes/reports"));

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Digital Library Management System is running",
  });
});

const path = require("path");

// Serve static assets built from frontend
app.use(express.static(path.join(__dirname, "public")));

// SPA Fallback for client routes
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) return next();
  const indexPath = path.join(__dirname, "public", "index.html");
  if (require("fs").existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  next();
});

// 404 handler for API routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    errorCode: "NOT_FOUND",
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

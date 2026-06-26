const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env file
dotenv.config();

const app = express();

// ── Middleware ────────────────────────────────────────────────
app.use(cors());                  // Allow cross-origin requests from React frontend
app.use(express.json());          // Parse incoming JSON request bodies

// ── Database Connection ───────────────────────────────────────
connectDB();

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth",      require("./routes/auth"));
app.use("/api/products",  require("./routes/products"));
app.use("/api/customers", require("./routes/customers"));
app.use("/api/sales",     require("./routes/sales"));
app.use("/api/analytics", require("./routes/analytics"));

// ── Health Check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "Inventory & Sales API is running" });
});

// ── Global Error Handler ──────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

// ── Start Server ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

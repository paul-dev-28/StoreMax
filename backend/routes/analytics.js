const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getDashboardStats } = require("../controllers/analyticsController");

// GET /api/analytics/dashboard  →  returns all 5 dashboard stats
router.get("/dashboard", protect, getDashboardStats);

module.exports = router;

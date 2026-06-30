const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { getDashboardStats, getChartData } = require("../controllers/analyticsController");

// GET /api/analytics/dashboard  →  returns all 5 dashboard stats
router.get("/dashboard", protect, getDashboardStats);

// GET /api/analytics/charts     →  returns full chart/insights dataset
router.get("/charts", protect, getChartData);

module.exports = router;

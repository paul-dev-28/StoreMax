const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { createSale, getSales } = require("../controllers/saleController");

// All routes below require a valid JWT token
router.get("/",  protect, getSales);    // GET  /api/sales
router.post("/", protect, createSale);  // POST /api/sales

module.exports = router;

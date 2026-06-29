const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const { createSale, getSales, getSaleById } = require("../controllers/saleController");

// All routes below require a valid JWT token
router.get("/",    protect, getSales);      // GET  /api/sales
router.get("/:id", protect, getSaleById);   // GET  /api/sales/:id
router.post("/",   protect, createSale);    // POST /api/sales

module.exports = router;

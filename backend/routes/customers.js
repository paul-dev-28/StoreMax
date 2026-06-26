const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

// All routes below require a valid JWT token
router.get("/",       protect, getCustomers);     // GET    /api/customers
router.post("/",      protect, createCustomer);   // POST   /api/customers
router.put("/:id",    protect, updateCustomer);   // PUT    /api/customers/:id
router.delete("/:id", protect, deleteCustomer);   // DELETE /api/customers/:id

module.exports = router;

const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// All routes below require a valid JWT token
router.get("/",        protect, getProducts);     // GET    /api/products
router.post("/",       protect, createProduct);   // POST   /api/products
router.put("/:id",     protect, updateProduct);   // PUT    /api/products/:id
router.delete("/:id",  protect, deleteProduct);   // DELETE /api/products/:id

module.exports = router;

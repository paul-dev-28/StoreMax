const Product = require("../models/Product");

// ── GET all products ──────────────────────────────────────────
// GET /api/products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── CREATE a product ──────────────────────────────────────────
// POST /api/products
const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      purchasePrice,
      sellingPrice,
      quantity,
    } = req.body;

    if (
      !name ||
      !category ||
      purchasePrice == null ||
      sellingPrice == null
    ) {
      return res.status(400).json({
        message:
          "Name, category, purchase price, and selling price are required",
      });
    }

    const product = await Product.create({
      name,
      category,
      purchasePrice,
      sellingPrice,
      quantity: quantity ?? 0,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UPDATE a product ──────────────────────────────────────────
// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      purchasePrice,
      sellingPrice,
      quantity,
    } = req.body;

    const product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      {
        name,
        category,
        purchasePrice,
        sellingPrice,
        quantity,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── DELETE a product ──────────────────────────────────────────
// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
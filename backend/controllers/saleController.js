const Sale = require("../models/Sale");
const Product = require("../models/Product");
const Customer = require("../models/Customer");

// ── CREATE a sale ─────────────────────────────────────────────
// POST /api/sales
const createSale = async (req, res) => {
  try {
    const { customer, products } = req.body;

    if (!customer || !products || products.length === 0) {
      return res.status(400).json({
        message: "Customer and at least one product are required",
      });
    }

    // Customer must belong to current user
    const customerExists = await Customer.findOne({
      _id: customer,
      owner: req.user.id,
    });

    if (!customerExists) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    const productDocs = [];

    // Validate every product belongs to current user
    for (const item of products) {
      const productDoc = await Product.findOne({
        _id: item.product,
        owner: req.user.id,
      });

      if (!productDoc) {
        return res.status(404).json({
          message: `Product not found`,
        });
      }

      if (productDoc.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${productDoc.name}". Available: ${productDoc.quantity}, Requested: ${item.quantity}`,
        });
      }

      productDocs.push({
        doc: productDoc,
        quantitySold: item.quantity,
      });
    }

    let totalAmount = 0;

    // Deduct stock and calculate total
    for (const { doc, quantitySold } of productDocs) {
      totalAmount += doc.sellingPrice * quantitySold;

      doc.quantity -= quantitySold;
      await doc.save();
    }

    // Create sale
    const sale = await Sale.create({
      customer,
      products,
      totalAmount,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Sale created successfully",
      sale,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET all sales ─────────────────────────────────────────────
// GET /api/sales
const getSales = async (req, res) => {
  try {
    const sales = await Sale.find({
      owner: req.user.id,
    })
      .sort({ createdAt: -1 })
      .populate("customer", "name")
      .populate("products.product", "name sellingPrice");

    res.status(200).json(sales);

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createSale,
  getSales,
};
const mongoose = require("mongoose");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// ── GET all customers ─────────────────────────────────────────
// GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find({
      owner: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── CREATE a customer ─────────────────────────────────────────
// POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    if (!name || !phone || !address) {
      return res.status(400).json({
        message: "Name, phone, and address are required",
      });
    }

    const customer = await Customer.create({
      name,
      phone,
      address,
      owner: req.user.id,
    });

    res.status(201).json({
      message: "Customer created successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── UPDATE a customer ─────────────────────────────────────────
// PUT /api/customers/:id
const updateCustomer = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await Customer.findOneAndUpdate(
      {
        _id: req.params.id,
        owner: req.user.id,
      },
      {
        name,
        phone,
        address,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer updated successfully",
      customer,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── DELETE a customer ─────────────────────────────────────────
// DELETE /api/customers/:id
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    res.status(200).json({
      message: "Customer deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// ── GET customer details, stats, and order history ────────────
// GET /api/customers/:id
// Returns customer profile + aggregated statistics + full order history
// in a single response to avoid multiple round-trips from the frontend.
const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format before querying — prevents a Mongoose
    // CastError from returning a confusing 500 on a malformed URL.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid customer ID",
      });
    }

    // Fetch the customer — owner check enforces multi-tenant isolation
    const customer = await Customer.findOne({
      _id: id,
      owner: req.user.id,
    });

    if (!customer) {
      return res.status(404).json({
        message: "Customer not found",
      });
    }

    // Convert to ObjectId for use in aggregation $match
    const customerId = mongoose.Types.ObjectId.createFromHexString(id);
    const ownerId    = mongoose.Types.ObjectId.createFromHexString(req.user.id);

    // Run aggregation and order fetch in parallel
    const [statsResult, orders] = await Promise.all([

      // Aggregation: compute customer lifetime statistics from their sales
      Sale.aggregate([
        {
          $match: {
            customer: customerId,
            owner:    ownerId,
          },
        },
        {
          $group: {
            _id:               null,
            totalOrders:       { $sum: 1 },
            totalSpent:        { $sum: "$totalAmount" },
            averageOrderValue: { $avg: "$totalAmount" },
            lastPurchaseDate:  { $max: "$createdAt" },
          },
        },
      ]),

      // Fetch all orders for this customer, newest first.
      // Populate name + sellingPrice so the Invoice Details page
      // can reuse this data without an additional request.
      Sale.find({
        customer: id,
        owner:    req.user.id,
      })
        .sort({ createdAt: -1 })
        .populate("products.product", "name sellingPrice"),
    ]);

    // Aggregation returns [] when no sales exist — normalise to zero values
    const stats = statsResult.length
      ? {
          totalOrders:       statsResult[0].totalOrders,
          totalSpent:        statsResult[0].totalSpent,
          averageOrderValue: Math.round(statsResult[0].averageOrderValue),
          lastPurchaseDate:  statsResult[0].lastPurchaseDate,
        }
      : {
          totalOrders:       0,
          totalSpent:        0,
          averageOrderValue: 0,
          lastPurchaseDate:  null,
        };

    res.status(200).json({
      customer,
      stats,
      orders,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerById,
};

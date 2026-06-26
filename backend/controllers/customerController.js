const Customer = require("../models/Customer");

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

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },

    // ── Multi-tenancy ─────────────────────────────────────────
    // Every customer belongs to exactly one registered user.
    // Set automatically by the controller from req.user.id —
    // the frontend must never send this field.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,       // fast lookup: Customer.find({ owner: userId })
    },
  },
  { timestamps: true }  // auto-adds createdAt and updatedAt
);

// Model name "Customer" is what Sale.js will use in:
// customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" }
module.exports = mongoose.model("Customer", customerSchema);

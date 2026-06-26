const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    purchasePrice: {
      type: Number,
      required: [true, "Purchase price is required"],
      min: [0, "Purchase price cannot be negative"],
    },
    sellingPrice: {
      type: Number,
      required: [true, "Selling price is required"],
      min: [0, "Selling price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      default: 0,
      min: [0, "Quantity cannot be negative"],
    },

    // ── Multi-tenancy ─────────────────────────────────────────
    // Every product belongs to exactly one registered user.
    // Set automatically by the controller from req.user.id —
    // the frontend must never send this field.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,       // fast lookup: Product.find({ owner: userId })
    },
  },
  { timestamps: true }  // auto-adds createdAt and updatedAt
);

module.exports = mongoose.model("Product", productSchema);

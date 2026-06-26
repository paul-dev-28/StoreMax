const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema(
  {
    // Which customer made this purchase (Customer document)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },

    // Array of products sold in this sale
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: [true, "Product is required"],
        },
        quantity: {
          type: Number,
          required: [true, "Quantity is required"],
          min: [1, "Quantity must be at least 1"],
        },
      },
    ],

    // Sum of (sellingPrice * quantity) for all products — calculated in controller
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
    },

    // ── Invoice fields ────────────────────────────────────────
    // Human-readable invoice number: INV-YYYYXXXX (e.g. INV-20260001)
    // sparse: true lets existing documents (without this field) coexist with
    // the unique constraint without throwing a duplicate-key error.
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
    },

    // ── Payment fields (future-ready) ─────────────────────────
    paymentStatus: {
      type: String,
      enum: ["paid", "partial", "due"],
      default: "paid",
    },

    amountPaid: {
      type: Number,
      default: 0,
    },

    balanceDue: {
      type: Number,
      default: 0,
    },

    // ── Multi-tenancy ─────────────────────────────────────────
    // The authenticated system user who created this sale record.
    // Note: this is distinct from `customer` (the buyer).
    //   owner    → the User running the store (from req.user.id)
    //   customer → the Customer document (the person buying)
    // Set automatically by the controller — frontend must never send this.
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,       // fast lookup: Sale.find({ owner: userId })
    },
  },
  { timestamps: true }  // createdAt used for sales history and analytics
);

// ── Auto-generate invoice number on new sale ──────────────────
// Runs before every Sale.create() call.
// isNew guard ensures this only fires once — not on updates.
saleSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  // Generate INV-YYYYXXXX
  const year = new Date().getFullYear();
  const count = await this.constructor.countDocuments({
    invoiceNumber: { $regex: `^INV-${year}` },
  });
  this.invoiceNumber = `INV-${year}${String(count + 1).padStart(4, "0")}`;

  // For fully paid sales, keep amountPaid in sync with totalAmount
  if (this.paymentStatus === "paid") {
    this.amountPaid = this.totalAmount;
    this.balanceDue = 0;
  }

  next();
});

// ── Indexes ───────────────────────────────────────────────────
// Compound index for customer order history: filter by customer, sort newest first
saleSchema.index({ customer: 1, createdAt: -1 });

// Compound index for owner-scoped sales history (multi-tenant + sorted)
saleSchema.index({ owner: 1, createdAt: -1 });

module.exports = mongoose.model("Sale", saleSchema);

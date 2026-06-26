const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// ── GET Dashboard Stats ───────────────────────────────────────
// GET /api/analytics/dashboard
const getDashboardStats = async (req, res) => {
  try {
    const owner = req.user.id;

    const [
      totalProducts,
      totalCustomers,
      totalSales,
      revenueResult,
      lowStockProducts,
    ] = await Promise.all([

      Product.countDocuments({
        owner,
      }),

      Customer.countDocuments({
        owner,
      }),

      Sale.countDocuments({
        owner,
      }),

      Sale.aggregate([
        {
          $match: {
            owner: Sale.db.base.Types.ObjectId.createFromHexString(owner),
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$totalAmount",
            },
          },
        },
      ]),

      Product.countDocuments({
        owner,
        quantity: {
          $lt: 10,
        },
      }),
    ]);

    const totalRevenue = revenueResult.length
      ? revenueResult[0].total
      : 0;

    res.status(200).json({
      totalProducts,
      totalCustomers,
      totalSales,
      totalRevenue,
      lowStockProducts,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
};
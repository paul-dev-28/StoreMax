const mongoose = require("mongoose");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const Sale = require("../models/Sale");

// ── GET Dashboard Stats ───────────────────────────────────────
// GET /api/analytics/dashboard
// UNCHANGED — existing 5-card KPI endpoint, untouched.
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

// ── GET Dashboard Chart Data ────────────────────────────────────
// GET /api/analytics/charts
//
// Returns every metric the rich analytics dashboard needs in a single
// response. To minimise database round trips, correlated metrics that
// share the same $match (owner) are batched into ONE aggregate() call
// per collection using $facet — each facet branch is an independent
// sub-pipeline run against the same matched document set:
//
//   Sale.aggregate()     → 9 facets  (1 round trip)
//   Product.aggregate()  → 4 facets  (1 round trip)
//   Customer.aggregate() → 2 facets  (1 round trip)
//
// All three run in parallel via Promise.all, so total latency is
// bounded by the slowest single aggregation, not the sum of all three.
// "Never Sold Products" and the three Top Products sort variants are
// derived in Node from data already fetched above — no extra queries.
const getChartData = async (req, res) => {
  try {
    const ownerId = mongoose.Types.ObjectId.createFromHexString(req.user.id);

    // ── Date boundaries ───────────────────────────────────────
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const last30DaysStart = new Date(startOfToday);
    last30DaysStart.setDate(last30DaysStart.getDate() - 29); // inclusive of today

    const last12MonthsStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // ── Run all three collection aggregations in parallel ─────
    const [saleFacets, productFacets, customerFacets] = await Promise.all([

      // ═══ SALE collection — 9 facets in 1 round trip ═══════
      Sale.aggregate([
        { $match: { owner: ownerId } },
        {
          $facet: {

            // Daily revenue + order count, last 30 days
            revenueTrend: [
              { $match: { createdAt: { $gte: last30DaysStart } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                  revenue: { $sum: "$totalAmount" },
                  orders:  { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],

            // Monthly revenue + order count, last 12 months
            monthlyRevenue: [
              { $match: { createdAt: { $gte: last12MonthsStart } } },
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                  revenue: { $sum: "$totalAmount" },
                  orders:  { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],

            // All-time totals — used to derive Average Order Value
            totals: [
              {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: "$totalAmount" },
                  totalOrders:  { $sum: 1 },
                },
              },
            ],

            // All-time total units sold — used to derive Avg Items/Order
            unitStats: [
              { $unwind: "$products" },
              {
                $group: {
                  _id: null,
                  totalUnits: { $sum: "$products.quantity" },
                },
              },
            ],

            // Revenue + order count for today only
            todayStats: [
              { $match: { createdAt: { $gte: startOfToday } } },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: "$totalAmount" },
                  orders:  { $sum: 1 },
                },
              },
            ],

            // Revenue + order count for the current month
            monthStats: [
              { $match: { createdAt: { $gte: startOfMonth } } },
              {
                $group: {
                  _id: null,
                  revenue: { $sum: "$totalAmount" },
                  orders:  { $sum: 1 },
                },
              },
            ],

            // Per-product units sold + revenue (full list — sorted 3 ways in Node)
            // NOTE: products referenced here always belong to the same owner,
            // because createSale only allows selecting the user's own products.
            // No additional owner filter is needed on the $lookup join.
            topProducts: [
              { $unwind: "$products" },
              {
                $group: {
                  _id: "$products.product",
                  unitsSold: { $sum: "$products.quantity" },
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "_id",
                  foreignField: "_id",
                  as: "productInfo",
                },
              },
              { $unwind: "$productInfo" },
              {
                $project: {
                  _id:       1,
                  name:      "$productInfo.name",
                  category:  "$productInfo.category",
                  unitsSold: 1,
                  revenue:   { $multiply: ["$unitsSold", "$productInfo.sellingPrice"] },
                },
              },
              { $sort: { unitsSold: -1 } },
            ],

            // Revenue + units sold grouped by product category
            revenueByCategory: [
              { $unwind: "$products" },
              {
                $lookup: {
                  from: "products",
                  localField: "products.product",
                  foreignField: "_id",
                  as: "productInfo",
                },
              },
              { $unwind: "$productInfo" },
              {
                $group: {
                  _id:       "$productInfo.category",
                  revenue:   { $sum: { $multiply: ["$products.quantity", "$productInfo.sellingPrice"] } },
                  unitsSold: { $sum: "$products.quantity" },
                },
              },
              { $sort: { revenue: -1 } },
            ],

            // Top 5 customers by lifetime spend
            topCustomers: [
              {
                $group: {
                  _id:         "$customer",
                  totalSpent:  { $sum: "$totalAmount" },
                  orderCount:  { $sum: 1 },
                },
              },
              { $sort: { totalSpent: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "customers",
                  localField: "_id",
                  foreignField: "_id",
                  as: "customerInfo",
                },
              },
              { $unwind: "$customerInfo" },
              {
                $project: {
                  _id:        1,
                  name:       "$customerInfo.name",
                  totalSpent: 1,
                  orderCount: 1,
                },
              },
            ],

            // 5 most recent sales, with customer name joined in
            recentSales: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              {
                $lookup: {
                  from: "customers",
                  localField: "customer",
                  foreignField: "_id",
                  as: "customerInfo",
                },
              },
              { $unwind: "$customerInfo" },
              {
                $project: {
                  invoiceNumber: 1,
                  totalAmount:   1,
                  createdAt:     1,
                  paymentStatus: 1,
                  customerName:  "$customerInfo.name",
                },
              },
            ],

          },
        },
      ]),

      // ═══ PRODUCT collection — 4 facets in 1 round trip ════
      Product.aggregate([
        { $match: { owner: ownerId } },
        {
          $facet: {

            // Stock + value grouped by category
            byCategory: [
              {
                $group: {
                  _id:             "$category",
                  totalQuantity:   { $sum: "$quantity" },
                  inventoryValue:  { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
                  productCount:    { $sum: 1 },
                },
              },
              { $sort: { inventoryValue: -1 } },
            ],

            // Inventory value at cost vs. at retail (gross)
            totals: [
              {
                $group: {
                  _id: null,
                  inventoryValue:      { $sum: { $multiply: ["$quantity", "$purchasePrice"] } },
                  grossInventoryValue: { $sum: { $multiply: ["$quantity", "$sellingPrice"] } },
                },
              },
            ],

            // Products below the same threshold used by the existing KPI card
            lowStock: [
              { $match: { quantity: { $lt: 10 } } },
              { $project: { name: 1, category: 1, quantity: 1 } },
              { $sort: { quantity: 1 } },
              { $limit: 10 },
            ],

            // Full product list (id/name/category/quantity only) —
            // used in Node to derive "Never Sold Products" by diffing
            // against the sold-product IDs from the Sale facet above.
            allProducts: [
              { $project: { name: 1, category: 1, quantity: 1 } },
            ],

          },
        },
      ]),

      // ═══ CUSTOMER collection — 2 facets in 1 round trip ═══
      Customer.aggregate([
        { $match: { owner: ownerId } },
        {
          $facet: {

            // 5 most recently added customers
            recent: [
              { $sort: { createdAt: -1 } },
              { $limit: 5 },
              { $project: { name: 1, phone: 1, createdAt: 1 } },
            ],

            // New customers per month, last 12 months
            growth: [
              { $match: { createdAt: { $gte: last12MonthsStart } } },
              {
                $group: {
                  _id:          { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
                  newCustomers: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],

          },
        },
      ]),
    ]);

    // ── Unpack facet results (each facet key holds an array) ──
    const sf = saleFacets[0];
    const pf = productFacets[0];
    const cf = customerFacets[0];

    const totals     = sf.totals[0]     || { totalRevenue: 0, totalOrders: 0 };
    const unitStats   = sf.unitStats[0]  || { totalUnits: 0 };
    const todayStats  = sf.todayStats[0] || { revenue: 0, orders: 0 };
    const monthStats  = sf.monthStats[0] || { revenue: 0, orders: 0 };
    const invTotals   = pf.totals[0]     || { inventoryValue: 0, grossInventoryValue: 0 };

    // Average Order Value + Average Items Per Order — derived, no extra query
    const averageOrderValue = totals.totalOrders
      ? Math.round(totals.totalRevenue / totals.totalOrders)
      : 0;

    const averageItemsPerOrder = totals.totalOrders
      ? Number((unitStats.totalUnits / totals.totalOrders).toFixed(1))
      : 0;

    // Top Products sorted 3 ways from the same dataset — no extra query
    const topProducts   = sf.topProducts || [];
    const topSelling     = [...topProducts].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5);
    const highestRevenue = [...topProducts].sort((a, b) => b.revenue   - a.revenue).slice(0, 5);
    const slowMoving      = [...topProducts].sort((a, b) => a.unitsSold - b.unitsSold).slice(0, 5);

    // Never Sold Products — diff full product list against sold IDs — no extra query
    const soldIds = new Set(topProducts.map((p) => p._id.toString()));
    const neverSoldProducts = (pf.allProducts || [])
      .filter((p) => !soldIds.has(p._id.toString()))
      .slice(0, 10);

    res.status(200).json({
      revenueTrend:        sf.revenueTrend,
      monthlyRevenue:      sf.monthlyRevenue,
      todayStats,
      monthStats,
      orderStats: {
        averageOrderValue,
        totalUnitsSold: unitStats.totalUnits,
        averageItemsPerOrder,
      },
      inventoryStats: invTotals,
      topSelling,
      highestRevenue,
      slowMoving,
      neverSoldProducts,
      inventoryByCategory: pf.byCategory,
      revenueByCategory:    sf.revenueByCategory,
      topCustomers:         sf.topCustomers,
      recentSales:          sf.recentSales,
      recentCustomers:      cf.recent,
      lowStockList:         pf.lowStock,
      customerGrowth:       cf.growth,
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
  getChartData,
};

import { FiAward, FiZap, FiCalendar, FiPackage, FiAlertCircle } from "react-icons/fi";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const formatShortDate = (dateStr) => {
  // dateStr is "YYYY-MM-DD" from the $dateToString aggregation
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};

// ── InsightsStrip ─────────────────────────────────────────────
// Row of small business-insight chips, all derived in-memory from the
// chart payload already fetched for the dashboard — zero extra API calls.
// Renders nothing while loading or if there isn't enough data yet, so
// the dashboard never shows a row of empty/zero chips.
function InsightsStrip({ data, loading }) {
  if (loading) {
    return (
      <div className="insights-strip" aria-hidden="true">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="insight-chip insight-chip--skeleton">
            <div className="insight-chip-icon shimmer" />
            <div className="insight-chip-text">
              <div className="skeleton-cell skeleton-cell--short shimmer" style={{ height: "0.6875rem", marginBottom: "0.25rem" }} />
              <div className="skeleton-cell skeleton-cell--medium shimmer" style={{ height: "0.8125rem" }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const {
    revenueByCategory = [],
    topSelling = [],
    revenueTrend = [],
    neverSoldProducts = [],
    lowStockList = [],
  } = data;

  // Best performing category by revenue
  const bestCategory = revenueByCategory[0];

  // Best selling product by units
  const bestProduct = topSelling[0];

  // Highest single-day revenue in the trend window
  const bestDay = revenueTrend.length
    ? revenueTrend.reduce((max, d) => (d.revenue > max.revenue ? d : max), revenueTrend[0])
    : null;

  // Build only the chips that have real data — never show an empty/zero chip
  const chips = [];

  if (bestCategory) {
    chips.push({
      key:   "category",
      Icon:  FiAward,
      label: "Top Category",
      value: bestCategory._id,
      sub:   formatCurrency(bestCategory.revenue),
    });
  }

  if (bestProduct) {
    chips.push({
      key:   "product",
      Icon:  FiZap,
      label: "Best Seller",
      value: bestProduct.name,
      sub:   `${bestProduct.unitsSold} units sold`,
    });
  }

  if (bestDay && bestDay.revenue > 0) {
    chips.push({
      key:   "day",
      Icon:  FiCalendar,
      label: "Best Day (30d)",
      value: formatCurrency(bestDay.revenue),
      sub:   formatShortDate(bestDay._id),
    });
  }

  if (neverSoldProducts.length > 0) {
    chips.push({
      key:      "neverSold",
      Icon:     FiPackage,
      label:    "Never Sold",
      value:    `${neverSoldProducts.length} ${neverSoldProducts.length === 1 ? "product" : "products"}`,
      sub:      "Consider promoting",
      variant:  "neutral",
    });
  }

  if (lowStockList.length > 0) {
    chips.push({
      key:      "lowStock",
      Icon:     FiAlertCircle,
      label:    "Needs Restock",
      value:    `${lowStockList.length} ${lowStockList.length === 1 ? "item" : "items"}`,
      sub:      "Below 10 units",
      variant:  "warning",
    });
  }

  // Nothing meaningful to show yet (e.g. brand-new account, no sales)
  if (chips.length === 0) return null;

  return (
    <div className="insights-strip">
      {chips.map(({ key, Icon, label, value, sub, variant }) => (
        <div key={key} className={`insight-chip${variant ? ` insight-chip--${variant}` : ""}`}>
          <div className="insight-chip-icon">
            <Icon size={15} aria-hidden="true" />
          </div>
          <div className="insight-chip-text">
            <span className="insight-chip-label">{label}</span>
            <span className="insight-chip-value" title={value}>{value}</span>
            <span className="insight-chip-sub">{sub}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InsightsStrip;

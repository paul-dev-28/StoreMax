import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTrendingUp,
  FiAlertTriangle,
} from "react-icons/fi";

// ── Card configuration ────────────────────────────────────────
// Each entry maps one API field to its label, icon, and style variant.
// Defining this outside the component avoids re-creation on every render.
// Relocated verbatim from Dashboard.jsx — no logic changed.
export const CARD_CONFIG = [
  {
    key:          "totalProducts",
    label:        "Total Products",
    Icon:         FiPackage,
    iconVariant:  "primary",
    format:       (v) => v.toLocaleString(),
  },
  {
    key:          "totalCustomers",
    label:        "Total Customers",
    Icon:         FiUsers,
    iconVariant:  "blue",
    format:       (v) => v.toLocaleString(),
  },
  {
    key:          "totalSales",
    label:        "Total Sales",
    Icon:         FiShoppingCart,
    iconVariant:  "success",
    format:       (v) => v.toLocaleString(),
  },
  {
    key:          "totalRevenue",
    label:        "Total Revenue",
    Icon:         FiTrendingUp,
    iconVariant:  "success",
    format:       (v) => `₹${v.toLocaleString()}`,
  },
  {
    key:            "lowStockProducts",
    label:          "Low Stock Items",
    Icon:           FiAlertTriangle,
    iconVariant:    "warning",
    format:         (v) => v.toLocaleString(),
    warnIfPositive: true,  // turns red when value > 0
  },
];

// ── KpiCard ───────────────────────────────────────────────────
// Renders one metric card. Uses warnIfPositive to switch to
// danger colors when low stock count is greater than zero.
// Relocated verbatim from Dashboard.jsx's StatCard — no logic changed.
export function KpiCard({ label, value, rawValue, Icon, iconVariant, warnIfPositive }) {
  const isDanger      = warnIfPositive && rawValue > 0;
  const activeVariant = isDanger ? "danger" : iconVariant;

  return (
    <div className={`stat-card${isDanger ? " stat-card--danger" : ""}`}>
      <div className="stat-card-top">
        <div className={`card-icon card-icon--${activeVariant}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      </div>
      <p className={`card-value${isDanger ? " card-value--danger" : ""}`}>
        {value}
      </p>
      <p className="card-label">{label}</p>
    </div>
  );
}

// ── KpiSkeletonCard ───────────────────────────────────────────
// Shown while data is loading. Matches KpiCard dimensions exactly.
// Relocated verbatim from Dashboard.jsx's SkeletonCard — no logic changed.
export function KpiSkeletonCard() {
  return (
    <div className="stat-card stat-card--skeleton" aria-hidden="true">
      <div className="skeleton-icon shimmer" />
      <div className="skeleton-value shimmer" />
      <div className="skeleton-label shimmer" />
    </div>
  );
}

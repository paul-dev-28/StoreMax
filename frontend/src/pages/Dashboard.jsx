import { useState, useEffect } from "react";
import {
  FiPackage,
  FiUsers,
  FiShoppingCart,
  FiTrendingUp,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../services/api";
import "./Dashboard.css";

// ── Card configuration ────────────────────────────────────────
// Each entry maps one API field to its label, icon, and style variant.
// Defining this outside the component avoids re-creation on every render.
const CARD_CONFIG = [
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

// ── StatCard ──────────────────────────────────────────────────
// Renders one metric card. Uses warnIfPositive to switch to
// danger colors when low stock count is greater than zero.
function StatCard({ label, value, rawValue, Icon, iconVariant, warnIfPositive }) {
  const isDanger      = warnIfPositive && rawValue > 0;
  const activeVariant = isDanger ? "danger" : iconVariant;

  return (
    <div className={`stat-card${isDanger ? " stat-card--danger" : ""}`}>
      <div className="stat-card-top">
        <div className={`card-icon card-icon--${activeVariant}`}>
          <Icon size={17} aria-hidden="true" />
        </div>
      </div>
      <p className={`card-value${isDanger ? " card-value--danger" : ""}`}>
        {value}
      </p>
      <p className="card-label">{label}</p>
    </div>
  );
}

// ── SkeletonCard ──────────────────────────────────────────────
// Shown while data is loading. Matches StatCard dimensions exactly.
function SkeletonCard() {
  return (
    <div className="stat-card stat-card--skeleton" aria-hidden="true">
      <div className="skeleton-icon shimmer" />
      <div className="skeleton-value shimmer" />
      <div className="skeleton-label shimmer" />
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────
function Dashboard() {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  // Extracted so the retry button can call it directly.
  // API call (endpoint, response handling) is identical to the original.
  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/analytics/dashboard");
      setStats(response.data);
    } catch (err) {
      setError("Failed to load dashboard stats.");
    } finally {
      setLoading(false);
    }
  };

  // Run once on mount — same behaviour as the original useEffect
  useEffect(() => {
    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="dashboard-page">

      {/* ── Page Header ───────────────────────────────── */}
      <div className="dashboard-header">
        <p className="dashboard-subtitle">
          Customers and sales overview.
        </p>
      </div>

      {/* ── Error Banner (only when not loading) ──────── */}
      {error && !loading && (
        <div className="error-card" role="alert">
          <FiAlertTriangle size={20} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchStats}>
            <FiRefreshCw size={14} aria-hidden="true" />
            Try Again
          </button>
        </div>
      )}

      {/* ── Stats Grid ────────────────────────────────── */}
      <div className="stats-grid">
        {loading ? (
          // Five skeleton placeholders while fetching
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          // Render real cards only when data is available and no error
          !error &&
          CARD_CONFIG.map(({ key, label, Icon, iconVariant, format, warnIfPositive }) => (
            <StatCard
              key={key}
              label={label}
              value={format(stats[key])}
              rawValue={stats[key]}
              Icon={Icon}
              iconVariant={iconVariant}
              warnIfPositive={warnIfPositive}
            />
          ))
        )}
      </div>

    </div>
  );
}

export default Dashboard;

import { FiSun, FiCalendar, FiBarChart2, FiArchive, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

// ── MetricRow ─────────────────────────────────────────────────
function MetricRow({ label, value }) {
  return (
    <div className="metric-row">
      <span className="metric-row-label">{label}</span>
      <span className="metric-row-value">{value}</span>
    </div>
  );
}

// ── MetricGroup ───────────────────────────────────────────────
function MetricGroup({ Icon, title, children }) {
  return (
    <div className="metric-group">
      <div className="metric-group-header">
        <Icon size={13} aria-hidden="true" />
        {title}
      </div>
      <div className="metric-group-rows">
        {children}
      </div>
    </div>
  );
}

// ── SummaryMetricsCard ────────────────────────────────────────
// data = {
//   todayStats:     { revenue, orders },
//   monthStats:     { revenue, orders },
//   orderStats:     { averageOrderValue, totalUnitsSold, averageItemsPerOrder },
//   inventoryStats: { inventoryValue, grossInventoryValue },
// }
// No API calls — all values supplied via props from the single dashboard fetch.
function SummaryMetricsCard({ data, loading, error, onRetry }) {
  return (
    <SectionCard title="Business Summary" Icon={FiBarChart2}>

      {loading && (
        <div className="metric-skeleton" aria-hidden="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="metric-group">
              <div className="skeleton-cell skeleton-cell--short shimmer" style={{ height: "0.6875rem", marginBottom: "0.625rem" }} />
              <div className="skeleton-cell skeleton-cell--wide shimmer" style={{ height: "0.875rem", marginBottom: "0.5rem" }} />
              <div className="skeleton-cell skeleton-cell--medium shimmer" style={{ height: "0.875rem" }} />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="dash-card-error">
          <FiAlertTriangle size={18} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={onRetry} type="button">
            <FiRefreshCw size={13} aria-hidden="true" />
            Retry
          </button>
        </div>
      )}

      {!loading && !error && data && (
        <div className="metric-groups">

          <MetricGroup Icon={FiSun} title="Today">
            <MetricRow label="Revenue" value={formatCurrency(data.todayStats.revenue)} />
            <MetricRow label="Orders"  value={data.todayStats.orders.toLocaleString()} />
          </MetricGroup>

          <MetricGroup Icon={FiCalendar} title="This Month">
            <MetricRow label="Revenue" value={formatCurrency(data.monthStats.revenue)} />
            <MetricRow label="Orders"  value={data.monthStats.orders.toLocaleString()} />
          </MetricGroup>

          <MetricGroup Icon={FiBarChart2} title="Overall">
            <MetricRow label="Avg. Order Value"   value={formatCurrency(data.orderStats.averageOrderValue)} />
            <MetricRow label="Total Units Sold"   value={data.orderStats.totalUnitsSold.toLocaleString()} />
            <MetricRow label="Avg. Items / Order" value={data.orderStats.averageItemsPerOrder} />
          </MetricGroup>

          <MetricGroup Icon={FiArchive} title="Inventory">
            <MetricRow label="Value (Cost)"   value={formatCurrency(data.inventoryStats.inventoryValue)} />
            <MetricRow label="Value (Retail)" value={formatCurrency(data.inventoryStats.grossInventoryValue)} />
          </MetricGroup>

        </div>
      )}

    </SectionCard>
  );
}

export default SummaryMetricsCard;

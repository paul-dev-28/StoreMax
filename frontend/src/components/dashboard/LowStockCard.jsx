import { FiAlertTriangle, FiPackage, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
// Sub-categorize within the existing <10 threshold for a more
// actionable status column — no new backend query required.
const getStockStatus = (quantity) =>
  quantity < 5 ? { label: "Critical", variant: "danger" } : { label: "Low", variant: "warning" };

// ── LowStockCard ──────────────────────────────────────────────
// lowStockList: [{ _id, name, category, quantity }]
// No API calls — data supplied via props from the single dashboard fetch.
// Reuses .table-container (defined in Customers.css, globally bundled).
function LowStockCard({ lowStockList, loading, error, onRetry }) {
  const products = lowStockList || [];
  const hasData  = products.length > 0;

  return (
    <SectionCard title="Low Stock Alert" Icon={FiAlertTriangle} className="dash-card--full">

      {loading && (
        <div className="table-container">
          <table className="ls-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr className="skeleton-row" key={i} aria-hidden="true">
                  <td><div className="skeleton-cell skeleton-cell--wide shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {!loading && !error && !hasData && (
        <div className="dash-empty-state">
          <FiPackage className="dash-empty-icon" size={28} aria-hidden="true" />
          <p className="dash-empty-title">All stock levels healthy</p>
          <p className="dash-empty-desc">No products are currently running low.</p>
        </div>
      )}

      {!loading && !error && hasData && (
        <div className="table-container">
          <table className="ls-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const status = getStockStatus(p.quantity);
                return (
                  <tr key={p._id}>
                    <td className="ls-td-product">{p.name}</td>
                    <td>
                      <span className="ls-category-badge">{p.category}</span>
                    </td>
                    <td className="ls-td-stock">{p.quantity}</td>
                    <td>
                      <span className={`ls-status-badge ls-status-badge--${status.variant}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </SectionCard>
  );
}

export default LowStockCard;

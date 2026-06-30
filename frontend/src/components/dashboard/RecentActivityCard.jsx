import { useState } from "react";
import { FiActivity, FiFileText, FiUser, FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import SectionCard from "./SectionCard";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) => `₹${Number(amount).toLocaleString("en-IN")}`;

const formatShortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

const TABS = [
  { key: "sales",     label: "Recent Sales" },
  { key: "customers", label: "Recent Customers" },
];

// ── RecentActivityCard ────────────────────────────────────────
// recentSales:     [{ _id, invoiceNumber, totalAmount, createdAt, paymentStatus, customerName }]
// recentCustomers: [{ _id, name, phone, createdAt }]
// No API calls — both lists supplied via props from the single dashboard fetch.
// Reuses .cd-payment-badge (defined in CustomerDetail.css, globally bundled)
// instead of redefining payment status colours here.
function RecentActivityCard({ recentSales, recentCustomers, loading, error, onRetry }) {
  const [activeTab, setActiveTab] = useState("sales");

  const sales     = recentSales || [];
  const customers = recentCustomers || [];
  const hasData   = activeTab === "sales" ? sales.length > 0 : customers.length > 0;

  const tabSwitcher = (
    <div className="dash-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`dash-tab${activeTab === tab.key ? " dash-tab--active" : ""}`}
          onClick={() => setActiveTab(tab.key)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard title="Recent Activity" Icon={FiActivity} headerRight={tabSwitcher}>

      {loading && (
        <div className="activity-skeleton" aria-hidden="true">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="activity-row activity-row--skeleton">
              <div className="skeleton-icon shimmer" style={{ width: "32px", height: "32px" }} />
              <div className="activity-row-main">
                <div className="skeleton-cell skeleton-cell--medium shimmer" style={{ height: "0.875rem", marginBottom: "0.375rem" }} />
                <div className="skeleton-cell skeleton-cell--short shimmer" style={{ height: "0.75rem" }} />
              </div>
              <div className="skeleton-cell skeleton-cell--short shimmer" style={{ height: "0.875rem" }} />
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

      {!loading && !error && !hasData && (
        <div className="dash-empty-state">
          {activeTab === "sales" ? (
            <FiFileText className="dash-empty-icon" size={28} aria-hidden="true" />
          ) : (
            <FiUser className="dash-empty-icon" size={28} aria-hidden="true" />
          )}
          <p className="dash-empty-title">
            {activeTab === "sales" ? "No sales yet" : "No customers yet"}
          </p>
          <p className="dash-empty-desc">
            {activeTab === "sales"
              ? "Recent invoices will show up here."
              : "Newly added customers will show up here."}
          </p>
        </div>
      )}

      {!loading && !error && hasData && activeTab === "sales" && (
        <div className="activity-list">
          {sales.map((sale) => (
            <div className="activity-row" key={sale._id}>
              <div className="activity-row-icon">
                <FiFileText size={14} aria-hidden="true" />
              </div>
              <div className="activity-row-main">
                <span className="activity-row-title">{sale.customerName}</span>
                <span className="activity-row-sub">
                  {sale.invoiceNumber || `#${sale._id.slice(-6).toUpperCase()}`} · {formatShortDate(sale.createdAt)}
                </span>
              </div>
              <div className="activity-row-end">
                <span className="activity-row-amount">{formatCurrency(sale.totalAmount)}</span>
                <span className={`cd-payment-badge cd-payment-badge--${sale.paymentStatus || "paid"}`}>
                  {(sale.paymentStatus || "paid").replace(/^\w/, (c) => c.toUpperCase())}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && hasData && activeTab === "customers" && (
        <div className="activity-list">
          {customers.map((customer) => (
            <div className="activity-row" key={customer._id}>
              <div className="activity-row-icon activity-row-icon--blue">
                <FiUser size={14} aria-hidden="true" />
              </div>
              <div className="activity-row-main">
                <span className="activity-row-title">{customer.name}</span>
                <span className="activity-row-sub">{customer.phone}</span>
              </div>
              <div className="activity-row-end">
                <span className="activity-row-date">{formatShortDate(customer.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

    </SectionCard>
  );
}

export default RecentActivityCard;

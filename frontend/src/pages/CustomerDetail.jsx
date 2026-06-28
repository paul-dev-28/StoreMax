import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiShoppingCart,
  FiTrendingUp,
  FiCalendar,
  FiAlertTriangle,
  FiRefreshCw,
  FiFileText,
} from "react-icons/fi";
import api from "../services/api";
import "./CustomerDetail.css";

// ── Helpers ───────────────────────────────────────────────────
// Format a number as Indian Rupee currency
const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

// Format an ISO date string to a readable short date + time
const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day:   "2-digit",
    month: "short",
    year:  "numeric",
  });
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day:    "2-digit",
    month:  "short",
    year:   "numeric",
    hour:   "2-digit",
    minute: "2-digit",
  });
};

// ── StatCard ──────────────────────────────────────────────────
// Reusable mini stat card — same visual pattern as Dashboard.
// Defined here to avoid creating a shared component file.
function StatCard({ label, value, Icon, iconVariant }) {
  return (
    <div className="cd-stat-card">
      <div className="cd-stat-card-top">
        <div className={`card-icon card-icon--${iconVariant}`}>
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
      <p className="card-value">{value}</p>
      <p className="card-label">{label}</p>
    </div>
  );
}

// ── SkeletonStatCard ──────────────────────────────────────────
function SkeletonStatCard() {
  return (
    <div className="cd-stat-card cd-stat-card--skeleton" aria-hidden="true">
      <div className="skeleton-icon shimmer" />
      <div className="skeleton-value shimmer" />
      <div className="skeleton-label shimmer" />
    </div>
  );
}

// ── PaymentBadge ──────────────────────────────────────────────
function PaymentBadge({ status }) {
  return (
    <span className={`cd-payment-badge cd-payment-badge--${status}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// ── CustomerDetail ────────────────────────────────────────────
function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [data, setData]       = useState(null);   // { customer, stats, orders }
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchCustomer = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/customers/${id}`);
      setData(response.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Customer not found.");
      } else if (status === 400) {
        setError("Invalid customer ID.");
      } else {
        setError("Failed to load customer details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Render: Loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="cd-page">
        {/* Back button still visible during load */}
        <button className="cd-back-btn" onClick={() => navigate("/customers")}>
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to Customers
        </button>

        {/* Skeleton profile card */}
        <div className="cd-profile-card">
          <div className="cd-profile-skeleton">
            <div className="skeleton-cell skeleton-cell--wide shimmer" style={{ height: "1.5rem", marginBottom: "0.5rem" }} />
            <div className="skeleton-cell skeleton-cell--medium shimmer" style={{ height: "0.875rem", marginBottom: "0.375rem" }} />
            <div className="skeleton-cell skeleton-cell--long shimmer" style={{ height: "0.875rem" }} />
          </div>
        </div>

        {/* Skeleton stat cards */}
        <div className="cd-stats-grid">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        {/* Skeleton table rows */}
        <div className="table-container">
          <table className="cd-orders-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 4 }).map((_, i) => (
                <tr className="skeleton-row" key={i} aria-hidden="true">
                  <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                  <td><div className="skeleton-cell skeleton-cell--actions shimmer" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── Render: Error ──────────────────────────────────────────
  if (error) {
    return (
      <div className="cd-page">
        <button className="cd-back-btn" onClick={() => navigate("/customers")}>
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to Customers
        </button>
        <div className="error-card" role="alert">
          <FiAlertTriangle size={20} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchCustomer}>
            <FiRefreshCw size={14} aria-hidden="true" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { customer, stats, orders } = data;

  // ── Render: Content ────────────────────────────────────────
  return (
    <div className="cd-page">

      {/* ── Back Navigation ───────────────────────────── */}
      <button className="cd-back-btn" onClick={() => navigate("/customers")}>
        <FiArrowLeft size={16} aria-hidden="true" />
        Back to Customers
      </button>

      {/* ── Page Header ───────────────────────────────── */}
      <div className="cd-header">
        <h1 className="cd-title">{customer.name}</h1>
        <p className="cd-subtitle">
          Member since {formatDate(customer.createdAt)}
        </p>
      </div>

      {/* ── Customer Profile Card ──────────────────────── */}
      <div className="cd-profile-card">
        <div className="cd-profile-section-title">
          <FiUser size={14} aria-hidden="true" />
          Customer Information
        </div>
        <div className="cd-profile-grid">
          <div className="cd-profile-field">
            <span className="cd-field-label">Name</span>
            <span className="cd-field-value">{customer.name}</span>
          </div>
          <div className="cd-profile-field">
            <span className="cd-field-label">Phone</span>
            <span className="cd-field-value cd-field-value--mono">{customer.phone}</span>
          </div>
          <div className="cd-profile-field cd-profile-field--full">
            <span className="cd-field-label">Address</span>
            <span className="cd-field-value">{customer.address}</span>
          </div>
        </div>
      </div>

      {/* ── Statistics Grid ───────────────────────────── */}
      <div className="cd-stats-grid">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders.toLocaleString()}
          Icon={FiShoppingCart}
          iconVariant="primary"
        />
        <StatCard
          label="Total Spent"
          value={formatCurrency(stats.totalSpent)}
          Icon={FiTrendingUp}
          iconVariant="success"
        />
        <StatCard
          label="Avg. Order Value"
          value={formatCurrency(stats.averageOrderValue)}
          Icon={FiTrendingUp}
          iconVariant="blue"
        />
        <StatCard
          label="Last Purchase"
          value={formatDate(stats.lastPurchaseDate)}
          Icon={FiCalendar}
          iconVariant="warning"
        />
      </div>

      {/* ── Order History ─────────────────────────────── */}
      <div className="cd-orders-section">
        <div className="cd-orders-header">
          <h2 className="cd-orders-title">Order History</h2>
          <span className="cd-orders-count">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
          </span>
        </div>

        <div className="table-container">
          <table className="cd-orders-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <div className="empty-state">
                      <FiFileText className="empty-icon" size={36} aria-hidden="true" />
                      <p className="empty-title">No orders yet.</p>
                      <p className="empty-desc">
                        This customer has not placed any orders.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id}>

                    {/* Invoice Number */}
                    <td>
                      <span className="cd-invoice-number">
                        {order.invoiceNumber || `#${order._id.slice(-6).toUpperCase()}`}
                      </span>
                    </td>

                    {/* Date */}
                    <td>
                      <span className="cd-date-text">
                        {formatDateTime(order.createdAt)}
                      </span>
                    </td>

                    {/* Items count */}
                    <td>
                      <span className="cd-items-count">
                        {order.products.length}{" "}
                        {order.products.length === 1 ? "item" : "items"}
                      </span>
                    </td>

                    {/* Total amount */}
                    <td>
                      <span className="cd-amount">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>

                    {/* Payment status */}
                    <td>
                      <PaymentBadge status={order.paymentStatus || "paid"} />
                    </td>

                    {/* Action — placeholder navigation for Invoice Details (next feature) */}
                    <td>
                      <button
                        className="cd-btn-invoice"
                        onClick={() => navigate(`/invoices/${order._id}`)}
                        aria-label={`View invoice ${order.invoiceNumber}`}
                      >
                        <FiFileText size={12} aria-hidden="true" />
                        View Invoice
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default CustomerDetail;

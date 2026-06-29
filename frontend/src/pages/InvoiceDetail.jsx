import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiDownload,
  FiUser,
  FiFileText,
  FiAlertTriangle,
  FiRefreshCw,
} from "react-icons/fi";
import api from "../services/api";
import generateInvoicePdf from "../utils/generateInvoicePdf";
import "./InvoiceDetail.css";

// ── Helpers ───────────────────────────────────────────────────
const formatCurrency = (amount) =>
  `₹${Number(amount).toLocaleString("en-IN")}`;

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

// ── InvoiceDetail ─────────────────────────────────────────────
function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sale, setSale]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/sales/${id}`);
      setSale(response.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 404) {
        setError("Invoice not found.");
      } else if (status === 400) {
        setError("Invalid invoice ID.");
      } else {
        setError("Failed to load invoice.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Navigate back to the customer's detail page (uses customer._id from
  // the loaded sale). Falls back to /customers if sale is unavailable.
  const handleBack = () => {
    if (sale?.customer?._id) {
      navigate(`/customers/${sale.customer._id}`);
    } else {
      navigate("/customers");
    }
  };

  // ── Render: Loading ────────────────────────────────────────
  if (loading) {
    return (
      <div className="id-page">
        <div className="id-top-bar">
          <button className="id-back-btn" onClick={() => navigate("/customers")}>
            <FiArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        </div>

        <div className="id-invoice-card">
          {/* Header skeleton */}
          <div className="id-skeleton-header">
            <div className="skeleton-cell skeleton-cell--wide shimmer"
              style={{ height: "1.75rem", marginBottom: "0.5rem" }} />
            <div className="skeleton-cell skeleton-cell--medium shimmer"
              style={{ height: "0.875rem" }} />
          </div>

          <div className="id-skeleton-divider" />

          {/* Meta + customer skeleton */}
          <div className="id-skeleton-meta">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="id-skeleton-field">
                <div className="skeleton-cell skeleton-cell--short shimmer"
                  style={{ height: "0.75rem", marginBottom: "0.375rem" }} />
                <div className="skeleton-cell skeleton-cell--medium shimmer"
                  style={{ height: "0.9375rem" }} />
              </div>
            ))}
          </div>

          <div className="id-skeleton-divider" />

          {/* Table skeleton */}
          <div className="table-container">
            <table className="id-items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 3 }).map((_, i) => (
                  <tr className="skeleton-row" key={i} aria-hidden="true">
                    <td><div className="skeleton-cell skeleton-cell--long shimmer" /></td>
                    <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
                    <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
                    <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // ── Render: Error ──────────────────────────────────────────
  if (error) {
    return (
      <div className="id-page">
        <div className="id-top-bar">
          <button className="id-back-btn" onClick={() => navigate("/customers")}>
            <FiArrowLeft size={16} aria-hidden="true" />
            Back to Customers
          </button>
        </div>
        <div className="error-card" role="alert">
          <FiAlertTriangle size={20} className="error-icon" aria-hidden="true" />
          <p className="error-message">{error}</p>
          <button className="retry-btn" onClick={fetchInvoice}>
            <FiRefreshCw size={14} aria-hidden="true" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Derived values computed once from loaded sale
  const invoiceLabel = sale.invoiceNumber || `#${sale._id.slice(-6).toUpperCase()}`;
  const totalQty     = sale.products.reduce((sum, item) => sum + item.quantity, 0);
  const status       = sale.paymentStatus || "paid";

  // ── Render: Content ────────────────────────────────────────
  return (
    <div className="id-page">

      {/* ── Top bar: back + download ───────────────────── */}
      <div className="id-top-bar">
        <button className="id-back-btn" onClick={handleBack} aria-label="Back to customer">
          <FiArrowLeft size={16} aria-hidden="true" />
          Back to Customer
        </button>

        <button
          className="id-download-btn"
          onClick={() => generateInvoicePdf(sale)}
          aria-label="Download PDF invoice"
        >
          <FiDownload size={15} aria-hidden="true" />
          Download PDF
        </button>
      </div>

      {/* ── Invoice Card ───────────────────────────────── */}
      <div className="id-invoice-card">

        {/* ── Invoice header ──────────────────────────── */}
        <div className="id-invoice-header">
          <div className="id-invoice-header-left">
            <div className="id-store-name">StoreMax</div>
            <div className="id-store-tagline">Inventory &amp; Sales Management System</div>
          </div>
          <div className="id-invoice-header-right">
            <div className="id-invoice-label">INVOICE</div>
            <div className="id-invoice-number">{invoiceLabel}</div>
          </div>
        </div>

        <div className="id-divider" />

        {/* ── Invoice meta + customer ──────────────────── */}
        <div className="id-meta-grid">

          {/* Left: invoice date + status */}
          <div className="id-meta-block">
            <div className="id-meta-field">
              <span className="id-field-label">Invoice Date</span>
              <span className="id-field-value">{formatDateTime(sale.createdAt)}</span>
            </div>
            <div className="id-meta-field">
              <span className="id-field-label">Payment Status</span>
              <span className={`id-status-badge id-status-badge--${status}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>

          {/* Right: bill to */}
          <div className="id-meta-block">
            <div className="id-bill-to-label">
              <FiUser size={12} aria-hidden="true" />
              Bill To
            </div>
            <div className="id-bill-name">{sale.customer.name}</div>
            <div className="id-bill-detail">{sale.customer.phone}</div>
            <div className="id-bill-detail">{sale.customer.address}</div>
          </div>

        </div>

        <div className="id-divider" />

        {/* ── Line items table ─────────────────────────── */}
        <div className="table-container">
          <table className="id-items-table">
            <thead>
              <tr>
                <th className="id-th-product">Product</th>
                <th className="id-th-center">Qty</th>
                <th className="id-th-right">Unit Price</th>
                <th className="id-th-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {sale.products.map((item, index) => {
                const unitPrice = item.product?.sellingPrice ?? 0;
                const subtotal  = unitPrice * item.quantity;
                return (
                  <tr key={index}>
                    <td className="id-td-product">
                      <FiFileText
                        className="id-product-icon"
                        size={13}
                        aria-hidden="true"
                      />
                      {item.product?.name || "Deleted Product"}
                    </td>
                    <td className="id-td-center">{item.quantity}</td>
                    <td className="id-td-right">{formatCurrency(unitPrice)}</td>
                    <td className="id-td-right id-td-subtotal">
                      {formatCurrency(subtotal)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Totals ───────────────────────────────────── */}
        <div className="id-totals">
          <div className="id-total-row">
            <span className="id-total-label">Total Items</span>
            <span className="id-total-value">{totalQty}</span>
          </div>
          <div className="id-divider id-divider--narrow" />
          <div className="id-total-row id-total-row--grand">
            <span className="id-grand-label">Grand Total</span>
            <span className="id-grand-value">{formatCurrency(sale.totalAmount)}</span>
          </div>
        </div>

      </div>

    </div>
  );
}

export default InvoiceDetail;

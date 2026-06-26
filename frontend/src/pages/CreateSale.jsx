import { useState, useEffect } from "react";
import {
  FiUser,
  FiPackage,
  FiShoppingCart,
  FiPlus,
  FiTrash2,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import api from "../services/api";
import "./CreateSale.css";

// ── Constants ─────────────────────────────────────────────────
const emptyRow = { product: "", quantity: 1 };

// ── ProductRow ─────────────────────────────────────────────────
// Renders one product selector + quantity input + optional meta info.
// Extracted to keep the main component JSX readable.
function ProductRow({ row, index, products, onRowChange, onRemove, canRemove }) {
  const selected = products.find((p) => p._id === row.product);
  const subtotal = selected ? selected.sellingPrice * Number(row.quantity) : 0;

  return (
    <div className="product-row">
      <div className="product-row-main">
        {/* Product selector */}
        <select
          className="form-select row-select"
          value={row.product}
          onChange={(e) => onRowChange(index, "product", e.target.value)}
          required
          aria-label={`Product ${index + 1}`}
        >
          <option value="">Select a product</option>
          {products.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} (Stock: {p.quantity}) — ₹{p.sellingPrice}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <input
          className="qty-input"
          type="number"
          min="1"
          value={row.quantity}
          onChange={(e) => onRowChange(index, "quantity", e.target.value)}
          required
          aria-label={`Quantity for product ${index + 1}`}
        />

        {/* Remove button — hidden when only one row remains */}
        {canRemove && (
          <button
            type="button"
            className="btn-remove"
            onClick={() => onRemove(index)}
            aria-label="Remove this product"
          >
            <FiTrash2 size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Meta row: unit price, stock remaining, running subtotal */}
      {selected && (
        <div className="product-row-meta">
          <span className="row-price">₹{selected.sellingPrice} / unit</span>
          <span className="row-stock">Stock: {selected.quantity}</span>
          {row.quantity > 0 && (
            <span className="row-subtotal">
              ₹{subtotal.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── LoadingSkeleton ────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="sale-grid">
      <div className="sale-left">
        <div className="sale-card">
          <div className="sk-label shimmer" />
          <div className="sk-input shimmer" />
        </div>
        <div className="sale-card">
          <div className="sk-label shimmer" />
          <div className="sk-row shimmer" style={{ marginBottom: "0.75rem" }} />
          <div className="sk-row shimmer" />
        </div>
      </div>
      <div className="sale-right">
        <div className="sale-card">
          <div className="sk-label shimmer" />
          <div className="sk-total shimmer" />
          <div className="sk-btn shimmer" />
        </div>
      </div>
    </div>
  );
}

// ── CreateSale ─────────────────────────────────────────────────
function CreateSale() {
  const [customers, setCustomers]         = useState([]);
  const [products, setProducts]           = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [productRows, setProductRows]     = useState([{ ...emptyRow }]);
  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState("");

  // Load customers and products in parallel on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get("/customers"),
          api.get("/products"),
        ]);
        setCustomers(custRes.data);
        setProducts(prodRes.data);
      } catch (err) {
        setError("Failed to load customers or products.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // ── Product row handlers (unchanged) ──────────────────────
  const handleRowChange = (index, field, value) => {
    const updatedRows = [...productRows];
    updatedRows[index][field] = value;
    setProductRows(updatedRows);
  };

  const addRow = () => {
    setProductRows([...productRows, { ...emptyRow }]);
  };

  const removeRow = (index) => {
    if (productRows.length === 1) return;   // always keep at least one row
    setProductRows(productRows.filter((_, i) => i !== index));
  };

  // ── Live total calculation (unchanged) ────────────────────
  const calculateTotal = () => {
    return productRows.reduce((total, row) => {
      const product = products.find((p) => p._id === row.product);
      if (!product || !row.quantity) return total;
      return total + product.sellingPrice * Number(row.quantity);
    }, 0);
  };

  // ── Submit (unchanged) ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCustomer) {
      return setError("Please select a customer.");
    }
    const hasEmptyProduct = productRows.some((r) => !r.product);
    if (hasEmptyProduct) {
      return setError("Please select a product for every row.");
    }

    setSubmitting(true);
    try {
      await api.post("/sales", {
        customer: selectedCustomer,
        products: productRows.map((r) => ({
          product:  r.product,
          quantity: Number(r.quantity),
        })),
      });

      setSuccess("Sold! Inventory updated.");
      setSelectedCustomer("");
      setProductRows([{ ...emptyRow }]);
    } catch (err) {
      setError(err.response?.data?.message || "Sail Failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Compute order lines for summary (display only) ────────
  const orderLines = productRows
    .filter((row) => row.product && Number(row.quantity) > 0)
    .map((row) => {
      const product = products.find((p) => p._id === row.product);
      if (!product) return null;
      return {
        name:     product.name,
        quantity: Number(row.quantity),
        subtotal: product.sellingPrice * Number(row.quantity),
      };
    })
    .filter(Boolean);

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="sale-page">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="sale-header">
        <h1 className="sale-title">Create Sale</h1>
        <p className="sale-subtitle">
          Create a customer invoice and automatically update inventory.
        </p>
      </div>

      {/* ── Loading Skeletons ────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Main Content ─────────────────────────────────── */}
      {!loading && (
        <form onSubmit={handleSubmit} noValidate>
          <div className="sale-grid">

            {/* ── LEFT COLUMN ─────────────────────────────── */}
            <div className="sale-left">

              {/* Alert banners */}
              {error && (
                <div className="alert alert--error" role="alert">
                  <FiAlertCircle size={16} aria-hidden="true" />
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert--success" role="status">
                  <FiCheckCircle size={16} aria-hidden="true" />
                  {success}
                </div>
              )}

              {/* Customer Card */}
              <div className="sale-card">
                <div className="card-section-title">
                  <FiUser size={14} aria-hidden="true" />
                  Customer
                </div>
                <select
                  className="form-select"
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  required
                  aria-label="Select customer"
                >
                  <option value="">Select a customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} — {c.phone}
                    </option>
                  ))}
                </select>
              </div>

              {/* Products Card */}
              <div className="sale-card">
                <div className="card-section-title">
                  <FiPackage size={14} aria-hidden="true" />
                  Products
                </div>

                <div className="product-rows">
                  {productRows.map((row, index) => (
                    <ProductRow
                      key={index}
                      row={row}
                      index={index}
                      products={products}
                      onRowChange={handleRowChange}
                      onRemove={removeRow}
                      canRemove={productRows.length > 1}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-add-product"
                  onClick={addRow}
                  aria-label="Add another product row"
                >
                  <FiPlus size={15} aria-hidden="true" />
                  Add Another Product
                </button>
              </div>

            </div>

            {/* ── RIGHT COLUMN — ORDER SUMMARY ────────────── */}
            <div className="sale-right">
              <div className="sale-card sale-summary">

                <div className="card-section-title">
                  <FiShoppingCart size={14} aria-hidden="true" />
                  Order Summary
                </div>

                {/* Line items */}
                <div className="summary-items">
                  {orderLines.length === 0 ? (
                    <p className="summary-empty">No products selected yet.</p>
                  ) : (
                    orderLines.map((line, i) => (
                      <div key={i} className="summary-line">
                        <span className="summary-line-name">{line.name}</span>
                        <span className="summary-line-qty">× {line.quantity}</span>
                        <span className="summary-line-price">
                          ₹{line.subtotal.toLocaleString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="summary-divider" />

                {/* Total */}
                <div className="summary-total-row">
                  <span className="summary-total-label">Total</span>
                  <span className="summary-total-amount">
                    ₹{calculateTotal().toLocaleString()}
                  </span>
                </div>

                {/* Confirm Sale */}
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? "Processing…" : "Confirm Sale"}
                </button>

              </div>
            </div>

          </div>
        </form>
      )}
    </div>
  );
}

export default CreateSale;

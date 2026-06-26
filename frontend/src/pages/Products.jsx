import { useState, useEffect } from "react";
import {
  FiPackage,
  FiSearch,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";
import api from "../services/api";
import "./Products.css";

// ── Constants ─────────────────────────────────────────────────
const emptyForm = {
  name: "",
  category: "",
  purchasePrice: "",
  sellingPrice: "",
  quantity: "",
};

// ── Stock badge variant ────────────────────────────────────────
// >= 20 → green, 10–19 → amber, < 10 → red
const getStockVariant = (qty) => {
  if (qty >= 20) return "success";
  if (qty >= 10) return "warning";
  return "danger";
};

// ── SkeletonRow ────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="skeleton-row" aria-hidden="true">
      <td><div className="skeleton-cell skeleton-cell--wide shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--short shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--tiny shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--actions shimmer" /></td>
    </tr>
  );
}

// ── EmptyState ─────────────────────────────────────────────────
function EmptyState({ hasSearch }) {
  return (
    <div className="empty-state">
      <FiPackage className="empty-icon" size={40} aria-hidden="true" />
      <p className="empty-title">
        {hasSearch ? "No products match your search." : "No products added yet."}
      </p>
      <p className="empty-desc">
        {hasSearch
          ? "Try a different search term or clear the search."
          : "Add your first product using the form above."}
      </p>
    </div>
  );
}

// ── Products ───────────────────────────────────────────────────
function Products() {
  const [products, setProducts]   = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);   // null = add, id = edit
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [formError, setFormError] = useState("");

  // UI-only state additions
  const [search, setSearch]       = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── API calls (unchanged) ──────────────────────────────────
  const fetchProducts = async () => {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (err) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, form);
      } else {
        await api.post("/products", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name:          product.name,
      category:      product.category,
      purchasePrice: product.purchasePrice,
      sellingPrice:  product.sellingPrice,
      quantity:      product.quantity,
    });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      setError("Failed to delete product.");
    }
  };

  // ── Client-side search filter ──────────────────────────────
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="products-page">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="products-header">
        <h1 className="products-title">Products</h1>
        <p className="products-subtitle">
          Manage inventory, pricing and stock levels.
        </p>
      </div>

      {/* ── Add / Edit Form Card ─────────────────────────── */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">
            {editingId ? "Edit Product" : "Add New Product"}
          </h2>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Name + Category */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-name">Product Name</label>
              <input
                id="prod-name"
                className="form-input"
                name="name"
                placeholder="e.g. Wireless Mouse"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-category">Category</label>
              <input
                id="prod-category"
                className="form-input"
                name="category"
                placeholder="e.g. Electronics"
                value={form.category}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Purchase Price + Selling Price + Quantity */}
          <div className="form-row form-row--three">
            <div className="form-group">
              <label className="form-label" htmlFor="prod-purchase">Purchase Price (₹)</label>
              <input
                id="prod-purchase"
                className="form-input"
                name="purchasePrice"
                type="number"
                placeholder="0.00"
                value={form.purchasePrice}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-selling">Selling Price (₹)</label>
              <input
                id="prod-selling"
                className="form-input"
                name="sellingPrice"
                type="number"
                placeholder="0.00"
                value={form.sellingPrice}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="prod-qty">Quantity</label>
              <input
                id="prod-qty"
                className="form-input"
                name="quantity"
                type="number"
                placeholder="0"
                value={form.quantity}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update Product" : "Add Product"}
            </button>
            {editingId && (
              <button className="btn-cancel" type="button" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ── Table Section ────────────────────────────────── */}
      <div className="table-section">

        {/* Search bar */}
        <div className="table-toolbar">
          <div className="search-wrapper">
            <FiSearch className="search-icon" size={15} aria-hidden="true" />
            <input
              className="search-input"
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </div>

        {/* Page-level error */}
        {error && <p className="page-error">{error}</p>}

        {/* Table */}
        <div className="table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    <EmptyState hasSearch={search.length > 0} />
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p._id}>

                    {/* Product */}
                    <td>
                      <div className="product-cell">
                        <FiPackage className="product-icon" size={15} aria-hidden="true" />
                        <span className="product-name">{p.name}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="category-badge">{p.category}</span>
                    </td>

                    {/* Purchase Price */}
                    <td>
                      <span className="price-purchase">₹{p.purchasePrice}</span>
                    </td>

                    {/* Selling Price */}
                    <td>
                      <span className="price-selling">₹{p.sellingPrice}</span>
                    </td>

                    {/* Stock badge */}
                    <td>
                      <span className={`stock-badge stock-badge--${getStockVariant(p.quantity)}`}>
                        {p.quantity}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(p)}
                          aria-label={`Edit ${p.name}`}
                        >
                          <FiEdit2 size={12} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(p._id)}
                          aria-label={`Delete ${p.name}`}
                        >
                          <FiTrash2 size={12} aria-hidden="true" />
                          Delete
                        </button>
                      </div>
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

export default Products;

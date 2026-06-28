import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiEye,
} from "react-icons/fi";
import api from "../services/api";
import "./Customers.css";

// ── Constants ─────────────────────────────────────────────────
const emptyForm = { name: "", phone: "", address: "" };

// ── SkeletonRow ────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="skeleton-row" aria-hidden="true">
      <td><div className="skeleton-cell skeleton-cell--wide shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--medium shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--long shimmer" /></td>
      <td><div className="skeleton-cell skeleton-cell--actions shimmer" /></td>
    </tr>
  );
}

// ── EmptyState ─────────────────────────────────────────────────
function EmptyState({ hasSearch }) {
  return (
    <div className="empty-state">
      <FiUser className="empty-icon" size={40} aria-hidden="true" />
      <p className="empty-title">
        {hasSearch ? "No matching customers found." : "No customers added yet."}
      </p>
      <p className="empty-desc">
        {hasSearch
          ? "Try a different name, phone number, or address."
          : "Add your first customer using the form above."}
      </p>
    </div>
  );
}

// ── Customers ──────────────────────────────────────────────────
function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [form, setForm]           = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);   // null = add, id = edit
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [formError, setFormError] = useState("");

  // UI-only state
  const [search, setSearch]         = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ── API calls (unchanged) ──────────────────────────────────
  const fetchCustomers = async () => {
    try {
      const response = await api.get("/customers");
      setCustomers(response.data);
    } catch (err) {
      setError("Failed to load customers.");
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
        await api.put(`/customers/${editingId}`, form);
      } else {
        await api.post("/customers", form);
      }
      setForm(emptyForm);
      setEditingId(null);
      fetchCustomers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save customer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setForm({ name: customer.name, phone: customer.phone, address: customer.address });
    setFormError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      setError("Failed to delete customer.");
    }
  };

  // ── Client-side search filter ──────────────────────────────
  const filteredCustomers = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
    );
  });

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="customers-page">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="customers-header">
        <h1 className="customers-title">Customers</h1>
        <p className="customers-subtitle">
          Manage customer information for sales and billing.
        </p>
      </div>

      {/* ── Add / Edit Form Card ─────────────────────────── */}
      <div className="form-card">
        <div className="form-card-header">
          <h2 className="form-card-title">
            {editingId ? "Edit Customer" : "Add New Customer"}
          </h2>
        </div>

        {formError && <p className="form-error">{formError}</p>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Name + Phone */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="cust-name">Customer Name</label>
              <input
                id="cust-name"
                className="form-input"
                name="name"
                placeholder="e.g. Rajesh Kumar"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="cust-phone">Phone Number</label>
              <input
                id="cust-phone"
                className="form-input"
                name="phone"
                placeholder="e.g. +91-9876543210"
                value={form.phone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Address (full width) */}
          <div className="form-row form-row--full">
            <div className="form-group">
              <label className="form-label" htmlFor="cust-address">Address</label>
              <input
                id="cust-address"
                className="form-input"
                name="address"
                placeholder="e.g. 42, MG Road, Kolkata, West Bengal"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn-primary" type="submit" disabled={submitting}>
              {submitting ? "Saving…" : editingId ? "Update Customer" : "Add Customer"}
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
              placeholder="Search customers…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search customers"
            />
          </div>
        </div>

        {/* Page-level error */}
        {error && <p className="page-error">{error}</p>}

        {/* Table */}
        <div className="table-container">
          <table className="customers-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="empty-cell">
                    <EmptyState hasSearch={search.length > 0} />
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c._id}>

                    {/* Customer */}
                    <td>
                      <div className="customer-cell">
                        <FiUser className="customer-icon" size={15} aria-hidden="true" />
                        <span className="customer-name">{c.name}</span>
                      </div>
                    </td>

                    {/* Phone */}
                    <td>
                      <span className="phone-text">{c.phone}</span>
                    </td>

                    {/* Address */}
                    <td>
                      <span className="address-text" title={c.address}>
                        {c.address}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="action-cell">
                        <button
                          className="btn-view"
                          onClick={() => navigate(`/customers/${c._id}`)}
                          aria-label={`View ${c.name}`}
                        >
                          <FiEye size={12} aria-hidden="true" />
                          View
                        </button>
                        <button
                          className="btn-edit"
                          onClick={() => handleEdit(c)}
                          aria-label={`Edit ${c.name}`}
                        >
                          <FiEdit2 size={12} aria-hidden="true" />
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(c._id)}
                          aria-label={`Delete ${c.name}`}
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

export default Customers;

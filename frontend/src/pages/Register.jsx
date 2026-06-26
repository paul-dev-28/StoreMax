import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiPackage, FiUser, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import api from "../services/api";
import "./Register.css";

function Register() {
  const navigate = useNavigate();

  // Form field state — name is the only addition over Login
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();   // prevent page refresh on form submit
    setError("");          // clear any previous error
    setLoading(true);

    try {
      const response = await api.post("/auth/register", { name, email, password });

      // Server returns: { message, token, user: { id, name, email } }
      const { token } = response.data;

      // Save token so the Axios interceptor attaches it to all future requests
      localStorage.setItem("token", token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Axios puts the server's error response in err.response.data
      const message = err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">

        {/* ── Brand ─────────────────────────────────────── */}
        <div className="register-brand">
          <div className="brand-icon-wrapper">
            <FiPackage size={24} aria-hidden="true" />
          </div>
          <h1 className="register-app-name">StoreMax</h1>
          <p className="register-tagline">Create an account to get started.</p>
        </div>

        {/* ── Error Alert ───────────────────────────────── */}
        {error && (
          <div className="register-error" role="alert">
            <FiAlertCircle size={16} aria-hidden="true" />
            {error}
          </div>
        )}

        {/* ── Form ──────────────────────────────────────── */}
        <form className="register-form" onSubmit={handleRegister} noValidate>

          {/* Name */}
          <div className="form-field">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <div className="input-wrapper">
              <FiUser className="input-icon" size={16} aria-hidden="true" />
              <input
                id="reg-name"
                className="register-input"
                type="text"
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </div>

          {/* Email */}
          <div className="form-field">
            <label className="form-label" htmlFor="reg-email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" size={16} aria-hidden="true" />
              <input
                id="reg-email"
                className="register-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" size={16} aria-hidden="true" />
              <input
                id="reg-password"
                className="register-input"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button
            className="register-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating Account…" : "Create Account"}
          </button>

        </form>

        {/* ── Footer ────────────────────────────────────── */}
        <p className="register-footer">
          Already have an account?{" "}
          <Link to="/login" className="register-link">Sign In</Link>
        </p>

      </div>

      {/* ── Copyright ─────────────────────────────────── */}
      <p className="register-copyright">
        StoreMax &copy; 2026
      </p>
    </div>
  );
}

export default Register;

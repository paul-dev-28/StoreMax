import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiPackage, FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import api from "../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  // Form field state
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  // UI state
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();   // prevent page refresh on form submit
    setError("");          // clear any previous error
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      // Server returns: { message, token, user: { id, name, email } }
      const { token } = response.data;

      // Save token so the Axios interceptor can attach it to future requests
      localStorage.setItem("token", token);

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      // Axios puts the server's error response in err.response.data
      const message = err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* ── Brand ─────────────────────────────────────── */}
        <div className="login-brand">
          <div className="brand-icon-wrapper">
            <FiPackage size={24} aria-hidden="true" />
          </div>
          <h1 className="login-app-name">StoreMax</h1>
          <p className="login-tagline">Sign in to manage inventory and sales.</p>
        </div>

        {/* ── Error Alert ───────────────────────────────── */}
        {error && (
          <div className="login-error" role="alert">
            <FiAlertCircle size={16} aria-hidden="true" />
            {error}
          </div>
        )}

        {/* ── Form ──────────────────────────────────────── */}
        <form className="login-form" onSubmit={handleLogin} noValidate>

          <div className="form-field">
            <label className="form-label" htmlFor="login-email">Email</label>
            <div className="input-wrapper">
              <FiMail className="input-icon" size={16} aria-hidden="true" />
              <input
                id="login-email"
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="login-password">Password</label>
            <div className="input-wrapper">
              <FiLock className="input-icon" size={16} aria-hidden="true" />
              <input
                id="login-password"
                className="login-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            className="login-btn"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

        </form>

        {/* ── Footer ────────────────────────────────────── */}
        <p className="login-footer">
          Don't have an account?{" "}
          <Link to="/register" className="login-link">Register</Link>
        </p>

      </div>

      {/* ── Copyright ─────────────────────────────────── */}
      <p className="login-copyright">
        StoreMax &copy; 2026
      </p>
    </div>
  );
}

export default Login;

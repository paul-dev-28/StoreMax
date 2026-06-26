import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navbar.css";

// Declared outside component — no re-creation on every render
const NAV_LINKS = [
  { to: "/dashboard",   label: "Home"   },
  { to: "/products",    label: "Products"    },
  { to: "/customers",   label: "Customers"   },
  { to: "/create-sale", label: "Create Sale" },
];

function Navbar() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">

        {/* ── Brand ─────────────────────────────────────────── */}
        <Link to="/dashboard" className="navbar-brand">
          {/* Package / cube icon — represents inventory */}
          <svg
            className="brand-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span className="brand-name">StoreMax</span>
        </Link>

        {/* ── Navigation Links ──────────────────────────────── */}
        <div className="navbar-links">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`nav-link${location.pathname === to ? " nav-link--active" : ""}`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Logout ────────────────────────────────────────── */}
        <div className="navbar-actions">
          <button
            className="logout-btn"
            onClick={handleLogout}
            aria-label="Log out of your account"
          >
            Logout
          </button>
        </div>

      </div>
    </nav>
  );
}

export default Navbar;

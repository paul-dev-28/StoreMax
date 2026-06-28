import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import "./App.css";

// Page imports
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import CreateSale from "./pages/CreateSale";
import CustomerDetail from "./pages/CustomerDetail";

// Shared layout for all protected pages.
// Eliminates the repeated <Navbar /> + wrapper pattern across every route.
// ProtectedRoute still guards every page — nothing changes for auth.
function AppLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ─────────────────────────────────────── */}
        {/* Login/Register own their full-screen centered layout     */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected Routes ──────────────────────────────────── */}
        {/* AppLayout supplies the Navbar + #F8FAFC shell.           */}
        {/* All route paths, components, and auth logic are unchanged */}
        <Route path="/dashboard"       element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/products"        element={<AppLayout><Products /></AppLayout>} />
        <Route path="/customers"       element={<AppLayout><Customers /></AppLayout>} />
        <Route path="/customers/:id"   element={<AppLayout><CustomerDetail /></AppLayout>} />
        <Route path="/create-sale"     element={<AppLayout><CreateSale /></AppLayout>} />

        {/* Default: redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

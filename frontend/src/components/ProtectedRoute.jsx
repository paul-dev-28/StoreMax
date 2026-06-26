import { Navigate } from "react-router-dom";

// Wraps any route that requires authentication
// Usage: <ProtectedRoute><Dashboard /></ProtectedRoute>
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // No token means user is not logged in — send them to login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Token exists — render the actual page component
  return children;
}

export default ProtectedRoute;

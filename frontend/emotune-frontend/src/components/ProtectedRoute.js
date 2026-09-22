
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  let parsedUser = null;

  try {
    parsedUser = JSON.parse(user);
  } catch (err) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }

  if (!parsedUser.id || isNaN(parsedUser.id)) {
    localStorage.clear();
    return <Navigate to="/login" replace />;
  }
  return children;
}

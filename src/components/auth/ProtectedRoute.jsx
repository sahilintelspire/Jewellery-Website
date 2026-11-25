import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, reason = 'Please sign in or create an account to continue.' }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/auth"
        replace
        state={{
          from: `${location.pathname}${location.search}`,
          reason,
        }}
      />
    );
  }

  return children;
}

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole } = useStore();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute; 
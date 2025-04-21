import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole, token } = useStore();

  console.log('ProtectedRoute Debug:', {
    isLoggedIn,
    userRole,
    allowedRoles,
    hasToken: !!token,
    localStorageRole: localStorage.getItem('userRole'),
    localStorageToken: localStorage.getItem('token')
  });

  if (!isLoggedIn) {
    console.log('Redirecting to login - not logged in');
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    console.log('Redirecting to unauthorized - role mismatch:', {
      userRole,
      allowedRoles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;

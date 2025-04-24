import React from 'react';
import { useNavigate } from 'react-router';
import { getInitials } from './getNameInitials.js';
import { FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

const SystemNavbar = ({ user }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  // Ensure user data is available
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'System Admin';
  const initial = getInitials(fullName);

  return (
    <div className="fixed top-0 left-0 right-0 flex items-center justify-between h-14 bg-gradient-to-r from-indigo-600 to-indigo-800 px-6 text-white z-50 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 shadow-md">
          <FaUserCircle className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-indigo-100">Welcome back,</p>
          <p className="text-lg font-semibold">{fullName}</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-500 shadow-md font-semibold">
          {initial}
        </div>
        <button
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-400 rounded-lg transition-colors duration-200 shadow-md"
          onClick={onLogout}
        >
          <FaSignOutAlt className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default SystemNavbar;

import React from 'react';
import { useNavigate } from 'react-router';
import { getInitials } from './getNameInitials.js';

const SystemNavbar = ({ user }) => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  

  // Ensure user data is available
  const fullName = user ? `${user.firstName} ${user.lastName}` : 'System Admin';
  const initial = getInitials(fullName); // Get initials based on user's full name

  return (
    <div className='fixed top-0 left-0 right-0 flex items-center justify-between h-12 bg-teal-600 px-5 text-white z-10'>
      <p>Welcome, {fullName}</p>
      <div className='flex justify-between'>
        <p className='w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center font-bold text-black'>
          {initial}
        </p>
        <button className='px-4 py-1 bg-teal-700 hover:bg-teal-800 ml-8' onClick={onLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

export default SystemNavbar;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import AuthModal from './AuthModal';
import { FaShoppingCart, FaUser, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
  const { isLoggedIn, userRole, logout } = useStore();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const handleAuthClick = () => {
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-blue-600">
                FoodHub
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  {userRole === 'Customer' && (
                    <Link
                      to="/cart"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaShoppingCart size={20} />
                    </Link>
                  )}
                  {userRole === 'Catering Manager' && (
                    <Link
                      to="/manager"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <FaUser size={20} />
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <FaSignOutAlt size={20} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Navbar; 
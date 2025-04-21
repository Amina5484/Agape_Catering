import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaShoppingBag,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaMoon,
  FaSun,
  FaHistory,
  FaClipboardList,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const {
    token,
    setToken,
    darkMode,
    toggleDarkMode,
    user,
    resetLoginState,
    logout: contextLogout,
    isLoggedIn,
    userRole,
  } = useContext(StoreContext);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  // Listen for login state changes
  useEffect(() => {
    // Close dropdowns when login state changes
    setIsProfileOpen(false);
    setIsOpen(false);
  }, [isLoggedIn, token]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const logout = () => {
    // Use the context logout function which properly clears all state
    contextLogout();
    setIsProfileOpen(false);
    setIsOpen(false);
    // Navigate to home page
    navigate('/');
  };

  const handleLoginClick = () => {
    // Reset login state before showing login form
    resetLoginState();
    setShowLogin(true);
    // Close any open menus
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  // Check if user is logged in and is a customer
  const isCustomerLoggedIn = isLoggedIn && userRole === 'Customer';

  // Debug log to help track state
  useEffect(() => {
    console.log('Login state:', { isLoggedIn, userRole, isCustomerLoggedIn });
  }, [isLoggedIn, userRole, isCustomerLoggedIn]);

  return (
    <div className="p-2 flex items-center bg-white dark:bg-gray-900 dark:text-white shadow-md fixed top-0 left-0 w-full z-10 transition-colors duration-300">
      <div className="flex-1 flex justify-start">
        <Link to="/">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-12 h-6 sm:w-16 sm:h-8 md:w-20 md:h-10"
          />
        </Link>
      </div>

      <div className="sm:hidden flex items-center space-x-3">
        <FaSearch
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:text-gray-400"
          title="Search"
        />
        <Link to="/cart">
          <FaShoppingCart
            className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:text-gray-400"
            title="Cart"
          />
        </Link>
        <FaBars
          className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
          title="Menu"
        />
      </div>

      <div className="hidden sm:flex flex-1 justify-end px-4 sm:px-8 md:px-16">
        <ul className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 text-xs sm:text-sm md:text-base font-medium text-black dark:text-white">
          <Link to="/" className="cursor-pointer hover:text-gray-400">
            Home
          </Link>
          <Link to="/menu" className="cursor-pointer hover:text-gray-400">
            Menu
          </Link>
          <Link to="/categories" className="cursor-pointer hover:text-gray-400">
            Category
          </Link>
          <Link to="/cart">
            <FaShoppingCart
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-gray-400"
              title="Cart"
            />
          </Link>
          <FaSearch
            className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer hover:text-gray-400"
            title="Search"
          />
          <Link to="/feedback" className="cursor-pointer hover:text-gray-400">
            Feedback
          </Link>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? (
              <FaSun className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            ) : (
              <FaMoon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-300" />
            )}
          </button>

          {/* User Profile Dropdown */}
          {isCustomerLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/customer/orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaClipboardList className="mr-2" />
                    Order Status
                  </Link>
                  <Link
                    to="/customer/order-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaHistory className="mr-2" />
                    Order History
                  </Link>
                  <Link
                    to="/customer/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaCog className="mr-2" />
                    Manage Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-blue-500 rounded text-white px-3 py-1 text-xs sm:text-sm hover:bg-blue-600 transition"
              onClick={handleLoginClick}
            >
              Login/Sign Up
            </button>
          )}
        </ul>
      </div>

      {isOpen && (
        <div className="absolute top-12 sm:top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-lg p-3 sm:p-4 sm:hidden transition-colors duration-300">
          <ul className="flex flex-col space-y-3 sm:space-y-4 text-center text-black dark:text-white">
            <li className="cursor-pointer hover:text-gray-400">
              <Link to="/">Home</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-400">
              <Link to="/menu">Menu</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-400">
              <Link to="/categories">Category</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-400">
              <Link to="/feedback">Feedback</Link>
            </li>
            <li className="cursor-pointer hover:text-gray-400">
              <button
                onClick={toggleDarkMode}
                className="flex items-center justify-center w-full py-2"
              >
                {darkMode ? (
                  <>
                    <FaSun className="mr-2 text-yellow-500" />
                    <span>Light Mode</span>
                  </>
                ) : (
                  <>
                    <FaMoon className="mr-2 text-gray-600 dark:text-gray-300" />
                    <span>Dark Mode</span>
                  </>
                )}
              </button>
            </li>
            {!isCustomerLoggedIn ? (
              <button
                className="bg-blue-500 rounded text-white px-4 py-1 text-sm hover:bg-blue-600 transition"
                onClick={handleLoginClick}
              >
                Login/Sign Up
              </button>
            ) : (
              <>
                <li className="cursor-pointer hover:text-gray-400">
                  <Link to="/customer/orders">Order Status</Link>
                </li>
                <li className="cursor-pointer hover:text-gray-400">
                  <Link to="/customer/order-history">Order History</Link>
                </li>
                <li className="cursor-pointer hover:text-gray-400">
                  <Link to="/customer/profile">Manage Profile</Link>
                </li>
                <li
                  onClick={logout}
                  className="cursor-pointer hover:text-gray-400 text-red-600 dark:text-red-400"
                >
                  Logout
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;

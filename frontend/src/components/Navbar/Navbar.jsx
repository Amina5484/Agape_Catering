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
    <div className="p-2 flex items-center bg-white dark:bg-gray-900 dark:text-white shadow-md fixed top-0 left-0 w-full z-10 transition-colors">
      <div className="flex-1 flex justify-start">
        <Link to="/">
          <img
            src={assets.logo}
            alt="Logo"
            className="w-16 h-8 sm:w-20 sm:h-10"
          />
        </Link>
      </div>

      <div className="sm:hidden flex items-center space-x-4">
        <FaSearch
          className="w-6 h-6 cursor-pointer hover:text-gray-400"
          title="Search"
        />
        <Link to="/cart">
          <FaShoppingCart
            className="w-6 h-6 cursor-pointer hover:text-gray-400"
            title="Cart"
          />
        </Link>
        <FaBars
          className="w-6 h-6 cursor-pointer hover:text-gray-400"
          onClick={() => setIsOpen(!isOpen)}
          title="Menu"
        />
      </div>

      <div className="hidden sm:flex flex-1 justify-end px-4 sm:px-16">
        <ul className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-md font-medium text-black dark:text-white">
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
              className="w-5 h-5 cursor-pointer hover:text-gray-400"
              title="Cart"
            />
          </Link>
          <FaSearch
            className="w-5 h-5 cursor-pointer hover:text-gray-400"
            title="Search"
          />
          <Link to="/feedback" className="cursor-pointer hover:text-gray-400">
            Feedback
          </Link>

          {!isCustomerLoggedIn ? (
            <button
              onClick={handleLoginClick}
              className="bg-blue-500 rounded-full text-white px-6 py-2 hover:bg-blue-600 transition duration-300"
            >
              Login/Sign Up
            </button>
          ) : (
            <div className="relative flex items-center" ref={profileRef}>
              <div onClick={() => setIsProfileOpen(!isProfileOpen)}>
                <FaUser className="w-7 h-7 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" />
                {isProfileOpen && (
                  <ul className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg py-2 border border-gray-200 dark:border-gray-700">
                    <li
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        navigate('/customer/orders');
                        setIsProfileOpen(false);
                      }}
                    >
                      <FaShoppingBag className="mr-2" />
                      Order
                    </li>
                    <li
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        navigate('/customer/orders');
                        setIsProfileOpen(false);
                      }}
                    >
                      <FaShoppingBag className="mr-2" />
                      Order History
                    </li>
                    <li
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => {
                        navigate('/customer/profile');
                        setIsProfileOpen(false);
                      }}
                    >
                      <FaCog className="mr-2" />
                      Manage Profile
                    </li>
                    <li
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-red-600 dark:text-red-400"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </li>
                  </ul>
                )}
              </div>

              <button
                onClick={toggleDarkMode}
                className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? (
                  <FaSun className="text-yellow-500 w-6 h-6" />
                ) : (
                  <FaMoon className="text-gray-600 w-6 h-6" />
                )}
              </button>
            </div>
          )}
        </ul>
      </div>

      {isOpen && (
        <div className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-lg p-4 sm:hidden">
          <ul className="flex flex-col space-y-4 text-center text-black dark:text-white">
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
            {!isCustomerLoggedIn ? (
              <button
                className="bg-blue-500 rounded text-white px-4 py-1 hover:text-gray-400 transition"
                onClick={handleLoginClick}
              >
                Login/Sign Up
              </button>
            ) : (
              <li
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="cursor-pointer hover:text-gray-400 text-red-600 dark:text-red-400"
              >
                Logout
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Navbar;

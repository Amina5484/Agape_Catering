import React, { useContext, useState, useRef, useEffect } from 'react';
import { assets } from '../../assets/assets';
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaShoppingBag,
  FaSignOutAlt,
  FaUser,
  FaHistory,
  FaClipboardList,
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';

const Navbar = ({ setShowLogin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const {
    token,
    setToken,
    user,
    resetLoginState,
    logout: contextLogout,
    isLoggedIn,
    userRole,
  } = useContext(StoreContext);
  const profileRef = useRef(null);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsProfileOpen(false);
    setIsOpen(false);
  }, [isLoggedIn, token]);

  const logout = () => {
    contextLogout();
    setIsProfileOpen(false);
    setIsOpen(false);
    navigate('/');
  };

  const handleLoginClick = () => {
    resetLoginState();
    setShowLogin(true);
    setIsOpen(false);
    setIsProfileOpen(false);
  };

  const isCustomerLoggedIn = isLoggedIn && userRole === 'Customer';

  return (
    <div className="p-2 flex items-center bg-white text-black shadow-md fixed top-0 left-0 w-full z-10 transition-colors duration-300">
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
        <div className="relative flex items-center">
          <FaSearch
            className="w-5 h-5 sm:w-6 sm:h-6 cursor-pointer hover:text-gray-400"
            title="Search"
            onClick={() => setShowSearch(!showSearch)}
          />
          {showSearch && (
            <div className="absolute left-0 top-0 -translate-x-full w-48 bg-white rounded-lg shadow-lg p-2">
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <button
                  type="submit"
                  className="ml-2 p-2 text-orange-500 hover:text-orange-600"
                >
                  <FaSearch size={16} />
                </button>
              </form>
            </div>
          )}
        </div>
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
        <ul className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 text-xs sm:text-sm md:text-base font-medium">
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
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer text-orange-500 hover:text-gray-400"
              title="Cart"
            />
          </Link>
          <div className="relative flex items-center">
            <FaSearch
              className="w-4 h-4 sm:w-5 sm:h-5 cursor-pointer text-orange-500 hover:text-gray-400"
              title="Search"
              onClick={() => setShowSearch(!showSearch)}
            />
            {showSearch && (
              <div className="absolute left-0 top-0 -translate-x-full w-48 bg-white rounded-lg shadow-lg p-2">
                <form onSubmit={handleSearch} className="flex items-center">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full px-3 py-2 text-sm bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="ml-2 p-2 text-orange-500 hover:text-orange-600"
                  >
                    <FaSearch size={16} />
                  </button>
                </form>
              </div>
            )}
          </div>
          <Link
            to="/feedback"
            className="cursor-pointer text-gray-800 hover:text-orange-500 transition-colors duration-200"
          >
            Feedback
          </Link>

          {/* User Profile Dropdown */}
          {isCustomerLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <FaUser className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                  <Link
                    to="/customer/orders"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaClipboardList className="mr-2" />
                    Order Status
                  </Link>
                  <Link
                    to="/customer/order-history"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaHistory className="mr-2" />
                    Order History
                  </Link>
                  <Link
                    to="/customer/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaUser className="mr-2" />
                    Manage Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    <FaSignOutAlt className="mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="bg-orange-500 rounded text-white px-3 py-1 text-xs sm:text-sm hover:bg-orange-200 transition"
              onClick={handleLoginClick}
            >
              Login/Sign Up
            </button>
          )}
        </ul>
      </div>

      {isOpen && (
        <div className="absolute top-12 sm:top-14 left-0 w-full bg-white shadow-lg p-3 sm:p-4 sm:hidden transition-colors duration-300">
          <ul className="flex flex-col space-y-3 sm:space-y-4 text-center text-black">
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
                  className="cursor-pointer hover:text-gray-400 text-red-600"
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

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { useStore } from '../../context/StoreContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  HiMenu,
  HiMoon,
  HiSun,
  HiUser,
  HiLogout,
  HiChevronDown,
  HiCog,
  HiShieldCheck,
  HiClock,
  HiUserCircle
} from 'react-icons/hi';

const ManagerNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode: isDarkMode, toggleDarkMode, logout } = useStore();
  const {
    sidebarVisible,
    toggleSidebar,
    toggleMobileMenu,
    shouldShowHamburger,
    hasClickedCard,
    hideSidebar,
    isMobileView
  } = useSidebar();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Custom sidebar hide handler that also navigates
  const handleHideSidebar = () => {
    hideSidebar();
    // If we're not already on the home page, navigate there
    if (location.pathname !== '/manager') {
      navigate('/manager');
    }
  };

  // Toggle handler that considers current state
  const handleToggleSidebar = () => {
    if (sidebarVisible) {
      handleHideSidebar();
    } else {
      toggleSidebar();
    }
  }

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300
        ${isDarkMode
          ? 'bg-gradient-royal text-white'
          : 'bg-gradient-royal text-white'
        } shadow-md`}
    >
      <div className="px-4 md:px-6 py-3 flex items-center justify-between">
        {/* Left Side - Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-3">
            <img
              src={assets.logo}
              alt="Agape Catering"
              className="h-8"
            />
            <div className="hidden md:flex flex-col">
              <span className="font-semibold text-white text-lg">Agape Catering</span>
              <span className="text-xs text-blue-100">{getGreeting()}, Manager</span>
            </div>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center space-x-3 md:space-x-4">
          {/* Current Time - Desktop Only */}
          <div className="hidden md:flex items-center pr-2">
            <HiClock className="w-4 h-4 text-blue-100 mr-1" />
            <span className="text-sm text-blue-100">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-royal-600/30 hover:bg-royal-600/50 text-white transition-colors duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <HiSun className="w-5 h-5" />
            ) : (
              <HiMoon className="w-5 h-5" />
            )}
          </button>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className="flex items-center space-x-1 py-1 px-2 rounded-lg bg-royal-600/30 hover:bg-royal-600/50 transition-colors duration-200"
            >
              <HiUserCircle className="w-8 h-8 text-white" />
              <span className="hidden md:inline-block text-sm font-medium text-white">Manager</span>
              <HiChevronDown className={`w-4 h-4 text-white transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileMenuOpen && (
              <div
                className={`absolute right-0 mt-2 w-60 py-2 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out
                  ${isDarkMode
                    ? 'bg-gray-800 border border-gray-700'
                    : 'bg-white border border-misty'
                  } animate-fadeIn`}
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <HiUserCircle className="w-10 h-10 text-royal" />
                    <div>
                      <p className="text-sm font-semibold text-charcoal dark:text-white">Manager Account</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">manager@agapecatering.com</p>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                      navigate('/manager/profile');
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left
                      ${isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-cloud'
                      }`}
                  >
                    <HiCog className="w-4 h-4 mr-3 text-royal" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setProfileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left
                      ${isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-cloud'
                      }`}
                  >
                    <HiShieldCheck className="w-4 h-4 mr-3 text-emerald" />
                    <span>Privacy Settings</span>
                  </button>

                  <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

                  <button
                    onClick={handleLogout}
                    className={`flex items-center w-full px-4 py-2 text-sm text-left text-crimson
                      ${isDarkMode
                        ? 'hover:bg-gray-700'
                        : 'hover:bg-cloud'
                      }`}
                  >
                    <HiLogout className="w-4 h-4 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Hamburger Menu - Now on the right side */}
          {(shouldShowHamburger || hasClickedCard) && (
            <button
              onClick={shouldShowHamburger ? toggleMobileMenu : handleToggleSidebar}
              className="p-2 rounded-full bg-royal-600/30 hover:bg-royal-600/50 text-white transition-colors duration-200"
              aria-label="Toggle menu"
            >
              <HiMenu className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default ManagerNavbar;
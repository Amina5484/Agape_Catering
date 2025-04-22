import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useStore } from '../../context/StoreContext';
import { HiMenu, HiMoon, HiSun, HiUser, HiLogout, HiChevronDown } from 'react-icons/hi';
import { assets } from '../../assets/assets';

const Navbar = () => {
    const navigate = useNavigate();
    const { sidebarVisible, toggleSidebar, toggleMobileMenu } = useSidebar();
    const { darkMode, toggleDarkMode, logout } = useStore();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);

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

    // Handle profile menu toggle
    const toggleProfileMenu = () => {
        setProfileMenuOpen(!profileMenuOpen);
    };

    // Handle logout
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300
        ${darkMode
                    ? 'bg-gray-900 text-white border-b border-gray-700'
                    : 'bg-white text-gray-800 border-b border-gray-200'
                } shadow-sm`}
        >
            <div className="px-4 md:px-6 py-2 flex items-center justify-between">
                {/* Left Side - Logo & Menu Button */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={sidebarVisible ? toggleSidebar : toggleMobileMenu}
                        className={`p-2 rounded-full transition-colors
              ${darkMode
                                ? 'hover:bg-gray-700'
                                : 'hover:bg-gray-100'
                            }`}
                        aria-label="Toggle menu"
                    >
                        <HiMenu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center space-x-3">
                        <img
                            src={assets.logo}
                            alt="Agape Catering"
                            className="h-8"
                        />
                        <span className="text-lg font-semibold hidden md:inline-block">Agape Catering</span>
                    </div>
                </div>

                {/* Right Side - Actions */}
                <div className="flex items-center space-x-2 md:space-x-4">
                    {/* Dark Mode Toggle */}
                    <button
                        onClick={toggleDarkMode}
                        className={`p-2 rounded-full transition-colors
              ${darkMode
                                ? 'hover:bg-gray-700 text-yellow-400'
                                : 'hover:bg-gray-100 text-gray-600'
                            }`}
                        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {darkMode ? (
                            <HiSun className="w-5 h-5" />
                        ) : (
                            <HiMoon className="w-5 h-5" />
                        )}
                    </button>

                    {/* Profile Menu */}
                    <div className="relative" ref={profileMenuRef}>
                        <button
                            onClick={toggleProfileMenu}
                            className={`flex items-center space-x-1 py-1 px-2 rounded-lg transition-colors
                ${darkMode
                                    ? 'hover:bg-gray-800'
                                    : 'hover:bg-gray-100'
                                }`}
                        >
                            <img
                                src={assets.manager_profile || '/default-avatar.png'}
                                alt="Profile"
                                className="w-8 h-8 rounded-full object-cover border-2 border-indigo-500"
                            />
                            <span className="hidden md:inline-block text-sm font-medium">Manager</span>
                            <HiChevronDown className={`w-4 h-4 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {profileMenuOpen && (
                            <div
                                className={`absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg 
                  ${darkMode
                                        ? 'bg-gray-800 border border-gray-700'
                                        : 'bg-white border border-gray-200'
                                    }`}
                            >
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold">Manager Account</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">manager@agapecatering.com</p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            navigate('/manager/profile');
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm text-left
                      ${darkMode
                                                ? 'hover:bg-gray-700'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <HiUser className="w-4 h-4 mr-3" />
                                        <span>Profile</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setProfileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        className={`flex items-center w-full px-4 py-2 text-sm text-left text-red-600
                      ${darkMode
                                                ? 'hover:bg-gray-700'
                                                : 'hover:bg-gray-100'
                                            }`}
                                    >
                                        <HiLogout className="w-4 h-4 mr-3" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 
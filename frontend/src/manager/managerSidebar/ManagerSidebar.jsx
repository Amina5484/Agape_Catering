import React, { useEffect } from 'react';
import {
  HiTemplate,
  HiOutlineTag,
  HiClipboardList,
  HiShoppingCart,
  HiCalendar,
  HiChartBar,
  HiChatAlt2,
  HiUser,
  HiHome,
  HiX,
  HiChevronRight,
  HiQuestionMarkCircle
} from 'react-icons/hi';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useStore } from '../../context/StoreContext';
import ManagerNavbar from '../managerNavbar/Navbar';

// Function to get sidebar icon color based on active state
const getIconColorClass = (isActive, isDarkMode) => {
  if (isActive) return 'text-white';
  return isDarkMode ? 'text-gray-400 group-hover:text-white' : 'text-gray-500 group-hover:text-royal';
};

const ManagerSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode: isDarkMode } = useStore();
  const {
    sidebarVisible,
    hideSidebar,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isMobileView,
    shouldShowHamburger,
    hasClickedCard
  } = useSidebar();

  // Custom sidebar hide handler that also navigates
  const handleHideSidebar = () => {
    hideSidebar();
    // If we're not already on the home page, navigate there
    if (location.pathname !== '/manager') {
      navigate('/manager');
    }
  };

  // Close mobile menu when window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobileMenuOpen]);

  // Navigation items for the sidebar
  const navItems = [
    { path: '/manager', name: 'Dashboard', icon: <HiHome className="w-5 h-5" /> },
    { path: '/manager/menu', name: 'Menu Management', icon: <HiTemplate className="w-5 h-5" /> },
    { path: '/manager/categories', name: 'Categories', icon: <HiOutlineTag className="w-5 h-5" /> },
    { path: '/manager/orders', name: 'Orders', icon: <HiClipboardList className="w-5 h-5" /> },
    { path: '/manager/stock', name: 'Inventory', icon: <HiShoppingCart className="w-5 h-5" /> },
    { path: '/manager/schedule', name: 'Schedule', icon: <HiCalendar className="w-5 h-5" /> },
    { path: '/manager/generate-report', name: 'Reports', icon: <HiChartBar className="w-5 h-5" /> },
    { path: '/manager/feedback', name: 'Feedback', icon: <HiChatAlt2 className="w-5 h-5" /> },
    { path: '/manager/profile', name: 'Profile', icon: <HiUser className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-cloud text-charcoal'}`}>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden"
          onClick={handleHideSidebar}
        />
      )}

      {/* Sidebar - position depends on viewport */}
      <div
        className={`fixed inset-y-0 z-30 w-72 transform transition-transform duration-300 ease-in-out
          ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-charcoal'} 
          ${isMobileView
            ? 'right-0' + (sidebarVisible ? ' translate-x-0 sidebar-appear-right' : ' translate-x-full')
            : 'left-0' + (sidebarVisible ? ' translate-x-0 sidebar-appear' : ' -translate-x-full')
          } 
          border-r ${isDarkMode ? 'border-gray-700' : 'border-misty'} 
          pt-20 shadow-lg overflow-y-auto h-screen`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="px-4 py-4 border-b mb-4 border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-charcoal'}`}>
              Manager Portal
            </h2>
            <button
              className={`p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200`}
              onClick={handleHideSidebar}
            >
              <HiX className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2">
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Management
            </h3>
            <div className="space-y-1 mb-8">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/manager'}
                  className={({ isActive }) => `
                    group flex items-center justify-between px-4 py-3 rounded-lg transition-colors duration-200 ease-in-out
                    ${isActive
                      ? isDarkMode
                        ? 'bg-gradient-royal text-white'
                        : 'bg-gradient-royal text-white'
                      : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-charcoal hover:bg-cloud'
                    }
                  `}
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsMobileMenuOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center">
                    <span className={`mr-3 ${getIconColorClass(location.pathname === item.path ||
                      (item.path !== '/manager' && location.pathname.startsWith(item.path)), isDarkMode)}`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <HiChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${getIconColorClass(location.pathname === item.path ||
                    (item.path !== '/manager' && location.pathname.startsWith(item.path)), isDarkMode)
                    }`} />
                </NavLink>
              ))}
            </div>

            {/* Additional Section */}
            <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Help & Resources
            </h3>
            <div className="space-y-1">
              <div className="px-4 py-3 rounded-lg bg-emerald/10 dark:bg-emerald/20 cursor-pointer transition-colors hover:bg-emerald/20 dark:hover:bg-emerald/30 flex items-center">
                <HiQuestionMarkCircle className="w-5 h-5 text-emerald mr-3" />
                <div>
                  <h4 className="font-medium text-charcoal dark:text-white">Need Assistance?</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Contact support for help</p>
                </div>
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>© Agape Catering 2023</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 
        ${sidebarVisible && !isMobileView ? 'pl-0 md:pl-72' : 'pl-0'}`}>
        <ManagerNavbar />
        <div className={`p-4 md:p-8 pt-20 ${isDarkMode ? 'bg-gray-900' : 'bg-cloud'} min-h-screen transition-colors duration-300`}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;

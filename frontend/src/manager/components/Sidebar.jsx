import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';
import { useStore } from '../../context/StoreContext';
import {
  HiHome,
  HiMenu,
  HiTemplate,
  HiClipboardList,
  HiShoppingCart,
  HiCalendar,
  HiChartBar,
  HiChatAlt2,
  HiUser,
  HiX,
  HiOutlineTag,
} from 'react-icons/hi';

const Sidebar = () => {
  const { sidebarVisible, hideSidebar, isMobileMenuOpen, setIsMobileMenuOpen } =
    useSidebar();
  const { isDarkMode } = useStore();

  // Close mobile menu when sidebar is hidden
  useEffect(() => {
    if (!sidebarVisible) {
      setIsMobileMenuOpen(false);
    }
  }, [sidebarVisible, setIsMobileMenuOpen]);

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

  // Define navigation items
  const navItems = [
    {
      path: '/manager',
      name: 'Dashboard',
      icon: <HiHome className="w-5 h-5" />,
    },
    {
      path: '/manager/menu',
      name: 'Menu Management',
      icon: <HiTemplate className="w-5 h-5" />,
    },
    {
      path: '/manager/categories',
      name: 'Categories',
      icon: <HiOutlineTag className="w-5 h-5" />,
    },
    {
      path: '/manager/orders',
      name: 'Orders',
      icon: <HiClipboardList className="w-5 h-5" />,
    },
    {
      path: '/manager/stock',
      name: 'Inventory',
      icon: <HiShoppingCart className="w-5 h-5" />,
    },
    {
      path: '/manager/generate-report',
      name: 'Reports',
      icon: <HiChartBar className="w-5 h-5" />,
    },
    {
      path: '/manager/feedback',
      name: 'Feedback',
      icon: <HiChatAlt2 className="w-5 h-5" />,
    },
    {
      path: '/manager/profile',
      name: 'Profile',
      icon: <HiUser className="w-5 h-5" />,
    },
  ];

  // If the sidebar is not visible, don't render it
  if (!sidebarVisible && !isMobileMenuOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-20 md:hidden"
          onClick={hideSidebar}
        />
      )}

      {/* Sidebar container */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
          ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} 
          ${
            isMobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          } 
          border-r ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} 
          pt-16 md:pt-20 shadow-lg overflow-y-auto`}
      >
        <div className="px-4 py-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Manager Portal</h2>
            <button
              className="p-2 rounded-full md:hidden hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={hideSidebar}
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/manager'}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 rounded-lg transition-colors duration-150 ease-in-out
                  ${
                    isActive
                      ? isDarkMode
                        ? 'bg-indigo-700 text-white'
                        : 'bg-indigo-50 text-indigo-700'
                      : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800'
                      : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 768) {
                    setIsMobileMenuOpen(false);
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

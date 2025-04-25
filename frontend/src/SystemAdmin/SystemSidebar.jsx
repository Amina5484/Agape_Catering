import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { FaUserCircle, FaPlus, FaListUl, FaCog, FaUsers, FaHome, FaTimes } from "react-icons/fa";
import SystemNavbar from './SystemNavbar';
import { useSidebar } from '../context/SidebarContext';

const SystemSidebar = ({ user }) => {
  const location = useLocation();
  const { sidebarVisible, toggleSidebar, isMobileView } = useSidebar();

  // Check if we're on the home page
  const isHomePage = location.pathname === '/admin';

  return (
    <div className="flex min-h-screen">
      <SystemNavbar user={user} />

      {/* Sidebar - Only show if not on home page or if mobile menu is open */}
      {(!isHomePage || sidebarVisible) && (
        <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${isMobileView
          ? sidebarVisible
            ? 'translate-x-0'
            : '-translate-x-full'
          : 'translate-x-0'
          }`}>
          {/* Mobile close button */}
          {isMobileView && (
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <FaTimes className="w-5 h-5 text-gray-600" />
            </button>
          )}

          <div className="pt-16 px-4">
            <div className="text-xl font-bold border-b border-gray-200 mb-4 pb-2 text-gray-800">
              Admin Dashboard
            </div>
            <div className="space-y-2">
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <FaHome className="w-5 h-5" />
                <span>Home</span>
              </NavLink>

              <NavLink
                to="/admin/create-account"
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <FaPlus className="w-5 h-5" />
                <span>Add User</span>
              </NavLink>

              <NavLink
                to="/admin/view-user"
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <FaUsers className="w-5 h-5" />
                <span>View Users</span>
              </NavLink>

              <NavLink
                to="/admin/settings"
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <FaListUl className="w-5 h-5" />
                <span>Profile Management</span>
              </NavLink>

              <NavLink
                to="/admin/user-management"
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                    ? 'bg-orange-400 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                  }`
                }
              >
                <FaUsers className="w-5 h-5" />
                <span>Staff Management</span>
              </NavLink>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${!isHomePage && !isMobileView ? 'ml-4' : ''
        }`}>
        <div className=" p-35 pt-16">
          <Outlet />
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileView && sidebarVisible && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
};

export default SystemSidebar;
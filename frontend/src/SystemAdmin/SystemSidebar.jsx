import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaUserCircle, FaPlus, FaListUl, FaCog, FaUsers, FaHome } from "react-icons/fa";
import SystemNavbar from './SystemNavbar';

const SystemSidebar = ({ user }) => {
  return (
    <div className="flex">
      <SystemNavbar user={user} />
      <div className="w-64 fixed left-0 top-12 pt-4 font-bold min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200">
        <div className="pl-4 text-xl border-b border-gray-200 mb-4 pb-2 text-gray-800">
          Admin Dashboard
        </div>
        <div className="space-y-2 px-4">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
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
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
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
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
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
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <FaListUl className="w-5 h-5" />
            <span>Profile Managment</span>
          </NavLink>


          <NavLink
            to="/admin/user-management"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`
            }
          >
            <FaUsers className="w-5 h-5" />
            <span>User Management</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 pt-16">
        <Outlet />
      </div>
    </div>
  );
};

export default SystemSidebar;
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { FaUserCircle, FaPlus, FaListUl, FaCog, FaUsers } from "react-icons/fa";
import SystemNavbar from './SystemNavbar';

const SystemSidebar = ({ user }) => {
  return (
    <div className="flex">
      <SystemNavbar user={user} />
      <div className="w-64 fixed left-0 top-12 pt-4 font-bold min-h-screen bg-gray-100 border-r-2 border-gray-300">
        <div className="pl-4 text-xl border-b-2 border-gray-300 mb-4 pb-2 text-black">
          Dashboard
        </div>
        <div className="space-y-4">
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            🏠 <span>Home</span>
          </NavLink>

          <NavLink
            to="/admin/create-account"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaPlus className="w-4 h-4 text-green-600" />
            <span>Add User</span>
          </NavLink>

          <NavLink
            to="/admin/view-user"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaUsers className="w-4 h-4 text-blue-600" />
            <span>View Users</span>
          </NavLink>

          <NavLink
            to="/admin/edit-user"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaUserCircle className="w-4 h-4 text-purple-600" />
            <span>Edit User</span>
          </NavLink>

          <NavLink
            to="/admin/staff-list"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaListUl className="w-4 h-4 text-orange-600" />
            <span>List of Users</span>
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaCog className="w-4 h-4 text-gray-600" />
            <span>Settings</span>
          </NavLink>

          <NavLink
            to="/admin/user-management"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaUsers className="w-4 h-4 text-green-600" />
            <span>User Management</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 pt-16"> {/* Add padding for the navbar */}
        <Outlet /> {/* Render nested routes */}
      </div>
    </div>
  );
};

export default SystemSidebar;
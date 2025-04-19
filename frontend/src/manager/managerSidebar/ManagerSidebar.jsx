import React from 'react';
import { FaPlus, FaCog, FaListUl, FaUserCircle, FaHome, FaClipboardList, FaChartBar, FaList } from 'react-icons/fa';
import { NavLink, Outlet } from 'react-router-dom';
import ManagerNavbar from '../managerNavbar/Navbar';

const ManagerSidebar = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 fixed left-0 top-0 h-screen bg-white shadow-xl border-r border-gray-200 pt-16 transition-all duration-300 ease-in-out">
        <div className="pl-6 text-xl font-bold border-b border-gray-200 mb-6 pb-3 text-gray-800">
          Dashboard
        </div>
        <div className="space-y-2 px-6">
          <NavLink
            to="/manager"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaHome className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </NavLink>

          <NavLink
            to="/manager/menu"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-green-50 text-green-600 border-l-4 border-green-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaPlus className="w-5 h-5" />
            <span className="font-medium">Menu Management</span>
          </NavLink>

          <NavLink
            to="/manager/categories"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-orange-50 text-orange-600 border-l-4 border-orange-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaList className="w-5 h-5" />
            <span className="font-medium">Category Management</span>
          </NavLink>

          <NavLink
            to="/manager/stock"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaListUl className="w-5 h-5" />
            <span className="font-medium">Stock Management</span>
          </NavLink>

          <NavLink
            to="/manager/orders"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-yellow-50 text-yellow-600 border-l-4 border-yellow-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaClipboardList className="w-5 h-5" />
            <span className="font-medium">Order Management</span>
          </NavLink>

          <NavLink
            to="/manager/schedule"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-purple-50 text-purple-600 border-l-4 border-purple-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaCog className="w-5 h-5" />
            <span className="font-medium">Schedule Management</span>
          </NavLink>

          <NavLink
            to="/manager/generate-report"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-indigo-50 text-indigo-600 border-l-4 border-indigo-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaChartBar className="w-5 h-5" />
            <span className="font-medium">Generate Report</span>
          </NavLink>

          <NavLink
            to="/manager/feedback"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-red-50 text-red-600 border-l-4 border-red-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaUserCircle className="w-5 h-5" />
            <span className="font-medium">View Feedback</span>
          </NavLink>

          <NavLink
            to="/manager/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 rounded-lg p-3 transition duration-300 ${isActive
                ? 'bg-teal-50 text-teal-600 border-l-4 border-teal-500'
                : 'text-gray-600 hover:bg-gray-50'
              }`
            }
          >
            <FaUserCircle className="w-5 h-5" />
            <span className="font-medium">Profile</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        <ManagerNavbar />
        <div className="p-8 bg-gray-50 min-h-screen">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSidebar;

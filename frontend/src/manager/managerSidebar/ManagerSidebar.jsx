import React from 'react';
import { FaPlus, FaCog, FaListUl, FaUserCircle } from 'react-icons/fa';
import { NavLink, Outlet } from 'react-router-dom';
import ManagerNavbar from '../managerNavbar/Navbar';

const ManagerSidebar = () => {
  return (
    <div className="flex">
      <ManagerNavbar />
      {/* Sidebar */}
      <div className="w-64 fixed left-0 top-12 pt-4 font-bold min-h-screen bg-gray-100 border-r-2 border-gray-300">
        <div className="pl-4 text-xl border-b-2 border-gray-300 mb-4 pb-2 text-black">
          Dashboard
        </div>
        <div className="space-y-4">
          <NavLink
            to="/manager"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            🏠 <span>Home</span>
          </NavLink>

          <NavLink
            to="/manager/add"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaPlus className="w-4 h-4 text-green-600" />
            <span>Add Menus</span>
          </NavLink>

          <NavLink
            to="/manager/list"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaListUl className="w-4 h-4 text-blue-600" />
            <span>List of Menus</span>
          </NavLink>

          <NavLink
            to="/manager/profile"
            className={({ isActive }) =>
              `flex items-center space-x-3 border rounded-lg p-2 transition duration-300 ${
                isActive ? 'bg-gray-400' : 'text-gray-700'
              } hover:bg-gray-200`
            }
          >
            <FaUserCircle className="w-4 h-4 text-purple-600" />
            <span>Profile</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 pt-16">
        <Outlet /> {/* Renders nested routes */}
      </div>
    </div>
  );
};

export default ManagerSidebar;

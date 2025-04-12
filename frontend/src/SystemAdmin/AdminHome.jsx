import React from 'react';
import { FaUsers, FaUserPlus, FaUserCog, FaUserShield } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const stats = [
    {
      id: 1,
      title: 'Manage Accounts',
      icon: <FaUserCog className="h-6 w-6" />,
      value: 'View & Edit',
      link: '/admin/staff-list',
      description: 'Manage user accounts and roles',
      color: 'bg-indigo-100 text-indigo-600'
    },
    {
      id: 2,
      title: 'Create Account',
      icon: <FaUserPlus className="h-6 w-6" />,
      value: 'Add New',
      link: '/admin/create-account',
      description: 'Create new user accounts',
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 3,
      title: 'User Management',
      icon: <FaUsers className="h-6 w-6" />,
      value: 'Manage',
      link: '/admin/user-management',
      description: 'Comprehensive user management',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      title: 'System Settings',
      icon: <FaUserShield className="h-6 w-6" />,
      value: 'Configure',
      link: '/admin/settings',
      description: 'System configuration and settings',
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <div className="p-6 ml-64 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to the system administration panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="bg-white overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-lg p-3 ${item.color}`}>
                    {item.icon}
                  </div>
                  <span className={`text-sm font-semibold ${item.color} bg-opacity-20 px-3 py-1 rounded-full`}>
                    {item.value}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              to="/admin/staff-list" 
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Account Management</h3>
              <p className="text-gray-600">View and manage all user accounts</p>
            </Link>
            <Link 
              to="/admin/create-account" 
              className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-300"
            >
              <h3 className="font-semibold text-lg text-gray-800 mb-2">Create New Account</h3>
              <p className="text-gray-600">Add a new user to the system</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

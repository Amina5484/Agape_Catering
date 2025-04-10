import React from 'react';
import { FaUsers } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const stats = [
    {
      id: 1,
      title: 'Manage Accounts',
      icon: <FaUsers className="h-6 w-6" />,
      value: 'View & Edit',
      link: '/admin/staff-list',
      description: 'Manage user accounts and roles'
    },
    {
      id: 2,
      title: 'Create Account',
      icon: <FaUsers className="h-6 w-6" />,
      value: 'Add New',
      link: '/admin/create-account',
      description: 'Create new user accounts'
    }
  ];

  return (
    <div className="p-6 ml-64 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome to the system administration panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="bg-white overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    {item.icon}
                  </div>
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {item.value}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/staff-list" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Account Management</h3>
              <p className="text-gray-600">View and manage all user accounts</p>
            </Link>
            <Link to="/admin/create-account" className="p-4 border rounded-lg hover:bg-gray-50">
              <h3 className="font-semibold text-lg mb-2">Create New Account</h3>
              <p className="text-gray-600">Add a new user to the system</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

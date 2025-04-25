import React from 'react';
import { FaUsers, FaUserPlus, FaUserCog, FaUserShield } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminHome = () => {
  const stats = [
    {
      id: 1,
      title: 'List of customers',
      icon: <FaUserCog className="h-6 w-6" />,
      value: 'View ',
      link: '/admin/view-user',
      description: 'Manage user accounts and roles',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 2,
      title: 'Create Account',
      icon: <FaUserPlus className="h-6 w-6" />,
      value: 'Add New',
      link: '/admin/create-account',
      description: 'Create new user accounts',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 3,
      title: 'List of staffs',
      icon: <FaUsers className="h-6 w-6" />,
      value: 'Manage',
      link: '/admin/user-management',
      description: 'Comprehensive user management',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 4,
      title: 'Profile Management',
      icon: <FaUserShield className="h-6 w-6" />,
      value: 'Configure',
      link: '/admin/settings',
      description: 'System configuration and settings',
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="p-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to the system administration panel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((item) => (
            <Link
              key={item.id}
              to={item.link}
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
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
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHome;

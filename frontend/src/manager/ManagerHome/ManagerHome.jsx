import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaCubes, FaChartBar, FaComments, FaPlus, FaListUl, FaClipboardList, FaCog, FaUserCircle } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';

const Home = () => {
  const navigate = useNavigate();
  const { feedbackList, fetchFeedbackList } = useContext(StoreContext);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleViewFeedback = () => {
    setShowFeedback((prev) => !prev);
    fetchFeedbackList();
  };

  const dashboardCards = [
    {
      title: 'Menu Management',
      description: 'Add, edit, or remove menu items',
      icon: <FaPlus className="w-8 h-8" />,
      path: '/manager/menu',
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600'
    },
    {
      title: 'Stock Management',
      description: 'Manage inventory and stock levels',
      icon: <FaListUl className="w-8 h-8" />,
      path: '/manager/stock',
      color: 'bg-purple-500',
      hoverColor: 'hover:bg-purple-600'
    },
    {
      title: 'Order Management',
      description: 'View and manage customer orders',
      icon: <FaClipboardList className="w-8 h-8" />,
      path: '/manager/orders',
      color: 'bg-yellow-500',
      hoverColor: 'hover:bg-yellow-600'
    },
    {
      title: 'Schedule Management',
      description: 'Manage staff schedules and shifts',
      icon: <FaCog className="w-8 h-8" />,
      path: '/manager/schedule',
      color: 'bg-indigo-500',
      hoverColor: 'hover:bg-indigo-600'
    },
    {
      title: 'Generate Report',
      description: 'Generate sales and performance reports',
      icon: <FaChartBar className="w-8 h-8" />,
      path: '/manager/generate-report',
      color: 'bg-red-500',
      hoverColor: 'hover:bg-red-600'
    },
    {
      title: 'View Feedback',
      description: 'Read and respond to customer feedback',
      icon: <FaComments className="w-8 h-8" />,
      path: '/manager/feedback',
      color: 'bg-teal-500',
      hoverColor: 'hover:bg-teal-600'
    },
    {
      title: 'Profile',
      description: 'Manage your account settings',
      icon: <FaUserCircle className="w-8 h-8" />,
      path: '/manager/profile',
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600'
    }
  ];

  return (
    <div className="pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Your Dashboard</h1>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {dashboardCards.map((card, index) => (
              <div
                key={index}
                onClick={() => navigate(card.path)}
                className={`
                  bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300
                  p-6 border border-gray-100 cursor-pointer
                  transform hover:-translate-y-1
                `}
              >
                <div className="flex items-center space-x-4">
                  <div className={`${card.color} text-white p-3 rounded-lg`}>
                    {card.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{card.title}</h2>
                    <p className="text-gray-600 text-sm">{card.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

         

          {/* Feedback Section */}
          {showFeedback && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
              
              {feedbackList.length === 0 ? (
                <div className="text-center py-8">
                  <FaComments className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No feedback submitted yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {feedbackList.map((feedback, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{feedback.name}</p>
                        <span className="text-sm text-gray-500">{feedback.email}</span>
                      </div>
                      <p className="text-gray-600">{feedback.feedback}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

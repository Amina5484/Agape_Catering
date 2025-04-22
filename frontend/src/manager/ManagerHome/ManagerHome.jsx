import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { useSidebar } from '../../context/SidebarContext';
import {
  HiTemplate,
  HiOutlineTag,
  HiClipboardList,
  HiShoppingCart,
  HiCalendar,
  HiChartBar,
  HiChatAlt2,
  HiUser,
  HiTrendingUp,
  HiLightningBolt,
  HiHome,
  HiArrowRight
} from 'react-icons/hi';

const ManagerHome = () => {
  const navigate = useNavigate();
  const { darkMode: isDarkMode } = useStore();
  const { showSidebar, setSidebarVisible, setHasClickedCard } = useSidebar();

  // Set sidebar to hidden initially when component loads
  useEffect(() => {
    setSidebarVisible(false);
  }, [setSidebarVisible]);

  // Dashboard cards configuration
  const dashboardCards = [
    {
      title: 'Menu Management',
      description: 'Manage your menu items and offerings',
      icon: <HiTemplate className="w-7 h-7" />,
      path: '/manager/menu',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-indigo-500',
    },
    {
      title: 'Categories',
      description: 'Organize your product categories',
      icon: <HiOutlineTag className="w-7 h-7" />,
      path: '/manager/categories',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: <HiClipboardList className="w-7 h-7" />,
      path: '/manager/orders',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-teal-500',
    },
    {
      title: 'Inventory',
      description: 'Track and manage inventory levels',
      icon: <HiShoppingCart className="w-7 h-7" />,
      path: '/manager/stock',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Schedule',
      description: 'Manage event bookings and calendar',
      icon: <HiCalendar className="w-7 h-7" />,
      path: '/manager/schedule',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Reports',
      description: 'View sales and performance reports',
      icon: <HiChartBar className="w-7 h-7" />,
      path: '/manager/generate-report',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-cyan-500',
    },
    {
      title: 'Feedback',
      description: 'View customer reviews and feedback',
      icon: <HiChatAlt2 className="w-7 h-7" />,
      path: '/manager/feedback',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-pink-500',
    },
    {
      title: 'Profile',
      description: 'Manage your account settings',
      icon: <HiUser className="w-7 h-7" />,
      path: '/manager/profile',
      gradient: isDarkMode ? 'from-gray-800 to-gray-700' : 'from-gray-50 to-white',
      iconBg: isDarkMode ? 'bg-gray-700' : 'bg-gray-200',
      iconColor: 'text-amber-500',
    },
  ];

  // Performance metrics for the dashboard
  const metrics = [
    {
      title: 'Revenue Growth',
      value: '+24%',
      change: '+4.3%',
      icon: <HiTrendingUp className="h-6 w-6 text-green-500" />,
      color: isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
    },
    {
      title: 'Orders Completed',
      value: '94%',
      change: '+2.5%',
      icon: <HiLightningBolt className="h-6 w-6 text-blue-500" />,
      color: isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
    }
  ];

  // Handler for card click
  const handleCardClick = (path) => {
    // Show the sidebar when any card is clicked
    setSidebarVisible(true);
    // Also set hasClickedCard to true to ensure sidebar remains visible
    setHasClickedCard(true);
    // Navigate to the selected path
    navigate(path);
  };

  return (
    <div className={`${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-800'} transition-colors duration-300 min-h-screen`}>
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Welcome Banner with Indigo accent */}
        <div className={`mb-8 p-6 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-l-4 border-indigo-500`}>
          <h1 className="text-3xl font-bold flex items-center">
            <HiHome className="mr-3 text-indigo-500" />
            Manager Dashboard
          </h1>
          <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Welcome back to your catering management portal. Manage your business from a single dashboard.
          </p>
        </div>

        {/* Performance Metrics Section (commented out but fixed) */}
        {/* <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10">
          <div className="mb-6 md:mb-0">
            <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
              Performance Overview
            </h2>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
              Track key metrics and performance indicators
            </p>
          </div>
        </div> */}

        {/* Dashboard Cards Section Title */}
        <div className="mb-6">
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Management Tools
          </h2>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
            Select a category to manage your catering business
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(card.path)}
              className={`bg-gradient-to-br ${card.gradient}
                rounded-xl shadow-md hover:shadow-lg transition-all duration-300
                p-6 border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} cursor-pointer
                transform hover-lift`}
            >
              <div className="flex flex-col h-full">
                <div className={`w-14 h-14 rounded-full ${card.iconBg} flex items-center justify-center ${card.iconColor} mb-4`}>
                  {card.icon}
                </div>
                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-2`}>
                  {card.title}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mb-4`}>
                  {card.description}
                </p>
                <div className="mt-auto">
                  <div className={`inline-flex items-center text-sm font-medium ${card.iconColor}`}>
                    Manage
                    <HiArrowRight className="ml-1 w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManagerHome;

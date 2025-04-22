import React, { useEffect, useState } from 'react';
import {
    HiShoppingCart,
    HiCurrencyDollar,
    HiClipboardList,
    HiUserGroup,
    HiChartPie,
    HiTrendingUp,
    HiTrendingDown,
    HiChartBar,
    HiClock
} from 'react-icons/hi';
import { useSidebar } from '../../context/SidebarContext';
import { useStore } from '../../context/StoreContext';
import { motion } from 'framer-motion';

const ManagerHome = () => {
    const { darkMode } = useStore();
    const { setCardClicked, showSidebar } = useSidebar();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    // Placeholder data for dashboard cards
    const dashboardData = {
        totalSales: '₦458,500',
        salesChange: '+12.5%',
        totalOrders: 284,
        ordersChange: '+8.2%',
        inventoryItems: 138,
        inventoryChange: '-3.1%',
        customers: 1, 250,
        customersChange: '+15.3%',
    };

    // Mock data for sales chart
    const salesData = [
        { month: 'Jan', amount: 25000 },
        { month: 'Feb', amount: 35000 },
        { month: 'Mar', amount: 28000 },
        { month: 'Apr', amount: 43000 },
        { month: 'May', amount: 39000 },
        { month: 'Jun', amount: 48500 },
    ];

    // Find the max value for scaling the chart
    const maxSales = Math.max(...salesData.map(d => d.amount));

    // Function to handle card click and show sidebar
    const handleCardClick = () => {
        setCardClicked(true);
        showSidebar();
    };

    // Animation variants for cards
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (custom) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: custom * 0.1,
                duration: 0.5,
                ease: "easeOut"
            }
        })
    };

    // Skeleton loader for cards
    const CardSkeleton = () => (
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow-md animate-pulse`}>
            <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-1/3 bg-gray-400 rounded-md"></div>
                <div className="h-10 w-10 rounded-full bg-gray-400"></div>
            </div>
            <div className="h-8 w-2/3 bg-gray-400 rounded-md mb-2"></div>
            <div className="h-4 w-1/4 bg-gray-400 rounded-md"></div>
        </div>
    );

    return (
        <div className="container mx-auto px-4">
            {/* Welcome Banner */}
            <div className={`mb-8 p-6 rounded-xl ${darkMode
                ? 'bg-gradient-to-r from-gray-800 to-gray-900 border-l-4 border-royal'
                : 'bg-gradient-to-r from-white to-gray-100 border-l-4 border-royal'
                } shadow-md`}>
                <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-charcoal'}`}>
                    Welcome to Manager Dashboard
                </h1>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Monitor your restaurant's performance and manage operations efficiently.
                </p>
            </div>

            {/* Dashboard Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {loading ? (
                    // Show skeletons when loading
                    <>
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                        <CardSkeleton />
                    </>
                ) : (
                    // Show actual cards when data is loaded
                    <>
                        {/* Total Sales Card */}
                        <motion.div
                            custom={0}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={handleCardClick}
                            className={`cursor-pointer rounded-xl ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-white hover:bg-gray-50'
                                } p-6 shadow-md border-b-4 border-royal transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Sales</h3>
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-royal/20' : 'bg-royal/10'}`}>
                                    <HiCurrencyDollar className="h-6 w-6 text-royal" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-charcoal'}`}>{dashboardData.totalSales}</p>
                            <div className="flex items-center">
                                <span className={`flex items-center ${dashboardData.salesChange.startsWith('+')
                                        ? 'text-emerald'
                                        : 'text-crimson'
                                    }`}>
                                    {dashboardData.salesChange.startsWith('+')
                                        ? <HiTrendingUp className="mr-1" />
                                        : <HiTrendingDown className="mr-1" />
                                    }
                                    {dashboardData.salesChange}
                                </span>
                                <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>since last month</span>
                            </div>
                        </motion.div>

                        {/* Total Orders Card */}
                        <motion.div
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={handleCardClick}
                            className={`cursor-pointer rounded-xl ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-white hover:bg-gray-50'
                                } p-6 shadow-md border-b-4 border-emerald transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Orders</h3>
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-emerald/20' : 'bg-emerald/10'}`}>
                                    <HiClipboardList className="h-6 w-6 text-emerald" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-charcoal'}`}>{dashboardData.totalOrders}</p>
                            <div className="flex items-center">
                                <span className={`flex items-center ${dashboardData.ordersChange.startsWith('+')
                                        ? 'text-emerald'
                                        : 'text-crimson'
                                    }`}>
                                    {dashboardData.ordersChange.startsWith('+')
                                        ? <HiTrendingUp className="mr-1" />
                                        : <HiTrendingDown className="mr-1" />
                                    }
                                    {dashboardData.ordersChange}
                                </span>
                                <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>since last month</span>
                            </div>
                        </motion.div>

                        {/* Inventory Card */}
                        <motion.div
                            custom={2}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={handleCardClick}
                            className={`cursor-pointer rounded-xl ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-white hover:bg-gray-50'
                                } p-6 shadow-md border-b-4 border-deep-ocean transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Inventory Items</h3>
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-deep-ocean/20' : 'bg-deep-ocean/10'}`}>
                                    <HiShoppingCart className="h-6 w-6 text-deep-ocean" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-charcoal'}`}>{dashboardData.inventoryItems}</p>
                            <div className="flex items-center">
                                <span className={`flex items-center ${dashboardData.inventoryChange.startsWith('+')
                                        ? 'text-emerald'
                                        : 'text-crimson'
                                    }`}>
                                    {dashboardData.inventoryChange.startsWith('+')
                                        ? <HiTrendingUp className="mr-1" />
                                        : <HiTrendingDown className="mr-1" />
                                    }
                                    {dashboardData.inventoryChange}
                                </span>
                                <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>since last month</span>
                            </div>
                        </motion.div>

                        {/* Customers Card */}
                        <motion.div
                            custom={3}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            onClick={handleCardClick}
                            className={`cursor-pointer rounded-xl ${darkMode
                                ? 'bg-gray-800 hover:bg-gray-700'
                                : 'bg-white hover:bg-gray-50'
                                } p-6 shadow-md border-b-4 border-royal transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Total Customers</h3>
                                <div className={`p-3 rounded-full ${darkMode ? 'bg-royal/20' : 'bg-royal/10'}`}>
                                    <HiUserGroup className="h-6 w-6 text-royal" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold mb-1 ${darkMode ? 'text-white' : 'text-charcoal'}`}>{dashboardData.customers}</p>
                            <div className="flex items-center">
                                <span className={`flex items-center ${dashboardData.customersChange.startsWith('+')
                                        ? 'text-emerald'
                                        : 'text-crimson'
                                    }`}>
                                    {dashboardData.customersChange.startsWith('+')
                                        ? <HiTrendingUp className="mr-1" />
                                        : <HiTrendingDown className="mr-1" />
                                    }
                                    {dashboardData.customersChange}
                                </span>
                                <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>since last month</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </div>

            {/* Additional Dashboard Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className={`lg:col-span-2 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow-md`}
                >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                            <HiChartBar className="w-5 h-5 mr-2 text-royal" />
                            Monthly Sales Overview
                        </div>
                    </h3>

                    {loading ? (
                        <div className="h-64 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-royal"></div>
                        </div>
                    ) : (
                        <div className="h-64 flex items-end justify-around">
                            {salesData.map((data, index) => (
                                <div key={index} className="flex flex-col items-center">
                                    <div
                                        className="w-12 bg-gradient-to-t from-royal to-royal/60 rounded-t-lg transition-all duration-500 hover:from-royal/80 hover:to-royal"
                                        style={{ height: `${(data.amount / maxSales) * 200}px` }}
                                    ></div>
                                    <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{data.month}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} p-6 shadow-md`}
                >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                        <div className="flex items-center">
                            <HiClock className="w-5 h-5 mr-2 text-royal" />
                            Recent Activity
                        </div>
                    </h3>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="flex animate-pulse">
                                    <div className="h-10 w-10 rounded-full bg-gray-400 mr-3"></div>
                                    <div className="flex-1">
                                        <div className="h-4 w-3/4 bg-gray-400 rounded-md mb-2"></div>
                                        <div className="h-3 w-1/2 bg-gray-400 rounded-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-cloud'}`}>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-emerald/20 mr-3">
                                        <HiClipboardList className="h-5 w-5 text-emerald" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-charcoal'}`}>New order received</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>15 minutes ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-cloud'}`}>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-royal/20 mr-3">
                                        <HiCurrencyDollar className="h-5 w-5 text-royal" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-charcoal'}`}>Payment received</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>1 hour ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-cloud'}`}>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-crimson/20 mr-3">
                                        <HiShoppingCart className="h-5 w-5 text-crimson" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-charcoal'}`}>Inventory alert</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>3 hours ago</p>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-cloud'}`}>
                                <div className="flex items-center">
                                    <div className="p-2 rounded-full bg-deep-ocean/20 mr-3">
                                        <HiUserGroup className="h-5 w-5 text-deep-ocean" />
                                    </div>
                                    <div>
                                        <p className={`font-medium ${darkMode ? 'text-white' : 'text-charcoal'}`}>New customer registered</p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>5 hours ago</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ManagerHome; 
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { toast } from 'react-toastify';
import {
    FaClipboardList,
    FaHistory,
    FaShoppingBag,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaTruck,
    FaUtensils,
} from 'react-icons/fa';






const CustomerOrders = () => {
    const [currentOrders, setCurrentOrders] = useState([]);
    const [orderHistory, setOrderHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('current');
    const [menuItems, setMenuItems] = useState({});

    useEffect(() => {
        fetchCurrentOrders();
        fetchOrderHistory();
    }, []);





    

    const fetchMenuItems = async (order) => {
        try {
            const itemIds = order.menuItems.map(item => item.item);
            const uniqueItemIds = [...new Set(itemIds)];

            const itemsPromises = uniqueItemIds.map(async (itemId) => {
                if (!itemId) return null;
                const response = await axiosInstance.get(`/menu/item/${itemId}`);
                return response.data;
            });

            const items = await Promise.all(itemsPromises);
            const itemsMap = items.reduce((acc, item) => {
                if (item) acc[item._id] = item;
                return acc;
            }, {});

            setMenuItems(prev => ({ ...prev, ...itemsMap }));
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

     const fetchCurrentOrders = async () => {
       try {
         console.log('Fetching current orders...');
         const token = localStorage.getItem('token');

         const response = await axiosInstance.get('/customer/myorder/', {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         });

         console.log('Current orders response:', response.data);

         const orders = Array.isArray(response.data)
           ? response.data
           : [response.data];
         setCurrentOrders(orders);

         // No need to fetch menu items separately anymore
       } catch (error) {
         console.error('Error fetching current orders:', error);
         toast.error('Failed to load current orders');
       }
     };

     const fetchOrderHistory = async () => {
       try {
         console.log('Fetching order history...');
         const token = localStorage.getItem('token');

         const response = await axiosInstance.get('/customer/myorderhistory/', {
           headers: {
             Authorization: `Bearer ${token}`,
           },
         });

         console.log('Order history response:', response.data);

         const orders = Array.isArray(response.data)
           ? response.data
           : [response.data];
         setOrderHistory(orders);

         // No need to fetch menu items separately anymore
       } catch (error) {
         console.error('Error fetching order history:', error);
         toast.error('Failed to load order history');
       } finally {
         setLoading(false);
       }
     };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return <FaClock className="text-yellow-500" />;
            case 'confirmed':
                return <FaCheckCircle className="text-green-500" />;
            case 'preparing':
                return <FaUtensils className="text-orange-500" />;
            case 'ready':
                return <FaTruck className="text-blue-500" />;
            case 'delivered':
                return <FaCheckCircle className="text-green-500" />;
            case 'cancelled':
                return <FaTimesCircle className="text-red-500" />;
            default:
                return <FaClipboardList className="text-gray-500" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-green-100 text-green-800';
            case 'preparing':
                return 'bg-orange-100 text-orange-800';
            case 'ready':
                return 'bg-blue-100 text-blue-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

                    {/* Debug info */}
                    <div className="mb-4 p-4 bg-gray-100 rounded">
                        <p className="text-sm text-gray-600">Debug Info:</p>
                        <p className="text-sm text-gray-600">Current Orders Count: {currentOrders.length}</p>
                        <p className="text-sm text-gray-600">Order History Count: {orderHistory.length}</p>
                        <p className="text-sm text-gray-600">Loading: {loading ? 'Yes' : 'No'}</p>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab('current')}
                                className={`${activeTab === 'current'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <FaClipboardList className="mr-2" />
                                Current Orders
                                <span className="ml-2 bg-teal-100 text-teal-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {currentOrders.length}
                                </span>
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`${activeTab === 'history'
                                    ? 'border-teal-500 text-teal-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
                            >
                                <FaHistory className="mr-2" />
                                Order History
                                <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                                    {orderHistory.length}
                                </span>
                            </button>
                        </nav>
                    </div>

                    {/* Current Orders Tab */}
                    {activeTab === 'current' && (
                        <div>
                            {currentOrders.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No current orders
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Get started by placing a new order.
                                    </p>
                                    <div className="mt-6">
                                        <Link
                                            to="/menu"
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                        >
                                            <FaShoppingBag className="-ml-1 mr-2 h-5 w-5" />
                                            Order Now
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {currentOrders.map((order) => (
                                        <div
                                            key={order._id}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            Order #{order._id.slice(-6)}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                        <p className="text-sm text-gray-500 mt-1">
                                                            Type: {order.typeOfOrder}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(order.orderStatus)}
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                                order.orderStatus
                                                            )}`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Delivery Date</p>
                                                            <p className="text-sm text-gray-900">
                                                                {order.deliveryDate ? formatDate(order.deliveryDate) : 'Not set'}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Order Type</p>
                                                            <p className="text-sm text-gray-900 capitalize">
                                                                {order.typeOfOrder || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Special Instructions */}
                                                {order.specialInstructions && (
                                                    <div className="mt-4">
                                                        <p className="text-sm text-gray-500">Special Instructions</p>
                                                        <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                                                            {order.specialInstructions}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total Amount</p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {formatCurrency(order.totalAmount)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Payment Status</p>
                                                            <p
                                                                className={`text-sm font-medium ${order.paymentStatus === 'paid'
                                                                    ? 'text-green-600'
                                                                    : order.paymentStatus === 'partially_paid'
                                                                        ? 'text-yellow-600'
                                                                        : 'text-red-600'
                                                                    }`}
                                                            >
                                                                {order.paymentStatus.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <p className="text-sm text-gray-500">Delivery Address</p>
                                                    <p className="text-sm text-gray-900">
                                                        {order.Address?.addressText || 'No address provided'}
                                                    </p>
                                                </div>

                                                <div className="mt-4">
                                                    {/* <p className="text-sm text-gray-500">Menu Items</p>
                                                    <div className="mt-2 space-y-3">
                                                        {order.menuItems?.map((item, index) => {
                                                            const menuItem = menuItems[item.item];
                                                            return (
                                                                <div key={item._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                                    <div className="flex items-center space-x-3">
                                                                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                                                            {menuItem?.image ? (
                                                                                <img
                                                                                    src={menuItem.image}
                                                                                    alt={menuItem.name}
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            ) : (
                                                                                <FaUtensils className="w-6 h-6 text-gray-400" />
                                                                            )}
                                                                        </div>
                                                                        <div>
                                                                            <h4 className="text-sm font-medium text-gray-900">
                                                                                {menuItem?.name || `Item ${index + 1}`}
                                                                            </h4>
                                                                            {menuItem?.description && (
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    {menuItem.description}
                                                                                </p>
                                                                            )}
                                                                            {item.specialInstructions && (
                                                                                <p className="text-xs text-teal-600 mt-1">
                                                                                    Note: {item.specialInstructions}
                                                                                </p>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center space-x-4">
                                                                        <div className="flex items-center space-x-1">
                                                                            <span className="text-sm font-medium text-gray-900">
                                                                                {item.quantity}
                                                                            </span>
                                                                            <span className="text-sm text-gray-500">x</span>
                                                                        </div>
                                                                        <div className="text-sm font-medium text-gray-900">
                                                                            {formatCurrency(menuItem?.price * item.quantity || 0)}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div> */}
                                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-sm font-medium text-gray-500">Subtotal</span>
                                                            <span className="text-sm font-medium text-gray-900">
                                                                {formatCurrency(order.totalAmount)}
                                                            </span>
                                                        </div>
                                                        {order.paidAmount > 0 && (
                                                            <div className="flex justify-between items-center mt-2">
                                                                <span className="text-sm font-medium text-gray-500">Paid Amount</span>
                                                                <span className="text-sm font-medium text-green-600">
                                                                    {formatCurrency(order.paidAmount)}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {order.paidAmount < order.totalAmount && (
                                                            <div className="flex justify-between items-center mt-2">
                                                                <span className="text-sm font-medium text-gray-500">Remaining Balance</span>
                                                                <span className="text-sm font-medium text-orange-600">
                                                                    {formatCurrency(order.totalAmount - order.paidAmount)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                                                    >
                                                        View Order Details →
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Order History Tab */}
                    {activeTab === 'history' && (
                        <div>
                            {orderHistory.length === 0 ? (
                                <div className="text-center py-12">
                                    <FaHistory className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        No order history
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Your past orders will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orderHistory.map((order) => (
                                        <div
                                            key={order._id}
                                            className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <div className="p-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium text-gray-900">
                                                            Order #{order._id.slice(-6)}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">
                                                            {formatDate(order.createdAt)}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(order.orderStatus)}
                                                        <span
                                                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                                order.orderStatus
                                                            )}`}
                                                        >
                                                            {order.orderStatus}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Total Amount</p>
                                                            <p className="text-lg font-semibold text-gray-900">
                                                                {formatCurrency(order.totalAmount)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-500">Payment Status</p>
                                                            <p
                                                                className={`text-sm font-medium ${order.paymentStatus === 'paid'
                                                                    ? 'text-green-600'
                                                                    : order.paymentStatus === 'partially_paid'
                                                                        ? 'text-yellow-600'
                                                                        : 'text-red-600'
                                                                    }`}
                                                            >
                                                                {order.paymentStatus.replace('_', ' ')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <Link
                                                        to={`/orders/${order._id}`}
                                                        className="text-teal-600 hover:text-teal-900 text-sm font-medium"
                                                    >
                                                        View Order Details →
                                                    </Link>
                                                </div>
                                            </div>
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

export default CustomerOrders; 
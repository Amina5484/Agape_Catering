// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const OrderManagement = () => {
//   const [orders, setOrders] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const fetchOrders = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(
//         'http://localhost:4000/api/catering/orders',
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setOrders(response.data);
//       setLoading(false);
//     } catch (error) {
//       toast.error('Failed to fetch orders');
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   const handleStatusUpdate = async (orderId, newStatus) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(
//         `http://localhost:4000/api/catering/order/update-status/${orderId}`,
//         { status: newStatus },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       toast.success('Order status updated successfully');
//       fetchOrders();
//     } catch (error) {
//       toast.error('Failed to update order status');
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <h1 className="text-3xl font-bold mb-8">Order Management</h1>

//       <div className="bg-white rounded-lg shadow-md overflow-hidden">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Order ID
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Customer
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Address
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Items
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Total
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Status
//               </th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                 Actions
//               </th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {orders.map((order) => (
//               <tr key={order._id}>
//                 <td className="px-6 py-4 whitespace-nowrap">{order._id}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <div>{order.userId?.name || 'N/A'}</div>
//                   <div className="text-xs text-gray-500">
//                     {order.userId?.phone || 'N/A'}
//                   </div>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {order.Address?.addressText || 'N/A'}
//                 </td>
//                 <td className="px-6 py-4">
//                   <ul className="list-disc list-inside">
//                     {order.menuItems.map((item) => (
//                       <li key={item._id}>
//                         {item.item?.name} x {item.quantity}
//                       </li>
//                     ))}
//                   </ul>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   {order.totalAmount?.toLocaleString('en-ET', {
//                     style: 'currency',
//                     currency: 'ETB',
//                   })}
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-semibold ${order.orderStatus === 'completed'
//                         ? 'bg-green-100 text-green-800'
//                         : order.orderStatus === 'in_progress'
//                           ? 'bg-yellow-100 text-yellow-800'
//                           : 'bg-gray-100 text-gray-800'
//                       }`}
//                   >
//                     {order.orderStatus}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <select
//                     value={order.orderStatus}
//                     onChange={(e) =>
//                       handleStatusUpdate(order._id, e.target.value)
//                     }
//                     className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
//                   >
//                     <option value="pending">Pending</option>
//                     <option value="in_progress">In Progress</option>
//                     <option value="completed">Completed</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default OrderManagement;
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import { FaMapMarkerAlt, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const OrderManagement = () => {
  const { token } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [customerLocation, setCustomerLocation] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Get token from localStorage

      if (!token) {
        toast.error('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Fetching orders with token:', token);

      const response = await axios.get(
        'http://localhost:4000/api/catering/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Orders response:', response.data);

      if (response.data) {
        setOrders(response.data);
      } else {
        toast.error('Invalid response format from server');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      console.error('Error response:', error.response);

      if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        // You might want to redirect to login here
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view orders');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch orders');
      }

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await axios.post(
        `http://localhost:4000/api/catering/order/accept/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);
      toast.error(error.response?.data?.message || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await axios.put(
        `http://localhost:4000/api/catering/order/update-status/${orderId}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  };

  const handleViewLocation = async (customerId) => {
    try {
      if (!customerId) {
        toast.error('Customer ID is missing');
        return;
      }

      const response = await axios.get(
        `http://localhost:4000/api/catering/customer/${customerId}/location`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCustomerLocation(response.data);
      setSelectedOrder(customerId);
    } catch (error) {
      console.error('Error fetching customer location:', error);
      toast.error(
        error.response?.data?.message || 'Failed to fetch customer location'
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Order Management</h2>
        </div>

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {order._id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {order.userId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {Array.isArray(order.menuItems) ? (
                          order.menuItems.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center space-x-2"
                            >
                              <span className="font-medium">
                                {item.item?.name}
                              </span>
                              <span className="text-gray-500">
                                x {item.quantity}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">No items</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {order.totalAmount?.toLocaleString('en-ET', {
                          style: 'currency',
                          currency: 'ETB',
                        }) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {order.orderedDate
                          ? new Date(order.orderedDate).toLocaleDateString()
                          : 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.orderStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.orderStatus === 'Accepted'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'Completed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {order.orderStatus || 'Unknown'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {order.orderStatus === 'Pending' && (
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="flex items-center text-green-600 hover:text-green-800 transition duration-300 hover:scale-110"
                        >
                          <FaCheck className="mr-1" />
                          Accept
                        </button>
                      )}
                      {order.orderStatus === 'Accepted' && (
                        <button
                          onClick={() =>
                            handleUpdateStatus(order._id, 'Completed')
                          }
                          className="flex items-center text-blue-600 hover:text-blue-800 transition duration-300 hover:scale-110"
                        >
                          <FaSpinner className="mr-1" />
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleViewLocation(order.userId?._id)}
                        className="flex items-center text-gray-600 hover:text-gray-800 transition duration-300 hover:scale-110"
                      >
                        <FaMapMarkerAlt className="mr-1" />
                        Location
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg">No orders found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-semibold text-gray-700">
                  Customer Location
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-800">
                  <span className="font-medium">Address:</span>{' '}
                  {customerLocation?.address || 'N/A'}
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">City:</span>{' '}
                  {customerLocation?.city || 'N/A'}
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Phone:</span>{' '}
                  {customerLocation?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;

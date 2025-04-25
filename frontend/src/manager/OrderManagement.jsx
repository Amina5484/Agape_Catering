import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';

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
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('No authentication token found. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await axios.get(
        'http://localhost:4000/api/catering/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setOrders(response.data);
      } else {
        toast.error('Invalid response format from server');
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:4000/api/catering/order/update-status/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleViewLocation = async (order) => {
    try {
      if (!order || !order.Address || !order.Address.coordinates) {
        toast.error('Order address or coordinates information is missing');
        return;
      }

      const { latitude, longitude } = order.Address.coordinates;

      if (!latitude || !longitude) {
        toast.error('Invalid coordinates');
        return;
      }

      setCustomerLocation({
        address: order.Address.address || 'Not provided',
        city: order.Address.city || 'Not provided',
        phone: order.userId?.phone || 'Not provided',
        name: order.userId?.name || 'Not provided',
        coordinates: { latitude, longitude },
      });
      setSelectedOrder(order._id); // Open modal for this order
    } catch (error) {
      console.error('Error processing location data:', error);
      toast.error('Failed to process location data');
    }
  };

  const navigateToGoogleMaps = (coordinates) => {
    if (coordinates?.latitude && coordinates?.longitude) {
      // Navigate to Google Maps with coordinates
      const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordinates.latitude},${coordinates.longitude}`;
      window.open(mapUrl, '_blank'); // Open in new tab
    } else {
      // Fallback: Use address if coordinates are not available
      const addressQuery = encodeURIComponent(
        `${customerLocation?.address || ''}, ${customerLocation?.city || ''}`
      );
      const mapUrl = `https://www.google.com/maps/search/?api=1&query=${addressQuery}`;
      window.open(mapUrl, '_blank'); // Open in new tab
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
            <thead className="bg-orange-400">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {order._id?.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div>{order.userId?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800">
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {order.totalAmount?.toLocaleString('en-ET', {
                        style: 'currency',
                        currency: 'ETB',
                      }) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      {order.orderedDate
                        ? new Date(order.orderedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        className="text-xs bg-gray-100 text-gray-800 rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-orange-300"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewLocation(order)}
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
      </div>

      {selectedOrder && customerLocation && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Customer Location</h3>
              <button onClick={() => setSelectedOrder(null)}>
                <FaTimes className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <p>
              <strong>Name:</strong> {customerLocation.name}
            </p>
            <p>
              <strong>Phone:</strong> {customerLocation.phone}
            </p>
            <p>
              <strong>Address:</strong> {customerLocation.address},{' '}
              {customerLocation.city}
            </p>
            <button
              onClick={() => navigateToGoogleMaps(customerLocation.coordinates)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200"
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

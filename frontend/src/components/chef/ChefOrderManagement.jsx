import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaUtensils, FaTimes } from 'react-icons/fa';

const ChefOrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/order/chef');

      // Debug: Log information about special instructions
      console.log(`Fetched ${response.data.length} orders`);
      if (response.data.length > 0) {
        console.log('First order:', response.data[0]);
        console.log('Special instructions in first order:', {
          specialInstructions: response.data[0].specialInstructions,
          preparationInstructions: response.data[0].preparationInstructions,
          additionalNotes: response.data[0].additionalNotes,
          notes: response.data[0].notes,
        });
      }

      setOrders(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      // Use the chef-specific endpoint for order details
      const response = await axios.get(`/api/order/chef/details/${orderId}`);

      // Debug: Log the order details to see if special instructions are present
      console.log('Order details response:', response.data);
      console.log(
        'Special instructions:',
        response.data.specialInstructions ||
          response.data.preparationInstructions ||
          response.data.additionalNotes ||
          response.data.notes
      );

      // Update the specific order with more detailed information
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, ...response.data } : order
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order details');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const orderDetails = await fetchOrderDetails(orderId);
      if (orderDetails) {
        setSelectedOrder(orderDetails);
        setShowDetailModal(true);
      }
    } catch (err) {
      console.error('Error viewing order details:', err);
      navigate(`/chef/orders/${orderId}`);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/order/${orderId}/status`, { status });
      // Update order status locally
      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error('Failed to update order status');
      console.error('Error updating order status:', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            Pending
          </span>
        );
      case 'in-progress':
      case 'preparing':
        return (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
            Preparing
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
            {status}
          </span>
        );
    }
  };

  // Transform status text for display
  const displayStatus = (status) => {
    if (status === 'in-progress') return 'preparing';
    return status;
  };

  // Transform display status back to backend format
  const normalizeStatus = (displayStatus) => {
    if (displayStatus === 'preparing') return 'in-progress';
    return displayStatus;
  };

  // Create status dropdown for the schedule table
  const renderStatusSelect = (order) => {
    return (
      <select
        value={displayStatus(order.status)}
        onChange={(e) =>
          updateOrderStatus(order._id, normalizeStatus(e.target.value))
        }
        className={`px-3 py-1 text-sm rounded border ${
          order.status === 'completed'
            ? 'bg-green-50 border-green-200 text-green-800'
            : order.status === 'in-progress' || order.status === 'preparing'
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}
      >
        <option value="pending">Pending</option>
        <option value="preparing">Preparing</option>
        <option value="completed">Completed</option>
      </select>
    );
  };

  // Order details modal component
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Order Details</h3>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes />
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">
                  Order #{order._id?.substring(0, 8)}
                </p>
                <p className="text-sm text-gray-500">
                  {order.createdAt &&
                    format(new Date(order.createdAt), 'MMMM dd, yyyy hh:mm a')}
                </p>
              </div>
              <div>{getStatusBadge(order.status)}</div>
            </div>

            {/* Special Instructions Section - Very Prominent */}
            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-md">
              <div className="flex items-center text-yellow-800 mb-2">
                <FaUtensils className="mr-2" />
                <h4 className="font-medium text-lg">Special Instructions</h4>
              </div>
              <p className="text-sm text-yellow-800 whitespace-pre-line">
                {order.specialInstructions ||
                  order.preparationInstructions ||
                  order.additionalNotes ||
                  order.notes ||
                  'No special instructions provided by customer.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Customer Information
                </h4>
                <p className="text-sm">
                  <span className="font-medium">Name:</span>{' '}
                  {order.customer?.name || order.userId?.name || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Phone:</span>{' '}
                  {order.customer?.phone || order.userId?.phone || 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span>{' '}
                  {order.customer?.email || order.userId?.email || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">
                  Delivery Information
                </h4>
                <p className="text-sm">
                  <span className="font-medium">Event Date:</span>{' '}
                  {order.eventDate ||
                  order.deliveryDateValue ||
                  order.deliveryDate
                    ? format(
                        new Date(
                          order.eventDate ||
                            order.deliveryDateValue ||
                            order.deliveryDate
                        ),
                        'MMMM dd, yyyy'
                      )
                    : 'N/A'}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Address:</span>{' '}
                  {order.address ||
                    order.deliveryAddress ||
                    order.Address?.addressText ||
                    'N/A'}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Order Items</h4>
              <div className="bg-gray-50 p-4 rounded-md">
                {(order.items && order.items.length > 0) ||
                (order.menuItems && order.menuItems.length > 0) ? (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(order.items || order.menuItems || []).map(
                        (item, index) => (
                          <tr key={index} className="hover:bg-gray-100">
                            <td className="px-4 py-2 whitespace-nowrap">
                              {item.item?.name || item.name || 'Unknown Item'}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 whitespace-pre-line">
                              {item.note || item.specialInstructions || ''}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-sm text-gray-500">No items available</p>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Close
              </button>

              <div className="flex items-center">
                <select
                  value={displayStatus(order.status)}
                  onChange={(e) =>
                    updateOrderStatus(
                      order._id,
                      normalizeStatus(e.target.value)
                    )
                  }
                  className={`ml-2 px-3 py-2 text-sm rounded border ${
                    order.status === 'completed'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : order.status === 'in-progress' ||
                        order.status === 'preparing'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-semibold mb-6">Chef Schedule Management</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <button
        className="mb-6 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        onClick={fetchOrders}
      >
        Refresh Schedule
      </button>

      {orders.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
          No orders scheduled at this time.
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Order ID
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Order Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Delivery Date
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {order._id.substring(0, 8)}...
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {order.createdAt
                      ? format(new Date(order.createdAt), 'MMM dd, yyyy')
                      : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {order.deliveryDate ||
                    order.deliveryDateValue ||
                    order.eventDate
                      ? format(
                          new Date(
                            order.deliveryDate ||
                              order.deliveryDateValue ||
                              order.eventDate
                          ),
                          'MMM dd, yyyy'
                        )
                      : 'N/A'}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {renderStatusSelect(order)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleViewDetails(order._id)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                      {order.status === 'completed' && (
                        <FaCheckCircle className="text-green-500" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Render order details modal when an order is selected */}
      {showDetailModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default ChefOrderManagement;

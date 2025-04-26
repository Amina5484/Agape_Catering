import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaUtensils, FaTimes } from 'react-icons/fa';

// Improved chef order management UI with schedule support
const ChefOrderManagement = () => {
  const [schedules, setSchedules] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch directly assigned orders
      try {
        const ordersResponse = await axios.get('/api/order/chef');
        console.log(`✅ Fetched ${ordersResponse.data.length} direct orders`);
        setOrders(ordersResponse.data);
      } catch (orderErr) {
        console.error('Error fetching direct orders:', orderErr);
        setError('Failed to fetch your direct orders');
      }

      // Fetch scheduled orders from the chef schedules endpoint
      try {
        const schedulesResponse = await axios.get('/api/chef/schedules');
        console.log(`✅ Fetched ${schedulesResponse.data.length} schedules`);
        setSchedules(schedulesResponse.data);
      } catch (scheduleErr) {
        console.error('Error fetching schedules:', scheduleErr);
        toast.warning('Unable to load your scheduled orders');
      }
    } catch (err) {
      console.error('Error in fetch process:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/order/chef/details/${orderId}`);

      console.log('Order details:', response.data);

      // Update the order list with the details
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, ...response.data } : order
        )
      );

      return response.data;
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order details');
      return null;
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
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`/api/order/${orderId}/status`, { status });

      // Update order status in the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
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

  // OrderDetailsModal component
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
                  order.deliveryDate ||
                  order.scheduledDate
                    ? format(
                        new Date(
                          order.eventDate ||
                            order.deliveryDateValue ||
                            order.deliveryDate ||
                            order.scheduledDate
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
                  value={order.status || 'pending'}
                  onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                  className="px-3 py-1 rounded text-sm font-medium border"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">Preparing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Main render method
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {loading && orders.length === 0 && schedules.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          <p className="font-medium">Error loading your assignments</p>
          <p className="text-sm">{error}</p>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Chef Dashboard
          </h1>

          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="flex border-b border-gray-200">
                <button className="px-4 py-2 font-medium text-blue-600 border-b-2 border-blue-600">
                  Your Assignments
                </button>
              </div>

              {/* Direct Orders Section */}
              <div className="p-4">
                <h2 className="text-lg font-medium text-gray-700 mb-2">
                  {orders.length > 0
                    ? `Direct Orders (${orders.length})`
                    : 'No direct orders assigned'}
                </h2>

                {orders.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr
                            key={order._id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleViewDetails(order._id)}
                          >
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                              {order._id?.substring(0, 8)}...
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              {order.userId?.name || 'N/A'}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              {getStatusBadge(order.status)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewDetails(order._id);
                                }}
                                className="text-blue-600 hover:text-blue-800 font-medium mr-2"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {/* Scheduled Orders Section */}
                <div className="mt-8">
                  <h2 className="text-lg font-medium text-gray-700 mb-2">
                    {schedules.length > 0
                      ? `Scheduled Orders (${schedules.length})`
                      : 'No scheduled orders assigned'}
                  </h2>

                  {schedules.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Schedule ID
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Shift
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {schedules.map((schedule) => (
                            <tr
                              key={schedule._id}
                              className="hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                if (schedule.orders && schedule.orders._id) {
                                  handleViewDetails(schedule.orders._id);
                                }
                              }}
                            >
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {schedule._id?.substring(0, 8)}...
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {schedule.date
                                  ? format(
                                      new Date(schedule.date),
                                      'MMM dd, yyyy'
                                    )
                                  : 'N/A'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {schedule.shiftTime || 'N/A'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {schedule.orders
                                  ? schedule.orders._id
                                    ? schedule.orders._id.substring(0, 8) +
                                      '...'
                                    : 'N/A'
                                  : 'No order details'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      schedule.orders &&
                                      schedule.orders._id
                                    ) {
                                      handleViewDetails(schedule.orders._id);
                                    } else {
                                      toast.warning(
                                        'No order details available for this schedule'
                                      );
                                    }
                                  }}
                                  className="text-blue-600 hover:text-blue-800 font-medium mr-2"
                                  disabled={
                                    !schedule.orders || !schedule.orders._id
                                  }
                                >
                                  View Order
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
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

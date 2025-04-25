import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:4000/api/catering/orders/${orderId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setOrder(response.data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error(
        error.response?.data?.message || 'Failed to load order details'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';

    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const navigateToGoogleMaps = () => {
    if (!order || !order.Address || !order.Address.coordinates) {
      toast.error('Location coordinates are not available for this order');
      return;
    }

    const { latitude, longitude } = order.Address.coordinates;

    if (!latitude || !longitude) {
      toast.error('Invalid coordinates');
      return;
    }

    // Navigate to Google Maps with coordinates
    const mapUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    window.open(mapUrl, '_blank'); // Open in new tab
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-100 p-6 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold text-gray-800">
                  Order Details
                </h1>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  {order.orderStatus || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Order Info */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Order Information
                </h2>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{order._id}</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="font-medium">
                      {formatDate(order.orderedDate)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-medium">
                      {formatDate(order.DeliveryDate)}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-medium">
                      {order.totalAmount?.toLocaleString('en-ET', {
                        style: 'currency',
                        currency: 'ETB',
                      }) || 'N/A'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <span
                      className={`font-medium ${
                        order.paymentStatus === 'paid'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {order.paymentStatus || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Delivery Information
                </h2>
                <div className="space-y-2">
                  <p className="flex justify-between">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">
                      {order.Address?.address || 'N/A'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">City:</span>
                    <span className="font-medium">
                      {order.Address?.city || 'N/A'}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">
                      {order.userId?.phone || 'N/A'}
                    </span>
                  </p>

                  <div className="mt-4">
                    <button
                      onClick={navigateToGoogleMaps}
                      className="flex items-center justify-center w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      <FaMapMarkerAlt className="mr-2" />
                      View Location on Google Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Order Items
              </h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.menuItems && order.menuItems.length > 0 ? (
                      order.menuItems.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.item?.name || 'Unknown Item'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.item?.price?.toLocaleString('en-ET', {
                              style: 'currency',
                              currency: 'ETB',
                            }) || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.createdAt
                              ? formatDate(item.createdAt)
                              : formatDate(order.orderedDate)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {(
                              (item.item?.price || 0) * item.quantity
                            ).toLocaleString('en-ET', {
                              style: 'currency',
                              currency: 'ETB',
                            })}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-4 text-center text-sm text-gray-500"
                        >
                          No items found in this order
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

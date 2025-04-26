import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaMapMarkerAlt, FaTimes, FaCheckCircle } from 'react-icons/fa';

const OrderManagement = () => {
  const { token } = useStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentNote, setPaymentNote] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [scheduledOrders, setScheduledOrders] = useState(new Set());

  useEffect(() => {
    fetchOrders();
  }, []);

  // Utility function to format dates consistently
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';

    try {
      const date = new Date(dateValue);
      // Check if date is valid
      if (isNaN(date.getTime())) return 'Invalid Date';

      // Format: Month Day, Year (e.g., April 23, 2025)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (err) {
      console.error('Date formatting error:', err);
      return 'Date Error';
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      // Fetch all schedules to check which orders are already scheduled
      let scheduledOrderIds = new Set();
      try {
        const schedulesResponse = await axios.get(
          'http://localhost:4000/api/catering/schedule',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (schedulesResponse.data && Array.isArray(schedulesResponse.data)) {
          schedulesResponse.data.forEach((schedule) => {
            if (schedule.orders && schedule.orders._id) {
              scheduledOrderIds.add(schedule.orders._id);
            }
          });
        }

        setScheduledOrders(scheduledOrderIds);
        console.log(
          'Orders that are already scheduled:',
          Array.from(scheduledOrderIds)
        );
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }

      // Fetch the orders as normal
      const response = await axios.get(
        'http://localhost:4000/api/catering/orders',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Debug: Log the first order raw data for examination
        if (response.data.length > 0) {
          const firstOrder = response.data[0];

          // Print ALL order fields and their values to identify the exact field names
          console.log('****** FULL ORDER DEBUG ******');
          console.log('Order ID:', firstOrder._id);
          console.log('ALL ORDER KEYS:', Object.keys(firstOrder));

          // Print each key-value pair to identify exact capitalization
          Object.keys(firstOrder).forEach((key) => {
            console.log(`${key}:`, firstOrder[key]);
          });

          // Specifically check for DeliveryDate variations with exact capitalization
          console.log('*** CHECKING DELIVERY DATE FIELDS ***');
          console.log('deliveryDate value:', firstOrder.deliveryDate);
          console.log('DeliveryDate value:', firstOrder.DeliveryDate);
          console.log('typeOfOrder value:', firstOrder.typeOfOrder);

          // Check the first order for any property that might contain 'delivery'
          for (const key of Object.keys(firstOrder)) {
            if (
              key.toLowerCase().includes('delivery') ||
              key.toLowerCase().includes('date')
            ) {
              console.log(`Found potential field: ${key} =`, firstOrder[key]);
            }
          }

          // Check all nested objects for delivery date fields
          for (const key of Object.keys(firstOrder)) {
            if (
              typeof firstOrder[key] === 'object' &&
              firstOrder[key] !== null
            ) {
              console.log(`Examining nested object '${key}':`);
              for (const nestedKey of Object.keys(firstOrder[key] || {})) {
                if (
                  nestedKey.toLowerCase().includes('delivery') ||
                  nestedKey.toLowerCase().includes('date')
                ) {
                  console.log(
                    `  - Found nested field: ${key}.${nestedKey} =`,
                    firstOrder[key][nestedKey]
                  );
                }
              }
            }
          }
        }

        // Process the dates in the orders
        const processedOrders = response.data.map((order) => {
          // Try to find delivery date using multiple approaches
          let deliveryDateValue = null;
          let deliveryDateFieldName = null;

          // Try to check all possible capitalization and field variations
          // This is the critical part where we need to match exactly how it's saved

          // Check for capitalization variants
          const fieldVariants = [
            'deliveryDate',
            'DeliveryDate',
            'Deliverydate',
            'deliverydate',
            'DELIVERYDATE',
            'Delivery_Date',
            'delivery_date',
            'DeliveryTime',
            'deliverytime',
            'DELIVERY_DATE',
          ];

          // Try each field variant
          for (const field of fieldVariants) {
            if (order[field] !== undefined && order[field] !== null) {
              deliveryDateValue = order[field];
              deliveryDateFieldName = field;
              console.log(
                `Found delivery date in field: ${field}`,
                deliveryDateValue
              );
              break;
            }
          }

          // If not found, check in Address object with multiple variants
          if (!deliveryDateValue && order.Address) {
            for (const field of fieldVariants) {
              if (
                order.Address[field] !== undefined &&
                order.Address[field] !== null
              ) {
                deliveryDateValue = order.Address[field];
                deliveryDateFieldName = `Address.${field}`;
                console.log(
                  `Found delivery date in Address.${field}`,
                  deliveryDateValue
                );
                break;
              }
            }
          }

          // Add properties showing what we found
          return {
            ...order,
            // Basic formatted dates
            formattedOrderDate: formatDate(
              order.createdAt || order.orderedDate
            ),
            formattedDeliveryDate: formatDate(deliveryDateValue),

            // Debug properties
            isScheduledOrder: order.typeOfOrder === 'scheduled',
            isMissingDeliveryDate:
              !deliveryDateValue && order.typeOfOrder === 'scheduled',
            deliveryDateFieldName: deliveryDateFieldName,
            deliveryDateValue: deliveryDateValue,
            // Add original order properties to debug in UI
            originalDeliveryDate: order.DeliveryDate,
            originalLowerDeliveryDate: order.deliveryDate,
          };
        });

        // Check for scheduled orders missing delivery dates
        const missingDates = processedOrders.filter(
          (order) => order.isMissingDeliveryDate
        );
        if (missingDates.length > 0) {
          console.warn(
            `Found ${missingDates.length} scheduled orders missing delivery dates:`
          );
          missingDates.forEach((order) => {
            console.warn(
              `Order ${order._id} is missing delivery date. Type: ${order.typeOfOrder}`
            );
          });
        }

        setOrders(processedOrders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to identify which field contains the delivery date
  const getDeliveryDateFieldName = (order) => {
    if (order.deliveryDate) return 'deliveryDate';
    if (order.DeliveryDate) return 'DeliveryDate';
    if (order.delivery_date) return 'delivery_date';
    if (order.deliveryTime) return 'deliveryTime';
    if (order.DeliveryTime) return 'DeliveryTime';
    if (order.scheduled_date) return 'scheduled_date';
    if (order.scheduledDate) return 'scheduledDate';

    if (order.Address) {
      if (order.Address.deliveryDate) return 'Address.deliveryDate';
      if (order.Address.DeliveryDate) return 'Address.DeliveryDate';
      if (order.Address.delivery_date) return 'Address.delivery_date';
      if (order.Address.scheduledDate) return 'Address.scheduledDate';
    }

    if (order.typeOfOrderMeta) {
      if (order.typeOfOrderMeta.date) return 'typeOfOrderMeta.date';
      if (order.typeOfOrderMeta.scheduledDate)
        return 'typeOfOrderMeta.scheduledDate';
    }

    return null;
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      // Debug log
      console.log('Accepting order:', orderId);

      // Confirm with chef about notifying customer
      if (
        !window.confirm(
          `Are you sure you want to accept this order? This will notify the customer that their order has been accepted.`
        )
      ) {
        return;
      }

      // Get token from localStorage as backup
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        toast.error('Authentication token missing. Please log in again.');
        return;
      }

      // Show loading toast
      const loadingToastId = toast.loading(
        'Accepting order and notifying customer...'
      );

      // Get the order details to ensure we have customer email
      const orderToUpdate = orders.find((order) => order._id === orderId);

      if (!orderToUpdate || !orderToUpdate.userId) {
        console.error('Order details missing userId information');
        toast.error('Missing customer details for notification');
      }

      console.log('Customer details for notification:', {
        email: orderToUpdate?.userId?.email,
        name: orderToUpdate?.userId?.name,
        phone: orderToUpdate?.userId?.phone,
      });

      // Log the API request for debugging
      console.log(`Sending request to accept order with notification:`, {
        endpoint: `http://localhost:4000/api/catering/order/accept/${orderId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const response = await axios.post(
        `http://localhost:4000/api/catering/order/accept/${orderId}`,
        {
          // Add notification flag and all user contact info
          notifyCustomer: true,
          customerEmail: orderToUpdate?.userId?.email,
          customerName: orderToUpdate?.userId?.name,
          customerPhone: orderToUpdate?.userId?.phone,
          message: `Your order #${orderId.substring(
            0,
            8
          )} has been ACCEPTED! We're preparing your food with care.`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Log response
      console.log('Accept order response:', response.data);

      // Dismiss loading toast
      toast.dismiss(loadingToastId);

      // Show success message including the email address if available
      if (orderToUpdate?.userId?.email) {
        toast.success(
          `Order accepted! Notification sent to ${orderToUpdate.userId.email}`
        );
      } else {
        toast.success(
          'Order accepted! (Customer notification may have failed)'
        );
      }

      fetchOrders();
    } catch (error) {
      console.error('Error accepting order:', error);

      // Log detailed error information
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }

      toast.error(
        error.response?.data?.message ||
          'Failed to accept order. Please try again.'
      );
    }
  };

  const handleUpdateStatus = async (orderId, newStatus, currentStatus) => {
    try {
      const normalizedStatus = normalizeStatus(newStatus);
      const toastId = toast.loading(`Updating order status to ${newStatus}...`);

      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        toast.dismiss(toastId);
        toast.error('Authentication token not found. Please log in again.');
        return;
      }

      // Find the order to get customer details
      const orderToUpdate = orders.find((order) => order._id === orderId);
      if (!orderToUpdate || !orderToUpdate.userId) {
        toast.dismiss(toastId);
        toast.error('Order details not found.');
        return;
      }

      // Prepare the request payload
      const updateData = {
        status: normalizedStatus,
        notifyCustomer: true,
        customerEmail: orderToUpdate.userId?.email,
        customerName: orderToUpdate.userId?.name,
        customerPhone: orderToUpdate.userId?.phone,
        message: `Your order #${orderId.substring(
          0,
          8
        )} status has been updated to: ${newStatus.toUpperCase()}`,
      };

      try {
        // Try with POST method first
        const response = await axios.post(
          `http://localhost:4000/api/catering/order/update-status/${orderId}`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        toast.dismiss(toastId);
        toast.success(
          `Order status updated to ${newStatus}. Customer notified.`
        );
        fetchOrders();
        return;
      } catch (postError) {
        console.error('POST method failed:', postError);

        // Try with PUT method if POST fails
        try {
          const response = await axios.put(
            `http://localhost:4000/api/catering/order/update-status/${orderId}`,
            updateData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          toast.dismiss(toastId);
          toast.success(
            `Order status updated to ${newStatus}. Customer notified.`
          );
          fetchOrders();
          return;
        } catch (putError) {
          console.error('PUT method also failed:', putError);
          toast.dismiss(toastId);
          toast.error(
            putError.response?.data?.message ||
              'Failed to update order status. Please try again.'
          );
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(
        error.response?.data?.message ||
          'An unexpected error occurred. Please try again.'
      );
      fetchOrders();
    }
  };

  // Helper function to normalize status values to match backend expectations
  const normalizeStatus = (status) => {
    // Backend validates against: 'pending', 'confirmed', 'preparing', 'ready', 'delivered'
    const statusMap = {
      Pending: 'pending',
      Accepted: 'confirmed', // 'Accepted' in UI maps to 'confirmed' in DB
      Preparing: 'preparing',
      Ready: 'ready',
      Delivered: 'delivered',
    };

    // Either use the mapping or convert to lowercase if not in mapping
    return statusMap[status] || status.toLowerCase();
  };

  // Add a helper function to convert DB status to display format
  const displayStatus = (dbStatus) => {
    // Convert DB status (lowercase) to UI status (title case)
    const statusMap = {
      pending: 'Pending',
      confirmed: 'Accepted',
      preparing: 'Preparing',
      ready: 'Ready',
      delivered: 'Delivered',
    };

    return statusMap[dbStatus] || dbStatus;
  };

  const handleViewLocation = async (order) => {
    try {
      if (!order) {
        toast.error('Order information is missing');
        return;
      }

      // Log the entire order object to see all properties
      console.log('FULL ORDER OBJECT:', order);

      // Add debug helper to see all address-like properties
      const findCoordinateFields = (obj, path = '') => {
        if (!obj || typeof obj !== 'object') return;

        Object.keys(obj).forEach((key) => {
          const currentPath = path ? `${path}.${key}` : key;

          // Look for coordinate-like keys
          if (
            key === 'lat' ||
            key === 'latitude' ||
            key === 'lng' ||
            key === 'longitude' ||
            key === 'coordinates' ||
            key === 'location' ||
            key === 'address' ||
            key === 'Address' ||
            key === 'position'
          ) {
            console.log(
              `Potential coordinate field found: ${currentPath}:`,
              obj[key]
            );
          }

          // Recurse into nested objects but avoid circular references
          if (obj[key] && typeof obj[key] === 'object' && key !== 'parent') {
            findCoordinateFields(obj[key], currentPath);
          }
        });
      };

      // Search for any coordinate-like fields in the object
      console.log('SEARCHING FOR COORDINATE FIELDS:');
      findCoordinateFields(order);

      // Define Addis Ababa default coordinates
      const addisAbabaCoords = { latitude: 9.03, longitude: 38.74 };

      // Direct access to order coordinates - check all possible paths
      let coordinates = null;
      let coordinateSource = '';

      // Try direct coordinates access
      if (order.lat && order.lng) {
        coordinates = { latitude: order.lat, longitude: order.lng };
        coordinateSource = 'order.lat/lng';
      } else if (order.latitude && order.longitude) {
        coordinates = { latitude: order.latitude, longitude: order.longitude };
        coordinateSource = 'order.latitude/longitude';
      }
      // Check Address property (most common)
      else if (order.Address) {
        if (order.Address.coordinates) {
          if (
            order.Address.coordinates.latitude &&
            order.Address.coordinates.longitude
          ) {
            coordinates = {
              latitude: order.Address.coordinates.latitude,
              longitude: order.Address.coordinates.longitude,
            };
            coordinateSource = 'order.Address.coordinates';
          } else if (
            order.Address.coordinates.lat &&
            order.Address.coordinates.lng
          ) {
            coordinates = {
              latitude: order.Address.coordinates.lat,
              longitude: order.Address.coordinates.lng,
            };
            coordinateSource = 'order.Address.coordinates lat/lng';
          }
        } else if (order.Address.latitude && order.Address.longitude) {
          coordinates = {
            latitude: order.Address.latitude,
            longitude: order.Address.longitude,
          };
          coordinateSource = 'order.Address direct';
        } else if (order.Address.lat && order.Address.lng) {
          coordinates = {
            latitude: order.Address.lat,
            longitude: order.Address.lng,
          };
          coordinateSource = 'order.Address lat/lng';
        }
      }
      // Check location property
      else if (order.location) {
        if (order.location.latitude && order.location.longitude) {
          coordinates = {
            latitude: order.location.latitude,
            longitude: order.location.longitude,
          };
          coordinateSource = 'order.location';
        } else if (order.location.lat && order.location.lng) {
          coordinates = {
            latitude: order.location.lat,
            longitude: order.location.lng,
          };
          coordinateSource = 'order.location lat/lng';
        }
      }
      // Check for coordinates field
      else if (order.coordinates) {
        if (order.coordinates.latitude && order.coordinates.longitude) {
          coordinates = {
            latitude: order.coordinates.latitude,
            longitude: order.coordinates.longitude,
          };
          coordinateSource = 'order.coordinates';
        } else if (order.coordinates.lat && order.coordinates.lng) {
          coordinates = {
            latitude: order.coordinates.lat,
            longitude: order.coordinates.lng,
          };
          coordinateSource = 'order.coordinates lat/lng';
        }
      }

      // For debugging, let's check if userId has location info
      if (!coordinates && order.userId && typeof order.userId === 'object') {
        console.log('Checking userId for location data:', order.userId);
      }

      // Validate coordinates
      if (
        coordinates &&
        isValidCoordinate(coordinates.latitude) &&
        isValidCoordinate(coordinates.longitude)
      ) {
        console.log(
          `USING EXACT ORDER LOCATION from ${coordinateSource}:`,
          coordinates
        );
        toast.success(`Opening exact order location (${coordinateSource})`);
      } else {
        console.log(
          'NO VALID COORDINATES FOUND IN ORDER, using default Addis Ababa location'
        );
        toast.warning(
          'Exact order location unavailable. Showing Addis Ababa center.'
        );
        coordinates = addisAbabaCoords;
      }

      // Use Google Maps place format with marker (q=lat,lng) and high zoom level
      const mapUrl = `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}&z=17`;
      window.open(mapUrl, '_blank');
    } catch (error) {
      console.error('Error processing order location:', error);
      toast.error('Failed to open order location map');
    }
  };

  // Helper function to validate coordinates
  const isValidCoordinate = (coord) => {
    return coord !== null && coord !== undefined && !isNaN(parseFloat(coord));
  };

  // Function to directly notify customer about order status changes
  const notifyCustomer = async (orderId, status, orderDetails = {}) => {
    try {
      console.log(
        `Attempting to notify customer about order ${orderId} status change to ${status}`
      );

      // Get token from localStorage as backup
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        console.error('Authentication token missing for notification');
        return false;
      }

      // Instead of using a dedicated notification endpoint that doesn't exist,
      // we'll use the update status endpoint with a notifyCustomer flag
      // This endpoint already exists in the backend and can send emails

      console.log(
        'Sending notification request via status update with email notification flag'
      );

      const response = await axios.post(
        `http://localhost:4000/api/catering/order/update-status/${orderId}`,
        {
          // Keep the current status, we're just triggering an email notification
          orderStatus: status,
          status: status,
          // This flag tells the backend to send an email notification
          notifyCustomer: true,
          // Include customer details to help the backend
          customerEmail: orderDetails.customerEmail,
          customerName: orderDetails.customerName,
          customerPhone: orderDetails.customerPhone,
          message: `Your order #${orderId.substring(
            0,
            8
          )} status has been updated to: ${status}`,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      console.log('Customer notification request sent:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to send customer notification:', error);
      // Don't throw error, just log it - we don't want to interrupt the main flow
      return false;
    }
  };

  // Function to handle row click and show order details
  const handleRowClick = (order) => {
    // Log detailed debug information about the order's dates
    debugOrderDates(order);

    // Log the raw order data for inspection
    console.log('===== CLICKED ORDER RAW DATA =====');
    console.log(JSON.stringify(order, null, 2));

    setSelectedOrder(order);
    setShowModal(true);
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Modal component to display order details
  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl">
          <div className="sticky top-0 bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Order Details</h3>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>

          <div className="p-6">
            {/* Order ID and Status */}
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold">Order #{order._id}</h2>
                <p className="text-sm text-gray-500">
                  Created: {formatDate(order.createdAt)}
                </p>
              </div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium 
                  ${
                    order.orderStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.orderStatus === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : order.orderStatus === 'preparing'
                      ? 'bg-orange-100 text-orange-800'
                      : order.orderStatus === 'ready'
                      ? 'bg-indigo-100 text-indigo-800'
                      : order.orderStatus === 'delivered'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {displayStatus(order.orderStatus)}
                </span>
              </div>
            </div>

            {/* Customer Info */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <span className="text-gray-600">Name:</span>{' '}
                  {order.userId?.name || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-600">Email:</span>{' '}
                  {order.userId?.email || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-600">Phone:</span>{' '}
                  {order.userId?.phone || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-600">Order Type:</span>{' '}
                  {order.typeOfOrder || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-600">Number of Guests:</span>{' '}
                  {order.numberOfGuest || 'N/A'}
                </p>
              </div>
            </div>

            {/* Special Instructions */}
            {order.specialInstructions && (
              <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Special Instructions</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.specialInstructions}
                </p>
              </div>
            )}

            {/* Delivery Information */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <span className="text-gray-600">Delivery Date:</span>{' '}
                  {order.deliveryDateValue ? (
                    <div className="flex flex-col">
                      <span>{formatDate(order.deliveryDateValue)}</span>
                      <span className="text-xs text-gray-500">
                        ({order.typeOfOrder || 'N/A'})
                      </span>
                      <span className="text-xs text-blue-500">
                        Field: {order.deliveryDateFieldName || 'unknown'}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span
                        className={
                          order.isScheduledOrder
                            ? 'text-red-500 text-xs font-bold'
                            : 'text-gray-500 text-xs'
                        }
                      >
                        {order.isScheduledOrder ? 'Not set!' : 'N/A'}
                      </span>
                      {order.isScheduledOrder && (
                        <div className="text-xs text-red-500">
                          <span>(Scheduled)</span>
                          <br />
                          <span>
                            DeliveryDate:{' '}
                            {order.originalDeliveryDate ? 'exists' : 'missing'}
                          </span>
                          <br />
                          <span>
                            deliveryDate:{' '}
                            {order.originalLowerDeliveryDate
                              ? 'exists'
                              : 'missing'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </p>
                <p>
                  <span className="text-gray-600">Address:</span>{' '}
                  {order.Address?.addressText || 'N/A'}
                </p>
                <div className="md:col-span-2 mt-2">
                  <button
                    onClick={() => handleViewLocation(order)}
                    className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    <FaMapMarkerAlt className="mr-1" />
                    View on Map
                  </button>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-6">
              <h3 className="font-semibold mb-2">Order Items</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.isArray(order.menuItems) &&
                    order.menuItems.length > 0 ? (
                      order.menuItems.map((item) => (
                        <tr key={item._id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.item?.name || 'Unknown Item'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            {item.item?.price?.toLocaleString('en-ET', {
                              style: 'currency',
                              currency: 'ETB',
                            }) || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                            {(item.item?.price * item.quantity)?.toLocaleString(
                              'en-ET',
                              {
                                style: 'currency',
                                currency: 'ETB',
                              }
                            ) || 'N/A'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-4 py-3 text-center text-sm text-gray-500"
                        >
                          No items in this order
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan="3"
                        className="px-4 py-3 text-right text-sm font-medium text-gray-900"
                      >
                        Total:
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
                        {order.totalAmount?.toLocaleString('en-ET', {
                          style: 'currency',
                          currency: 'ETB',
                        }) || 'N/A'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Payment Information */}
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center justify-between">
                Payment Information
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    order.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : order.paymentStatus === 'partially_paid'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {order.paymentStatus === 'paid'
                    ? 'PAID'
                    : order.paymentStatus === 'partially_paid'
                    ? 'PARTIALLY PAID'
                    : 'UNPAID'}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p>
                  <span className="text-gray-600">Payment Status:</span>{' '}
                  <span
                    className={`font-medium ${
                      order.paymentStatus === 'paid'
                        ? 'text-green-600'
                        : order.paymentStatus === 'partially_paid'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}
                  >
                    {order.paymentStatus
                      ? order.paymentStatus.replace('_', ' ').toUpperCase()
                      : 'N/A'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Total Amount:</span>{' '}
                  {order.totalAmount?.toLocaleString('en-ET', {
                    style: 'currency',
                    currency: 'ETB',
                  }) || 'N/A'}
                </p>
                <p>
                  <span className="text-gray-600">Paid Amount:</span>{' '}
                  <span
                    className={
                      order.paidAmount > 0 ? 'text-green-600 font-medium' : ''
                    }
                  >
                    {order.paidAmount?.toLocaleString('en-ET', {
                      style: 'currency',
                      currency: 'ETB',
                    }) || '0 ETB'}
                  </span>
                </p>
                <p>
                  <span className="text-gray-600">Remaining:</span>{' '}
                  <span
                    className={
                      order.totalAmount - order.paidAmount > 0
                        ? 'text-red-600 font-medium'
                        : 'text-green-600 font-medium'
                    }
                  >
                    {(order.totalAmount - order.paidAmount)?.toLocaleString(
                      'en-ET',
                      {
                        style: 'currency',
                        currency: 'ETB',
                      }
                    ) || 'N/A'}
                  </span>
                </p>
              </div>

              {/* Payment Record Button - Only show if not fully paid */}
              {order.paymentStatus !== 'paid' && (
                <div className="mt-4">
                  <button
                    onClick={() => {
                      setShowPaymentModal(true);
                      setSelectedOrder(order);
                      onClose(); // Close the details modal
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition w-full flex items-center justify-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Record Payment
                  </button>
                </div>
              )}

              {/* Payment History */}
              {order.paymentHistory && order.paymentHistory.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Payment History
                  </h4>
                  <div className="max-h-40 overflow-y-auto">
                    <table className="min-w-full text-xs">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-2 py-1 text-left">Date</th>
                          <th className="px-2 py-1 text-right">Amount</th>
                          <th className="px-2 py-1 text-left">Method</th>
                          <th className="px-2 py-1 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {order.paymentHistory.map((payment, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-2 py-1">
                              {new Date(payment.date).toLocaleDateString()}
                            </td>
                            <td className="px-2 py-1 text-right font-medium">
                              {payment.amount?.toLocaleString('en-ET', {
                                style: 'currency',
                                currency: 'ETB',
                              })}
                            </td>
                            <td className="px-2 py-1 capitalize">
                              {payment.method}
                            </td>
                            <td className="px-2 py-1">
                              <span
                                className={`px-1 py-0.5 text-xs rounded-full ${
                                  payment.status === 'success'
                                    ? 'bg-green-100 text-green-800'
                                    : payment.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {payment.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Show this when order is in "ready" status and payment is not completed */}
              {order.orderStatus === 'ready' &&
                order.paymentStatus !== 'paid' &&
                order.totalAmount - order.paidAmount > 0 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">Payment Required:</span>{' '}
                      This order is ready but still has a remaining balance of{' '}
                      {(order.totalAmount - order.paidAmount)?.toLocaleString(
                        'en-ET',
                        { style: 'currency', currency: 'ETB' }
                      )}
                      . The customer has been notified to complete the payment.
                    </p>
                  </div>
                )}

              {/* Show this when order is ready and payment is completed */}
              {order.orderStatus === 'ready' &&
                order.paymentStatus === 'paid' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">Payment Completed:</span>{' '}
                      This order is fully paid and ready for delivery.
                    </p>
                  </div>
                )}
            </div>

            {/* Status Update */}
            <div className="mt-8 border-t pt-4">
              <h3 className="font-semibold mb-4">Update Order Status</h3>
              <div className="flex items-center gap-4">
                <select
                  value={displayStatus(order.orderStatus) || 'Pending'}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent row click
                    handleUpdateStatus(
                      order._id,
                      e.target.value,
                      order.orderStatus
                    );
                  }}
                  onClick={(e) => e.stopPropagation()} // Prevent row click
                  className={`px-1 py-1 rounded text-xs font-medium border ${
                    order.orderStatus === 'pending'
                      ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                      : order.orderStatus === 'confirmed'
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : order.orderStatus === 'preparing'
                      ? 'bg-orange-50 border-orange-200 text-orange-800'
                      : order.orderStatus === 'ready'
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                      : order.orderStatus === 'delivered'
                      ? 'bg-blue-50 border-blue-200 text-blue-800'
                      : 'bg-gray-50 border-gray-200 text-gray-800'
                  }`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Ready">Ready</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // This function will explicitly log all date fields in the order to help debug
  const debugOrderDates = (order) => {
    if (!order) return;

    console.log('----- DEBUG ORDER DATES -----');
    console.log('Order ID:', order._id);
    console.log('Order Type:', order.typeOfOrder);

    // Check for direct date fields at root level
    console.log('Root level date fields:');
    console.log('- createdAt:', order.createdAt);
    console.log('- deliveryDate:', order.deliveryDate);
    console.log('- DeliveryDate:', order.DeliveryDate);

    // Check for date fields in the Address object
    if (order.Address) {
      console.log('Address object date fields:');
      console.log('- Address.deliveryDate:', order.Address.deliveryDate);
      console.log('- Address.DeliveryDate:', order.Address.DeliveryDate);
    }

    // Check TypeOfOrder related fields
    console.log('Order type and related fields:');
    console.log('- typeOfOrder:', order.typeOfOrder);
    console.log('- TypeOfOrder:', order.TypeOfOrder);

    if (order.typeOfOrderMeta) {
      console.log('typeOfOrderMeta fields:');
      Object.keys(order.typeOfOrderMeta).forEach((key) => {
        console.log(`- typeOfOrderMeta.${key}:`, order.typeOfOrderMeta[key]);
      });
    }

    // Let's also log the original PlaceOrder data format
    console.log('Looking for order data format:');
    console.log(
      '- Is DeliveryDate capitalized in the order object:',
      'DeliveryDate' in order
    );
    console.log(
      '- Is deliveryDate lowercase in the order object:',
      'deliveryDate' in order
    );
  };

  const handleRecordPayment = async (orderId) => {
    try {
      setProcessingPayment(true);

      // Validate payment amount
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid payment amount');
        setProcessingPayment(false);
        return;
      }

      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        toast.error('Authentication token missing. Please log in again.');
        setProcessingPayment(false);
        return;
      }

      // Send payment record to server
      const response = await axios.post(
        `http://localhost:4000/api/order/payment/${orderId}`,
        {
          amount,
          paymentMethod,
          notes: paymentNote,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      // Display success message
      toast.success('Payment recorded successfully');

      // Close payment modal
      setShowPaymentModal(false);

      // Reset form
      setPaymentAmount('');
      setPaymentMethod('cash');
      setPaymentNote('');

      // Refresh the orders list
      fetchOrders();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setProcessingPayment(false);
    }
  };

  // Close the payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentMethod('cash');
    setPaymentNote('');
  };

  // Add this component for the payment modal:
  const PaymentRecordModal = ({ order, onClose }) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
          <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
            <h3 className="text-xl font-bold">Record Payment</h3>
            <button
              onClick={closePaymentModal}
              className="text-white hover:text-red-200 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Order ID:</span>
                <span className="font-medium">
                  {order._id?.substring(0, 8)}...
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Total Amount:</span>
                <span className="font-medium">
                  {order.totalAmount?.toLocaleString('en-ET', {
                    style: 'currency',
                    currency: 'ETB',
                  })}
                </span>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-700">Remaining Balance:</span>
                <span className="font-medium text-red-600">
                  {(order.totalAmount - order.paidAmount)?.toLocaleString(
                    'en-ET',
                    { style: 'currency', currency: 'ETB' }
                  )}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Payment Amount (ETB)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                min="0"
                max={order.totalAmount - order.paidAmount}
                step="0.01"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Add any notes about this payment"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closePaymentModal}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800"
                disabled={processingPayment}
              >
                Cancel
              </button>
              <button
                onClick={() => handleRecordPayment(order._id)}
                className="px-4 py-2 bg-green-600 rounded-md hover:bg-green-700 text-white flex items-center"
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  'Record Payment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Handle scheduling an order directly instead of showing the popup
  const handleScheduleOrder = async (order, e) => {
    e.stopPropagation(); // Prevent row click

    // If already scheduled, don't do anything
    if (scheduledOrders.has(order._id)) {
      toast.info('This order is already scheduled');
      return;
    }

    try {
      console.log('Attempting to schedule order with ID:', order._id);

      // First fetch the list of executive chefs to get a valid chefId
      // We need to select an available chef for the assignment
      let chefId;

      try {
        // Try to get a list of available chefs
        const chefsResponse = await axios.get(
          'http://localhost:4000/api/user/chefs',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Use the first chef from the list
        if (chefsResponse.data && chefsResponse.data.length > 0) {
          chefId = chefsResponse.data[0]._id;
          console.log('Using chef ID:', chefId);
        } else {
          // If no chefs available, use the current user's ID as a fallback
          chefId = localStorage.getItem('userId');
          console.log(
            'No chefs found, using current user ID as fallback:',
            chefId
          );
        }
      } catch (chefError) {
        // If we can't fetch chefs, use a hardcoded ID or the current user ID
        console.error('Error fetching chefs:', chefError);
        chefId = localStorage.getItem('userId');
        console.log('Using fallback user ID:', chefId);
      }

      if (!chefId) {
        throw new Error('Could not find a valid chef ID for assignment');
      }

      // Use the existing assign schedule endpoint from catering manager controller
      const response = await axios.post(
        `http://localhost:4000/api/catering/schedule/assign`,
        {
          orderId: order._id,
          chefId: chefId, // This is required by the backend
          shiftTime: 'morning', // default value
          date: new Date().toISOString().split('T')[0], // today's date
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Schedule response:', response.data);
      toast.success('Order scheduled for chef successfully');

      // Update local state to show this order as scheduled
      setScheduledOrders((prev) => new Set([...prev, order._id]));

      // Refresh orders after scheduling
      fetchOrders();
    } catch (error) {
      console.error('Error scheduling order:', error);
      const errorMsg =
        error.response?.data?.message || error.message || 'Unknown error';
      console.error('Error details:', errorMsg);
      toast.error(`Failed to schedule order: ${errorMsg}`);
    }
  };

  // Add the isOrderCompleted function
  const isOrderCompleted = (order) => {
    return (
      order.orderStatus === 'completed' ||
      order.status === 'completed' ||
      order.orderStatus === 'delivered'
    );
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
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(orders) && orders.length > 0 ? (
                orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition duration-150 cursor-pointer"
                    onClick={() => handleRowClick(order)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {order._id?.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {order.userId?.name || 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.userId?.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">
                        {order.totalAmount?.toLocaleString('en-ET', {
                          style: 'currency',
                          currency: 'ETB',
                        }) || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {formatDate(order.createdAt || order.orderedDate)}
                      </div>
                    </td>
{/* <<<<<<< HEAD
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
======= */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-800">
                        {order.deliveryDateValue ? (
                          <div className="flex flex-col">
                            <span>{formatDate(order.deliveryDateValue)}</span>
                            <span className="text-xs text-gray-500">
                              ({order.typeOfOrder || 'N/A'})
                            </span>
                            <span className="text-xs text-blue-500">
                              Field: {order.deliveryDateFieldName || 'unknown'}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span
                              className={
                                order.isScheduledOrder
                                  ? 'text-red-500 text-xs font-bold'
                                  : 'text-gray-500 text-xs'
                              }
                            >
                              {order.isScheduledOrder ? 'Not set!' : 'N/A'}
                            </span>
                            {order.isScheduledOrder && (
                              <div className="text-xs text-red-500">
                                <span>(Scheduled)</span>
                                <br />
                                <span>
                                  DeliveryDate:{' '}
                                  {order.originalDeliveryDate
                                    ? 'exists'
                                    : 'missing'}
                                </span>
                                <br />
                                <span>
                                  deliveryDate:{' '}
                                  {order.originalLowerDeliveryDate
                                    ? 'exists'
                                    : 'missing'}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <button
                        onClick={(e) => handleScheduleOrder(order, e)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          scheduledOrders.has(order._id)
                            ? 'bg-green-100 text-green-800 cursor-default'
                            : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        }`}
                        disabled={
                          isOrderCompleted(order) ||
                          scheduledOrders.has(order._id)
                        }
                      >
                        {scheduledOrders.has(order._id) ? (
                          <span className="flex items-center">
                            <FaCheckCircle className="mr-1" /> Scheduled
                          </span>
                        ) : (
                          'Schedule'
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select
                        value={displayStatus(order.orderStatus) || 'Pending'}
                        onChange={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleUpdateStatus(
                            order._id,
                            e.target.value,
                            order.orderStatus
                          );
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent row click
                        className={`px-1 py-1 rounded text-xs font-medium border ${
                          order.orderStatus === 'pending'
                            ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                            : order.orderStatus === 'confirmed'
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : order.orderStatus === 'preparing'
                            ? 'bg-orange-50 border-orange-200 text-orange-800'
                            : order.orderStatus === 'ready'
                            ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                            : order.orderStatus === 'delivered'
                            ? 'bg-blue-50 border-blue-200 text-blue-800'
                            : 'bg-gray-50 border-gray-200 text-gray-800'
                        }`}

                      >
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Preparing">Preparing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleViewLocation(order);
                          }}
                          className="flex items-center text-gray-600 hover:text-green-700 transition duration-300 hover:scale-110 bg-gray-100 hover:bg-gray-200 px-1 py-1 rounded text-xs"
                        >
                          <FaMapMarkerAlt className="mr-1 text-red-500" />
                          Location
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="9"
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

      {/* Render the modal if an order is selected */}
      {showModal && selectedOrder && (
        <OrderDetailsModal order={selectedOrder} onClose={closeModal} />
      )}

      {/* Render the payment modal if showPaymentModal is true */}
      {showPaymentModal && (
        <PaymentRecordModal order={selectedOrder} onClose={closePaymentModal} />
      )}
    </div>
  );
};

export default OrderManagement;

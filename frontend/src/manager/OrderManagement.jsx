import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "../context/StoreContext";

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
      const response = await axios.get("http://localhost:4000/api/catering/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error(error.response?.data?.message || "Failed to fetch orders");
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
      toast.success("Order accepted successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error accepting order:", error);
      toast.error(error.response?.data?.message || "Failed to accept order");
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
      toast.success("Order status updated successfully");
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.response?.data?.message || "Failed to update order status");
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
      toast.error(error.response?.data?.message || 'Failed to fetch customer location');
    }
  };

  if (loading) {
    return <div className="p-6 ml-64">Loading...</div>;
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
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders && orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{order._id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">{order.customerName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-800">
                        {order.items.map((item) => (
                          <div key={item._id}>
                            {item.name} x {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">${order.total}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        order.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleAcceptOrder(order._id)}
                          className="text-green-600 hover:text-green-800 transition duration-300 hover:scale-110"
                        >
                          Accept
                        </button>
                      )}
                      {order.status === 'Accepted' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Completed')}
                          className="text-blue-600 hover:text-blue-800 transition duration-300 hover:scale-110"
                        >
                          Complete
                        </button>
                      )}
                      <button
                        onClick={() => handleViewLocation(order.customerId)}
                        className="text-gray-600 hover:text-gray-800 transition duration-300 hover:scale-110"
                      >
                        View Location
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
              <h3 className="text-2xl font-semibold mb-6 text-gray-700">Customer Location</h3>
              <div className="space-y-4">
                <p className="text-gray-800">
                  <span className="font-medium">Address:</span> {customerLocation.address}
                </p>
                <p className="text-gray-800">
                  <span className="font-medium">Coordinates:</span> {customerLocation.latitude}, {customerLocation.longitude}
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    setCustomerLocation(null);
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement; 
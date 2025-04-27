import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import {
  FaCalendarAlt,
  FaClock,
  FaUtensils,
  FaUser,
  FaTimes,
} from 'react-icons/fa';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch schedules from the catering manager's endpoint
      const response = await axios.get(
        'http://localhost:4000/api/catering/schedule',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('Fetched schedules:', response.data);
      setSchedules(response.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
      setError('Failed to load your schedules');
      toast.error('Unable to load your scheduled orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Get the schedule to find the order ID
      const schedule = schedules.find((s) => s._id === scheduleId);
      if (!schedule || !schedule.orders) {
        toast.error('Schedule or order not found');
        return;
      }

      // Update the order status using the correct endpoint
      await axios.post(
        `http://localhost:4000/api/catering/chef/schedules/${scheduleId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update local state
      setSchedules((prevSchedules) =>
        prevSchedules.map((s) =>
          s._id === scheduleId
            ? { ...s, orders: { ...s.orders, status: newStatus } }
            : s
        )
      );

      toast.success('Order status updated successfully');
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(
        error.response?.data?.message || 'Failed to update order status'
      );
    }
  };

  const handleRowClick = (schedule) => {
    setSelectedSchedule(schedule);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
        <p className="font-medium">Error loading your schedules</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Your Scheduled Orders
        </h2>
        <button
          onClick={fetchSchedules}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          Refresh
        </button>
      </div>

      {schedules.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
          No scheduled orders assigned yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {schedules.map((schedule) => (
                <tr
                  key={schedule._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(schedule)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule._id?.substring(0, 8)}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(schedule.date), 'MMMM dd, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {schedule.orders?.deliveryDate
                      ? format(
                          new Date(schedule.orders.deliveryDate),
                          'MMMM dd, yyyy'
                        )
                      : schedule.orders?.deliveryDateValue
                      ? format(
                          new Date(schedule.orders.deliveryDateValue),
                          'MMMM dd, yyyy'
                        )
                      : 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <select
                      value={schedule.orders?.status || 'preparing'}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(schedule._id, e.target.value);
                      }}
                      className={`px-2 py-1 rounded text-sm font-medium border ${
                        schedule.orders?.status === 'completed'
                          ? 'bg-green-50 border-green-200 text-green-800'
                          : 'bg-blue-50 border-blue-200 text-blue-800'
                      }`}
                    >
                      <option value="preparing">Preparing</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Modal */}
      {showModal && selectedSchedule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Order Details
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-4">
                {/* Schedule Information */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Schedule Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p className="text-sm">
                        <span className="font-medium">Schedule ID:</span>{' '}
                        {selectedSchedule._id}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Date:</span>{' '}
                        {format(
                          new Date(selectedSchedule.date),
                          'MMMM dd, yyyy'
                        )}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Delivery Date:</span>{' '}
                        {selectedSchedule.orders?.deliveryDate
                          ? format(
                              new Date(selectedSchedule.orders.deliveryDate),
                              'MMMM dd, yyyy'
                            )
                          : selectedSchedule.orders?.deliveryDateValue
                          ? format(
                              new Date(
                                selectedSchedule.orders.deliveryDateValue
                              ),
                              'MMMM dd, yyyy'
                            )
                          : 'Not specified'}
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Status:</span>{' '}
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedSchedule.orders?.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {selectedSchedule.orders?.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                {selectedSchedule.orders && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">
                      Order Information
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <p className="text-sm mb-4">
                        <span className="font-medium">Order ID:</span>{' '}
                        {selectedSchedule.orders._id}
                      </p>
                      <p className="text-sm mb-4">
                        <span className="font-medium">Number of Guests:</span>{' '}
                        {selectedSchedule.orders.numberOfGuest || 'N/A'}
                      </p>

                      {/* Menu Items Table */}
                      {selectedSchedule.orders.menuItems && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Menu Items
                          </h5>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead>
                                <tr>
                                  <th className="px-4 py-2 bg-orange-400 text-white text-left text-xs font-medium uppercase tracking-wider">
                                    Item Name
                                  </th>
                                  <th className="px-4 py-2 bg-orange-400 text-white text-left text-xs font-medium uppercase tracking-wider">
                                    Quantity
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {selectedSchedule.orders.menuItems.map(
                                  (item, index) => (
                                    <tr
                                      key={index}
                                      className="hover:bg-gray-50"
                                    >
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                                        {item.item?.name || 'Unknown Item'}
                                      </td>
                                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                        {item.quantity}
                                      </td>
                                    </tr>
                                  )
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Special Instructions */}
                      {selectedSchedule.orders.specialInstructions && (
                        <div className="mt-4">
                          <h5 className="font-medium text-gray-700 mb-2">
                            Special Instructions
                          </h5>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
                            {selectedSchedule.orders.specialInstructions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaBell, FaSearch, FaRedo, FaUser, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';

const ViewFeedback = () => {
  const { token } = useStore();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  useEffect(() => {
    fetchFeedbacks();
    fetchNotifications();
    // Check for new feedback every 30 seconds
    const interval = setInterval(() => {
      fetchFeedbacks();
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/feedback/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackList(response.data.data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch feedbacks');
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/feedback/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotifications(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await axios.put(
        `http://localhost:4000/api/feedback/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const filteredFeedbacks = feedbackList.filter(feedback => {
    const matchesSearch = feedback.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feedback.feedback?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'today') {
      const today = new Date().toDateString();
      return matchesSearch && new Date(feedback.createdAt).toDateString() === today;
    }
    if (selectedFilter === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return matchesSearch && new Date(feedback.createdAt) >= weekAgo;
    }
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <p className="text-slate-600 font-medium">Loading feedback...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mt-20 px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search feedback..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
              />
              <FaSearch className="absolute left-3 top-3 text-slate-400" />
            </div>

            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full md:w-40 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
            </select>

            <div className="flex space-x-2">
              <button
                onClick={fetchFeedbacks}
                className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors duration-200 shadow-sm"
                title="Refresh"
              >
                <FaRedo className="text-slate-600" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors duration-200 shadow-sm relative"
                >
                  <FaBell className="text-slate-600" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                      {notifications.length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 z-10">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3">
                        Notifications
                      </h3>
                      {notifications.length === 0 ? (
                        <p className="text-slate-500 text-center py-4">
                          No new notifications
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors duration-200"
                              onClick={() => {
                                markNotificationAsRead(notification._id);
                                setShowNotifications(false);
                              }}
                            >
                              <p className="text-sm text-slate-800">
                                {notification.message}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">
                                {new Date(
                                  notification.createdAt
                                ).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {filteredFeedbacks.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <FaSearch className="text-slate-400 text-2xl" />
              </div>
              <p className="text-slate-600 text-lg mb-4">No feedback found</p>
              <button
                onClick={fetchFeedbacks}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
              >
                Try Again
              </button>
            </div>
          ) : (
            filteredFeedbacks.map((feedback) => (
              <div
                key={feedback._id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                    <div className="flex items-center space-x-3 mb-4 md:mb-0">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FaUser className="text-indigo-600 text-xl" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800">
                          {feedback.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-slate-500 text-sm">
                          <FaEnvelope className="text-slate-400" />
                          <span>{feedback.email}</span>
                        </div>
                        {feedback.phone && (
                          <div className="flex items-center space-x-2 text-slate-500 text-sm">
                            <FaPhone className="text-slate-400" />
                            <span>{feedback.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-slate-500">
                      <FaCalendarAlt className="text-slate-400" />
                      <span className="text-sm">
                        {new Date(feedback.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-slate-800 leading-relaxed">
                      {feedback.feedback}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFeedback;
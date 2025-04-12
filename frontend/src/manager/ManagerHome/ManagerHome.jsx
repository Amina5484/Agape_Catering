import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaCubes, FaChartBar, FaComments } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';

const Home = () => {
  const navigate = useNavigate();
  const { feedbackList, fetchFeedbackList } = useContext(StoreContext);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleViewFeedback = () => {
    setShowFeedback((prev) => !prev);
    fetchFeedbackList();
  };

  return (
    <div className="pt-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to Your Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Orders Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">24</p>
                </div>
                <div className="bg-blue-50 rounded-full p-3">
                  <FaBoxOpen className="w-6 h-6 text-blue-600" />
                </div>
          </div>
        </div>

            {/* Stock Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Items</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">156</p>
                </div>
                <div className="bg-green-50 rounded-full p-3">
                  <FaCubes className="w-6 h-6 text-green-600" />
                </div>
          </div>
        </div>

            {/* Reports Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reports</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">12</p>
                </div>
                <div className="bg-yellow-50 rounded-full p-3">
                  <FaChartBar className="w-6 h-6 text-yellow-600" />
                </div>
          </div>
        </div>

            {/* Feedback Card */}
            <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Feedback</p>
                  <p className="text-2xl font-semibold text-gray-900 mt-1">8</p>
                </div>
                <div className="bg-red-50 rounded-full p-3">
                  <FaComments className="w-6 h-6 text-red-600" />
                </div>
          </div>
        </div>
      </div>

          {/* Feedback Section */}
      {showFeedback && (
            <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Feedback</h2>
                <button
                  onClick={() => setShowFeedback(false)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Close
                </button>
              </div>
              
          {feedbackList.length === 0 ? (
                <div className="text-center py-8">
                  <FaComments className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No feedback submitted yet.</p>
                </div>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback, index) => (
                <div
                  key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-gray-900">{feedback.name}</p>
                        <span className="text-sm text-gray-500">{feedback.email}</span>
                      </div>
                      <p className="text-gray-600">{feedback.feedback}</p>
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

export default Home;

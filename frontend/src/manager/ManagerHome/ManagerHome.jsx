import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBoxOpen, FaCubes, FaChartBar, FaComments } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';

const ManagerHome = () => {
  const navigate = useNavigate();
  const { feedbackList, fetchFeedbackList } = useContext(StoreContext);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleViewFeedback = () => {
    setShowFeedback((prev) => !prev);
    fetchFeedbackList(); // Fetch feedback without checking for login status
  };

  return (
    <div className="pt-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 justify-items-center ml-64 p-6">
        {/* Orders Button */}
        <div
          className="cursor-pointer border rounded-lg hover:shadow-lg transition-shadow w-60 h-28"
          onClick={() => handleNavigation('/')}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <FaBoxOpen className="text-2xl text-blue-600 mb-1" />
            <button className="text-md w-3/4 py-1 bg-blue-500 text-white rounded-lg">
              Orders
            </button>
          </div>
        </div>

        {/* Manage Stock Button */}
        <div
          className="cursor-pointer border rounded-lg hover:shadow-lg transition-shadow w-60 h-28"
          onClick={() => handleNavigation('/manager/manage-stock')}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <FaCubes className="text-2xl text-green-600 mb-1" />
            <button className="text-md w-3/4 py-1 bg-green-500 text-white rounded-lg">
              Stock
            </button>
          </div>
        </div>

        {/* Generate Report Button */}
        <div
          className="cursor-pointer border rounded-lg hover:shadow-lg transition-shadow w-60 h-28"
          onClick={() => handleNavigation('/manager/generate-report')}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <FaChartBar className="text-2xl text-yellow-600 mb-1" />
            <button className="text-md w-3/4 py-1 bg-yellow-500 text-white rounded-lg">
              Generate Report
            </button>
          </div>
        </div>

        {/* View Feedback Button */}
        <div
          className="cursor-pointer border rounded-lg hover:shadow-lg transition-shadow w-60 h-28"
          onClick={handleViewFeedback}
        >
          <div className="flex flex-col items-center justify-center h-full">
            <FaComments className="text-2xl text-red-600 mb-1" />
            <button className="text-md w-3/4 py-1 bg-red-500 text-white rounded-lg">
              View Feedback
            </button>
          </div>
        </div>
      </div>

      {/* Conditionally render feedback */}
      {showFeedback && (
        <div className="mt-8 w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-center mb-6">Feedback</h2>
          {feedbackList.length === 0 ? (
            <p className="text-center text-gray-600">
              No feedback submitted yet.
            </p>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm"
                >
                  <p className="font-semibold text-lg">{feedback.name}</p>
                  <p className="text-gray-600">{feedback.email}</p>
                  <p className="text-gray-600">{feedback.phone}</p>
                  <p className="mt-2 text-gray-800">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManagerHome; 
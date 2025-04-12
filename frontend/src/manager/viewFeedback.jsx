import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "../context/StoreContext";

const ViewFeedback = () => {
  const { token } = useStore();
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/catering/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFeedbackList(response.data);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error(error.response?.data?.message || "Failed to fetch feedback");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 ml-64">Loading...</div>;
  }

  return (
    <div className="p-6 ml-64">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Customer Feedback</h2>
          <button
            onClick={fetchFeedback}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Refresh Feedback
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {feedbackList.length === 0 ? (
            <p className="text-center text-gray-600">No feedback available.</p>
          ) : (
            <div className="space-y-4">
              {feedbackList.map((feedback) => (
                <div
                  key={feedback._id}
                  className="p-4 border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-lg">{feedback.name}</p>
                      <p className="text-gray-600">{feedback.email}</p>
                      <p className="text-gray-600">{feedback.phone}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-800">{feedback.feedback}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewFeedback;
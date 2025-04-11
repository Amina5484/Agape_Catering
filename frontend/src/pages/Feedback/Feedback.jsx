import React, { useState, useContext } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { StoreContext } from '../../context/StoreContext';

const FeedbackForm = () => {
  const { isLoggedIn, userId } = useContext(StoreContext);
  const [formData, setFormData] = useState({
    feedback: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.feedback.trim()) {
      newErrors.feedback = 'Feedback message is required';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('Please login to submit feedback');
      return;
    }

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    const existingFeedback =
      JSON.parse(localStorage.getItem('feedbacks')) || [];

    // Add new feedback with user ID
    const updatedFeedback = [...existingFeedback, { ...formData, userId }];

    // Store updated feedback list
    localStorage.setItem('feedbacks', JSON.stringify(updatedFeedback));

    console.log('Feedback Submitted:', formData);
    console.log(
      'updated Feedback List',
      JSON.parse(localStorage.getItem('feedbacks'))
    );
    setFormData({
      feedback: '',
    });

    toast.success('Thank you for your feedback!', { position: 'top-right' });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-4">Give Feedback</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label htmlFor="feedback" className="block text-lg">
            Feedback:
          </label>
          <textarea
            id="feedback"
            name="feedback"
            value={formData.feedback}
            onChange={handleChange}
            placeholder="Share your feedback here..."
            rows="8"
            className={`w-full p-3 border rounded-lg ${
              errors.feedback ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          ></textarea>
          {errors.feedback && (
            <span className="text-red-500 text-sm">{errors.feedback}</span>
          )}
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Submit Feedback
        </button>
      </form>
    </div>
  );
};

export default FeedbackForm;

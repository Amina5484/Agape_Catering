import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';

const ScheduleManagement = () => {
  const { token } = useStore();
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    chefId: '',
    shiftTime: '',
    date: ''
  });

  const fetchSchedules = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/catering/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setSchedules(response.data.schedules);
      }
    } catch (error) {
      toast.error('Failed to fetch schedules');
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:4000/api/catering/schedule/assign',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        toast.success('Schedule assigned successfully');
        setFormData({ chefId: '', shiftTime: '', date: '' });
        fetchSchedules();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign schedule');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Schedule Management</h2>
      
      {/* Assign Schedule Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Assign New Schedule</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Chef ID</label>
            <input
              type="text"
              name="chefId"
              value={formData.chefId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Shift Time</label>
            <input
              type="text"
              name="shiftTime"
              value={formData.shiftTime}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Assign Schedule
          </button>
        </form>
      </div>

      {/* Schedule List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Current Schedules</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Chef ID</th>
                <th className="px-4 py-2">Shift Time</th>
                <th className="px-4 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule._id} className="border-b">
                  <td className="px-4 py-2">{schedule.chefId}</td>
                  <td className="px-4 py-2">{schedule.shiftTime}</td>
                  <td className="px-4 py-2">{new Date(schedule.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ScheduleManagement; 
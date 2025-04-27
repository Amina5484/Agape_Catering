import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaBoxes, FaUser } from 'react-icons/fa';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChefHome = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    schedules: 0,
    inventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch schedules count
      const schedulesResponse = await axios.get(
        'http://localhost:4000/api/chef/schedules',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Fetch inventory count
      const inventoryResponse = await axios.get(
        'http://localhost:4000/api/chef/stock',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats({
        schedules: schedulesResponse.data.length,
        inventory: inventoryResponse.data.length,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Welcome to Your Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Schedules Card */}
        <div


          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/chef/schedule')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-full">
                <FaCalendarAlt className="text-orange-500 text-xl" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">
                Schedules
              </h3>
            </div>
            {/* <span className="text-2xl font-bold text-orange-500">
              {stats.schedules}
            </span> */}
          </div>
          <p className="text-gray-600">View and manage your scheduled orders</p>
        </div>

        {/* Inventory Card */}
        <div
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/chef/stock')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-full">
                <FaBoxes className="text-blue-500 text-xl" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">
                Inventory
              </h3>
            </div>
            {/* <span className="text-2xl font-bold text-blue-500">
              {stats.inventory}
            </span> */}
          </div>
          <p className="text-gray-600">
            Manage your kitchen inventory and stock levels
          </p>
        </div>

        {/* Profile Card */}
        <div
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/chef/profile')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-full">
                <FaUser className="text-green-500 text-xl" />
              </div>
              <h3 className="ml-4 text-lg font-semibold text-gray-800">
                Profile
              </h3>
            </div>
          </div>
          <p className="text-gray-600">
            Update your profile information and settings
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChefHome;

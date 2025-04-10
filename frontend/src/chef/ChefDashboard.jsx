import React, { useState, useEffect } from 'react';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { FaClipboardList, FaBoxes, FaCalendarAlt } from 'react-icons/fa';

const ChefDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    currentPassword: '',
    newPassword: '',
    photo: null
  });

  useEffect(() => {
    fetchUserData();
    fetchTasks();
    fetchSchedules();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axiosInstance.get('/user/profile');
      const userData = response.data;
      setUser(userData);
      setProfileData({
        firstName: userData.name.split(' ')[0] || '',
        lastName: userData.name.split(' ')[1] || '',
        email: userData.email,
        gender: userData.gender || '',
        currentPassword: '',
        newPassword: '',
        photo: null
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await axiosInstance.get('/chef/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await axiosInstance.get('/chef/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('firstName', profileData.firstName);
      formData.append('lastName', profileData.lastName);
      formData.append('email', profileData.email);
      formData.append('gender', profileData.gender);
      if (profileData.currentPassword && profileData.newPassword) {
        formData.append('currentPassword', profileData.currentPassword);
        formData.append('newPassword', profileData.newPassword);
      }
      if (profileData.photo) {
        formData.append('photo', profileData.photo);
      }

      await axiosInstance.put('/user/profile', formData);
      toast.success('Profile updated successfully');
      fetchUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleTaskUpdate = async (taskId, status) => {
    try {
      await axiosInstance.put(`/chef/tasks/${taskId}`, { status });
      toast.success('Task updated successfully');
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg h-screen fixed">
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Chef Dashboard</h2>
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/chef/orders"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaClipboardList className="mr-3" />
                    <span>Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/chef/inventory"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaBoxes className="mr-3" />
                    <span>Inventory</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/chef/schedule"
                    className="flex items-center p-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FaCalendarAlt className="mr-3" />
                    <span>Schedule</span>
                  </Link>
                </li>
              </ul>
            </nav>
            </div>
          </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard; 
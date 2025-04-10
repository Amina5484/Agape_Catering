import React, { useState, useEffect } from 'react';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    photo: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/profile');
        const { name, email, gender, photo } = response.data;
        const [firstName, lastName] = name.split(' ');
        setUser(prev => ({
          ...prev,
          firstName,
          lastName,
          email,
          gender,
          photo
        }));
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setUser(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords if changing
    if (user.newPassword) {
      if (user.newPassword !== user.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      if (!user.currentPassword) {
        toast.error('Current password is required to change password');
        return;
      }
    }

    const formData = new FormData();
    for (const key in user) {
      if (key === 'photo' && user[key]) {
        formData.append('photo', user[key]);
      } else if (key !== 'photo' && user[key]) {
        formData.append(key, user[key]);
      }
    }

    try {
      const response = await axiosInstance.put('/user/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Profile updated successfully');
      setUser(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-20 ml-64"> {/* Increased left margin to ml-64 */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-teal-600">Profile Settings</h2>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl p-100 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              name="firstName"
              value={user.firstName}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={user.lastName}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={user.gender}
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
            <input
              type="file"
              name="photo"
              onChange={handleChange}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              accept="image/*"
            />
            {user.photo && typeof user.photo === 'string' && (
              <img
                src={`http://localhost:4000${user.photo}`}
                alt="Profile"
                className="mt-2 w-20 h-20 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={user.currentPassword}
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
                type="password"
                name="newPassword"
                value={user.newPassword}
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <input
                type="password"
                name="confirmPassword"
                value={user.confirmPassword}
                onChange={handleChange}
                className="mt-1 p-2 block w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
        <button
          type="submit"
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
            Update Profile
        </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;

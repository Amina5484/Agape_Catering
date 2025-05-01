// src/components/UserManagement.js

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaEdit, FaTrash, FaEye, FaPlus } from 'react-icons/fa';

const UserManagement = () => {
  const navigate = useNavigate();
  const { token } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    isactivated: true,
  });

  useEffect(() => {
    if (!token) {
      toast.error('Please login to view this page');
      navigate('/login');
      return;
    }
    fetchUsers();
  }, [token, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:4000/api/admin/staffs',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        toast.error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      isactivated: user.isactivated,
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedUser) {
        await axios.put(
          `http://localhost:4000/api/admin/update/${selectedUser._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success('User updated successfully');
      } else {
        await axios.post('http://localhost:4000/api/users', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('User created successfully');
      }
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: '',
        isactivated: true,
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:4000/api/admin/delete/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleView = (userId) => {
    navigate(`/admin/user/${userId}`);
  };

  if (loading) {
    return (
      <div className="p-2 md:p-6 ml-0 md:ml-64 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-2 border-orange-400 mb-2 md:mb-4"></div>
          <div className="text-white text-sm md:text-xl font-medium">
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-6 ml-0 md:ml-64">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-lg md:text-2xl font-bold text-white">
            User Management
          </h2>
        </div>

        {isEditing && (
          <div className="bg-orange-400 rounded-lg md:rounded-xl shadow-lg p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-semibold text-white mb-3 md:mb-4">
              {selectedUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs md:text-sm font-medium text-white">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-sm"
                    required
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isactivated"
                  checked={formData.isactivated}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-xs md:text-sm text-white">
                  Active
                </label>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-xs md:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 md:px-4 md:py-2 bg-white text-orange-400 rounded-lg hover:bg-gray-100 text-xs md:text-sm"
                >
                  {selectedUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-[8px] md:text-sm">
              <thead className="bg-orange-400">
                <tr>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-1 py-1 md:px-3 md:py-3 text-left text-[7px] md:text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      {user.name}
                    </td>
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      {user.email}
                    </td>
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      {user.phone}
                    </td>
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      {user.role}
                    </td>
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      <span
                        className={`px-1 py-0.5 md:px-2 md:py-1 inline-flex text-[7px] md:text-xs leading-5 font-semibold rounded-full ${
                          user.isactivated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isactivated ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-1 py-1 md:px-3 md:py-3 whitespace-nowrap text-[8px] md:text-sm">
                      <div className="flex space-x-1 md:space-x-2">
                        <button
                          onClick={() => handleView(user._id)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <FaEye className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="text-orange-600 hover:text-orange-800"
                        >
                          <FaEdit className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash className="w-3 h-3 md:w-4 md:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;

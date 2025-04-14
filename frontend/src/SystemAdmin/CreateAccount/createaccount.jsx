import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import PasswordInput from '../../components/common/PasswordInput';
import { FaUserPlus, FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { token } = useStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    role: '',
    password: '',
    photo: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files) {
      setUser((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validatePhone(user.phone)) {
        toast.error('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      const userData = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        password: user.password,
        gender: user.gender,
      };

      const endpoint =
        user.role === 'Catering Manager'
          ? '/api/auth/register/catering-manager'
          : '/api/auth/register/executive-chef';

      const response = await axios.post(
        `http://localhost:4000${endpoint}`,
        userData,
        {
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.message) {
        toast.success(response.data.message);
        navigate('/admin/view-users');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      const errorMessage =
        error.response?.data?.message || 'Error creating account';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ml-64 mt-12 pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="text-white hover:text-indigo-200 transition-colors p-2 rounded-full hover:bg-indigo-700"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Create New Account</h2>
              </div>
              <FaUserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200" />
            </div>
      </div>

          {/* Form */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* First Name */}
                <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
              <input
                type="text"
                name="firstName"
                        value={user.firstName}
                onChange={handleChange}
                required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter first name"
              />
            </div>

                {/* Last Name */}
                <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
              <input
                type="text"
                name="lastName"
                        value={user.lastName}
                onChange={handleChange}
                required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter last name"
              />
            </div>

                {/* Email */}
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
              <input
                type="email"
                name="email"
                      value={user.email}
                onChange={handleChange}
                required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter email address"
              />
            </div>

                {/* Phone */}
                <div className="md:col-span-2 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      required
                      placeholder="+1234567890"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Format: +1234567890
                    </p>
                  </div>
                  </div>

                {/* Gender */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
              <select
                name="gender"
                      value={user.gender}
                onChange={handleChange}
                required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                      <option value="other">Other</option>
              </select>
            </div>

                {/* Role */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
              <select
                name="role"
                      value={user.role}
                onChange={handleChange}
                required
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Select Role</option>
                      <option value="Catering Manager">Catering Manager</option>
                      <option value="Executive Chef">Executive Chef</option>
              </select>
            </div>

                {/* Password */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <PasswordInput
                      name="password"
                      value={user.password}
                onChange={handleChange}
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="h-5 w-5" />
                      ) : (
                        <FaEye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
            </div>
          </div>

          {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
            <button
              type="submit"
                      disabled={loading}
                  className={`w-full sm:w-auto px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;

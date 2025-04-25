import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import { FaUserPlus, FaArrowLeft } from 'react-icons/fa';
import { isValidName, isValidEthiopianPhoneNumber } from '../../utils/validation';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { token } = useStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    role: '',
    photo: null,
  });

  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
      case 'lastName':
        return isValidName(value) ? null : 'Name must contain at least 3 alphabetical characters (no numbers or special characters)';
      case 'phone':
        return isValidEthiopianPhoneNumber(value) ? null : 'Phone number must be in format +2519XXXXXXXX or +2517XXXXXXXX (12 digits total)';
      default:
        return null;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo' && files) {
      setUser((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));

      // Validate field on change
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {
      firstName: validateField('firstName', user.firstName),
      lastName: validateField('lastName', user.lastName),
      phone: validateField('phone', user.phone)
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const userData = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
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
        if (response.data.password) {
          toast.info(
            `Generated password: ${response.data.password}. Please save this password.`
          );
        }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ml-64 mt-12 pt-4 sm:pt-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => navigate(-1)}
                  className="text-white hover:text-orange-200 transition-colors p-2 rounded-full hover:bg-orange-500"
                >
                  <FaArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  Create New Account
                </h2>
              </div>
              <FaUserPlus className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
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
                    className={`mt-1 block w-full rounded-lg border-${errors.firstName ? 'red-300' : 'gray-300'} shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                    // placeholder="Enter first nFoame (minimum 3 letters, alphabets only)"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
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
                    className={`mt-1 block w-full rounded-lg border-${errors.lastName ? 'red-300' : 'gray-300'} shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                    // placeholder="Enter last name (minimum 3 letters, alphabets only)"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
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
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
                      // placeholder="format: +2519XXXXXXXX or +2517XXXXXXXX"
                      className={`mt-1 block w-full rounded-lg border-${errors.phone ? 'red-300' : 'gray-300'} shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm`}
                    />
                    {errors.phone ? (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    ) : (
                      <p className="mt-1 text-xs text-gray-500">
                    
                      </p>
                    )}
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
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
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
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  >
                    <option value="">Select Role</option>
                    <option value="Catering Manager">Catering Manager</option>
                    <option value="Executive Chef">Executive Chef</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-400 hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Creating...' : 'Create Account'}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import PasswordInput from '../../components/common/PasswordInput';

const CreateAccount = () => {
  const navigate = useNavigate();
  const { token } = useStore();
  const [loading, setLoading] = useState(false);
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
      // Validate phone number
      if (!validatePhone(user.phone)) {
        toast.error('Please enter a valid phone number');
        setLoading(false);
        return;
      }

      // Prepare the data in the format expected by the backend
      const userData = {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        password: user.password,
        gender: user.gender,
      };

      // Determine the correct endpoint based on role
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

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-2xl font-bold mb-8 text-center">
                  Create New Account
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
            <div>
                      <label className="block text-sm font-medium text-gray-700">
                        First Name
                      </label>
              <input
                type="text"
                name="firstName"
                        value={user.firstName}
                onChange={handleChange}
                required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Last Name
                      </label>
              <input
                type="text"
                name="lastName"
                        value={user.lastName}
                onChange={handleChange}
                required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
                    </div>
            </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
              <input
                type="email"
                name="email"
                      value={user.email}
                onChange={handleChange}
                required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={user.phone}
                      onChange={handleChange}
                      required
                      placeholder="+1234567890"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Format: +1234567890
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Gender
                    </label>
              <select
                name="gender"
                      value={user.gender}
                onChange={handleChange}
                required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                      <option value="other">Other</option>
              </select>
            </div>

            <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
              <select
                name="role"
                      value={user.role}
                onChange={handleChange}
                required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Role</option>
                      <option value="Catering Manager">Catering Manager</option>
                      <option value="Executive Chef">Executive Chef</option>
              </select>
            </div>

            <div>
                    <PasswordInput
                      name="password"
                      value={user.password}
                onChange={handleChange}
                      label="Password"
                      required
                      minLength="6"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
          </div>

                  <div className="pt-4">
            <button
              type="submit"
                      disabled={loading}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
                      {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAccount;

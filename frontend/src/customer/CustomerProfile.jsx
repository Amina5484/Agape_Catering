import React, { useState, useEffect } from 'react';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../components/common/PasswordInput';

const CustomerProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gender: '',
    photo: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get('/user/profile');
        const { name, email, phone, gender } = response.data.user;
        const [firstName, lastName] = name.split(' ');
        setUser((prev) => ({
          ...prev,
          firstName,
          lastName,
          email,
          phone,
          gender,
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
      setUser((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setUser((prev) => ({ ...prev, [name]: value }));
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
      if (user.newPassword.length < 6) {
        toast.error('New password must be at least 6 characters long');
        return;
      }
    }

    try {
      setSaving(true);

      // Handle password change if requested
      if (user.currentPassword && user.newPassword) {
        const passwordData = {
          currentPassword: user.currentPassword,
          newPassword: user.newPassword,
        };

        try {
          const passwordResponse = await axiosInstance.post('/auth/change-password', passwordData);

          if (passwordResponse.data.message === 'Password changed successfully') {
            toast.success('Password updated successfully');

            // Clear password fields
            setUser((prev) => ({
              ...prev,
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            }));
          }
        } catch (passwordError) {
          console.error('Error changing password:', passwordError);
          const errorMessage = passwordError.response?.data?.message || 'Failed to change password';
          toast.error(errorMessage);
          return;
        }
      }

      // Update profile info
      const profileData = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
      };

      //const profileResponse = await axiosInstance.put('/user/update-profile', profileData);

      if (profileResponse.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-extrabold text-gray-900">Profile Settings</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField label="First Name" name="firstName" value={user.firstName} onChange={handleChange} required />
              <InputField label="Last Name" name="lastName" value={user.lastName} onChange={handleChange} required />
              <InputField label="Email" name="email" type="email" value={user.email} onChange={handleChange} required />
              <InputField label="Phone" name="phone" type="tel" value={user.phone} onChange={handleChange} required />

              <div>
                <label className="block text-sm font-medium text-gray-700">Gender</label>
                <select
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            {/* Password Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Change Password</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <PasswordInput
                  name="currentPassword"
                  value={user.currentPassword}
                  onChange={handleChange}
                  label="Current Password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
                <PasswordInput
                  name="newPassword"
                  value={user.newPassword}
                  onChange={handleChange}
                  label="New Password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
                <PasswordInput
                  name="confirmPassword"
                  value={user.confirmPassword}
                  onChange={handleChange}
                  label="Confirm New Password"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={saving}
                className="w-full flex justify-center items-center bg-orange-400 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition disabled:bg-teal-400"
              >
                {saving ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-5 w-5 mr-3 border-t-2 border-white rounded-full" viewBox="0 0 24 24" />
                    Saving...
                  </span>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable InputField component
const InputField = ({ label, name, value, onChange, type = "text", required = false }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-teal-500 focus:border-teal-500"
      required={required}
    />
  </div>
);

export default CustomerProfile;


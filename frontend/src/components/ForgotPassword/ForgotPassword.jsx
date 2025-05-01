import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaArrowLeft } from 'react-icons/fa';
import { FiMail, FiKey, FiLock, FiRefreshCw } from 'react-icons/fi';
import { useDarkMode } from '../../context/DarkModeContext';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useDarkMode();
    const [step, setStep] = useState(1); // 1: Email input, 2: OTP verification, 3: New password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Handle email submit to send OTP
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/user/forgot-password', { email });
            toast.success(response.data.message || 'OTP sent to your email');
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP. Please try again.');
            console.error('Forgot password error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification
    const handleOtpVerify = async (e) => {
        e.preventDefault();
        if (!otp.trim()) {
            toast.error('Please enter the OTP');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/user/verify-otp', {
                email,
                otp: parseInt(otp)
            });
            setToken(response.data.token);
            toast.success('OTP verified successfully');
            setStep(3);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired OTP');
            console.error('OTP verification error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle password reset
    const handlePasswordReset = async (e) => {
        e.preventDefault();
        if (!newPassword.trim() || !confirmPassword.trim()) {
            toast.error('Please enter and confirm your new password');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/user/reset-password', {
                token,
                newPassword: newPassword
            });
            toast.success(response.data.message || 'Password reset successful');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
            console.error('Password reset error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div
        className={`min-h-screen flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
        }`}
      >
        <div className="max-w-xs w-full space-y-6">
          <div
            className={`rounded-lg shadow-md overflow-hidden ${
              isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white'
            }`}
          >
            <div className="px-4 py-5 space-y-4">
              <div className="flex items-center mb-3">
                <button
                  onClick={() =>
                    step > 1 ? setStep(step - 1) : navigate('/login')
                  }
                  className={`p-2 rounded-full mr-2 transition-colors ${
                    isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FaArrowLeft className="h-3.5 w-3.5" />
                </button>
                <h2
                  className={`text-lg font-bold ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {step === 1 && 'Reset Password'}
                  {step === 2 && 'Verify OTP'}
                  {step === 3 && 'Create New Password'}
                </h2>
              </div>

              {/* Step 1 - Email input */}
              {step === 1 && (
                <form onSubmit={handleEmailSubmit} className="space-y-3">
                  <div className="flex justify-center my-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                      }`}
                    >
                      <FiMail
                        className={`h-5 w-5 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className={`appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors duration-200 ${
                          isDarkMode
                            ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                            : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                        }`}
                        required
                      />
                    </div>
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    We'll send a verification code to this email to reset your
                    password.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-orange-400 w-full py-2 px-4 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200  ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              )}

              {/* Step 2 - OTP verification */}
              {step === 2 && (
                <form onSubmit={handleOtpVerify} className="space-y-3">
                  <div className="flex justify-center my-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                      }`}
                    >
                      <FiKey
                        className={`h-5 w-5 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="otp"
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Verification Code
                    </label>
                    <input
                      id="otp"
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter OTP"
                      className={`appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      required
                    />
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Please enter the 6-digit verification code sent to{' '}
                    <span className="font-medium">{email}</span>
                  </p>

                  <div className="flex items-center text-xs">
                    <FiRefreshCw
                      className={`mr-1 ${
                        isDarkMode ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      size={12}
                    />
                    <span
                      onClick={() =>
                        handleEmailSubmit({ preventDefault: () => {} })
                      }
                      className={`cursor-pointer ${
                        isDarkMode
                          ? 'text-indigo-400 hover:text-indigo-300'
                          : 'text-indigo-600 hover:text-indigo-500'
                      }`}
                    >
                      Resend OTP
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      isDarkMode
                        ? 'bg-orange-400 hover:bg-indigo-800 focus:ring-indigo-500 focus:ring-offset-gray-900'
                        : 'bg-orange-400 hover:bg-indigo-700 focus:ring-indigo-500 focus:ring-offset-white'
                    } ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                </form>
              )}

              {/* Step 3 - Password reset */}
              {step === 3 && (
                <form onSubmit={handlePasswordReset} className="space-y-3">
                  <div className="flex justify-center my-4">
                    <div
                      className={`p-2.5 rounded-full ${
                        isDarkMode ? 'bg-indigo-900' : 'bg-indigo-100'
                      }`}
                    >
                      <FiLock
                        className={`h-5 w-5 ${
                          isDarkMode ? 'text-indigo-300' : 'text-indigo-600'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="new-password"
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      New Password
                    </label>
                    <input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className={`appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="confirm-password"
                      className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Confirm Password
                    </label>
                    <input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className={`appearance-none relative block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm transition-colors duration-200 ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                          : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
                      }`}
                      required
                    />
                  </div>
                  <p
                    className={`text-xs ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}
                  >
                    Your password must be at least 8 characters long and include
                    numbers and special characters.
                  </p>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`bg-orange-400 w-full py-2 px-4 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                      isLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Resetting Password...' : 'Reset Password'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="text-center">
            <p>
              Remember your password?{' '}
              <span
                onClick={() => navigate('/login')}
                className={`font-medium cursor-pointer hover:underline`}
              >
                Back to login
              </span>
            </p>
          </div>
        </div>
      </div>
    );
};

export default ForgotPassword;

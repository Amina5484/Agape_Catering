import React, { useState, useContext } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';

const Login = ({ setShowLogin }) => {
  const { login } = useContext(StoreContext);
  const navigate = useNavigate();
  const [currentState, setCurrentState] = useState('Login');
  const [data, setData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [agreeToTerms, setAgreeToTerms] = useState(false); // For the checkbox

  // Handle input changes
  const onChangeHandler = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle checkbox change
  const onCheckboxChange = () => {
    setAgreeToTerms((prev) => !prev);
  };

  // Validate input data
  const validateData = () => {
    if (!data.email.trim()) {
      toast.error('Please enter your email.');
      return false;
    }
    if (!data.password.trim()) {
      toast.error('Please enter your password.');
      return false;
    }
    if (currentState === 'Sign Up' && !data.name.trim()) {
      toast.error('Please enter your name.');
      return false;
    }
    if (!agreeToTerms) {
      toast.error('You must agree to the terms of use and privacy policy.');
      return false;
    }
    return true;
  };

  // Handle form submission
  const onLogin = async (event) => {
    event.preventDefault();

    if (!validateData()) return; // Stop if validation fails

    try {
      const result = await login(data.email, data.password);

      if (result.success) {
        setShowLogin(false);
        // The navigation will be handled by the context after successful login
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred during login');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full mx-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-3xl font-bold text-green-600">
          {currentState === 'Login' ? 'Login' : 'Sign Up'}
        </h2>
        <FaTimes
          className="cursor-pointer text-red-500"
          size={20}
          onClick={() => setShowLogin(false)}
        />
      </div>
      <form onSubmit={onLogin} className="space-y-4">
        {currentState === 'Sign Up' && (
          <input
            name="name"
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            placeholder="Your name"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        )}
        <input
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email"
          placeholder="Your email"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <input
          name="password"
          onChange={onChangeHandler}
          value={data.password}
          type="password"
          placeholder="Password"
          required
          className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-red-400 text-white font-semibold py-2 rounded-full hover:bg-gray-600 transition duration-300"
        >
          {currentState === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            checked={agreeToTerms}
            onChange={onCheckboxChange}
            required
            className="mr-2"
          />
          <p className="text-sm text-gray-600">
            I agree to the terms of use & policy.
          </p>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          {currentState === 'Login' ? (
            <>
              Don't have an account?{' '}
              <span
                onClick={() => setCurrentState('Sign Up')}
                className="text-blue-500 font-medium cursor-pointer hover:underline"
              >
                Sign Up
              </span>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <span
                onClick={() => setCurrentState('Login')}
                className="text-blue-500 font-medium cursor-pointer hover:underline"
              >
                Login
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  );
};

export default Login;

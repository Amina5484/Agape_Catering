import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import { useDarkMode } from '../../context/DarkModeContext';
import PasswordInput from '../common/PasswordInput';
import { FiLogIn, FiUser } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';

const Login = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, userRole } = useStore();
  const { isDarkMode } = useDarkMode();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isLoggedIn && userRole) {
      if (setShowLogin) setShowLogin(false);
      const routes = {
        'Customer': '/customer',
        'System Admin': '/admin',
        'Executive Chef': '/chef',
        'Catering Manager': '/manager',
      };
      navigate(routes[userRole] || '/', { replace: true });
    }
  }, [isLoggedIn, userRole, navigate, setShowLogin]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(formData.email, formData.password);
      if (result.success && result.user) {
        if (setShowLogin) setShowLogin(false);
        const routes = {
          'Customer': '/customer',
          'System Admin': '/admin',
          'Executive Chef': '/chef',
          'Catering Manager': '/manager',
        };
        navigate(routes[result.user.role] || '/', { replace: true });
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error in component:', error);
      toast.error(error.response?.data?.message || 'Invalid email or password');
    }
  };

  if (isLoggedIn) return null;

  return (
    <div
      className={`flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'
      }`}
    >
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 space-y-3">
        <div className="flex justify-center mb-1">
          <div
            className={`p-2 rounded-full ${
              isDarkMode ? 'bg-orange-200' : 'bg-indigo-100'
            }`}
          >
            <FaUtensils
              className={`h-5 w-5 ${
                isDarkMode ? 'text-orange-300' : 'text-orange-600'
              }`}
            />
          </div>
        </div>
        <h2
          className={`text-center text-lg font-bold mb-2 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Sign in to your account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="email"
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className={`block w-full px-3 py-1.5 border rounded-md sm:text-sm focus:outline-none focus:ring-2 focus:z-10 transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className={`block text-sm font-medium mb-1 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}
            >
              Password
            </label>
            <PasswordInput
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className={`block w-full px-3 py-1.5 border rounded-md sm:text-sm focus:outline-none focus:ring-2 focus:z-10 transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 placeholder-gray-400 text-white focus:ring-indigo-500 focus:border-indigo-500'
                  : 'bg-white border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
          </div>
          <div className="mt-1">
            <span
              onClick={() => {
                setShowLogin && setShowLogin(false);
                navigate('/forgot-password');
              }}
              className={`text-xs font-medium cursor-pointer hover:underline ${
                isDarkMode
                  ? 'text-indigo-400 hover:text-indigo-300'
                  : 'text-orange-600 hover:text-orange-200'
              }`}
            >
              Forgot your password?
            </span>
          </div>
          <div className="mt-2">
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-1.5 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 ${
                isDarkMode
                  ? 'bg-orange-300 hover:bg-orange-300 focus:ring-indigo-500 focus:ring-offset-gray-900'
                  : 'bg-orange-400 hover:bg-orange-300 focus:ring-indigo-500 focus:ring-offset-white'
              }`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FiLogIn className="h-4 w-4 text-orage-300 group-hover:text-indigo-200" />
              </span>
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center mt-2">
          <p
            className={`text-xs ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}
          >
            Don't have an account?{' '}
            <span
              onClick={() => {
                setShowLogin && setShowLogin(false);
                navigate('/register');
              }}
              className={`font-medium cursor-pointer hover:underline ${
                isDarkMode
                  ? 'text-teal-400 hover:text-teal-300'
                  : 'text-teal-600 hover:text-teal-500'
              }`}
            >
              Register here
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


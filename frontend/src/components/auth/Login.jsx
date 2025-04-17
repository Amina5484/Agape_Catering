import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import PasswordInput from '../common/PasswordInput';

const Login = ({ setShowLogin }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, userRole } = useStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (isLoggedIn && userRole) {
      // Close login modal if it exists
      if (setShowLogin) {
        setShowLogin(false);
      }

      // Redirect based on role
      switch (userRole) {
        case 'Customer':
          navigate('/customer', { replace: true });
          break;
        case 'System Admin':
          navigate('/admin', { replace: true });
          break;
        case 'Executive Chef':
          navigate('/chef', { replace: true });
          break;
        case 'Catering Manager':
          navigate('/manager', { replace: true });
          break;
        default:
          navigate('/');
      }
    }
  }, [isLoggedIn, userRole, navigate, setShowLogin]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting login form with:', formData);

    try {
      const result = await login(formData.email, formData.password);
      console.log('Login result:', result);

      if (result.success && result.user) {
        // Close login modal if it exists
        if (setShowLogin) {
          setShowLogin(false);
        }

        // Redirect based on role
        switch (result.user.role) {
          case 'Customer':
            navigate('/customer', { replace: true });
            break;
          case 'System Admin':
            navigate('/admin', { replace: true });
            break;
          case 'Executive Chef':
            navigate('/chef', { replace: true });
            break;
          case 'Catering Manager':
            navigate('/manager', { replace: true });
            break;
          default:
            navigate('/');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error in component:', error);
      const errorMessage =
        error.response?.data?.message || 'Invalid email or password';
      toast.error(errorMessage);
    }
  };

  // Don't render the form if already logged in
  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don&apos;t have an account?{' '}
            <a
              href="/register"
              className="font-medium text-teal-600 hover:text-teal-500"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

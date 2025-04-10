import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../context/StoreContext';
import { assets } from '../assets/assets';
import {
  FaSearch,
  FaShoppingCart,
  FaBars,
  FaShoppingBag,
  FaSignOutAlt,
  FaUser,
  FaCog,
  FaMoon,
  FaSun,
} from 'react-icons/fa';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { toast } from 'react-toastify';
import Footer from '../components/Footer/Footer';

const CustomerDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { token, setToken, darkMode, toggleDarkMode } = useContext(StoreContext);
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await axiosInstance.get('/food');
      setMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error('Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
    toast.success('Item added to cart');
    setShowCart(true);
  };

  const removeFromCart = (itemId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== itemId));
    toast.success('Item removed from cart');
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart =>
      prevCart.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken('');
    navigate('/');
  };

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Navigation Bar */}
      <div className="p-2 flex items-center bg-white dark:bg-gray-900 dark:text-white shadow-md fixed top-0 left-0 w-full z-10 transition-colors">
        <div className="flex-1 flex justify-start">
          <Link to="/">
            <img
              src={assets.logo}
              alt="Logo"
              className="w-16 h-8 sm:w-20 sm:h-10"
            />
          </Link>
        </div>

        <div className="sm:hidden flex items-center space-x-4">
          <FaSearch
            className="w-6 h-6 cursor-pointer hover:text-gray-400"
            title="Search"
          />
          <div className="relative">
            <FaShoppingCart
              className="w-6 h-6 cursor-pointer hover:text-gray-400"
              title="Cart"
              onClick={() => setShowCart(!showCart)}
            />
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cart.length}
              </span>
            )}
          </div>
          <FaBars
            className="w-6 h-6 cursor-pointer hover:text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
            title="Menu"
          />
        </div>

        <div className="hidden sm:flex flex-1 justify-end px-4 sm:px-16">
          <ul className="flex items-center space-x-4 sm:space-x-8 text-sm sm:text-md font-medium text-black dark:text-white">
            <Link to="/" className="cursor-pointer hover:text-gray-400">
              Home
            </Link>
            <Link to="/menu" className="cursor-pointer hover:text-gray-400">
              Menu
            </Link>
            <Link to="/category" className="cursor-pointer hover:text-gray-400">
              Category
            </Link>
            <div className="relative">
              <FaShoppingCart
                className="w-5 h-5 cursor-pointer hover:text-gray-400"
                title="Cart"
                onClick={() => setShowCart(!showCart)}
              />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cart.length}
                </span>
              )}
            </div>
            <FaSearch
              className="w-5 h-5 cursor-pointer hover:text-gray-400"
              title="Search"
            />
            <Link to="/feedback" className="cursor-pointer hover:text-gray-400">
              Feedback
            </Link>

            <div className="relative flex items-center">
              <div
                onMouseEnter={() => setIsProfileOpen(true)}
                onMouseLeave={() =>
                  setTimeout(() => setIsProfileOpen(false), 800)
                }
              >
                <FaUser className="w-7 h-7 cursor-pointer text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100" />
                {isProfileOpen && (
                  <ul className="absolute right-0 mt-2 w-32 border-red-400 bg-white dark:bg-gray-800 dark:text-white shadow-lg rounded-lg py-2 border transition-opacity duration-400">
                    <li className="flex items-center px-4 py-2 hover:bg-red-400 dark:hover:bg-red-600 cursor-pointer">
                      <FaShoppingBag className="mr-2" />
                      <Link to="/orders">Orders</Link>
                    </li>
                    <hr />
                    <li className="flex items-center px-4 py-2 hover:bg-red-400 dark:hover:bg-red-600 cursor-pointer">
                      <FaCog className="mr-2" />
                      <Link to="/manage-profile">Manage Profile</Link>
                    </li>
                    <hr />
                    <li
                      onClick={logout}
                      className="flex items-center px-4 py-2 hover:bg-red-400 dark:hover:bg-red-600 cursor-pointer"
                    >
                      <FaSignOutAlt className="mr-2" />
                      Logout
                    </li>
                  </ul>
                )}
              </div>

              <button
                onClick={toggleDarkMode}
                className="ml-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                {darkMode ? (
                  <FaSun className="text-yellow-500 w-6 h-6" />
                ) : (
                  <FaMoon className="text-gray-600 w-6 h-6" />
                )}
              </button>
            </div>
          </ul>
        </div>

        {isOpen && (
          <div className="absolute top-14 left-0 w-full bg-white dark:bg-gray-800 shadow-lg p-4 sm:hidden">
            <ul className="flex flex-col space-y-4 text-center text-black dark:text-white">
              <li className="cursor-pointer hover:text-gray-400">
                <Link to="/">Home</Link>
              </li>
              <li className="cursor-pointer hover:text-gray-400">
                <Link to="/menu">Menu</Link>
              </li>
              <li className="cursor-pointer hover:text-gray-400">
                <Link to="/category">Category</Link>
              </li>
              <li className="cursor-pointer hover:text-gray-400">
                <Link to="/feedback">Feedback</Link>
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div
        className="relative h-[90vh] bg-cover bg-center flex items-end text-white mx-4 mt-16"
        style={{ backgroundImage: `url(${assets.home})` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold px-6 py-2 rounded-lg">
            Welcome to Agape Catering
          </h1>
        </div>

        <div className="w-full p-4 md:p-6 bg-opacity-50">
          <div className="max-w-md">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 opacity-100 text-left">
              Order Your Food Here
            </h2>
            <p className="mt-2 text-sm sm:text-base opacity-90 text-left">
              Food brings people together, creating moments of joy and connection.
              From rich, savory dishes to sweet delights, every bite tells a
              story. A good meal nourishes both the body and the soul.
            </p>
          </div>

          <div className="flex justify-center mt-4 md:mt-6">
            <Link to="/menu">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                View Menu
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        {/* Menu Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Our Menu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div key={item._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <img
                  src={`http://localhost:4000${item.image}`}
                  alt={item.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xl font-bold">${item.price}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Featured Categories</h2>
            <div className="space-y-2">
              <Link to="/category" className="block hover:text-blue-500">Main Course</Link>
              <Link to="/category" className="block hover:text-blue-500">Appetizers</Link>
              <Link to="/category" className="block hover:text-blue-500">Desserts</Link>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">No recent orders</p>
            </div>
          </div>

          {/* Special Offers */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">Special Offers</h2>
            <div className="space-y-2">
              <p className="text-gray-600 dark:text-gray-300">Check back soon for special offers!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-lg p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Your Cart</h2>
            <button
              onClick={() => setShowCart(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          {cart.length === 0 ? (
            <p className="text-gray-500">Your cart is empty</p>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item._id} className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">{item.name}</h3>
                    <p className="text-gray-600">${item.price}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold">${calculateTotal()}</span>
                </div>
                <button
                  className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg transition-colors"
                >
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default CustomerDashboard; 
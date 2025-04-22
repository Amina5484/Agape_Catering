import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';
import { useStore } from '../../context/StoreContext';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const Explore = ({ category, setCategory }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { token, url } = useStore();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, menuRes] = await Promise.all([
        axios.get('http://localhost:4000/api/category'),
        axios.get('http://localhost:4000/api/menu'),
      ]);

      setCategories(
        Array.isArray(categoriesRes.data) ? categoriesRes.data : []
      );
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
      toast.error('Failed to load menu categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemsForCategory = (categoryId) => {
    if (!Array.isArray(menuItems)) return [];
    return menuItems.filter(
      (item) =>
        item.category &&
        (typeof item.category === 'object'
          ? item.category._id === categoryId
          : item.category === categoryId)
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p
          className={`text-xl font-semibold ${
            isDarkMode ? 'text-red-400' : 'text-red-500'
          }`}
        >
          {error}
        </p>
        <button
          onClick={fetchAllData}
          className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1
          className={`text-3xl font-bold text-center mb-10 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}
        >
          Menu Categories
        </h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 justify-items-center">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              className="flex flex-col items-center justify-center p-4 cursor-pointer transition-all duration-300"
              onClick={() => setCategory(cat._id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={`w-32 h-32 rounded-full shadow-md bg-white flex flex-col items-center justify-center`}
              >
                <img
                  src={`http://localhost:4000${cat.image}`}
                  alt={cat.categoryName}
                  className="w-20 h-20 object-cover rounded-full mb-1"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,...'; // fallback image
                  }}
                />
                <h2 className="text-sm font-bold text-red-500 text-center">
                  {cat.categoryName}
                </h2>
                <p className="text-xs text-gray-500 text-center">
                  {getMenuItemsForCategory(cat._id).length} items
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;

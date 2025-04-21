import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useDarkMode } from '../../context/DarkModeContext';
import { useStore } from '../../context/StoreContext';
import { motion, AnimatePresence } from 'framer-motion';

const Explore = ({ category, setCategory }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { token } = useStore();
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
        axios.get('http://localhost:4000/api/menu')
      ]);
      setCategories(categoriesRes.data);
      setMenuItems(menuRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemsForCategory = (categoryId) => {
    return menuItems.filter(item => item.category && item.category._id === categoryId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-xl font-semibold">{error}</p>
        <button
          onClick={fetchAllData}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Menu</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <motion.div
              key={cat._id}
              className={`p-6 rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              onClick={() => setCategory(cat._id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center space-x-4">
                {cat.image && (
                  <img
                    src={`http://localhost:4000${cat.image}`}
                    alt={cat.categoryName}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <h2 className="text-xl font-semibold">{cat.categoryName}</h2>
                  <p className="text-gray-500">
                    {getMenuItemsForCategory(cat._id).length} items
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Explore;

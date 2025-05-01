 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import { useNavigate } from 'react-router-dom';
 import { useDarkMode } from '../../context/DarkModeContext';
 import { useStore } from '../../context/StoreContext';
 import { motion, AnimatePresence } from 'framer-motion';
 import { toast } from 'react-toastify';

  // Your imports here...

const Explore = ({ category, setCategory }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useDarkMode();
  const { token, url } = useStore();
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantity, setQuantity] = useState(1);

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

      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : []);
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      toast.error('Failed to load menu categories.');
    } finally {
      setLoading(false);
    }
  };

  const getMenuItemsForCategory = (categoryId) => {
    return menuItems.filter(
      (item) =>
        item.category &&
        (typeof item.category === 'object'
          ? item.category._id === categoryId
          : item.category === categoryId)
    );
  };

  const handleAddToCart = (item) => {
    console.log('Added to cart:', item);
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
      <div className="text-center py-12 px-4">
        <p className={`text-xl font-semibold ${isDarkMode ? 'text-red-400' : 'text-red-500'}`}>
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <h2 className="text-2xl font-bold mb-4">No Categories Available</h2>
        <p className="text-gray-500 mb-6">
          Our menu categories are currently being updated. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <h1 className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
        Menu Categories
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {categories.map((cat) => (
          <motion.div
            key={cat._id}
            className={`w-full h-40 sm:h-48 flex flex-col items-center justify-center rounded-lg shadow-md cursor-pointer transition-all duration-300 ${
              isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => setCategory(cat._id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center rounded-full overflow-hidden">
              {cat.image && (
                <img
                  src={`http://localhost:4000${cat.image}`}
                  alt={cat.categoryName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                  }}
                />
              )}
            </div>
            <div className="text-center mt-4 px-2">
              <h2 className="text-base sm:text-lg font-semibold font-mono text-red-400 truncate">
                {cat.categoryName}
              </h2>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Responsive Popup */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md sm:max-w-xl p-6 rounded-lg overflow-y-auto max-h-[90vh] space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg sm:text-xl font-semibold">{selectedItem.name}</h2>
              <p className="text-base sm:text-lg font-semibold text-green-500">
                ${selectedItem.price}
              </p>
            </div>

            <div className="flex justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 rounded-lg overflow-hidden">
                {selectedItem.image && (
                  <img
                    src={`http://localhost:4000${selectedItem.image}`}
                    alt={selectedItem.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-12 text-center border border-gray-300 rounded-md"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-300 rounded-md"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => handleAddToCart(selectedItem)}
                className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;


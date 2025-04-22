import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiPlus, FiMinus, FiInfo } from 'react-icons/fi';

const MenuDisplay = ({ category }) => {
  const { isDarkMode } = useDarkMode();
  const { addToCart } = useStore();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({}); // Track quantity per item
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/menu');
      const items = response.data;

      const filteredItems =
        category === 'All'
          ? items
          : items.filter(
              (item) => item.category && item.category._id === category
            );

      setMenuItems(filteredItems);

      // Initialize quantities for each item
      const initialQuantities = {};
      filteredItems.forEach((item) => {
        initialQuantities[item._id] = 1;
      });
      setQuantities(initialQuantities);

      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items. Please try again later.');
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, change) => {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, prev[itemId] + change),
    }));
  };

  const handleAddToCart = (item) => {
    const itemQuantity = quantities[item._id] || 1;
    addToCart(item._id, itemQuantity);
    toast.success(`${item.name} added to cart!`);
    setSelectedItem(null);
    setShowDetails(false);

    // Reset quantity for this item back to 1
    setQuantities((prev) => ({
      ...prev,
      [item._id]: 1,
    }));
  };

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    const categoryName = item.category?.categoryName || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative w-20 h-20">
          <div className="absolute top-0 left-0 w-full h-full border-8 border-gray-200 rounded-full"></div>
          <div className="absolute top-0 left-0 w-full h-full border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md mx-auto">
          <h3 className="text-red-600 dark:text-red-400 text-xl font-bold mb-3">
            Unable to Load Menu
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchMenuItems}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-md transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {Object.entries(groupedItems).length > 0 ? (
          <div className="flex flex-wrap -mx-4">
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full md:w-1/2 lg:w-1/2 px-4 mb-8"
              >
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5">
                  <div className="flex items-center mb-4">
                    <div className="h-0.5 w-10 bg-indigo-600 mr-3"></div>
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                      {categoryName}
                    </h2>
                    <div className="h-0.5 flex-grow bg-gray-200 dark:bg-gray-700 ml-3"></div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {items.map((item) => (
                      <motion.div
                        key={item._id}
                        whileHover={{ y: -3 }}
                        className={`rounded-lg overflow-hidden shadow-sm transition-all duration-300 max-w-[180px] mx-auto ${
                          isDarkMode
                            ? 'bg-gray-800 border border-gray-700 text-white'
                            : 'bg-white border border-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="w-full">
                          <div className="w-full h-28 overflow-hidden">
                            <img
                              src={
                                item.image
                                  ? `http://localhost:4000${item.image}`
                                  : 'https://via.placeholder.com/100?text=Item'
                              }
                              alt={item.name}
                              className="w-full h-full object-contain bg-gray-50 dark:bg-gray-900"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://via.placeholder.com/100?text=Item';
                              }}
                            />
                          </div>

                          <div className="p-3">
                            <div className="flex flex-col mb-2">
                              <h3 className="text-sm font-bold line-clamp-1">
                                {item.name}
                              </h3>
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {item.price !== undefined && item.price !== null
                                  ? Number(item.price).toFixed(2)
                                  : '0.00'}{' '}
                                ETB
                              </span>
                            </div>

                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                              {item.description}
                            </p>

                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item._id, -1)
                                  }
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <FiMinus size={12} className="text-red-500" />
                                </button>
                                <span className="px-2 py-0.5 text-xs font-medium">
                                  {quantities[item._id] || 1}
                                </span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item._id, 1)
                                  }
                                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                >
                                  <FiPlus
                                    size={12}
                                    className="text-green-500"
                                  />
                                </button>
                              </div>
                              <button
                                onClick={() => handleAddToCart(item)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-200 hover:bg-red-300 text-gray-800 font-medium rounded text-xs transition-colors"
                              >
                                <FiShoppingCart size={10} />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2">
                No menu items available
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are no items in this category. Please check back later or
                try another category.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence>
          {showDetails && selectedItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm z-50 p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className={`p-0 rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl ${
                  isDarkMode ? 'bg-gray-800' : 'bg-white'
                }`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/2">
                    <div className="relative h-full overflow-hidden group">
                      <img
                        src={
                          selectedItem.image
                            ? `http://localhost:4000${selectedItem.image}`
                            : 'https://via.placeholder.com/500x600?text=Food+Image'
                        }
                        alt={selectedItem.name}
                        className="w-full h-64 md:h-full object-contain bg-gray-50 dark:bg-gray-900 p-2"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'https://via.placeholder.com/500x600?text=Food+Image';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent md:hidden"></div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 hidden md:block"></div>
                    </div>
                  </div>

                  <div className="md:w-1/2 p-8 md:p-6 lg:p-8 flex flex-col">
                    <div className="mb-auto">
                      <h2 className="text-2xl font-bold mb-1">
                        {selectedItem.name}
                      </h2>
                      <p className="text-indigo-600 dark:text-indigo-400 text-lg font-semibold mb-4">
                        {selectedItem.price !== undefined &&
                        selectedItem.price !== null
                          ? Number(selectedItem.price).toFixed(2)
                          : '0.00'}{' '}
                        ETB
                      </p>

                      <div className="mb-6">
                        <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                          Description
                        </h3>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                          {selectedItem.description}
                        </p>
                      </div>

                      {selectedItem.category && (
                        <div className="mb-6">
                          <h3 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 font-medium mb-2">
                            Category
                          </h3>
                          <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
                            {selectedItem.category.categoryName}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                          <button
                            onClick={() =>
                              handleQuantityChange(selectedItem._id, -1)
                            }
                            className="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <FiMinus size={18} className="text-red-500" />
                          </button>
                          <span className="px-6 py-2 font-medium text-lg">
                            {quantities[selectedItem._id] || 1}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(selectedItem._id, 1)
                            }
                            className="p-3 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            <FiPlus size={18} className="text-green-500" />
                          </button>
                        </div>

                        <div className="text-xl font-bold">
                          Total:{' '}
                          {(
                            (selectedItem.price || 0) *
                            (quantities[selectedItem._id] || 1)
                          ).toFixed(2)}{' '}
                          ETB
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setShowDetails(false)}
                          className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAddToCart(selectedItem)}
                          className="px-6 py-3 bg-red-200 hover:bg-red-300 text-gray-800 font-medium rounded-lg shadow-md transition-colors flex items-center justify-center gap-2"
                        >
                          <FiShoppingCart size={18} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MenuDisplay;

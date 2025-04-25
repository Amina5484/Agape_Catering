import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { toast } from 'react-toastify';
import { FiShoppingCart, FiPlus, FiMinus, FiInfo, FiFilter, FiSearch } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const MenuDisplay = ({ category }) => {
  const { isDarkMode } = useDarkMode();
  const { addToCart } = useStore();
  const location = useLocation();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Get search query from URL
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    fetchMenuItems();
  }, [category]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      setFilterLoading(true);
      const response = await axios.get('http://localhost:4000/api/menu');
      const items = response.data;

      const filteredItems =
        category === 'All'
          ? items
          : items.filter(
            (item) => item.category && item.category._id === category
          );

      setMenuItems(filteredItems);

      const initialQuantities = {};
      filteredItems.forEach((item) => {
        initialQuantities[item._id] = 1;
      });
      setQuantities(initialQuantities);

      setError(null);
    } catch (err) {
      setError('Failed to fetch menu items. Please try again later.');
      console.error('Error fetching menu items:', err);
      toast.error('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  // Filter menu items based on search query
  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group filtered items by category
  const groupedItems = filteredMenuItems.reduce((acc, item) => {
    const categoryName = item.category?.categoryName || 'Uncategorized';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(item);
    return acc;
  }, {});

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
    setQuantities((prev) => ({
      ...prev,
      [item._id]: 1,
    }));
  };

  const openItemDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

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
        {/* Search and Filter Section */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="w-full sm:w-96 relative">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border ${isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-white border-gray-200 text-gray-800 placeholder-gray-500'
                  } focus:outline-none focus:ring-2 focus:ring-orange-500`}
              />
              <FiSearch
                className={`absolute right-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                size={20}
              />
            </div>
          </div>

          {/* Filter Status */}
          <div className="flex items-center space-x-2">
            <FiFilter className="text-orange-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              {category === 'All' ? 'All Items' : `Filtered by: ${category}`}
            </h3>
            {filterLoading && (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-500 border-t-transparent"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Filtering...</span>
              </div>
            )}
          </div>
        </div>

        {/* Search Results Count */}
        {searchQuery && (
          <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
            Found {filteredMenuItems.length} items matching "{searchQuery}"
          </div>
        )}

        {Object.entries(groupedItems).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(groupedItems).map(([categoryName, items]) => (
              <motion.div
                key={categoryName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-16"
              >
                <div className="flex items-center mb-8">
                  <div className="h-0.5 w-10 bg-orange-500 mr-3"></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mt-10">
                    {categoryName}
                  </h2>
                  <div className="h-0.5 flex-grow bg-gray-200 dark:bg-gray-700 ml-3"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      whileHover={{ scale: 1.03 }}
                      className={`rounded-lg overflow-hidden shadow-md transition-all duration-300 max-w-sm ${isDarkMode
                        ? 'bg-gray-800 border border-gray-700 text-white'
                        : 'bg-white border border-gray-100 text-gray-800'
                        }`}
                    >
                      <div className="relative">
                        <img
                          src={
                            item.image
                              ? `http://localhost:4000${item.image}`
                              : 'https://via.placeholder.com/400x250?text=Food+Image'
                          }
                          alt={item.name}
                          className="w-full h-44 object-contain bg-white dark:bg-gray-700"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://via.placeholder.com/400x250?text=Food+Image';
                          }}
                        />
                        <button
                          onClick={() => openItemDetails(item)}
                          className="absolute bottom-3 right-3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md hover:shadow-lg transition-shadow"
                        >
                          <FiInfo
                            className="text-orange-500 dark:text-orange-400"
                            size={18}
                          />
                        </button>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold line-clamp-1">
                            {item.name}
                          </h3>
                          <span className="text-md font-bold text-orange-500 dark:text-orange-400">
                            {item.price !== undefined && item.price !== null
                              ? `${Number(item.price).toFixed(2)} ETB`
                              : '0.00 ETB'}
                          </span>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100 dark:border-gray-700">
                          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                            <button
                              onClick={() => handleQuantityChange(item._id, -1)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FiMinus className="text-orange-500" size={16} />
                            </button>
                            <span className="px-3 py-1 font-medium">
                              {quantities[item._id] || 1}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item._id, 1)}
                              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            >
                              <FiPlus className="text-orange-500" size={16} />
                            </button>
                          </div>
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors"
                          >
                            <FiShoppingCart size={16} />
                            <span>Add</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 max-w-xl mx-auto">
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-white">
                {searchQuery
                  ? 'No items found matching your search'
                  : 'No menu items available'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchQuery
                  ? 'Try adjusting your search terms or browse all items.'
                  : 'There are no items in this category. Please check back later or try another category.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Modal for item details */}
      <AnimatePresence>
        {showDetails && selectedItem && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4"
          >
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4 relative flex flex-col md:flex-row gap-4">
              <button
                onClick={() => {
                  setShowDetails(false);
                  setSelectedItem(null);
                }}
                className="absolute top-2 right-2 text-gray-600 hover:text-orange-500 dark:text-gray-300 text-2xl"
              >
                ✕
              </button>

              {/* Image section */}
              <div className="md:w-1/3 w-full mb-4 md:mb-0">
                <img
                  src={
                    selectedItem.image
                      ? `http://localhost:4000${selectedItem.image}`
                      : 'https://via.placeholder.com/400x250?text=Food+Image'
                  }
                  alt={selectedItem.name}
                  className="w-full h-60 object-cover rounded-md"
                />
              </div>

              {/* Details section */}
              <div className="md:w-2/3 w-full flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                    {selectedItem.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    {selectedItem.description}
                  </p>
                  <p className="text-orange-500 dark:text-orange-400 font-semibold text-lg mb-4">
                    {selectedItem.price?.toFixed(2) || '0.00'} ETB
                  </p>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <button
                      onClick={() => handleQuantityChange(selectedItem._id, -1)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiMinus className="text-orange-500" />
                    </button>
                    <span className="px-3 font-medium">
                      {quantities[selectedItem._id] || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(selectedItem._id, 1)}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      <FiPlus className="text-orange-500" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleAddToCart(selectedItem)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg"
                  >
                    <FiShoppingCart />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuDisplay;

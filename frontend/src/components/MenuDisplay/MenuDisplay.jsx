import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../context/StoreContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { toast } from 'react-toastify';

const MenuDisplay = ({ category }) => {
    const { isDarkMode } = useDarkMode();
    const { addToCart } = useStore();
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        fetchMenuItems();
    }, [category]);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:4000/api/menu');
            const items = response.data;

            const filteredItems = category === 'All'
                ? items
                : items.filter(item => item.category && item.category._id === category);

            setMenuItems(filteredItems);
            setError(null);
        } catch (err) {
            setError('Failed to fetch menu items. Please try again later.');
            console.error('Error fetching menu items:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = (item) => {
        setSelectedItem(item);
        setQuantity(1);
    };

    const handleQuantityChange = (change) => {
        setQuantity(prev => Math.max(1, prev + change));
    };

    const handleAddToCart = () => {
        if (selectedItem) {
            addToCart(selectedItem._id, quantity);
            toast.success(`${selectedItem.name} added to cart!`);
            setSelectedItem(null);
        }
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
                    onClick={fetchMenuItems}
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
                {Object.entries(groupedItems).map(([categoryName, items]) => (
                    <motion.div
                        key={categoryName}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-semibold mb-6">{categoryName}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map((item) => (
                                <motion.div
                                    key={item._id}
                                    className={`p-6 rounded-lg shadow-lg h-full ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}

                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex flex-col h-full">
                                        {item.image && (
                                            <img
                                                src={`http://localhost:4000${item.image}`}
                                                alt={item.name}
                                                className="w-full h-48 object-cover rounded-lg mb-4"
                                            />
                                        )}
                                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                                        <p className="text-gray-500 mb-4 line-clamp-2">{item.description}</p>
                                        <div className="mt-auto">
                                            <button
                                                onClick={() => handleViewDetails(item)}
                                                className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>

                            ))}
                        </div>
                    </motion.div>
                ))}

                <AnimatePresence>
                    {selectedItem && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
                            onClick={() => setSelectedItem(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className={`p-8 rounded-lg w-full max-w-2xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="flex flex-col items-center">
                                    {selectedItem.image && (
                                        <img
                                            src={`http://localhost:4000${selectedItem.image}`}
                                            alt={selectedItem.name}
                                            className="w-full h-80 object-cover rounded-lg mb-6"
                                        />

                                    )}
                                    <h3 className="text-2xl font-semibold mb-2">{selectedItem.name}</h3>
                                    <p className="text-gray-500 mb-4">{selectedItem.description}</p>
                                    <p className="text-xl font-bold mb-4">${selectedItem.price}</p>

                                    <div className="flex items-center justify-center mb-6">
                                        <button
                                            onClick={() => handleQuantityChange(-1)}
                                            className="px-4 py-2 bg-gray-200 rounded-l hover:bg-gray-300"
                                        >
                                            -
                                        </button>
                                        <span className="px-4 py-2 bg-gray-100">{quantity}</span>
                                        <button
                                            onClick={() => handleQuantityChange(1)}
                                            className="px-4 py-2 bg-gray-200 rounded-r hover:bg-gray-300"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="flex justify-between w-full">
                                        <p className="text-xl font-bold">
                                            Total: ${(selectedItem.price * quantity).toFixed(2)}
                                        </p>
                                        <button
                                            onClick={handleAddToCart}
                                            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            Add to Cart
                                        </button>
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

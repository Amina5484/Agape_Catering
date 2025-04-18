import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FoodDisplay = () => {
  const { food_list, url, setFoodList, addToCart, token } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  const loadFoodList = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/food/list`);
      const foodData = Array.isArray(response.data) ? response.data : [];
      const processedFoods = foodData.map(food => ({
        ...food,
        image: food.image ? `${url}/uploads/${food.image.replace(/^\/uploads\//, '')}` : null
      }));
      setFoodList(processedFoods);
    } catch {
      toast.error('Failed to load menu items');
    } finally {
      setIsLoading(false);
    }
  }, [url, setFoodList]);

  useEffect(() => {
    loadFoodList();
  }, [loadFoodList]);

  const categorizedFood = useMemo(() => {
    if (!food_list || food_list.length === 0) return {};

    return food_list.reduce((acc, item) => {
      const { category, subcategory } = item;
      if (!acc[category]) acc[category] = {};

      const subcategoryKey = subcategory || 'General';

      if (!acc[category][subcategoryKey]) acc[category][subcategoryKey] = [];
      acc[category][subcategoryKey].push(item);
      return acc;
    }, {});
  }, [food_list]);

  const handleAddToCart = useCallback(async () => {
    if (!selectedFood) return;

    if (!token) {
      toast.error('Please login first to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(selectedFood._id, quantity, '', selectedFood.price);
      toast.success('Added to cart successfully!');
      setSelectedFood(null);
      setQuantity(1);
    } catch {
      toast.error('Failed to add item to cart');
    }
  }, [selectedFood, quantity, token, addToCart, navigate]);

  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFood(null);
    setQuantity(1);
  }, []);

  const handleSelectFood = useCallback((food) => {
    setSelectedFood(food);
    setQuantity(1);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Our Menu
        </h1>

        {food_list && food_list.length > 0 ? (
          Object.keys(categorizedFood).map((category) => (
            <div key={category} className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
                {category}
              </h2>
              <div className="space-y-12">
                {Object.keys(categorizedFood[category]).map((subcategory) => (
                  <div
                    key={subcategory}
                    className="bg-white rounded-xl shadow-lg p-8"
                  >
                    <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                      {subcategory}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {categorizedFood[category][subcategory].map((item) => (
                        <div
                          key={item._id}
                          onClick={() => handleSelectFood(item)}
                          className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer bg-white rounded-lg overflow-hidden border border-gray-200"
                        >
                          <div className="relative">
                            <img
                              src={item.image || 'https://via.placeholder.com/300'}
                              alt={item.name}
                              className="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-white rounded-full px-3 py-1 shadow-lg">
                              <span className="text-green-600 font-semibold">
                                {item.price.toLocaleString()} Birr
                              </span>
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {item.name}
                            </h3>
                            <p className="text-gray-600 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">
            <p>No menu items available at the moment.</p>
          </div>
        )}
      </div>

      {/* Food Detail Modal */}
      {selectedFood && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
              <div className="relative h-96">
                <img
                  src={selectedFood.image || 'https://via.placeholder.com/800x400'}
                  alt={selectedFood.name}
                  className="w-full h-full object-cover rounded-t-xl"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                  <h2 className="text-3xl font-bold text-white">
                    {selectedFood.name}
                  </h2>
                </div>
              </div>
            </div>
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="text-3xl font-bold text-green-600">
                  {selectedFood.price.toLocaleString()} Birr
                </span>
                <div className="flex items-center space-x-4 bg-gray-100 rounded-lg p-2">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="text-xl font-bold">-</span>
                  </button>
                  <span className="text-xl font-semibold min-w-[2rem] text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-white hover:bg-gray-200 transition-colors duration-200"
                  >
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-lg mb-8">{selectedFood.description}</p>
              <button
                onClick={handleAddToCart}
                className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition duration-300 text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                {token ? 'Add to Cart' : 'Login to Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(FoodDisplay);

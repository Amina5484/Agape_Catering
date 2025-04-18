import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const FoodDisplay = () => {
  const { food_list, url, setFoodList, addToCart, token, isLoggedIn } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadFoodList = useCallback(async () => {
    try {
      setIsLoading(true);list
      const response = await axios.get(`${url}/api/customer/menu
`);
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

    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
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
  }, [selectedFood, quantity, isLoggedIn, addToCart, navigate]);

  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedFood(null);
    setQuantity(1);
    setModalVisible(false);
  }, []);

  const handleSelectFood = useCallback((food) => {
    setSelectedFood(food);
    setQuantity(1);
    setModalVisible(true);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Menu</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-slate-800 mb-12">Our Menu</h1>

        {food_list && food_list.length > 0 ? (
          Object.keys(categorizedFood).map((category) => (
            <div key={category} className="mb-16">
              <h2 className="text-2xl font-semibold text-slate-700 mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Object.keys(categorizedFood[category]).map((subcategory) => (
                  <div
                    key={categorizedFood[category][subcategory][0]._id}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {categorizedFood[category][subcategory][0].image ? (
                        <img
                          src={categorizedFood[category][subcategory][0].image}
                          alt={categorizedFood[category][subcategory][0].name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-400">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {categorizedFood[category][subcategory][0].price.toLocaleString()} Birr
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">{categorizedFood[category][subcategory][0].name}</h3>
                      <p className="text-slate-600 mb-4 line-clamp-2">{categorizedFood[category][subcategory][0].description}</p>
                      <button
                        onClick={() => handleSelectFood(categorizedFood[category][subcategory][0])}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        View Details
                      </button>
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

        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 transition-opacity duration-300 ${modalVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className={`bg-white rounded-2xl max-w-md w-full overflow-hidden transform transition-all duration-300 ${modalVisible ? 'scale-100' : 'scale-95'}`}>
            <div className="relative">
              <button
                onClick={handleCloseModal}
                className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="h-48 overflow-hidden">
                {selectedFood?.image ? (
                  <img
                    src={selectedFood.image}
                    alt={selectedFood.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">{selectedFood?.name}</h2>
                    <p className="text-slate-600 text-sm mt-1">{selectedFood?.description}</p>
                  </div>
                  <span className="text-xl font-bold text-indigo-600 whitespace-nowrap ml-4">
                    {selectedFood?.price} Birr
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-50 rounded-lg p-3 mb-4">
                  <span className="text-slate-700 font-medium">Quantity</span>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-100 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-100 transition-colors duration-200"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 font-medium"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FoodDisplay);

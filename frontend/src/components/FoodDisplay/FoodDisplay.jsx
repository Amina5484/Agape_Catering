import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';

const FoodDisplay = ({ category }) => {
  const { url, setFoodList, addToCart, token, isLoggedIn } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [localFoodList, setLocalFoodList] = useState([]);
  const [selectedSubSubcategory, setSelectedSubSubcategory] = useState(null);

  const loadFoodList = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${url}/api/customer/menu`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const foodData = Array.isArray(response.data) ? response.data : [];
      const processedFoods = foodData.map(food => ({
        ...food,
        image: food.image ? `${url}/uploads/${food.image}` : null
      }));
      setLocalFoodList(processedFoods);
      setFoodList(processedFoods);
    } catch (error) {
      console.error('Error loading menu:', error);
      toast.error('Failed to load menu items');
      setError('Failed to load menu items. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [url, setFoodList, token]);

  useEffect(() => {
    loadFoodList();
  }, [loadFoodList]);

  const categorizedFood = useMemo(() => {
    if (!localFoodList || localFoodList.length === 0) return {};

    return localFoodList.reduce((acc, item) => {
      const { category, subcategory } = item;
      if (!acc[category]) acc[category] = {};

      const subcategoryKey = subcategory || 'General';

      if (!acc[category][subcategoryKey]) acc[category][subcategoryKey] = [];
      acc[category][subcategoryKey].push(item);
      return acc;
    }, {});
  }, [localFoodList]);

  const handleAddToCart = useCallback(async (item, subSubcategory) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await addToCart(item._id, quantity, subSubcategory.name);
      toast.success('Added to cart successfully!');
      setSelectedSubcategory(null);
      setQuantity(1);
      setModalVisible(false);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  }, [quantity, isLoggedIn, addToCart, navigate]);

  const handleQuantityChange = useCallback((newQuantity) => {
    setQuantity(Math.max(1, newQuantity));
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedSubcategory(null);
    setQuantity(1);
    setModalVisible(false);
  }, []);

  const handleSelectSubcategory = useCallback((subcategory) => {
    setSelectedSubcategory(subcategory);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-slate-800 mb-8 sm:mb-12">Our Menu</h1>

        {localFoodList && localFoodList.length > 0 ? (
          Object.keys(categorizedFood).map((category) => (
            <div key={category} className="mb-12 sm:mb-16">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-700 mb-4 sm:mb-6">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Object.keys(categorizedFood[category]).map((subcategory) => (
                  <div
                    key={categorizedFood[category][subcategory][0]._id}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-40 sm:h-48 overflow-hidden">
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
                      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-indigo-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        {categorizedFood[category][subcategory][0].subSubcategories?.[0]?.price?.toLocaleString() || '0'} Birr
                      </div>
                    </div>
                    <div className="p-4 sm:p-6">
                      <h3 className="text-lg sm:text-xl font-semibold text-slate-800 mb-2">{subcategory}</h3>
                      <p className="text-sm sm:text-base text-slate-600 mb-4 line-clamp-2">
                        {categorizedFood[category][subcategory][0].description}
                      </p>
                      <button
                        onClick={() => handleSelectSubcategory(categorizedFood[category][subcategory][0])}
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 text-sm sm:text-base"
                      >
                        See Details
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
              <div className="h-40 sm:h-48 overflow-hidden">
                {selectedSubcategory?.image ? (
                  <img
                    src={selectedSubcategory.image}
                    alt={selectedSubcategory.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                    <span className="text-slate-400">No Image</span>
                  </div>
                )}
              </div>
              <div className="p-4 sm:p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-800">{selectedSubcategory?.name}</h2>
                    <p className="text-sm sm:text-base text-slate-600 mt-1">{selectedSubcategory?.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedSubcategory?.subSubcategories?.map((subSub, index) => (
                    <div
                      key={index}
                      className={`bg-slate-50 rounded-lg p-4 cursor-pointer transition-colors duration-200 ${selectedSubSubcategory?._id === subSub._id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-100'
                        }`}
                      onClick={() => setSelectedSubSubcategory(subSub)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm sm:text-base text-slate-700 font-medium">{subSub.name}</span>
                        <span className="text-lg sm:text-xl font-bold text-indigo-600">
                          {subSub.price.toLocaleString()} Birr
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedSubSubcategory && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleQuantityChange(quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-100 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="text-base sm:text-lg font-semibold min-w-[2rem] text-center">{quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-slate-100 transition-colors duration-200"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleAddToCart(selectedSubcategory, selectedSubSubcategory)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDisplay;

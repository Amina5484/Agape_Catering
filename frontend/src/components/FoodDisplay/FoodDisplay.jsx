import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { toast } from 'react-toastify';

const FoodDisplay = () => {
  const { food_list, fetchFoodList } =
    useContext(StoreContext);
  const [categorizedFood, setCategorizedFood] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadFoodList = async () => {
      try {
        setIsLoading(true);
        await fetchFoodList();
      } catch (error) {
        console.error('Error fetching food list:', error);
        toast.error('Failed to load menu items');
      } finally {
        setIsLoading(false);
      }
    };
    loadFoodList();
  }, []);

  useEffect(() => {
    if (food_list && food_list.length > 0) {
      const categorized = food_list.reduce((acc, item) => {
        const { category, subcategory } = item;
        if (!acc[category]) acc[category] = {};
        
        // Handle items without subcategory
        const subcategoryKey = subcategory || 'General';
        
        if (!acc[category][subcategoryKey]) acc[category][subcategoryKey] = [];
        acc[category][subcategoryKey].push(item);
        return acc;
      }, {});
      setCategorizedFood(categorized);
    }
  }, [food_list]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-12">
          Our Menu
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : food_list && food_list.length > 0 ? (
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
                          className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer"
                        >
                          <FoodItem
                            name={item.name}
                            description={item.description}
                            image={item.image}
                            price={item.price}
                            _id={item._id}
                          />
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
    </div>
  );
};

export default FoodDisplay;

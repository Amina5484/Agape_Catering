import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const FoodDisplay = () => {
  const { food_list, fetchFoodList, addToCart, isLoggedIn } =
    useContext(StoreContext);
  const navigate = useNavigate();
  const [categorizedFood, setCategorizedFood] = useState({});
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [quantity, setQuantity] = useState(1);
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
        if (!acc[category][subcategory]) acc[category][subcategory] = [];
        acc[category][subcategory].push(item);
        return acc;
      }, {});
      setCategorizedFood(categorized);
    }
  }, [food_list]);

  const openModal = (item) => {
    setSelectedItem(item);
    setSelectedType(item.types ? item.types[0] : null);
    setQuantity(1);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
    setSelectedType(null);
    setQuantity(1);
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    if (!selectedItem || !selectedType) {
      toast.error('Please select a type');
      return;
    }

    try {
      await addToCart({
        id: selectedItem._id,
        name: selectedItem.name,
        type: selectedType.name,
        price: selectedType.price,
        quantity,
      });
      toast.success('Item added to cart successfully');
      closeModal();
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

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
                          className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                          onClick={() => openModal(item)}
                        >
                          <FoodItem
                            name={item.name}
                            description={item.description}
                            image={item.image}
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

        {/* Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={closeModal}
          contentLabel="Food Item Details"
          className="fixed inset-0 flex items-center justify-center z-50"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center"
        >
          {selectedItem && (
            <div className="bg-white p-5 rounded-lg shadow-lg w-full max-w-sm relative">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
                onClick={closeModal}
              >
                &times;
              </button>

              <h2 className="text-2xl font-bold text-center">
                {selectedItem.name}
              </h2>
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-40 object-cover mt-3 rounded-lg"
              />
              <p className="mt-3 text-gray-700 text-center">
                {selectedItem.description}
              </p>

              {/* Type Selection */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Select Type:</h3>
                <select
                  className="border p-2 rounded mt-1 w-full"
                  value={selectedType ? selectedType.name : ''}
                  onChange={(e) =>
                    setSelectedType(
                      selectedItem.types.find(
                        (type) => type.name === e.target.value
                      )
                    )
                  }
                >
                  {selectedItem.types && selectedItem.types.length > 0 ? (
                    selectedItem.types.map((type) => (
                      <option key={type.name} value={type.name}>
                        {type.name} - {type.price} ETB
                      </option>
                    ))
                  ) : (
                    <option>No types available</option>
                  )}
                </select>
              </div>

              {/* Quantity Selection */}
              <div className="mt-4">
                <h3 className="text-lg font-semibold">Quantity:</h3>
                <input
                  type="number"
                  className="border p-2 rounded mt-1 w-full"
                  value={quantity}
                  min="1"
                  onChange={(e) =>
                    setQuantity(Math.max(1, parseInt(e.target.value)))
                  }
                />
              </div>

              {/* Buttons */}
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  onClick={closeModal}
                  className="bg-red-500 text-white px-4 py-2 rounded w-full hover:bg-red-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddToCart}
                  className="bg-green-500 text-white px-4 py-2 rounded w-full hover:bg-green-600"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default FoodDisplay;

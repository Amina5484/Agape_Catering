import React, { useContext, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { StoreContext } from '../../context/StoreContext';
import PropTypes from 'prop-types';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, isLoggedIn } = useContext(StoreContext);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(cartItems[id] || 1);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      alert('Please log in to add items to your cart.');
      return;
    }
    if (quantity <= 0) {
      alert('Please enter a valid quantity greater than 0.');
      return;
    }

    addToCart(id, quantity);
    toggleModal();
  };

  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value, 10);
    setQuantity(isNaN(newQuantity) || newQuantity < 1 ? 1 : newQuantity);
  };

  const imageUrl = image.startsWith('http')
    ? image
    : `http://localhost:4000/uploads/${image}`;

  return (
    <>
      {/* Main Food Item Display */}
      <div
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={toggleModal}
      >
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[tomato] transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
        <p className="text-lg font-bold text-[tomato]">{price} ETB</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md relative">
            <button
              onClick={toggleModal}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-300"
            >
              <FaTimes className="w-5 h-5 text-gray-600" />
            </button>

            <div className="relative overflow-hidden rounded-xl mb-6">
              <img
                src={imageUrl}
                alt={name}
                className="w-full h-64 object-cover"
              />
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">{name}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className="text-xl font-bold text-[tomato] mb-6">{price} ETB</p>

            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <label
                  htmlFor="quantity"
                  className="font-semibold text-gray-700"
                >
                  Quantity:
                </label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={handleQuantityChange}
                  min="1"
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[tomato] focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full bg-[tomato] text-white py-3 rounded-lg font-semibold hover:bg-[#ff6347] transition-colors duration-300 transform hover:scale-105"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

FoodItem.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default FoodItem;

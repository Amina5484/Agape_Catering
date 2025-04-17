import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import { useStore } from '../../context/StoreContext';
import { toast } from 'react-toastify';

Modal.setAppElement('#root');

const FoodItem = ({ name, description, image, price, _id }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoggedIn, url } = useStore();

  const getImageUrl = (img) => {
    if (!img) return 'https://via.placeholder.com/300x200?text=No+Image';
    if (img.startsWith('http')) return img;
    
    // Handle both cases: full path and filename only
    if (img.includes('/')) {
      // If it's a full path, ensure it starts with the correct URL
      return img.startsWith('/') ? `${url}${img}` : `${url}/${img}`;
    } else {
      // If it's just a filename, add it to the uploads directory
      return `${url}/uploads/${img}`;
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      await addToCart(_id, quantity, '', price);
      setIsModalOpen(false);
      setQuantity(1);
      toast.success('Added to cart successfully!');
    } catch (error) {
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <>
      <div 
        className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative overflow-hidden rounded-lg mb-4">
          <img
            src={getImageUrl(image)}
            alt={name}
            className="w-full h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
            onError={(e) => {
              console.error('Image failed to load:', image);
              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
              e.target.onerror = null;
            }}
          />
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-[tomato] transition-colors duration-300">
          {name}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{description}</p>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
          setQuantity(1);
        }}
        className="fixed inset-0 flex items-center justify-center z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-40"
      >
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setQuantity(1);
              }}
              className="absolute top-0 right-0 text-gray-600 hover:text-red-500 text-2xl font-bold bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md"
            >
              ×
            </button>
            <div className="mb-4">
              <img
                src={getImageUrl(image)}
                alt={name}
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  console.error('Image failed to load:', image);
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                  e.target.onerror = null;
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{name}</h2>
            <p className="text-gray-600 mb-4">{description}</p>
            <p className="text-xl font-semibold text-[tomato] mb-4">
              Birr {price}
            </p>
            <div className="flex items-center justify-between mb-6">
              <span className="text-gray-700">Quantity:</span>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-[tomato] text-white py-2 rounded-lg hover:bg-[#ff6347] transition-colors"
            >
              Add to Cart - Birr {price * quantity}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

FoodItem.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string,
  price: PropTypes.number.isRequired,
  _id: PropTypes.string.isRequired,
};

export default FoodItem;

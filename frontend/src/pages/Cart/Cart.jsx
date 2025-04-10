import { useContext, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const {
    cartItems,
    food_list,
    addToCart,
    removeFromCart,
    url,
    totalCartPrice,
    fetchCart,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  // Fetch cart data when component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Debug logging
  useEffect(() => {
    console.log('Cart Items:', cartItems);
    console.log('Food List:', food_list);
  }, [cartItems, food_list]);

  // Filter items based on cartItems
  const filteredItems = food_list.filter(
    (item) => cartItems[item._id]?.quantity > 0
  );

  // Debug logging for filtered items
  useEffect(() => {
    console.log('Filtered Items:', filteredItems);
  }, [filteredItems]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Your Cart</h1>
        
        {/* Cart Items Container */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          {/* Cart Header */}
          <div className="hidden sm:grid grid-cols-6 font-bold bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="text-gray-600">Item</div>
            <div className="text-gray-600">Title</div>
            <div className="text-gray-600">Price</div>
            <div className="text-gray-600">Quantity</div>
            <div className="text-gray-600">Total</div>
            <div className="text-gray-600">Remove</div>
          </div>

          {/* Cart Items */}
          {filteredItems.map((item) => {
            const cartItem = cartItems[item._id];
            const price = cartItem.price || item.price;
            const totalPrice = price * cartItem.quantity;

            return (
              <div
                key={item._id}
                className="grid grid-cols-3 sm:grid-cols-6 items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="relative">
                  <img
                    src={url + '/uploads/' + item.image}
                    alt={item.name}
                    className="w-20 h-20 sm:w-16 sm:h-16 rounded-lg object-cover shadow-md"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                </div>
                <p className="col-span-2 sm:col-span-1 font-medium text-gray-900">{item.name}</p>
                <p className="hidden sm:block text-gray-600 font-medium">{price} ETB</p>
                {/* Quantity Controls */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                  >
                    -
                  </button>
                  <p className="font-medium text-gray-900 w-8 text-center">{cartItem.quantity}</p>
                  <button
                    onClick={() =>
                      addToCart(item._id, 1, cartItem.selectedType, price)
                    }
                    className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200"
                  >
                    +
                  </button>
                </div>
                <p className="hidden sm:block text-gray-900 font-medium">{totalPrice} ETB</p>
                <button
                  onClick={() => removeFromCart(item._id, true)}
                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                  title="Remove Item"
                >
                  <RiCloseLine size={24} />
                </button>
              </div>
            );
          })}

          {/* Empty Cart Message */}
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">Your cart is empty</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 text-teal-600 hover:text-teal-700 font-medium"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span>{totalCartPrice} ETB</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Delivery Fee</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-teal-600">{totalCartPrice} ETB</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/order')}
              className="w-full mt-8 bg-teal-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

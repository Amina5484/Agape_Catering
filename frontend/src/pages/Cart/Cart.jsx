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
    isLoggedIn,
    userRole,
  } = useContext(StoreContext);
  const navigate = useNavigate();

  // Fetch cart data when component mounts
  useEffect(() => {
    console.log('Cart component mounted');
    console.log('Is logged in:', isLoggedIn);
    console.log('User role:', userRole);
    fetchCart();
  }, [fetchCart, isLoggedIn, userRole]);

  // Filter items based on cartItems
  const filteredItems = food_list.filter(
    (item) => cartItems[item._id]?.quantity > 0
  );

  console.log('Cart items:', cartItems);
  console.log('Food list:', food_list);
  console.log('Filtered items:', filteredItems);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 pt-24">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
          <p className="text-gray-600 mb-4">Please log in to view your cart</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your Cart
        </h1>

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
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
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
                  </div>
                  <p className="col-span-2 sm:col-span-1 font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="hidden sm:block text-gray-600 font-medium">
                    {price} ETB
                  </p>
                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors duration-200"
                    >
                      -
                    </button>
                    <p className="font-medium text-gray-900 w-8 text-center">
                      {cartItem.quantity}
                    </p>
                    <button
                      onClick={() =>
                        addToCart(item._id, 1, cartItem.selectedType, price)
                      }
                      className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors duration-200"
                    >
                      +
                    </button>
                  </div>
                  <p className="hidden sm:block text-gray-900 font-medium">
                    {totalPrice} ETB
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id, true)}
                    className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                    title="Remove Item"
                  >
                    <RiCloseLine size={24} />
                  </button>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Your cart is empty</p>
              <button
                onClick={() => navigate('/menu')}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Browse Menu
              </button>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {filteredItems.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
              <p className="text-2xl font-bold text-gray-900">
                {totalCartPrice} ETB
              </p>
            </div>
            <button
              onClick={() => navigate('/place-order')}
              className="w-full py-4 bg-green-600 text-white text-lg font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg"
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

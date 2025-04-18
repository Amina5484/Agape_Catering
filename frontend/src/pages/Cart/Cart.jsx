import React, { useContext, useEffect, useState, useCallback } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Cart = () => {
  const { 
    cartItems, 
    removeFromCart,
    updateCartItem,
    token,
    url,
    fetchCart,
    food_list,
    totalCartPrice
  } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await fetchCart();
    } catch {
        toast.error('Failed to load cart items');
      } finally {
        setIsLoading(false);
      }
  }, [token, fetchCart]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const handleQuantityChange = async (foodId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(foodId, newQuantity);
      await loadCart();
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (foodId) => {
    try {
      await removeFromCart(foodId);
      await loadCart();
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleCheckout = () => {
    if (!token) {
      toast.error('Please login to proceed to checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Prepare cart data for PlaceOrder page
    const cartData = {
      items: cartItems.map(item => {
        const foodItem = food_list.find(food => food._id === item.itemId);
        return {
          ...item,
          ...foodItem,
          total: item.quantity * (item.price || foodItem?.price || 0)
        };
      }),
      total: totalCartPrice
    };

    // Navigate to PlaceOrder with cart data
    navigate('/placeorder', { state: { cartData } });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your cart</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Calculate cart data
  const cartData = cartItems.map(item => {
    const foodItem = food_list.find(food => food._id === item.itemId);
    return {
      ...item,
      ...foodItem,
      total: item.quantity * (item.price || foodItem?.price || 0)
    };
  });

  const total = cartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cartData.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600">Your cart is empty</h2>
            <p className="text-gray-500 mt-2">Add some delicious items to your cart</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="divide-y divide-gray-200">
                {cartData.map((item) => (
                <div key={item.itemId} className="p-6 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20">
                      {item.image ? (
                    <img
                          src={`${url}/uploads/${item.image.replace(/^\/uploads\//, '')}`}
                      alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-gray-600">{item.selectedType || 'No special instructions'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-2">
                        <button
                        onClick={() => handleQuantityChange(item.itemId, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          -
                        </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                        <button
                        onClick={() => handleQuantityChange(item.itemId, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200"
                        >
                          +
                        </button>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {item.total.toLocaleString()} Birr
                      </p>
                      <p className="text-sm text-gray-500">
                        {(item.price || 0).toLocaleString()} Birr each
                      </p>
                    </div>
                      <button
                      onClick={() => handleRemoveItem(item.itemId)}
                      className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                </div>
                ))}
            </div>
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Total</h3>
                <p className="text-2xl font-bold text-gray-900">
                  {total.toLocaleString()} Birr
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition duration-300 text-lg font-semibold"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

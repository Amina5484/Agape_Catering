import { useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { useStore } from '../../context/StoreContext';
import { RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {
  const { 
    cartItems, 
    food_list, 
    fetchCart, 
    url, 
    isLoggedIn, 
    userId,
    token,
    addToCart, 
    removeFromCart 
  } = useStore();
  
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch cart data on mount and when login state changes
  useEffect(() => {
    const loadCart = async () => {
      if (!isLoggedIn || !userId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        await fetchCart();
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart items');
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [isLoggedIn, userId, fetchCart]);

  // Calculate cart data and total
  const cartData = useMemo(() => {
    return Object.entries(cartItems).map(([itemId, cartItem]) => {
      const foodItem = food_list.find(item => item._id === itemId);
      return {
        ...foodItem,
        quantity: cartItem.quantity,
        totalPrice: cartItem.quantity * (foodItem?.price || 0)
      };
    }).filter(item => item.quantity > 0);
  }, [cartItems, food_list]);

  const totalAmount = useMemo(() => {
    return cartData.reduce((total, item) => total + item.totalPrice, 0);
  }, [cartData]);

  // Handle quantity changes
  const handleQuantityChange = async (itemId, change) => {
    try {
      const currentQuantity = cartItems[itemId]?.quantity || 0;
      const newQuantity = currentQuantity + change;
      
      if (newQuantity <= 0) {
        await removeFromCart(itemId);
        toast.success('Item removed from cart');
      } else {
        const item = food_list.find(item => item._id === itemId);
        if (!item) {
          toast.error('Item not found');
          return;
        }

        // Set the exact new quantity
        await addToCart(itemId, newQuantity, '', item.price);
        toast.success('Cart updated');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Handle checkout
  const handleCheckout = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to checkout');
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await axios.post(
        `${url}/api/cart/${userId}/order`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        await fetchCart();
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Please Login</h2>
          <p className="text-gray-600 mb-4">You need to login to view your cart</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cartData.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-600 mb-4">Your cart is empty</h2>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition duration-300"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartData.map((item) => (
                  <li key={item._id} className="p-6 flex items-center">
                    <img
                      src={item.image ? `${url}${item.image}` : 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="text-gray-500">${item.price}</p>
                      <div className="mt-2 flex items-center">
                        <button
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          -
                        </button>
                        <span className="mx-4 text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="ml-6">
                      <p className="text-lg font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="mt-2 text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8 bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full bg-blue-500 text-white py-3 rounded-full hover:bg-blue-600 transition duration-300 ${
                  isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? 'Processing...' : 'Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

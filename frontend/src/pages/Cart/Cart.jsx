import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {
  const { cartItems, food_list, fetchCart, url, isLoggedIn, token } = useContext(StoreContext);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Initialize cart data
  const cartData = food_list.filter((item) => {
    const itemId = item._id.toString();
    return cartItems[itemId]?.quantity > 0;
  });

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!isLoggedIn) {
        if (mounted) setIsLoading(false);
        return;
      }
      try {
        if (mounted) setIsLoading(true);
        await fetchCart();
      } catch (error) {
        console.error('Error fetching cart:', error);
        if (mounted) {
          setError('Failed to load cart. Please try again.');
          toast.error('Error loading cart');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [fetchCart, isLoggedIn]);

  // Calculate total cart price
  const totalCartPrice = cartData.reduce(
    (total, item) => {
      const itemId = item._id.toString();
      const cartItem = cartItems[itemId];
      const quantity = cartItem?.quantity || 0;
      const price = cartItem?.price || item.price;
      return total + (price * quantity);
    },
    0
  );

  const handleCheckout = async () => {
    if (cartData.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setIsCheckingOut(true);
    try {
      navigate('/placeorder');
    } catch (error) {
      toast.error('Error during checkout');
      console.error('Checkout error:', error);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = food_list.find(item => item._id.toString() === itemId);
      if (!item) {
        toast.error('Item not found');
        return;
      }

      if (change > 0) {
        await axios.post(
          `${url}/api/cart/add`,
          {
            itemId,
            quantity: 1,
            price: item.price
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        await fetchCart();
        toast.success('Item added to cart');
      } else {
        await axios.post(
          `${url}/api/cart/remove`,
          {
            itemId,
            removeAll: false
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        await fetchCart();
        toast.success('Item removed from cart');
      }
    } catch (error) {
      toast.error('Failed to update quantity');
      console.error('Quantity update error:', error);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await axios.post(
        `${url}/api/cart/remove`,
        {
          itemId,
          removeAll: true
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      await fetchCart();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
      console.error('Remove item error:', error);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/100?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads/')) return `${url}${imagePath}`;
    return `${url}/uploads/${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-gray-600 text-xl font-medium">Loading cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
        <div className="text-red-500 text-xl mb-4 font-medium">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your cart</h2>
          <button
            onClick={() => navigate('/login')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
          >
            Login
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h2>
        
          {/* Cart Header */}
        <div className="hidden sm:grid grid-cols-6 font-bold border-b border-gray-200 py-4 text-gray-600">
          <div>Item</div>
          <div>Title</div>
          <div>Price</div>
          <div>Quantity</div>
          <div>Total</div>
          <div>Remove</div>
          </div>

          {/* Cart Items */}
        {cartData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {cartData.map((item) => {
                const itemId = item._id.toString();
                const cartItem = cartItems[itemId];
                const quantity = cartItem?.quantity || 0;
                const price = cartItem?.price || item.price;
                const itemTotal = price * quantity;

              return (
                <div
                    key={itemId}
                    className="grid grid-cols-3 sm:grid-cols-6 items-center border-b border-gray-200 py-4 gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="relative">
                    <img
                        src={getImageUrl(item.image)}
                      alt={item.name}
                        className="w-16 h-16 sm:w-10 sm:h-10 rounded-lg object-cover shadow-sm"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                          e.target.onerror = null;
                        }}
                    />
                  </div>
                    <p className="col-span-2 sm:col-span-1 font-medium text-gray-800">{item.name}</p>
                    <p className="hidden sm:block text-gray-600">{price} ETB</p>
                    
                  {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handleQuantityChange(itemId, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors shadow-sm"
                        disabled={quantity <= 1}
                    >
                      -
                    </button>
                      <p className="font-medium text-gray-800">{quantity}</p>
                      <button
                        onClick={() => handleQuantityChange(itemId, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
                      >
                        +
                      </button>
                    </div>
                    
                    <p className="hidden sm:block text-gray-800 font-medium">
                      {itemTotal} ETB
                    </p>
                    
                    <button
                      onClick={() => handleRemoveItem(itemId)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="Remove Item"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Cart Total and Checkout */}
            <div className="mt-8 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Total</h3>
                <h3 className="text-2xl font-bold text-indigo-600">
                  {totalCartPrice} ETB
                </h3>
                </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md ${
                  isCheckingOut ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

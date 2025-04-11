import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/StoreContext';
import { useContext } from 'react';
import { toast } from 'react-toastify';

const Cart = () => {
  const { cartItems, removeFromCart, fetchCart, loading } = useContext(StoreContext);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
    };

    fetchData();
  }, [fetchCart]);

  const handleCheckout = async () => {
    if (Object.keys(cartItems).length === 0) {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading cart...</div>
      </div>
    );
  }

  if (!localStorage.getItem("token")) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please login to view your cart</h2>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Login
        </button>
      </div>
    );
  }

  const totalAmount = Object.values(cartItems).reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h2>
        {Object.keys(cartItems).length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Your cart is empty</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(cartItems).map(([itemId, item]) => (
                <div key={itemId} className="flex justify-between items-center p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
                    <p className="text-gray-600">Price: ${item.price}</p>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    {item.selectedType && (
                      <p className="text-gray-600">Type: {item.selectedType}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => removeFromCart(itemId, false)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    >
                      -
                    </button>
                    <button 
                      onClick={() => removeFromCart(itemId, true)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-4 border-t border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Total: ${totalAmount.toFixed(2)}
              </h3>
              <button 
                onClick={handleCheckout} 
                disabled={isCheckingOut}
                className={`w-full py-3 px-4 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors ${
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

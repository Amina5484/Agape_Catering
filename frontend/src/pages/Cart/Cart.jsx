import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const Cart = () => {
  const { cartItems, removeFromCart, url, token, userId, isLoggedIn } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [foodData, setFoodData] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to view your cart');
      navigate('/login');
      return;
    }

    const fetchFoodData = async () => {
      try {
        const response = await axios.get(`${url}/api/food/list`);
        if (Array.isArray(response.data)) {
          const foodMap = response.data.reduce((acc, food) => {
            acc[food._id] = food;
            return acc;
          }, {});
          setFoodData(foodMap);
        }
      } catch (error) {
        console.error('Error fetching food data:', error);
        toast.error('Failed to load food details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFoodData();
  }, [url, isLoggedIn, navigate]);

  const handleQuantityChange = async (menuId, newQuantity) => {
    if (!isLoggedIn) {
      toast.error('Please login to modify cart');
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/cart/${userId}`,
        { menuId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Cart updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error(error.response?.data?.message || 'Failed to update cart');
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      const foodItem = foodData[item.menuId];
      return total + (foodItem?.price || 0) * item.quantity;
    }, 0);
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const cartData = cartItems.map(item => ({
      ...item,
      ...foodData[item.menuId],
      total: (foodData[item.menuId]?.price || 0) * item.quantity
    }));

    navigate('/placeorder', { state: { cartData } });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <p className="text-slate-600 text-lg">Your cart is empty</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {cartItems.map((item) => {
              const foodItem = foodData[item.menuId];
              if (!foodItem) return null;

              return (
                <div
                  key={item.menuId}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div className="p-6 flex items-center space-x-6">
                    <div className="w-24 h-24 flex-shrink-0">
                      {foodItem.image ? (
                        <img
                          src={foodItem.image}
                          alt={foodItem.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200 rounded-lg flex items-center justify-center">
                          <span className="text-slate-400">No Image</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {foodItem.name}
                      </h3>
                      <p className="text-slate-600 text-sm mt-1">
                        {foodItem.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleQuantityChange(item.menuId, Math.max(1, item.quantity - 1))}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            -
                          </button>
                          <span className="text-lg font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.menuId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-indigo-600">
                            {(foodItem.price * item.quantity).toLocaleString()} Birr
                          </p>
                          <button
                            onClick={() => removeFromCart(item.menuId)}
                            className="text-sm text-red-600 hover:text-red-700 mt-1"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-slate-800">Total</h2>
                <p className="text-2xl font-bold text-indigo-600">
                  {calculateTotal().toLocaleString()} Birr
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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

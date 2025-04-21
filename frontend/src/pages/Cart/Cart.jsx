import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
  const { removeFromCart, url, token, userId, isLoggedIn } = useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      // const response = await axios.get(`${url}/api/cart/`, {
      const response = await axios.get(`http://localhost:4000/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`${url}/api/cart/`);
      setCartData(response.data);
      console.log("Cart data fetched successfully:", response.data);
      console.log(response.data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      toast.error('Failed to load cart details');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error('Please login to view your cart');
      navigate('/login');
      return;
    }



    fetchCartData();
  }, [url, token, isLoggedIn, navigate]);

  const handleQuantityChange = async (itemId, newQuantity) => {

    if (!isLoggedIn) {
      toast.error('Please login to modify cart');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/api/cart/update/${itemId}`,
        { quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCartData(response.data);
      fetchCartData();
      toast.success('Cart updated successfully');
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!cartData || !cartData.items || cartData.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    navigate('/placeorder', { state: { cartItems: cartData.items } });
  };
  const handleRemoveFromCart = async (itemId) => {
    if (!isLoggedIn) {
      toast.error('Please login to modify cart');
      return;
    }

    try {
      const response = await axios.delete(
        `http://localhost:4000/api/cart/delete/${itemId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCartData(response.data);
      fetchCartData();
      toast.success('Item removed from cart successfully');
    } catch (error) {
      console.error('Error removing item from cart:', error);
      toast.error('Failed to remove item from cart');
    }
  };
  const calculateSubtotal = () => {
    return cartData?.subtotal || 0;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Your Shopping Cart</h1>
          <button
            onClick={() => navigate('/')}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            <FaShoppingBag className="mr-2" />
            Continue Shopping
          </button>
        </div>

        {!cartData?.items?.length ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaShoppingBag className="text-gray-400 text-4xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-600 mb-6">Looks like you haven't added any items to your cart yet.</p>
              <button
                onClick={() => navigate('/')}
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartData.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src={`http://localhost:4000${item.menuItem.image}`}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                        }}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{item.menuItem.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{item.menuItem.description}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(item._id)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FaTrash />
                        </button>
                      </div>
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleQuantityChange(item._id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <FaMinus className="text-gray-600" />
                          </button>
                          <span className="text-lg font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <FaPlus className="text-gray-600" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-indigo-600">
                            {item.totalPrice.toLocaleString()} Birr
                          </p>
                          <p className="text-sm text-gray-500">{item.price.toLocaleString()} Birr each</p>
                        </div>
                      </div>
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-500 mt-2">
                          <strong>Note:</strong> {item.specialInstructions}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      {calculateSubtotal().toLocaleString()} Birr
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Fee</span>

                    <span className="text-gray-900 font-medium">{cartData.items.map((item) => (item.deliveryFee ? item.deliveryFee : 0))}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-xl font-bold text-indigo-600">
                        {calculateSubtotal().toLocaleString()} Birr
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-6 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

import React, { useEffect, useState, useContext } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaTrash, FaMinus, FaPlus, FaShoppingBag } from 'react-icons/fa';

const Cart = () => {
  const { removeFromCart, url, token, userId, isLoggedIn } =
    useContext(StoreContext);
  const [isLoading, setIsLoading] = useState(true);
  const [cartData, setCartData] = useState(null);
  const navigate = useNavigate();

  const fetchCartData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.items) {
        setCartData(response.data);
      } else {
        setCartData({ items: [], subtotal: 0 });
      }
    } catch (error) {
      setCartData({ items: [], subtotal: 0 });
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
      await axios.put(
        `http://localhost:4000/api/cart/update/${itemId}`,
        { quantity: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCartData();
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveFromCart = async (itemId) => {
    if (!isLoggedIn) {
      toast.error('Please login to modify cart');
      return;
    }

    try {
      await axios.delete(`http://localhost:4000/api/cart/delete/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCartData();
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => cartData?.subtotal || 0;

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (!cartData?.items?.length) {
      toast.error('Your cart is empty');
      return;
    }

    const total = calculateSubtotal();

    const checkoutData = {
      cartItems: cartData.items,
      subtotal: cartData.subtotal,
      total,
    };

    navigate('/place-order', {
      state: { cartData: checkoutData },
    });
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
          {/* <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
            Your Shopping Cart
          </h1> */}
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Your cart is empty
            </h3>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-400 text-white px-6 py-3 rounded-lg hover:bg-orange-300 transition-colors font-medium"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* TABLE */}
            <div className="lg:col-span-3">
              <div className="overflow-x-auto rounded-lg shadow-sm">
                <table className="min-w-full text-sm text-left text-gray-500 bg-white">
                  <thead className="bg-gray-100 text-xs uppercase text-gray-700">
                    <tr>
                      <th className="px-3 py-3">Image</th>
                      <th className="px-3 py-3">Name</th>
                      <th className="px-3 py-3">Qty</th>
                      <th className="px-3 py-3">Price</th>
                      <th className="px-3 py-3">Total</th>
                      <th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartData.items.map((item) => (
                      <tr key={item._id} className="border-t hover:bg-gray-50">
                        <td className="px-3 py-3">
                          <img
                            src={
                              item.menuItem
                                ? `http://localhost:4000${item.menuItem.image}`
                                : ''
                            }
                            alt={item.menuItem?.name || 'Item'}
                            className="w-14 h-14 object-cover rounded"
                            loading="lazy"
                          />
                        </td>
                        <td className="px-3 py-3 font-medium text-gray-900">
                          {item.menuItem?.name}
                          <p className="text-xs text-gray-500">
                            {item.menuItem?.description}
                          </p>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  Math.max(1, item.quantity - 1)
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                            >
                              <FaMinus className="text-red-600" />
                            </button>
                            <span className="w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item._id,
                                  item.quantity + 1
                                )
                              }
                              className="w-7 h-7 flex items-center justify-center rounded bg-gray-100 hover:bg-gray-200"
                            >
                              <FaPlus className="text-green-600" />
                            </button>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          {item.price?.toLocaleString()} Br
                        </td>
                        <td className="px-3 py-3 text-indigo-600 font-semibold">
                          {item.totalPrice?.toLocaleString()} Br
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleRemoveFromCart(item._id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Delivery Information */}
              <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
              
                <div className="space-y-4">
                 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows="3"
                      placeholder="Any special instructions for delivery?"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-0">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Order Summary
                </h2>
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900 font-medium">
                      {calculateSubtotal().toLocaleString()} Br
                    </span>
                  </div> 
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-indigo-600">
                        {calculateSubtotal().toLocaleString()} Br
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full mt-6 bg-red-400 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
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

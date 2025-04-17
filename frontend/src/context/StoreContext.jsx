import { createContext, useEffect, useState, useContext, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../SystemAdmin/axiosInstance';

export const StoreContext = createContext(null);

// Add the useStore hook
export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreContextProvider');
  }
  return context;
};

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState('');

  const url = 'http://localhost:4000';

  // Check login state on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken && storedRole && storedUserId) {
      setToken(storedToken);
      setUserRole(storedRole);
      setUserId(storedUserId);
      setIsLoggedIn(true);
    } else {
      // Clear any partial data
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      setToken('');
      setUserRole('');
      setUserId('');
      setIsLoggedIn(false);
    }
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await axiosInstance.post('/auth/login', {
        email,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        setToken(token);
        setUserRole(user.role);
        setUserId(user._id);
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user._id);
        return { success: true, user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error details:', error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      return {
        success: false,
        message: errorMessage,
      };
    }
  };

  // Logout function
  const logout = () => {
    // Clear all state
    setToken('');
    setUserRole('');
    setUserId('');
    setIsLoggedIn(false);
    setCartItems({});
    setFoodList([]);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');

    // Show success message
    toast.success('Logged out successfully');

    // Force a page reload to ensure all states are reset
    window.location.href = '/';
  };

  // Create user account (for system admin only)
  const createUser = async (userData) => {
    if (userRole !== 'system_admin') {
      return {
        success: false,
        message: 'Only system admin can create new users',
      };
    }

    try {
      const response = await axios.post(
        `${url}/api/auth/register/${userData.role}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('User created successfully');
        return { success: true };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Create user error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create user',
      };
    }
  };

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn || !userId || !token) {
      setCartItems({});
      return;
    }

    try {
      const response = await axios.get(
        `${url}/api/cart/${userId}`,
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        // Convert cart data to proper format
        const formattedCartData = {};
        if (response.data.cartData) {
          Object.entries(response.data.cartData).forEach(([key, value]) => {
            formattedCartData[key] = {
              quantity: value.quantity || 0,
              price: value.price || 0,
              selectedType: value.selectedType || ''
            };
          });
        }
        setCartItems(formattedCartData);
      } else {
        throw new Error(response.data.message || 'Failed to fetch cart');
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      toast.error(error.message || 'Failed to load cart');
      setCartItems({});
    }
  }, [isLoggedIn, userId, token, url]);

  // Add item to cart
  const addToCart = useCallback(async (itemId, quantity = 1, selectedType = '', price) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return false;
    }

    try {
      const stringItemId = itemId.toString();
      const response = await axios.post(
        `${url}/api/cart/${userId}/cart`,
        {
          itemId: stringItemId,
          quantity: parseInt(quantity),
          selectedType,
          price: parseFloat(price)
        },
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        await fetchCart(); // Refresh cart data
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add item to cart');
      return false;
    }
  }, [isLoggedIn, userId, token, url, fetchCart]);

  // Remove item from cart
  const removeFromCart = useCallback(async (itemId) => {
    if (!isLoggedIn) {
      toast.error('Please login to remove items from cart');
      return false;
    }

    try {
      const stringItemId = itemId.toString();
      const response = await axios.delete(
        `${url}/api/cart/${userId}/${stringItemId}`,
        {
          headers: { token }
        }
      );

      if (response.data.success) {
        await fetchCart(); // Refresh cart data
        return true;
      } else {
        throw new Error(response.data.message || 'Failed to remove item from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(error.response?.data?.message || 'Failed to remove item from cart');
      return false;
    }
  }, [isLoggedIn, userId, token, url, fetchCart]);

  // Place order
  const placeOrder = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/cart/${userId}/order`,
        {},
        {
          headers: {
            token,
          },
        }
      );

      if (response.data.success) {
        await fetchCart(); // Refresh cart after order placement
        toast.success('Order placed successfully');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
      return { success: false, message: error.response?.data?.message || 'Failed to place order' };
    }
  };

  // Fetch food list
  const fetchFoodList = useCallback(async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        setFoodList(response.data.foods || []);
      }
    } catch (error) {
      console.error('Error fetching food list:', error);
      toast.error('Failed to load food items');
      setFoodList([]);
    }
  }, [url]);

  // Fetch food list on mount
  useEffect(() => {
    fetchFoodList();
  }, [fetchFoodList]);

  // Fetch cart when login state changes
  useEffect(() => {
    if (isLoggedIn && userId && token) {
      fetchCart();
    } else {
      setCartItems({});
    }
  }, [isLoggedIn, userId, token, fetchCart]);

  // Reset login state function
  const resetLoginState = () => {
    setToken('');
    setUserRole('');
    setUserId('');
    setIsLoggedIn(false);
  };

  // Context value
  const contextValue = {
    cartItems,
    setCartItems,
    food_list,
    setFoodList,
    token,
    setToken,
    isLoggedIn,
    setIsLoggedIn,
    userRole,
    setUserRole,
    userId,
    setUserId,
    url,
    login,
    logout,
    resetLoginState,
    createUser,
    fetchCart,
    addToCart,
    removeFromCart,
    placeOrder,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

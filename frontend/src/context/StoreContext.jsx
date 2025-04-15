import { createContext, useEffect, useState, useContext } from 'react';
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
  const fetchCart = async () => {
    if (!isLoggedIn || userRole !== 'Customer') return;
    try {
      const response = await axios.post(
        `${url}/api/cart/get`,
        { userId },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data.success) {
        console.log('Raw cart data:', response.data.cartData);
        // Convert cart data to proper format
        const formattedCartData = {};
        if (response.data.cartData) {
          Object.entries(response.data.cartData).forEach(([key, value]) => {
            // Handle both string and object keys
            const itemId =
              typeof key === 'object' ? key._id || key.toString() : key;
            formattedCartData[itemId] = {
              quantity: value.quantity || 0,
              price: value.price || 0,
              selectedType: value.selectedType || '',
            };
          });
        }
        console.log('Formatted cart data:', formattedCartData);
        setCartItems(formattedCartData);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems({});
    }
  };

  // Add item to cart
  const addToCart = async (itemId, quantity = 1, selectedType = '', price) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!itemId || !price) {
      console.error('Missing required fields:', { itemId, price });
      toast.error('Missing required item information');
      return;
    }

    try {
      // Ensure itemId is a string
      const stringItemId = itemId.toString();

      // Optimistic update
      const currentQuantity = cartItems[stringItemId]?.quantity || 0;
      const newQuantity = currentQuantity + parseInt(quantity);
      const newCartItems = {
        ...cartItems,
        [stringItemId]: {
          quantity: newQuantity,
          selectedType,
          price: parseFloat(price),
        },
      };
      setCartItems(newCartItems);

      const response = await axios.post(
        `${url}/api/cart/add`,
        {
          itemId: stringItemId,
          quantity: parseInt(quantity),
          selectedType,
          price: parseFloat(price),
          userId,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data.success) {
        console.log('Added to cart:', response.data.cartData);
        // Convert cart data to proper format
        const formattedCartData = {};
        if (response.data.cartData) {
          Object.entries(response.data.cartData).forEach(([key, value]) => {
            const itemId =
              typeof key === 'object' ? key._id || key.toString() : key;
            formattedCartData[itemId] = {
              quantity: value.quantity || 0,
              price: value.price || 0,
              selectedType: value.selectedType || '',
            };
          });
        }
        setCartItems(formattedCartData);
        toast.success('Added to cart successfully!');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCartItems(cartItems);
      console.error('Error adding item to cart:', error);
      console.error('Error response:', error.response?.data);
      toast.error(
        error.response?.data?.message || 'Failed to add item to cart'
      );
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId, removeAll = false) => {
    if (!isLoggedIn) return;
    if (!cartItems[itemId]) return;

    try {
      // Optimistic update
      const newCartItems = { ...cartItems };
      if (removeAll) {
        delete newCartItems[itemId];
      } else {
        newCartItems[itemId].quantity = Math.max(
          0,
          newCartItems[itemId].quantity - 1
        );
        if (newCartItems[itemId].quantity === 0) {
          delete newCartItems[itemId];
        }
      }
      setCartItems(newCartItems);

      const response = await axios.post(
        `${url}/api/cart/remove`,
        {
          itemId,
          removeAll,
          userId,
        },
        {
          headers: {
            token: token,
          },
        }
      );

      if (response.data.success) {
        console.log('Removed from cart:', response.data.cartData);
        setCartItems(response.data.cartData || {});
        toast.success('Item removed from cart');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCartItems(cartItems);
      console.error('Error removing item from cart:', error);
      toast.error(
        error.response?.data?.message || 'Failed to remove item from cart'
      );
    }
  };

  // Calculate total cart price
  const totalCartPrice = Object.keys(cartItems).reduce((total, itemId) => {
    const item = food_list.find((food) => food._id === itemId);
    if (item) {
      const cartItem = cartItems[itemId];
      return total + (cartItem.price || item.price) * cartItem.quantity;
    }
    return total;
  }, 0);

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        // Check if the response has a 'foods' property, otherwise use 'data'
        const foodData = response.data.foods || response.data.data || [];
        setFoodList(foodData);
        return foodData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching food list:', error);
      toast.error('Failed to fetch menu items');
      setFoodList([]);
      return [];
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchFoodList();
    if (isLoggedIn && userRole === 'Customer') {
      fetchCart();
    }
  }, [isLoggedIn, userRole]);

  // Add a function to reset login state
  const resetLoginState = () => {
    setToken('');
    setUserRole('');
    setUserId('');
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  // Context value
  const contextValue = {
    cartItems,
    setCartItems,
    food_list,
    setFoodList,
    addToCart,
    removeFromCart,
    totalCartPrice,
    url,
    token,
    setToken,
    isLoggedIn,
    setIsLoggedIn,
    userRole,
    setUserRole,
    userId,
    setUserId,
    login,
    logout,
    createUser,
    fetchFoodList,
    fetchCart,
    resetLoginState,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

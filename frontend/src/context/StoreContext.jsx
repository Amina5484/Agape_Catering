import {
  createContext,
  useEffect,
  useState,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import axiosInstance from '../SystemAdmin/axiosInstance';
import { useNavigate } from 'react-router-dom';

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
  const [cartItems, setCartItems] = useState([]);
  const [food_list, setFoodList] = useState([]);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });
  const navigate = useNavigate();

  const url = 'http://localhost:4000';

  // Initialize dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  }, []);

  // Check login state on mount and when token changes
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
      resetLoginState();
    }
  }, [token]);

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
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', user.role);
        localStorage.setItem('userId', user._id);

        setToken(token);
        setUserRole(user.role);
        setUserId(user._id);
        setIsLoggedIn(true);

        return { success: true, user };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      if (error.code === 'ERR_NETWORK') {
        return {
          success: false,
          message:
            'Cannot connect to the server. Please check if the backend is running.',
        };
      }

      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      return { success: false, message: errorMessage };
    }
  };

  // Logout function
  const logout = () => {
    resetLoginState();
    // toast.success('Logged out successfully');
    window.location.href = '/';
  };

  // Reset login state
  const resetLoginState = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    setToken('');
    setUserRole('');
    setUserId('');
    setIsLoggedIn(false);
    setCartItems([]);
  };

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!isLoggedIn) return;

    try {
      const response = await axios.get(`${url}/api/cart/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setCartItems(response.data.cartData || []);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    }
  }, [isLoggedIn, token, userId]);

  // Add item to cart
  const addToCart = async (menuItemId, quantity = 1) => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/cart/add`,
        { menuItemId, quantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success('Added to cart successfully');
        fetchCart(); // Refresh cart data
      } else {
        // toast.error(response.data.message || 'Failed to add to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    }
  };

  // Remove item from cart
  const removeFromCart = async (menuId) => {
    if (!isLoggedIn) {
      toast.error('Please login to remove items from cart');
      return;
    }

    try {
      const response = await axios.delete(`${url}/api/cart`, {
        data: { userId, itemId: menuId },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        toast.success('Item removed from cart');
        fetchCart(); // Refresh cart data
      } else {
        toast.error(response.data.message || 'Failed to remove from cart');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error(
        error.response?.data?.message || 'Failed to remove from cart'
      );
    }
  };

  // Update cart item quantity
  const updateCartItem = async (foodId, quantity) => {
    if (!token || !userId) return;

    try {
      const response = await axios.put(
        `${url}/api/cart/${foodId}`,
        { quantity: parseInt(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        await fetchCart();
      }
    } catch {
      toast.error('Failed to update cart item');
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!token || !userId) {
      toast.error('Please login to place an order');
      return;
    }

    try {
      const response = await axios.post(
        `${url}/api/customer/order/placeorder`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        await fetchCart();
        toast.success('Order placed successfully');
        return true;
      }
    } catch {
      toast.error('Failed to place order');
      return false;
    }
  };

  // Calculate total cart price
  const totalCartPrice = useMemo(() => {
    if (!Array.isArray(cartItems)) return 0;

    return cartItems.reduce((total, item) => {
      const foodItem = food_list.find((food) => food._id === item.itemId);
      if (foodItem) {
        return total + (item.price || foodItem.price) * item.quantity;
      }
      return total;
    }, 0);
  }, [cartItems, food_list]);

  // Fetch food list
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/customer/menu`);
      if (response.data.success) {
        const foodData = response.data.foods || response.data.data || [];
        setFoodList(Array.isArray(foodData) ? foodData : []);
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

  // Context value
  const contextValue = useMemo(
    () => ({
      cartItems,
      setCartItems,
      food_list,
      setFoodList,
      token,
      setToken,
      userRole,
      setUserRole,
      userId,
      setUserId,
      isLoggedIn,
      setIsLoggedIn,
      darkMode,
      toggleDarkMode,
      login,
      logout,
      resetLoginState,
      fetchCart,
      addToCart,
      removeFromCart,
      updateCartItem,
      placeOrder,
      totalCartPrice,
      fetchFoodList,
    }),
    [cartItems, food_list, token, isLoggedIn, userRole, userId, totalCartPrice]
  );

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

import { createContext, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || ''
  );
  const [userId, setUserId] = useState(localStorage.getItem('userId') || '');

  const url = 'http://localhost:4000';

  // Default system admin credentials
  const DEFAULT_ADMIN = {
    email: 'admin@system.com',
    password: 'Admin@123',
    role: 'System Admin',
  };

  // Login function
  const login = async (email, password) => {
    try {
      // Clear any existing state first
      setToken('');
      setUserRole('');
      setUserId('');
      setIsLoggedIn(false);
      setCartItems({});
      setFoodList([]);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');

      console.log('Attempting login with:', { email, password: '***' });
      const response = await axios.post(`${url}/api/auth/login`, {
        email,
        password,
      });

      console.log('Login response:', response.data);

      if (response.data.success) {
        const { token, user } = response.data;
        const role = user.role;
        setToken(token);
        setUserRole(role);
        setUserId(user._id);
        setIsLoggedIn(true);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
        localStorage.setItem('userId', user._id);
        return { success: true, role };
      }
      return { success: false, message: response.data.message };
    } catch (error) {
      console.error('Login error details:', error.response?.data || error);
      const errorMessage =
        error.response?.data?.message ||
        'Login failed. Please check your credentials.';
      toast.error(errorMessage);
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
    
    // Show success message
    toast.success('Logged out successfully');
    
    // Force a page reload to ensure clean state
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
        console.log('Fetched cart data:', response.data.cartData);
        setCartItems(response.data.cartData || {});
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
    try {
      const response = await axios.post(
        `${url}/api/cart/add`,
        {
          itemId,
          quantity,
          selectedType,
          price,
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
        setCartItems(response.data.cartData || {});
        toast.success('Added to cart successfully!');
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
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
    DEFAULT_ADMIN,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;

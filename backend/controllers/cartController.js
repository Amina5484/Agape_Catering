import User from '../models/userModel.js';

// Add item to cart
const addItemToCart = async (req, res) => {
  const { userId } = req.params;
  const { itemId, quantity = 1, selectedType = '', price } = req.body;

  try {
    if (!userId || !itemId || !price) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Initialize cartData if it doesn't exist
    if (!user.cartData) {
      user.cartData = {};
    }

    // Add or update item in cart
    if (!user.cartData[itemId]) {
      // New item
      user.cartData[itemId] = {
        quantity: parseInt(quantity),
        selectedType,
        price: parseFloat(price)
      };
    } else {
      // Update existing item - set the exact quantity instead of incrementing
      user.cartData[itemId] = {
        quantity: parseInt(quantity),
        selectedType,
        price: parseFloat(price)
      };
    }

    // Ensure quantity is valid
    if (user.cartData[itemId].quantity < 1) {
      delete user.cartData[itemId];
    } else if (user.cartData[itemId].quantity > 99) {
      user.cartData[itemId].quantity = 99;
    }

    await user.save();
    
    res.status(200).json({ 
      success: true,
      message: 'Cart updated successfully',
      cartData: user.cartData 
    });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error updating cart' 
    });
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    if (!userId || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.cartData || !user.cartData[itemId]) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found in cart' 
      });
    }

    delete user.cartData[itemId];
    await user.save();
    
    res.status(200).json({ 
      success: true,
      message: 'Item removed from cart',
      cartData: user.cartData 
    });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error removing item from cart' 
    });
  }
};

// View cart
const viewCart = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({ 
      success: true,
      cartData: user.cartData || {} 
    });
  } catch (error) {
    console.error('Error viewing cart:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error viewing cart' 
    });
  }
};

// Place order
const placeOrder = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    if (!user.cartData || Object.keys(user.cartData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cart is empty' 
      });
    }

    // Here you would normally create an order in your orders collection
    // For now, we'll just clear the cart
    user.cartData = {};
    await user.save();

    res.status(200).json({ 
      success: true,
      message: 'Order placed successfully' 
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error placing order' 
    });
  }
};

export { addItemToCart, removeItemFromCart, viewCart, placeOrder };
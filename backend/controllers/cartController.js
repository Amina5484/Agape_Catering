// import User from '../models/userModel.js';
// import menuSchema from '../models/menu.js';
// // Add item to cart
// import mongoose from 'mongoose';

// // Add item to cart
// const addItemToCart = async (req, res) => {
//   const { userId } = req.params;
//   const { menuId, quantity = 1, selectedType = '' } = req.body;

//   try {
//     if (!userId || !menuId) {
//       return res.status(400).json({
//         success: false,
//         message: 'Missing required fields',
//       });
//     }

//     // Validate menuId
//     if (!mongoose.Types.ObjectId.isValid(menuId)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid menuId format',
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found',
//       });
//     }

//     const menu = await menuSchema.findById(menuId);
//     if (!menu) {
//       return res.status(404).json({
//         success: false,
//         message: 'Menu not found',
//       });
//     }
//     console.log(menu);

//     // Initialize cartData if it doesn't exist
//     if (!user.cartData) {
//       user.cartData = [];
//     }

//     // // Add or update item in cart
//     // if (!user.cartData[menuId]) {
//     //   // New item
//     //   user.cartData[menuId] = {
//     //     quantity: parseInt(quantity),
//     //     selectedType,
//     //     price: parseFloat(menu.price), // Use the price from the menu item
//     //   };
//     // } else {
//     //   // Update existing item - set the exact quantity instead of incrementing
//     //   user.cartData[menuId] = {
//     //     quantity: parseInt(quantity),
//     //     selectedType,
//     //     price: parseFloat(menu.price), // Use the price from the menu item
//     //   };
//     // }

//     // // Ensure quantity is valid
//     // if (user.cartData[menuId].quantity < 1) {
//     //   delete user.cartData[menuId];
//     // } else if (user.cartData[menuId].quantity > 99) {
//     //   user.cartData[menuId].quantity = 99;
//     // }
//     // Add or update item in cart
// const existingItemIndex = user.cartData.findIndex(item => item.menuId === menuId);

// if (existingItemIndex === -1) {
//   // New item
//   user.cartData.push({
//     menuId,
//     quantity: parseInt(quantity),
//     selectedType,
//     price: parseFloat(menu.price),
//   });
// } else {
//   // Update existing item
//   user.cartData[existingItemIndex].quantity = parseInt(quantity);
//   user.cartData[existingItemIndex].selectedType = selectedType;
//   user.cartData[existingItemIndex].price = parseFloat(menu.price);

//   // Ensure quantity is valid
//   if (user.cartData[existingItemIndex].quantity < 1) {
//     user.cartData.splice(existingItemIndex, 1);
//   } else if (user.cartData[existingItemIndex].quantity > 99) {
//     user.cartData[existingItemIndex].quantity = 99;
//   }
// }


//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Cart updated successfully',
//       cartData: user.cartData,
//     });
//   } catch (error) {
//     console.error('Error adding item to cart:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error updating cart',
//     });
//   }
// };
// // Remove item from cart
// const removeItemFromCart = async (req, res) => {
//   console.log("Requested to remove item from cart");
//   const { userId, itemId } = req.body;
//   console.log(req.body);

//   try {
//     if (!userId || !itemId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing required fields' 
//       });
//     }
//     const user = await User.findById(userId);

//     console.log(user)
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }
//     if (!user.cartData[menuId]) {
//       // Add new item
//       user.cartData[menuId] = {
//         quantity: parseInt(quantity),
//         selectedType,
//         price: parseFloat(menu.price),
//       };
//     } else {
//       // Update existing item
//       user.cartData[menuId].quantity = parseInt(quantity);
//       user.cartData[menuId].selectedType = selectedType;
//       user.cartData[menuId].price = parseFloat(menu.price);
//     }
    
//     // Ensure quantity is valid
//     if (user.cartData[menuId].quantity < 1) {
//       delete user.cartData[menuId];
//     } else if (user.cartData[menuId].quantity > 99) {
//       user.cartData[menuId].quantity = 99;
//     }
//     if (!user.cartData || user.cartData.length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Cart is empty' 
//       });
//     }

//     const initialLength = user.cartData.length;
//     user.cartData = user.cartData.filter(item => item.menuId !== itemId);

//     if (user.cartData.length === initialLength) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Item not found in cart' 
//       });
//     }

//     await user.save();

//     return res.status(200).json({ 
//       success: true,
//       message: 'Item removed from cart',
//       cartData: user.cartData 
//     });

//   } catch (error) {
//     console.error('Error removing item from cart:', error);
//     return res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Error removing item from cart' 
//     });
//   }
// };


// // View cart
// const viewCart = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     if (!userId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'User ID is required' 
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     if (!user.cartData || Object.keys(user.cartData).length === 0) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Cart is empty' 
//       });
//     }
//     const cartWithDetails = await Promise.all(
//       user.cartData.map(async (cartItem) => {
//       const menu = await menuSchema.findById(cartItem.menuId);
//       if (menu) {
//         return {
//         ...cartItem,
//         image: menu.image,
//         description: menu.description,
//         };
//       }
//       return cartItem; // In case the menu item is not found, return the cart item as is
//       })
//     );

//     res.status(200).json({ 
//       success: true,
  

//       cartData: cartWithDetails || {} 
//     });
//   } catch (error) {
//     console.error('Error viewing cart:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Error viewing cart' 
//     });
//   }
// };

// // Place order
// const placeOrder = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     if (!userId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'User ID is required' 
//       });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'User not found' 
//       });
//     }

//     if (!user.cartData || Object.keys(user.cartData).length === 0) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Cart is empty' 
//       });
//     }

//     // Here you would normally create an order in your orders collection
//     // For now, we'll just clear the cart
//     user.cartData = {};
//     await user.save();

//     res.status(200).json({ 
//       success: true,
//       message: 'Order placed successfully' 
//     });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: error.message || 'Error placing order' 
//     });
//   }
// };

// export { addItemToCart, removeItemFromCart, viewCart, placeOrder };

import mongoose from 'mongoose';
// import User from '../models/userModel.js';
// import menuSchema from '../models/menu.js';

// const addItemToCart = async (req, res) => {
//   const { userId } = req.params;
//   const { menuId, quantity = 1, selectedType = '' } = req.body;

//   try {
//     if (!userId || !menuId) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     if (!mongoose.Types.ObjectId.isValid(menuId)) {
//       return res.status(400).json({ success: false, message: 'Invalid menuId format' });
//     }

//     const user = await User.findById(userId);
//     if (!user) return res.status(404).json({ success: false, message: 'User not found' });

//     const menu = await menuSchema.findById(menuId);
//     if (!menu) return res.status(404).json({ success: false, message: 'Menu not found' });

//     // Ensure cartData is an array
//     if (!Array.isArray(user.cartData)) user.cartData = [];

//     // Check if item already exists in cart
//     const existingIndex = user.cartData.findIndex(
//       (item) => item.menuId.toString() === menuId.toString()
//     );

//     if (existingIndex !== -1) {
//       // Update existing item
//       user.cartData[existingIndex].quantity = Math.min(Math.max(parseInt(quantity), 1), 99);
//       user.cartData[existingIndex].selectedType = selectedType;
//       user.cartData[existingIndex].price = parseFloat(menu.price);
//     } else {
//       // Add new item
//       user.cartData.push({
//         menuId,
//         quantity: Math.min(Math.max(parseInt(quantity), 1), 99),
//         selectedType,
//         price: parseFloat(menu.price),
//       });
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Item added to cart',
//       cartData: user.cartData,
//     });
//   } catch (error) {
//     console.error('Error adding item to cart:', error);
//     return res.status(500).json({ success: false, message: error.message });
//   }
// };



// // ✅ Remove item from cart
// const removeItemFromCart = async (req, res) => {
//   const { userId, itemId } = req.body;

//   try {
//     if (!userId || !itemId) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const user = await User.findById(userId);
//     if (!user || !Array.isArray(user.cartData)) {
//       return res.status(404).json({ success: false, message: 'User or cart not found' });
//     }

//     const initialLength = user.cartData.length;
//     user.cartData = user.cartData.filter(
//       (item) => item.menuId.toString() !== itemId.toString()
//     );

//     if (user.cartData.length === initialLength) {
//       return res.status(404).json({ success: false, message: 'Item not found in cart' });
//     }

//     await user.save();

//     return res.status(200).json({
//       success: true,
//       message: 'Item removed from cart',
//       cartData: user.cartData,
//     });
//   } catch (error) {
//     console.error('Error removing item from cart:', error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || 'Error removing item from cart',
//     });
//   }
// };

// // ✅ View cart with clean response format
// const viewCart = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'User ID is required' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (!Array.isArray(user.cartData) || user.cartData.length === 0) {
//       return res.status(200).json({ success: true, cartData: [] }); // ✅ still return success but with empty array
//     }

//     const cartWithDetails = await Promise.all(
//       user.cartData.map(async (cartItem) => {
//         const menu = await menuSchema.findById(cartItem.menuId);
//         if (!menu) return null;

//         return {
//           menuId: cartItem.menuId,
//           quantity: cartItem.quantity,
//           selectedType: cartItem.selectedType,
//           price: cartItem.price,
//           image: menu.image,
//           description: menu.description,
//         };
//       })
//     );

//     // Filter out nulls if any menu items were deleted
//     const filteredCart = cartWithDetails.filter(Boolean);

//     res.status(200).json({
//       success: true,
//       cartData: filteredCart,
//     });
//   } catch (error) {
//     console.error('Error viewing cart:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error viewing cart',
//     });
//   }
// };

// // ✅ Place order (clears cart)
// const placeOrder = async (req, res) => {
//   const { userId } = req.params;

//   try {
//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'User ID is required' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     if (!Array.isArray(user.cartData) || user.cartData.length === 0) {
//       return res.status(400).json({ success: false, message: 'Cart is empty' });
//     }

//     // TODO: Create an order and store it in a separate Order collection if needed

//     // Clear the cart
//     user.cartData = [];
//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: 'Order placed successfully',
//     });
//   } catch (error) {
//     console.error('Error placing order:', error);
//     res.status(500).json({
//       success: false,
//       message: error.message || 'Error placing order',
//     });
//   }
// };
import Cart from '../models/cartModel.js';
import Menu from '../models/menu.js'
const getCart = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming user ID is extracted from the authorization middleware
    const cart = await Cart.findOne({ userId }).populate('items.menuItem');
    if (!cart) return res.status(200).json({ items: [], subtotal: 0 });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error getting cart', error: err });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  const { menuItemId, quantity = 1, specialInstructions = '' } = req.body;

  try {
    const menuItem = await Menu.findById(menuItemId);
    console.log(menuItem);
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    let cart = await Cart.findOne({ userId: req.user._id });

    const totalPrice = menuItem.price * quantity;

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [{
          menuItem: menuItem._id,
          quantity,
          specialInstructions,
          price: menuItem.price,
          totalPrice
        }]
      });
    } else {
      const existingItem = cart.items.find(item =>
        item.menuItem.equals(menuItem._id)
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.quantity * existingItem.price;
      } else {
        cart.items.push({
          menuItem: menuItem._id,
          quantity,
          specialInstructions,
          price: menuItem.price,
          totalPrice
        });
      }
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    
    res.status(500).json({ message: 'Error adding to cart', error: err });
  }
};


// Update cart item (quantity or instructions)
const updateCartItem = async (req, res) => {
  const { itemId } = req.params;
  const { quantity, specialInstructions } = req.body;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: 'Cart item not found' });

    if (quantity !== undefined) {
      item.quantity = quantity;
      item.totalPrice = item.price * quantity;
    }
    if (specialInstructions !== undefined) {
      item.specialInstructions = specialInstructions;
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Error updating cart item', error: err });
  }
};


// Remove item from cart
const removeCartItem = async (req, res) => {
  const { itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const initialLength = cart.items.length;

    // Filter out the item to be removed
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    if (cart.items.length === initialLength) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    await cart.save();

    res.status(200).json({ message: 'Item removed successfully', cart });
  } catch (err) {
    res.status(500).json({ message: 'Error removing cart item', error: err });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = [];
    await cart.save();

    res.status(200).json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: 'Error clearing cart', error: err });
  }
};


// Checkout (placeholder)
const checkout = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    cart.status = 'ordered';
    await cart.save();

    // TODO: create order, handle payment, etc.

    res.status(200).json({ message: 'Order placed successfully!' });
  } catch (err) {
    res.status(500).json({ message: 'Error during checkout', error: err });
  }
};


// export { addItemToCart, removeItemFromCart, viewCart, placeOrder };
export { getCart, addToCart, updateCartItem, removeCartItem, clearCart, checkout };

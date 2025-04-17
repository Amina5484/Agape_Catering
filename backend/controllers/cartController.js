// import userModel from '../models/userModel.js';

// //add items to user cart
// const addToCart = async (req, res) => {
//   try {
//     const { userId, itemId, quantity = 1, selectedType = '', price } = req.body;
    
//     if (!userId || !itemId) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Initialize cartData if it doesn't exist
//     if (!user.cartData) {
//       user.cartData = {};
//     }

//     // Add or update item in cart
//     if (!user.cartData[itemId]) {
//       user.cartData[itemId] = {
//         quantity: parseInt(quantity),
//         selectedType: selectedType,
//         price: parseFloat(price)
//       };
//     } else {
//       user.cartData[itemId].quantity += parseInt(quantity);
//     }

//     // Save the updated user document
//     await user.save();

//     // Fetch the updated user to ensure we have the latest data
//     const updatedUser = await userModel.findById(userId);

//     res.json({ 
//       success: true, 
//       cartData: updatedUser.cartData || {}, 
//       message: 'Added to cart successfully' 
//     });
//   } catch (error) {
//     console.error('Error adding to cart:', error);
//     res.status(500).json({ success: false, message: 'Error adding to cart' });
//   }
// };

// //remove item from user cart
// const removeFromCart = async (req, res) => {
//   try {
//     const { userId, itemId, removeAll = false } = req.body;
    
//     if (!userId || !itemId) {
//       return res.status(400).json({ success: false, message: 'Missing required fields' });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Initialize cartData if it doesn't exist
//     if (!user.cartData) {
//       user.cartData = {};
//     }

//     if (!user.cartData[itemId]) {
//       return res.json({ success: false, message: 'Item not found in cart' });
//     }

//     if (removeAll) {
//       delete user.cartData[itemId];
//     } else {
//       if (user.cartData[itemId].quantity > 1) {
//         user.cartData[itemId].quantity -= 1;
//       } else {
//         delete user.cartData[itemId];
//       }
//     }

//     // Save the updated user document
//     await user.save();

//     // Fetch the updated user to ensure we have the latest data
//     const updatedUser = await userModel.findById(userId);

//     res.json({ 
//       success: true, 
//       cartData: updatedUser.cartData || {}, 
//       message: 'Item removed from cart' 
//     });
//   } catch (error) {
//     console.error('Error removing from cart:', error);
//     res.status(500).json({ success: false, message: 'Error removing from cart' });
//   }
// };

// //fetch user cart data
// const getCart = async (req, res) => {
//   try {
//     const { userId } = req.body;
    
//     if (!userId) {
//       return res.status(400).json({ success: false, message: 'Missing userId' });
//     }

//     const user = await userModel.findById(userId);
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' });
//     }

//     // Initialize cartData if it doesn't exist
//     if (!user.cartData) {
//       user.cartData = {};
//       await user.save();
//     }

//     // Ensure we're returning the latest data
//     const updatedUser = await userModel.findById(userId);

//     res.json({ 
//       success: true, 
//       cartData: updatedUser.cartData || {} 
//     });
//   } catch (error) {
//     console.error('Error fetching cart:', error);
//     res.status(500).json({ success: false, message: 'Error fetching cart' });
//   }
// };

// export { addToCart, removeFromCart, getCart };


import User from '../models/userModel.js';

// Add item to cart
const addItemToCart = async (req, res) => {
  const { userId } = req.params;
  const { item } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.cartData[item.id] = item; // Assuming item has a unique id
    await user.save();
    res.status(200).json({ message: 'Item added to cart', cart: user.cartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    delete user.cartData[itemId];
    await user.save();
    res.status(200).json({ message: 'Item removed from cart', cart: user.cartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// View cart
const viewCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({ cart: user.cartData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Place order
const placeOrder = async (req, res) => {
  const { userId } = req.params;
  const { orderDetails } = req.body; // Assuming orderDetails is an object with order info

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Here you would normally save the order to a separate order model
    user.cartData = {};
    await user.save();

    res.status(201).json({ message: 'Order placed', orderDetails });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export { addItemToCart, removeItemFromCart, viewCart, placeOrder };
import User from '../models/userModel.js';

// Add item to cart
const addItemToCart = async (req, res) => {
  const { userId } = req.params;
  const { item } = req.body;
  console.log(item ,"not sure");

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

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

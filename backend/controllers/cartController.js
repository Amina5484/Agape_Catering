import userModel from '../models/userModel.js';

//add items to user cart

const addToCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    if (!cartData[req.body.itemId]) {
      cartData[req.body.itemId] = 1;
    } else {
      cartData[req.body.itemId] += 1;
    }
    await userModel.findByIdAndDelete(req.body.userId, { cartData });
    res.json({ success: true, message: 'Added to cart' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'error' });
  }
};

//remove  item from user cart
const removeFromCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (!userData) {
      return res.json({ success: false, message: 'User not found' });
    }

    let cartData = userData.cartData || {};

    if (req.body.removeAll) {
      // Completely remove the item
      delete cartData[req.body.itemId];
    } else {
      // Reduce quantity or remove if 1
      if (cartData[req.body.itemId] > 1) {
        cartData[req.body.itemId] -= 1;
      } else {
        delete cartData[req.body.itemId];
      }
    }

    await userModel.findByIdAndUpdate(req.body.userId, { cartData });

    res.json({
      success: true,
      message: req.body.removeAll
        ? 'Item removed completely'
        : 'Item quantity reduced',
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Error' });
  }
};

//fetch user cart data
const getCart = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    let cartData = await userData.cartData;
    res.json({ success: true, cartData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: 'Error' });
  }
};

export { addToCart, removeFromCart, getCart };

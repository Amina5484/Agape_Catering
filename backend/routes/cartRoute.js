import express from 'express';
// import { addItemToCart, removeItemFromCart, viewCart, placeOrder } from '../controllers/cartController.js';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, checkout } from '../controllers/cartController.js';
import { protect, authorizeRoles } from '../config/authMiddleware.js';
import ROLES from '../config/roles.js';

const cartRouter = express.Router();
cartRouter.use(protect, authorizeRoles(ROLES.CUSTOMER));

cartRouter.get('/', getCart);
cartRouter.post('/add', addToCart)
cartRouter.put('/update/:itemId', updateCartItem)
cartRouter.delete('/delete/:itemId', removeCartItem)
cartRouter.delete('/clear', clearCart)
cartRouter.post('/clear', checkout)

// /**
//  * @swagger
//  * /api/cart/{userId}/:
//  *   post:
//  *     summary: Add item to cart
//  *     tags: [Cart]
//  */
// cartRouter.post('/:userId', addItemToCart);

// /**
//  * @swagger
//  * /api/cart/:
//  *   delete:
//  *     summary: Remove item from cart
//  *     tags: [Cart]
//  */
// cartRouter.delete('/', removeItemFromCart);

// /**
//  * @swagger
//  * /api/:
//  *   get:
//  *     summary: View cart
//  *     tags: [Cart]
//  */
// cartRouter.get('/:userId', viewCart);

// /**
//  * @swagger
//  * /{userId}/order:
//  *   post:
//  *     summary: Place order
//  *     tags: [Cart]
//  */
// cartRouter.post('/:userId/order', placeOrder);

export default cartRouter;
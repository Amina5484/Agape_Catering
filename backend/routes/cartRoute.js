import express from 'express';
import { addItemToCart, removeItemFromCart, viewCart, placeOrder } from '../controllers/cartController.js';

const cartRouter = express.Router();

/**
 * @swagger
 * /api/cart/{userId}/:
 *   post:
 *     summary: Add item to cart
 *     tags: [Cart]
 */
cartRouter.post('/:userId', addItemToCart);

/**
 * @swagger
 * /api/cart/:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 */
cartRouter.delete('/', removeItemFromCart);

/**
 * @swagger
 * /api/:
 *   get:
 *     summary: View cart
 *     tags: [Cart]
 */
cartRouter.get('/:userId', viewCart);

/**
 * @swagger
 * /{userId}/order:
 *   post:
 *     summary: Place order
 *     tags: [Cart]
 */
cartRouter.post('/:userId/order', placeOrder);

export default cartRouter;
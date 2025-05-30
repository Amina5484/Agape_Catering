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
cartRouter.post('/:userId/cart', addItemToCart);
<<<<<<< HEAD

/**
 * @swagger
 * /api/cart/{userId}/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 */
cartRouter.delete('/:userId/:itemId', removeItemFromCart);

/**
 * @swagger
 * /api/cart/{userId}:
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
=======
>>>>>>> 6c75af36e9b9f7b704f714da674ece91f6db5ced

/**
 * @swagger
 * /api/cart/{userId}/{itemId}:
 *   delete:
 *     summary: Remove item from cart
 *     tags: [Cart]
 */
cartRouter.delete('/:userId/:itemId', removeItemFromCart);

/**
 * @swagger
 * /api/cart/{userId}:
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
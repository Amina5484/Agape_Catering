import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
import { body, validationResult } from 'express-validator';

// Load environment variables
dotenv.config();

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY;

const chapa = express.Router();

// Validate payment input
const validatePaymentInput = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('currency').isString().withMessage('Currency must be a string'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('first_name').isString().withMessage('First name must be a string'),
  body('last_name').isString().withMessage('Last name must be a string'),
  body('phone').isString().withMessage('Phone must be a string'),
  body('tx_ref')
    .isString()
    .withMessage('Transaction reference must be a string'),
  body('callback_url').isURL().withMessage('Callback URL must be a valid URL'),
];

// Initialize payment
chapa.post('/pay', validatePaymentInput, async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const {
      amount,
      currency,
      email,
      first_name,
      last_name,
      phone,
      tx_ref,
      callback_url,
    } = req.body;

    // Payment data
    const paymentData = {
      amount,
      currency: currency || 'ETB', // Default to ETB if not provided
      email,
      first_name,
      last_name,
      phone,
      tx_ref,
      callback_url,
      return_url: callback_url || 'http://localhost:3000/success', // Default return URL
    };

    // Send request to Chapa API
    const response = await axios.post(
      'https://api.chapa.co/v1/transaction/initialize',
      paymentData,
      {
        headers: {
          Authorization: `Bearer ${CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Return payment URL to the client
    res.json({
      success: true,
      message: 'Payment initialized successfully',
      payment_url: response.data.data.checkout_url,
    });
  } catch (error) {
    console.error(
      'Error processing payment:',
      error.response?.data || error.message
    );
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
      error: error.response?.data || error.message,
    });
  }
});

// Verify payment webhook
chapa.post('/verify', async (req, res) => {
  try {
    console.log('Webhook received: ', req.body);

    // Verify the webhook signature (optional but recommended)
    const signature = req.headers['x-chapa-signature'];
    if (!signature) {
      return res
        .status(400)
        .json({ success: false, message: 'Missing signature' });
    }

    // Validate the signature using your secret key
    // (Implementation depends on Chapa's webhook signature mechanism)

    // Process the webhook data (e.g., update order status in your database)
    const { tx_ref, status } = req.body;
    if (status === 'success') {
      console.log(`Payment for transaction ${tx_ref} was successful`);
      // Update your database here
    } else {
      console.log(`Payment for transaction ${tx_ref} failed`);
    }

    res.status(200).json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res
      .status(500)
      .json({ success: false, message: 'Webhook processing failed' });
  }
});

export default chapa;
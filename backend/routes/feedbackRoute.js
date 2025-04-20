import express from 'express';
import Feedback from '../models/feedback.js'; // Import the Feedback model

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Feedback management APIs
 */

/**
 * @swagger
 * /api/feedback/list:
 *   get:
 *     summary: Retrieve a list of feedback
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: Successfully retrieved feedback list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       phone:
 *                         type: string
 *                       feedback:
 *                         type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/feedback/add:
 *   post:
 *     summary: Submit new feedback
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               feedback:
 *                 type: string
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */

router.get('/list', async (req, res) => {
  try {
    const feedbackList = await Feedback.find(); // Fetch feedback from the database
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { name, email, phone, feedback } = req.body;

    // Validate input
    if (!name || !email || !phone || !feedback) {
      return res
        .status(400)
        .json({ success: false, message: 'All fields are required' });
    }

    // Save feedback to the database
    const newFeedback = new Feedback({ name, email, phone, feedback });
    await newFeedback.save();

    res.json({ success: true, message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;

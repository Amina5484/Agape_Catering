import express from 'express';
import Feedback from '../models/feedback.js'; // Import the Feedback model

const router = express.Router();

// Fetch all feedback
router.get('/list', async (req, res) => {
  try {
    const feedbackList = await Feedback.find(); // Fetch feedback from the database
    res.json({ success: true, data: feedbackList });
  } catch (error) {
    console.error('Error fetching feedback list:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add new feedback
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

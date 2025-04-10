import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  feedback: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // Optional: Add a timestamp
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;

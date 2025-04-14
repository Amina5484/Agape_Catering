import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['feedback'] },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  feedbackId: { type: mongoose.Schema.Types.ObjectId, ref: 'Feedback' }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 
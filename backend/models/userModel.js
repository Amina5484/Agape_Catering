import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import order from './orderModel.js';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  photo: { type: String, default: './uploads/1740571467659-cookies.png' },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: [
      'Customer',
      'Catering Manager',
      'Chef',
      'Executive Chef',
      'System Admin',
    ],
    default: 'Customer',
  },
  previousOrders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
      orderDate: { type: Date },
      totalAmount: { type: Number },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Hash the password before saving the user
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    console.log('Comparing passwords for user:', this.email);
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password match result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

export default mongoose.model('userModel', UserSchema);

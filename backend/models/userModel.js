import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  photo: { type: String, default: './uploads/default-profile.png' },
  password: { type: String, required: true },
  otp: { type: Number },
  otpExpiration: { type: Date },
  is2FAVerified: { type: Boolean, default: false },
  role: {
    type: String,
    enum: ['Customer', 'Catering Manager', 'Executive Chef', 'System Admin'],
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

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('userModel', UserSchema);

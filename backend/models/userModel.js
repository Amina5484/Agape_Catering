import mongoose from 'mongoose';
import bcrypt from 'bcrypt';



const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  photo: { type: String },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Customer', 'Catering Manager', 'Executive Chef', 'System Admin'],
    default: 'Customer',
  },
  // cartData: { type: [Object] },
  // cartData: { type: Object, default: {} },
  cartData: [
    {
      menuId: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
      quantity: Number,
      selectedType: String,
      price: Number,
    }
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

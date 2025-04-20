import mongoose from "mongoose";

const CartItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu', // reference to your menu collection
    required: true
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  specialInstructions: {
    type: String,
    default: ''
  },

  price: {
    type: Number,
    required: true // store price at the time it was added
  },
  totalPrice: {
    type: Number,
    required: true
  }
});

const CartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true,
    unique: true // each user should have only one active cart
  },
  items: [CartItemSchema],
  status: {
    type: String,
    enum: ['active', 'ordered', 'abandoned'],
    default: 'active'
  },
  subtotal: {
    type: Number,
    default: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-update subtotal before save
CartSchema.pre('save', function (next) {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.updatedAt = Date.now();
  next();
});

const Cart = mongoose.model('Cart', CartSchema);
export default Cart;

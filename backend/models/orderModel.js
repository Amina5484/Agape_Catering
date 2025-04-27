import mongoose from 'mongoose';

const paymentHistorySchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  transactionId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'success', 'failed'],
    default: 'success',
  },
  method: {
    type: String,
    default: 'chapa',
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  paymentType: {
    type: String,
    enum: ['full', 'partial'],
    default: 'full',
  },

  paymentDescription: {
    type: String,
    default: 'Payment for order',
  },
});

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userModel',
    required: true,
  },
  typeOfOrder: {
    type: String,
    enum: ['urgent', 'scheduled'],
  },
  numberOfGuest: {
    type: Number,
    required: true,
    min: 10,
  },
  specialInstructions: {
    type: String,
    default: '',
  },
  // Fields for chef assignment

  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  // Status history to track changes
  statusHistory: [
    {
      status: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  deliveryDate: { type: Date },
  Address: { type: Object, required: true },
  menuItems: [
    {
      item: { type: mongoose.Schema.Types.ObjectId, ref: 'Menu' },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      specialInstructions: { type: String, default: '' },
    },
  ],
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['pending', 'partially_paid', 'paid'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivered',
      'cancelled',
    ],
    default: 'pending',
  },
  deliveryDateValue: { type: Date },
  paymentHistory: [paymentHistorySchema],
  createdAt: { type: Date, default: Date.now },
});

const orderModel =
  mongoose.models.order || mongoose.model('order', orderSchema);
export default orderModel;

// const orderSchema = new mongoose.Schema({
//     userId:{type:String,required:true},
//     items:{type:Array,required:true},
//     amount:{type:Number,required:true},
//     Address:{type:Object,required:true},
//     status:{type:String,default:"Food processing"},
//     date:{type:Date,default:Date.now()},
//     Paymen:{type:Boolean,default:false}
// })

import mongoose from "mongoose"


const orderSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    Address:{type:Object,required:true},
    menuItems: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
        quantity: { type: Number, required: true }
      }
    ],
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partially_paid', 'paid'],
      default: 'pending'
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered'],
      default: 'pending'
    },
    transactions: [
      {
        amount: Number,
        method: String,
        transactionId: String,
        date: { type: Date, default: Date.now }
      }
    ],
    createdAt: { type: Date, default: Date.now }
  });
  

const orderModel = mongoose.models.order || mongoose.model("order",orderSchema);
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
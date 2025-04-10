import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            menuItemId: { type: mongoose.Schema.Types.ObjectId, ref: "Menu", required: true },
            quantity: { type: Number, required: true }
        }
    ],
    status: {
        type: String,
        enum: ["Pending", "Accepted", "Preparing", "Completed", "Cancelled"],
        default: "Pending"
    },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 }, // Amount actually paid
    paymentStatus: {
        type: String,
        enum: ["Pending", "Half Paid", "Paid"],
        default: "Pending"
    },
    paymentTxRefs: [
        {
            tx_ref: String,
            amount: Number,
            paidAt: { type: Date, default: Date.now }
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Order", orderSchema);

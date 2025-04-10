import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import { processChapaPayment } from "../utils/chapaPayment.js";

// 🛒 Place order with 50% initial payment
const placeOrder = async (req, res) => {
    try {
        const { customerId, items, totalAmount } = req.body;

        if (!customerId || !items || !totalAmount) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const customer = await userModel.findById(customerId);
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const halfAmount = totalAmount / 2;

        // Process half payment
        const chapaResponse = await processChapaPayment({
            amount: halfAmount,
            description: "Initial 50% Payment",
            user: {
                first_name: customer.firstName || "Customer",
                last_name: customer.lastName || "",
                email: customer.email,
                phone_number: customer.phone || "0911121314"
            }
        });

        if (!chapaResponse.success || !chapaResponse.transactionId) {
            return res.status(400).json({
                message: "Payment failed",
                error: chapaResponse.error || "No transaction ID"
            });
        }

        // Save order
        const order = await orderModel.create({
            customerId,
            items,
            totalAmount,
            paidAmount: halfAmount,
            paymentStatus: "Half Paid",
            status: "Pending",
            paymentTxRefs: [
                {
                    tx_ref: chapaResponse.transactionId.tx_ref,
                    amount: halfAmount
                }
            ]
        });

        res.status(201).json({
            message: "Order placed with initial payment. Complete payment on delivery.",
            order,
            chapaResponse
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// 💰 Pay remaining 50% (on delivery)
const processFinalPayment = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId).populate("customerId");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.paymentStatus !== "Half Paid") {
            return res.status(400).json({ message: "Final payment not allowed at this stage" });
        }

        const remainingAmount = order.totalAmount - order.paidAmount;

        // Process remaining payment
        const chapaResponse = await processChapaPayment({
            amount: remainingAmount,
            description: "Final 50% Payment on Delivery",
            user: {
                first_name: order.customerId.firstName || "Customer",
                last_name: order.customerId.lastName || "",
                email: order.customerId.email,
                phone_number: order.customerId.phone || "0911121314"
            }
        });

        if (!chapaResponse.success || !chapaResponse.transactionId) {
            return res.status(400).json({
                message: "Final payment failed",
                error: chapaResponse.error || "No transaction ID"
            });
        }

        // Update order
        order.paidAmount += remainingAmount;
        order.paymentStatus = "Paid";
        order.status = "Completed";
        order.paymentTxRefs.push({
            tx_ref: chapaResponse.transactionId.tx_ref,
            amount: remainingAmount
        });
        await order.save();

        res.status(200).json({
            message: "Final payment successful and order completed",
            order,
            chapaResponse
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export { placeOrder, processFinalPayment };

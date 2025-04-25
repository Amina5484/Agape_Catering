import mongoose from "mongoose";
import order from "./orderModel.js";
const scheduleSchema = new mongoose.Schema({
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shiftTime: { type: String, required: true }, // e.g., "Morning", "Evening"
    orders: { type: mongoose.Schema.Types.ObjectId, ref: "order" },
    date: { type: Date, required: true }
});

export default mongoose.model("Schedule", scheduleSchema);

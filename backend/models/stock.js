import mongoose from "mongoose";

const stockSchema = new mongoose.Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }, // e.g., kg, liters
    lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Stock", stockSchema);

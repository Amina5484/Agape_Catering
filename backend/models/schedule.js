import mongoose from "mongoose";

const scheduleSchema = new mongoose.Schema({
    chefId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    shiftTime: { type: String, required: true }, // e.g., "Morning", "Evening"
    date: { type: Date, required: true }
});

export default mongoose.model("Schedule", scheduleSchema);

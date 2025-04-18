import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
});

// Check if the model already exists before creating it
const Food = mongoose.models.Food || mongoose.model('Food', foodSchema);

export default Food;

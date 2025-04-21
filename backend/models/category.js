import mongoose from "mongoose";

// const category = new mongoose.Schema({
//     name: { type: String, required: true },
//     image: { type: String, required: true },
//     description: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Category", category);

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    trim: true
  },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Add case-insensitive index for categoryName
categorySchema.index({ categoryName: 1 }, {
  unique: true,
  collation: {
    locale: 'en',
    strength: 2
  }
});

export default mongoose.model("Category", categorySchema);

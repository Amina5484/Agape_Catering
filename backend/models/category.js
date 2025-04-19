import mongoose from "mongoose";

// const category = new mongoose.Schema({
//     name: { type: String, required: true },
//     image: { type: String, required: true },
//     description: { type: String, required: true },
//     createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Category", category);



const subSubcategorySchema = new mongoose.Schema({
  subSubcategoryName: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String },
});

const subcategorySchema = new mongoose.Schema({
  subcategoryName: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  description: { type: String, required: true },
  // subSubcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubSubcategory" }]
  subSubcategoriesId: { type: String, required: true },
});

const categorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true },
  description: { type: String },
  image: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  // subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subcategory" }]
  subcategoriesId:{ type: String, required: true },
  subSubcategoriesId:{ type: String, required: true },
});

export const SubSubcategory = mongoose.model("SubSubcategory", subSubcategorySchema);
export const Subcategory = mongoose.model("Subcategory", subcategorySchema);
export default mongoose.model("Category", categorySchema);

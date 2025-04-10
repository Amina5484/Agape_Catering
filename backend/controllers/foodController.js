 import foodModel from '../models/foodmodel.js';
 import fs from 'fs';

 // Add Food
 const addFood = async (req, res) => {
   try {
     const image_filename = req.file?.filename;

     if (!image_filename) {
       return res
         .status(400)
         .json({ success: false, message: 'Image upload failed' });
     }

     const food = new foodModel({
       name: req.body.name,
       description: req.body.description,
       price: req.body.price,
       category: req.body.category,
       image: image_filename,
     });

     await food.save();
     res.json({ success: true, message: 'Food Added', data: food });
   } catch (error) {
     console.log(error);
     res.status(500).json({ success: false, message: 'Error adding food' });
   }
 };

 // List Food
 const listFood = async (req, res) => {
   try {
     const foods = await foodModel.find({});
     res.json({ success: true, data: foods });
   } catch (error) {
     console.log(error);
     res
       .status(500)
       .json({ success: false, message: 'Error fetching food list' });
   }
 };

 // Remove Food
 const removeFood = async (req, res) => {
   try {
     const food = await foodModel.findById(req.body.id);
     if (food) {
       fs.unlink(`uploads/${food.image}`, () => {});
       await foodModel.findByIdAndDelete(req.body.id);
       res.json({ success: true, message: 'Food Removed' });
     } else {
       res.status(404).json({ success: false, message: 'Food not found' });
     }
   } catch (error) {
     console.log(error);
     res.status(500).json({ success: false, message: 'Error removing food' });
   }
 };

 // Update Food
 const updateFood = async (req, res) => {
   try {
     const { id } = req.params;
     const { name, description, price, category } = req.body;
     const image_filename = req.file?.filename;

     // Check if food exists
     const food = await foodModel.findById(id);
     if (!food) {
       return res
         .status(404)
         .json({ success: false, message: 'Food not found' });
     }

     // If a new image is uploaded, delete the old image
     if (image_filename) {
       fs.unlink(`uploads/${food.image}`, (err) => {
         if (err) console.log(err); // Log error if deletion fails
       });
       food.image = image_filename; // Update with new image
     }

     // Update the food item with the new data
     food.name = name || food.name;
     food.description = description || food.description;
     food.price = price || food.price;
     food.category = category || food.category;

     // Save the updated food item
     await food.save();

     res.json({
       success: true,
       message: 'Food updated successfully',
       data: food,
     });
   } catch (error) {
     console.log(error);
     res.status(500).json({ success: false, message: 'Error updating food' });
   }
 };

 export { addFood, listFood, removeFood, updateFood };

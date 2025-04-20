import React, { useState, useContext } from 'react';
import { FaCloudUploadAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import { StoreContext } from '../../context/StoreContext';

const url = 'http://localhost:4000';

const AddMenuItem = () => {
  const { fetchFoodList } = useContext(StoreContext);

  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    types: [],
  });

  const [selectedType, setSelectedType] = useState('');
  const [typePrice, setTypePrice] = useState('');

  // ✅ Fixing Subcategory & Types Object
  const subcategories = {
    Drinks: {
      Beers: ['Habesha', 'Meta', 'Harar', 'Bedele'],
      Wines: ['Blue Level', 'Black Label', 'Gold Label'],
      Water: ['0.5L', '1L', '2L'],
    },
    Desserts: {
      Cake: ['5kg', '10kg', '15kg', '20kg'],
      Cookies: ['Chocolate Chip', 'Sugar Cookies', 'Peanut Butter Cookies'],
      Biscuits: ['Almond Biscuits', 'Malted Milk Biscuits', 'Savory Biscuits'],
    },
    Global_Cuisine: {
      Pizza: ['Vegetable', 'Special', 'Normal'],
      Burger: ['Normal', 'Special', 'Vegetable'],
      Pasta: ['Alfredo', 'Carbonara', 'Bolognese'],
    },
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const onChangeHandler = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({ ...prevData, [name]: value }));
  };

  const addTypeWithPrice = () => {
    if (!selectedType) {
      toast.error('Please select a type');
      return;
    }
    if (!typePrice || isNaN(typePrice) || Number(typePrice) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setData((prevData) => ({
      ...prevData,
      types: [
        ...prevData.types,
        { name: selectedType, price: Number(typePrice) },
      ],
    }));
    setSelectedType('');
    setTypePrice('');
    toast.success('Type added successfully');
  };

  const removeType = (index) => {
    setData((prevData) => ({
      ...prevData,
      types: prevData.types.filter((_, i) => i !== index),
    }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (!image) {
      toast.error('Please upload an image.');
      return;
    }

    if (data.types.length === 0) {
      toast.error('Please add at least one type with price');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('subcategory', data.subcategory);
    formData.append('image', image);
    formData.append('types', JSON.stringify(data.types));

    try {
      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        toast.success('Food added successfully');
        setData({
          name: '',
          description: '',
          category: '',
          subcategory: '',
          types: [],
        });
        setImage(null);
        setSelectedType('');
        setTypePrice('');
        fetchFoodList();
      } else {
        toast.error('Failed to add food item.');
      }
    } catch (error) {
      console.error('Error adding food item:', error);
      toast.error(error.response?.data?.message || 'Error adding food item. Please try again.');
    }
  };

  return (
    <div className="p-6 ml-64">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Add New Menu Item</h1>
        <form onSubmit={onSubmitHandler} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              name="name"
              value={data.name}
              onChange={onChangeHandler}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={data.description}
              onChange={onChangeHandler}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows="3"
              required
            />
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              name="category"
              value={data.category}
              onChange={onChangeHandler}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {Object.keys(subcategories).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Subcategory</label>
            <select
              name="subcategory"
              value={data.subcategory}
              onChange={onChangeHandler}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              disabled={!data.category}
            >
              <option value="">Select a subcategory</option>
              {data.category &&
                Object.keys(subcategories[data.category] || {}).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
            </select>
          </div>

          {/* Type and Price Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Add Type and Price</label>
            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select a type</option>
                {data.category &&
                  data.subcategory &&
                  subcategories[data.category] &&
                  subcategories[data.category][data.subcategory] ? (
                    subcategories[data.category][data.subcategory].map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))
                  ) : (
                    <option disabled>No available types</option>
                  )}
              </select>
              <input
                type="number"
                value={typePrice}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || (Number(value) >= 0 && !isNaN(value))) {
                    setTypePrice(value);
                  }
                }}
                placeholder="Price (ETB)"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <button
                type="button"
                onClick={addTypeWithPrice}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={!selectedType || !typePrice}
              >
                Add
              </button>
            </div>
          </div>

          {/* Display Added Types */}
          {data.types.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Added Types and Prices:</h3>
              <div className="space-y-2">
                {data.types.map((type, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
                    <span className="font-medium">{type.name} - <span className="text-green-600">{type.price.toFixed(2)} ETB</span></span>
                    <button
                      type="button"
                      onClick={() => removeType(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
                required
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaCloudUploadAlt className="inline-block mr-2" />
                Upload Image
              </label>
              {image && (
                <span className="ml-2 text-sm text-gray-500">
                  {image.name}
                </span>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Add Menu Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddMenuItem;

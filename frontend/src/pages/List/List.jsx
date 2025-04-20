import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { RiCloseLine } from 'react-icons/ri';

 const List = () => {
  const [list, setList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    image: null,
    types: [],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch the list of food items
  const fetchList = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/food/list`);
      if (response.data.success && response.data.foods) {
         setList(response.data.foods);
      } else {
        toast.error('Error fetching food list');
      }
    } catch (error) {
      console.error('Fetch list error:', error);
      toast.error('Failed to fetch food list');
    }
  };

  // Remove a food item
  const handleRemoveFood = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/food/remove/${id}`
      );

      if (response.data.success) {
        toast.success('Food item removed successfully!');
        fetchList(); // Refresh the food list
      } else {
        toast.error('Failed to remove food item.');
      }
    } catch (error) {
      console.error('Delete error:', error.response?.data || error.message);
      toast.error('Error removing food item.');
    }
  };

  // Edit a food item
 const handleEditFood = (item) => {
   setSelectedItem(item);
   setFormData({
     name: item.name || '',
     description: item.description || '',
     category: item.category || '',
     subcategory: item.subcategory || '',
     price: item.price || '',
     types:
       item.types?.map((type) => ({
           name: type.name || '',
           price: type.price || '',
         })) || [],
     image: null, // Reset image in the form
   });
   setIsModalOpen(true);
 };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle image file changes
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      image: file,
    });
  };

  // Add a new type to the form
  const handleAddType = () => {
    setFormData({
      ...formData,
      types: [...formData.types, { name: '', price: '' }],
    });
  };

  // Remove a type from the form
  const handleRemoveType = (index) => {
    const updatedTypes = formData.types.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      types: updatedTypes,
    });
  };

  // Handle type input change
  const handleTypeChange = (e, index) => {
    const { name, value } = e.target;
    const updatedTypes = [...formData.types];
     updatedTypes[index][name] = name === 'price' ? Number(value) : value; // Convert price to number
    setFormData({
      ...formData,
      types: updatedTypes,
    });
  };

  // Submit the form (update food item)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
    const cleanedTypes = formData.types
      .filter(type => type.name && type.price !== "") // Remove empty price entries
      .map(type => ({
        name: type.name,
        price: Number(type.price) || 0, // Convert price to number, default to 0
      }));

      const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("subcategory", formData.subcategory);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("price", Number(formData.price)); // Ensure price is a number
    formDataToSend.append("types", JSON.stringify(cleanedTypes));

      if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    console.log("Final FormData before sending:", Object.fromEntries(formDataToSend));

    const { data } = await axios.put(
      `http://localhost:4000/api/food/update/${selectedItem._id}`,
      formDataToSend,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (data.success) {
      toast.success("Food updated successfully");
      fetchList();
        setIsModalOpen(false);
      } else {
      toast.error("Error updating");
      }
    } catch (error) {
    console.error("Error updating food item:", error.response?.data || error.message);
    toast.error(error.response?.data?.message || "Error updating");
    }
  };


  // Fetch the list when the component mounts
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="px-2 py-2 ml-64 pt-16">
      <h1 className="text-2xl font-bold text-red-400 mb-4 text-center">
        Food List
      </h1>
      <hr className="mb-4" />

      {/* Modal for Update Form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              <RiCloseLine size={24} className="text-red-600 font-bold" />
            </button>
            <h2 className="text-xl font-bold text-center mb-3 text-red-400">
              Update Food Item
            </h2>
            <hr className="mb-3" />
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1 text-blue-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-blue-700">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Vegetable">Vegetable</option>
                  <option value="Full Package">Full Package</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Drink">Drink</option>
                  <option value="የጾም">የጾም</option>
                  <option value="የፍስክ">የፍስክ</option>
                  <option value="Global Cuisine">Global Cuisine</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1 text-blue-700">
                  Price (ETB)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-blue-700">
                  Types & Prices
                </label>
                {formData.types.map((type, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center mb-2"
                  >
                    <div className="flex flex-col w-full">
                      <input
                        type="text"
                        name="name"
                        value={type.name}
                        onChange={(e) => handleTypeChange(e, index)}
                        placeholder="Type Name"
                        className="w-full p-1 mb-1 border border-gray-300 rounded-md text-sm"
                      />
                      <input
                        type="number"
                        name="price"
                        value={type.price}
                        onChange={(e) => handleTypeChange(e, index)}
                        placeholder="Price"
                        className="w-full p-1 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveType(index)}
                      className="text-red-600 ml-2"
                    >
                      <RiCloseLine size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddType}
                  className="text-green-600 text-sm"
                >
                  + Add Type
                </button>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-blue-700">
                  Image
                </label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="w-full p-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-red-400 text-black px-3 py-1 rounded-md text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-3 py-1 rounded-md text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table to display food items */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-green-100">
            <tr>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Image
              </th>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Name
              </th>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Category
              </th>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Price
              </th>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Action
              </th>
              <th className="px-4 py-2 text-left font-bold text-green-700 text-sm md:text-xl">
                Remove
              </th>
            </tr>
          </thead>
          <tbody>
            {list && list.length > 0 ? (
              list.map((item, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <img
                       src={item.image || 'https://via.placeholder.com/64'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  </td>
                  <td className="px-4 py-2 text-sm md:text-base">
                    {item.name}
                  </td>
                  <td className="px-4 py-2 text-sm md:text-base">
                    {item.category}
                  </td>
                  <td className="px-4 py-2 text-sm md:text-base">
                     {item.types && item.types.length > 0
                       ? item.types.map((type, idx) => (
                           <div key={idx}>
                             {type.name}: {type.price} ETB
                           </div>
                         ))
                       : 'Price not available'}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleEditFood(item)}
                      className="bg-yellow-600 text-white px-4 py-2 font-semibold rounded-full"
                    >
                      Update
                    </button>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleRemoveFood(item._id)}
                      className="text-red-600"
                    >
                      <RiCloseLine size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-4">
                  No food items available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default List;
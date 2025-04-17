import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { menu_list } from '../assets/assets';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';

// Define subcategories for each main category
const subcategories = {
  'Dessert': ['Cake', 'Baklava', "T'ef Cake", 'Dabo Kolo', 'Atayef', 'Pudding', 'Cookies', 'Pies', 'Pastries', 'Candy'],
  'Vegetable': ['Salad', 'Steamed', 'Stir-fried', 'Roasted', 'Soup'],
  'Global cuisine': ['Italian', 'Chinese', 'Indian', 'Mexican', 'Thai', 'Japanese', 'American', 'Mediterranean'],
  'Full Package': ['Wedding', 'Birthday', 'Corporate', 'Family Gathering', 'Special Event'],
  'የጾም': ['Fasting Food', 'Special Fasting', 'Traditional Fasting'],
  'የፍስክ': ['Holiday Special', 'Traditional', 'Modern'],
  'Drinks': ['Hot Drinks', 'Cold Drinks', 'Juices', 'Smoothies', 'Alcoholic', 'Non-Alcoholic']
};

const MenuManagement = () => {
  const { token, fetchFoodList } = useStore();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    subcategory: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  // Update available subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      setAvailableSubcategories(subcategories[formData.category] || []);
      // Reset subcategory if it's not in the new category
      if (!subcategories[formData.category]?.includes(formData.subcategory)) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
      }
    } else {
      setAvailableSubcategories([]);
    }
  }, [formData.category]);

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/catering/menu', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Ensure each menu item has both category and subcategory
      const processedItems = response.data.map(item => ({
        ...item,
        category: item.category || 'Uncategorized',
        subcategory: item.subcategory || 'General'
      }));

      setMenuItems(processedItems);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create a preview URL for the selected file
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      subcategory: '',
      image: null
    });
    setImagePreview(null);
    setSelectedItem(null);
    setAvailableSubcategories([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);

      // Only append image if it's a new file
      if (formData.image instanceof File) {
        formDataToSend.append('image', formData.image);
      } else if (selectedItem?.image) {
        // If editing and no new image selected, keep the existing image
        formDataToSend.append('image', selectedItem.image);
      }

      if (selectedItem) {
        // Update existing item
        const response = await axios.put(
          `http://localhost:4000/api/catering/menu/update/${selectedItem._id}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Menu item updated successfully');
      } else {
        // Add new item
        const response = await axios.post(
          'http://localhost:4000/api/catering/menu',
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        toast.success('Menu item added successfully');
      }

      setIsModalOpen(false);
      resetForm();
      fetchMenuItems();

      // Refresh the food list in the StoreContext to update the home page and customer page
      await fetchFoodList();

    } catch (error) {
      console.error('Error saving menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to save menu item');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category || '',
      subcategory: item.subcategory || '',
      image: null // Reset image to null when editing
    });
    // Set image preview if image exists
    if (item.image) {
      const imageUrl = `http://localhost:4000/uploads/${item.image}`;
      setImagePreview(imageUrl);
    } else {
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await axios.delete(`http://localhost:4000/api/catering/menu/delete/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success('Menu item deleted successfully');
        fetchMenuItems();

        // Refresh the food list in the StoreContext to update the home page and customer page
        await fetchFoodList();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete menu item');
      }
    }
  };

  // Group menu items by category and subcategory
  const groupedMenuItems = menuItems.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    const subcategory = item.subcategory || 'General';

    if (!acc[category]) {
      acc[category] = {};
    }

    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }

    // Check if item already exists in this subcategory
    const itemExists = acc[category][subcategory].some(
      existingItem => existingItem.name === item.name
    );

    if (!itemExists) {
      acc[category][subcategory].push(item);
    }

    return acc;
  }, {});

  // Filter menu items based on search term and selected category
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
            <p className="text-gray-600 mt-1">Manage your menu items and categories</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <FaPlus className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add New Menu Item</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {menu_list.map((item) => (
                  <option key={item.menu_name} value={item.menu_name}>
                    {item.menu_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Menu Items Display */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {Object.keys(groupedMenuItems).map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-2xl font-bold text-gray-800 p-6 border-b border-gray-200">
                {category}
              </h3>

              {Object.keys(groupedMenuItems[category]).map((subcategory) => (
                <div key={subcategory} className="p-6 border-b border-gray-200 last:border-b-0">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4">
                    {subcategory}
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedMenuItems[category][subcategory].map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
                      >
                        <div className="flex items-start space-x-4">
                          {item.image && (
                            <img
                              src={`http://localhost:4000/uploads/${item.image}`}
                              alt={item.name}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <h5 className="text-lg font-semibold text-gray-800">{item.name}</h5>
                            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                            <p className="text-lg font-bold text-indigo-600 mt-2">
                              Birr {item.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-2 mt-4">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-indigo-600 hover:text-indigo-900 transition duration-300 hover:scale-110 flex items-center"
                          >
                            <FaEdit className="mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="text-red-600 hover:text-red-900 transition duration-300 hover:scale-110 flex items-center"
                          >
                            <FaTrash className="mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add/Edit Menu Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full transform transition-all">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {selectedItem ? 'Edit Menu Item' : 'Add New Item'}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (Birr)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows="3"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select category</option>
                    {menu_list.map((item) => (
                      <option key={item.menu_name} value={item.menu_name}>
                        {item.menu_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                    disabled={!formData.category || availableSubcategories.length === 0}
                  >
                    <option value="">Select subcategory</option>
                    {availableSubcategories.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-md shadow-sm"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {selectedItem ? 'Update' : 'Add'} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement; 
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
    description: '',
    category: '',
    subcategory: '',
    subSubcategories: [{ name: '', price: '' }],
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

      // Only set default for category, not subcategory
      const processedItems = response.data.map(item => ({
        ...item,
        category: item.category || 'Uncategorized'
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
      description: '',
      category: '',
      subcategory: '',
      subSubcategories: [{ name: '', price: '' }],
      image: null
    });
    setImagePreview(null);
    setSelectedItem(null);
    setAvailableSubcategories([]);
  };

  const handleSubSubcategoryChange = (index, field, value) => {
    setFormData(prev => {
      const newSubSubcategories = [...prev.subSubcategories];
      newSubSubcategories[index] = {
        ...newSubSubcategories[index],
        [field]: value
      };
      return {
        ...prev,
        subSubcategories: newSubSubcategories
      };
    });
  };

  const addSubSubcategory = () => {
    setFormData(prev => ({
      ...prev,
      subSubcategories: [...prev.subSubcategories, { name: '', price: '' }]
    }));
  };

  const removeSubSubcategory = (index) => {
    setFormData(prev => ({
      ...prev,
      subSubcategories: prev.subSubcategories.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);

      // Format subSubcategories as an array of objects with proper number conversion
      const formattedSubSubcategories = formData.subSubcategories.map(subSub => ({
        name: subSub.name,
        price: Number(subSub.price) || 0
      }));

      // Validate that all subSubcategories have valid prices
      if (formattedSubSubcategories.some(subSub => isNaN(subSub.price) || subSub.price <= 0)) {
        toast.error('All sub-subcategories must have valid prices');
        return;
      }

      formDataToSend.append('subSubcategories', JSON.stringify(formattedSubSubcategories));

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
      description: item.description,
      category: item.category || '',
      subcategory: item.subcategory || '',
      subSubcategories: item.subSubcategories || [{ name: '', price: '' }],
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
    const subcategory = item.subcategory || '';

    if (!acc[category]) {
      acc[category] = {};
    }

    if (!acc[category][subcategory]) {
      acc[category][subcategory] = [];
    }

    acc[category][subcategory].push(item);
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

        {/* Table Display */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Subcategory</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.image ? (
                        <img
                          src={`http://localhost:4000/uploads/${item.image}`}
                          alt={item.name}
                          className="h-16 w-16 rounded-md object-cover shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            const placeholderDiv = document.createElement('div');
                            placeholderDiv.className = 'h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center shadow-sm';
                            placeholderDiv.innerHTML = '<span class="text-gray-500 text-xs">No Image</span>';
                            e.target.parentNode.appendChild(placeholderDiv);
                          }}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center shadow-sm">
                          <span className="text-gray-500 text-xs">No Image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {item.subcategory}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {item.subSubcategories?.map((subSub, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm text-gray-700">{subSub.name}</span>
                            <span className="text-sm font-semibold text-indigo-600">
                              Birr {subSub.price.toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
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
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">No menu items found matching your criteria</p>
                      <p className="text-sm text-gray-500">Try adjusting your search or filter</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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

            <form onSubmit={handleSubmit} className="space-y-6">
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

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Sub-Subcategories</h3>
                {formData.subSubcategories.map((subSub, index) => (
                  <div key={index} className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input
                        type="text"
                        value={subSub.name}
                        onChange={(e) => handleSubSubcategoryChange(index, 'name', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700">Price</label>
                      <input
                        type="number"
                        value={subSub.price}
                        onChange={(e) => handleSubSubcategoryChange(index, 'price', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSubSubcategory(index)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSubSubcategory}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Sub-Subcategory
                </button>
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
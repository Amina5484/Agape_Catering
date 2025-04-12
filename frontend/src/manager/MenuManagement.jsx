import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { menu_list } from '../assets/assets';

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
      setMenuItems(response.data);
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
      setImagePreview(URL.createObjectURL(file));
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
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (selectedItem) {
        // Update existing item
        await axios.put(
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
        await axios.post(
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
      image: null
    });
    setImagePreview(item.image ? `http://localhost:4000/uploads/${item.image}` : null);
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
    
    acc[category][subcategory].push(item);
    return acc;
  }, {});

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
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Menu Management</h2>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Add New Item
          </button>
        </div>

        {/* Display menu items grouped by category and subcategory */}
        <div className="space-y-8">
          {Object.keys(groupedMenuItems).map(category => (
            <div key={category} className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="bg-indigo-600 px-6 py-4">
                <h3 className="text-xl font-bold text-white">{category}</h3>
              </div>
              
              <div className="p-6">
                {Object.keys(groupedMenuItems[category]).map(subcategory => (
                  <div key={subcategory} className="mb-8 last:mb-0">
                    <h4 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">
                      {subcategory}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {groupedMenuItems[category][subcategory].map(item => (
                        <div key={item._id} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start space-x-4">
                            {item.image ? (
                              <img 
                                src={`http://localhost:4000/uploads/${item.image}`} 
                                alt={item.name} 
                                className="h-16 w-16 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center">
                                <span className="text-gray-500 text-xs">No img</span>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h5 className="text-lg font-medium text-gray-900 truncate">{item.name}</h5>
                              <p className="text-sm text-gray-500 truncate">{item.description}</p>
                              <p className="text-sm font-semibold text-indigo-600">Birr {item.price}</p>
                            </div>
                          </div>
                          
                          <div className="mt-4 flex justify-end space-x-2">
                            <button 
                              onClick={() => handleEdit(item)}
                              className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(item._id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Add/Edit Menu Item */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full transform transition-all">
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
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Price (Birr)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  rows="2"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Image</label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-10 w-10 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
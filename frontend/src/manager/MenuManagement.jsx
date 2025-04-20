import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { menu_list } from '../assets/assets';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';


const MenuManagement = () => {
  const { token, fetchFoodList } = useStore();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [subSubcategories, setSubSubcategories] = useState([]);
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
    subSubcategory: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [availableSubcategories, setAvailableSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [filteredSubSubcategories, setFilteredSubSubcategories] = useState([]);
  const [showSubcategory, setShowSubcategory] = useState(false);
  const [showSubSubcategory, setShowSubSubcategory] = useState(false);

  useEffect(() => {
    fetchAllData();
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

  // Update filtered subcategories when category changes
  useEffect(() => {
    if (formData.category) {
      const filtered = subcategories.filter(sub => sub.subcategoriesId === formData.category);
      setFilteredSubcategories(filtered);
      setShowSubcategory(true);
      // Reset subcategory and sub-subcategory when category changes
      setFormData(prev => ({
        ...prev,
        subcategory: '',
        subSubcategory: ''
      }));
      setShowSubSubcategory(false);
    } else {
      setFilteredSubcategories([]);
      setShowSubcategory(false);
      setShowSubSubcategory(false);
    }
  }, [formData.category, subcategories]);

  // Update filtered sub-subcategories when subcategory changes
  useEffect(() => {
    if (formData.subcategory) {
      const filtered = subSubcategories.filter(subSub => subSub.subSubcategoriesId === formData.subcategory);
      setFilteredSubSubcategories(filtered);
      setShowSubSubcategory(true);
      // Reset sub-subcategory when subcategory changes
      setFormData(prev => ({
        ...prev,
        subSubcategory: ''
      }));
    } else {
      setFilteredSubSubcategories([]);
      setShowSubSubcategory(false);
    }
  }, [formData.subcategory, subSubcategories]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [menuRes, categoriesRes, subcategoriesRes, subSubcategoriesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/menu', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/category', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/category/subcategory', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:4000/api/category/subsubcategory', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setMenuItems(menuRes.data);
      setCategories(categoriesRes.data);
      setSubcategories(subcategoriesRes.data);
      setSubSubcategories(Array.isArray(subSubcategoriesRes.data) ? subSubcategoriesRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setSubSubcategories([]);
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      subcategory: '',
      subSubcategory: '',
      image: null
    });
    setImagePreview(null);
    setSelectedItem(null);
    setAvailableSubcategories([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('subcategory', formData.subcategory);
      formDataToSend.append('subSubcategory', formData.subSubcategory);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:4000/api/menu', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      toast.success('Menu item added successfully');
      resetForm();
      fetchAllData();
    } catch (error) {
      console.error('Error adding menu item:', error);
      toast.error(error.response?.data?.message || 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category,
      subcategory: item.subcategory,
      subSubcategory: item.subSubcategory,
      image: null
    });
    setImagePreview(item.image ? `http://localhost:4000${item.image}` : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:4000/api/menu/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAllData();

        // Refresh the food list in the StoreContext to update the home page and customer page
        await fetchFoodList();
      } catch (error) {
        console.error('Error deleting menu item:', error);
        toast.error(error.response?.data?.message || 'Failed to delete menu item');
      } finally {
        setLoading(false);
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Menu Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <FaPlus /> Add Menu Item
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm w-full">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Add Menu Item</h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  rows="2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {showSubcategory && (
                <div className="transition-all duration-300 ease-in-out">
                  <label className="block text-sm font-medium text-gray-700">Subcategory</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {filteredSubcategories.map(subcategory => (
                      <option key={subcategory._id} value={subcategory._id}>
                        {subcategory.subcategoryName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {showSubSubcategory && (
                <div className="transition-all duration-300 ease-in-out">
                  <label className="block text-sm font-medium text-gray-700">Sub-subcategory</label>
                  <select
                    name="subSubcategory"
                    value={formData.subSubcategory}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                    required
                  >
                    <option value="">Select Sub-subcategory</option>
                    {filteredSubSubcategories.map(subSubcategory => (
                      <option key={subSubcategory._id} value={subSubcategory._id}>
                        {subSubcategory.subSubcategoryName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Image</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    required
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-12 w-12 object-cover rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                  disabled={loading}
                >
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subcategory</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-subcategory</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMenuItems.map((item) => (
              <tr key={item._id} className="hover:bg-gray-50">
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
                  <div className="text-sm text-gray-500 line-clamp-2">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${item.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category?.categoryName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.subcategory?.subcategoryName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.subSubcategory?.subSubcategoryName || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManagement; 
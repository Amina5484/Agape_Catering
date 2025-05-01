import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const DeleteModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Confirm Delete</h2>
        <p>Are you sure you want to delete this menu item?</p>
        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const MenuManagement = () => {
  const { token } = useStore();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: null,
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [menuRes, categoriesRes] = await Promise.all([
        axios.get('http://localhost:4000/api/menu', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:4000/api/category', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setMenuItems(menuRes.data);
      setCategories(categoriesRes.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data');
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      if (isEditing) {
        await axios.put(
          `http://localhost:4000/api/menu/${editingId}`,
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
        await axios.post('http://localhost:4000/api/menu', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('Menu item added successfully');
      }

      resetForm();
      fetchAllData();
    } catch (error) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while processing your request');
      }
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      price: item.price,
      description: item.description,
      category: item.category?._id || '',
      image: null,
    });
    setPreviewImage(item.image ? `http://localhost:4000${item.image}` : null);
    setIsEditing(true);
    setEditingId(item._id);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      try {
        await axios.delete(`http://localhost:4000/api/menu/${deletingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success('Menu item deleted successfully');
        fetchAllData();
      } catch (error) {
        toast.error('Failed to delete menu item');
      } finally {
        setIsModalOpen(false);
        setDeletingId(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      description: '',
      category: '',
      image: null,
    });
    setPreviewImage(null);
    setIsEditing(false);
    setEditingId(null);
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory ||
      (item.category && item.category._id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Enter price"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Enter description"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select a Category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Image {!isEditing && '*'}
                  </label>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="flex-1 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300"
                      required={!isEditing}
                    />
                    {previewImage && (
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="h-16 w-16 object-cover rounded-md shadow-sm"
                      />
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-orange-400 text-white rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  {isEditing ? 'Update Menu Item' : 'Add Menu Item'}
                </button>
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Responsive Table Container */}
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600 text-[9px]">
                      <thead className="bg-orange-400 dark:bg-gray-700">
                        <tr>
                          <th className="px-0.5 py-0.5 text-left text-[8px] font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                            Image
                          </th>
                          <th className="px-0.5 py-0.5 text-left text-[8px] font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-0.5 py-0.5 text-left text-[8px] font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-0.5 py-0.5 text-left text-[8px] font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-0.5 py-0.5 text-left text-[8px] font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                        {filteredMenuItems.map((item) => (
                          <tr
                            key={item._id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="px-0.5 py-0.5 whitespace-nowrap">
                              <img
                                src={`http://localhost:4000${item.image}`}
                                alt={item.name}
                                className="h-6 w-6 object-cover rounded-sm"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    'https://via.placeholder.com/24';
                                }}
                              />
                            </td>
                            <td className="px-0.5 py-0.5">
                              <div className="text-[8px] font-medium text-gray-900 dark:text-white">
                                {item.name}
                              </div>
                              <div className="text-[8px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                {item.description}
                              </div>
                            </td>
                            <td className="px-0.5 py-0.5 whitespace-nowrap">
                              <div className="text-[8px] text-gray-900 dark:text-white">
                                {item.category?.categoryName || 'Uncategorized'}
                              </div>
                            </td>
                            <td className="px-0.5 py-0.5 whitespace-nowrap">
                              <div className="text-[8px] text-gray-900 dark:text-white">
                                {item.price.toFixed(2)}birr
                              </div>
                            </td>
                            <td className="px-0.5 py-0.5 whitespace-nowrap text-[8px] font-medium">
                              <div className="flex space-x-0.5">
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  <FaEdit className="w-2 h-2" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <FaTrash className="w-2 h-2" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <DeleteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default MenuManagement;

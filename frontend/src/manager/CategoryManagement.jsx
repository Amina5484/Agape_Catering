import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';

const CategoryManagement = () => {
  const { token } = useStore();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    categoryName: '',
    image: null

  });
  const [previewImage, setPreviewImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);


  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/category', {


        headers: { Authorization: `Bearer ${token}` },

      });
      setCategories(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to fetch categories');
      toast.error('Failed to fetch categories');
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
      formDataToSend.append('categoryName', formData.categoryName);
      formDataToSend.append('image', formData.image);

      if (isEditing) {

        // await axios.put(`http://localhost:4000/api/category/update/${editingId}`, formDataToSend, {
        //   headers: {
        //     Authorization: `Bearer ${token}`,
        //     'Content-Type': 'multipart/form-data'
        //   }
        // });

        await axios.put(
          `http://localhost:4000/api/category/update/${editingId}`,
          formDataToSend,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        toast.success('Category updated successfully');
      } else {
        await axios.post('http://localhost:4000/api/category', formDataToSend, {
          headers: {
            Authorization: `Bearer ${token}`,
// <<<<<<< HEAD
//             'Content-Type': 'multipart/form-data'
//           }
// =======
            'Content-Type': 'multipart/form-data',
          },

        });
        toast.success('Category added successfully');
      }

      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occurred');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      categoryName: category.categoryName,

      image: null,

    });
    setPreviewImage(`http://localhost:4000${category.image}`);
    setIsEditing(true);
    setEditingId(category._id);
  };


  const handleDelete = (id) => {
    setCategoryToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/category/delete/${categoryToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
// =======
//   const handleDelete = async (id) => {
//     if (window.confirm('Are you sure you want to delete this category?')) {
//       try {
//         await axios.delete(`http://localhost:4000/api/category/delete/${id}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         toast.success('Category deleted successfully');
//         fetchCategories();
//       } catch (error) {
//         toast.error('Failed to delete category');
//       }
// >>>>>>> 976d0548e758fc8d51cf6cc251f59710507395ae
    }
  };

  const resetForm = () => {
    setFormData({
      categoryName: '',

      image: null


    });
    setPreviewImage(null);
    setIsEditing(false);
    setEditingId(null);
  };


  const filteredCategories = categories.filter((category) =>

    category.categoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">

        
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                {isEditing ? 'Edit Category' : 'Add New Category'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    value={formData.categoryName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                    placeholder="Enter category name"
                  />
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
                  {isEditing ? 'Update Category' : 'Add Category'}
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
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-orange-400 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-white dark:text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredCategories.map((category) => (

                      <tr key={category._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">

                        <td className="px-4 py-4 whitespace-nowrap">
                          <img
                            src={`http://localhost:4000${category.image}`}
                            alt={category.categoryName}
                            className="h-12 w-12 object-cover rounded-md"
                          />
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.categoryName}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(category)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                          >
                            <FaEdit className="inline-block" />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <FaTrash className="inline-block" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>
      </div>


      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Confirm Delete</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this category?</p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CategoryManagement;



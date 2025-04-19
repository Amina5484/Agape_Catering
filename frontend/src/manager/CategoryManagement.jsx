import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaTrash, FaArrowRight } from 'react-icons/fa';

const CategoryManagement = () => {
    const { token } = useStore();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeForm, setActiveForm] = useState('subSubcategory');

    // Form states
    const [subSubcategoryForm, setSubSubcategoryForm] = useState({
        subSubcategoryName: '',
        description: '',
        image: null
    });
    const [subcategoryForm, setSubcategoryForm] = useState({
        subcategoryName: '',
        description: '',
        subSubcategoriesId: '',
        image: null
    });
    const [categoryForm, setCategoryForm] = useState({
        categoryName: '',
        description: '',
        subcategoriesId: '',
        subSubcategoriesId: '',
        image: null
    });

    // Image previews
    const [imagePreviews, setImagePreviews] = useState({
        subSubcategory: null,
        subcategory: null,
        category: null
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, subcategoriesRes, subSubcategoriesRes] = await Promise.all([
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
            setCategories(categoriesRes.data);
            setSubcategories(subcategoriesRes.data);
            setSubSubcategories(subSubcategoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const formState = type === 'category' ? categoryForm :
                type === 'subcategory' ? subcategoryForm :
                    subSubcategoryForm;
            const setFormState = type === 'category' ? setCategoryForm :
                type === 'subcategory' ? setSubcategoryForm :
                    setSubSubcategoryForm;

            setFormState(prev => ({
                ...prev,
                image: file
            }));

            const previewUrl = URL.createObjectURL(file);
            setImagePreviews(prev => ({
                ...prev,
                [type]: previewUrl
            }));
        }
    };

    const handleInputChange = (e, type) => {
        const { name, value } = e.target;
        const formState = type === 'category' ? categoryForm :
            type === 'subcategory' ? subcategoryForm :
                subSubcategoryForm;
        const setFormState = type === 'category' ? setCategoryForm :
            type === 'subcategory' ? setSubcategoryForm :
                setSubSubcategoryForm;

        setFormState(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubSubcategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('subSubcategoryName', subSubcategoryForm.subSubcategoryName);
            formData.append('description', subSubcategoryForm.description);
            if (subSubcategoryForm.image) {
                formData.append('image', subSubcategoryForm.image);
            }

            const response = await axios.post('http://localhost:4000/api/category/subsubcategory', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Sub-subcategory created successfully');
            setSubSubcategoryForm({
                subSubcategoryName: '',
                description: '',
                image: null
            });
            setImagePreviews(prev => ({ ...prev, subSubcategory: null }));

            // Update subcategory form with the new sub-subcategory ID
            setSubcategoryForm(prev => ({
                ...prev,
                subSubcategoriesId: response.data._id
            }));

            // Move to subcategory form
            setActiveForm('subcategory');
            fetchAllData();
        } catch (error) {
            console.error('Error creating sub-subcategory:', error);
            toast.error(error.response?.data?.message || 'Failed to create sub-subcategory');
        }
    };

    const handleSubcategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('subcategoryName', subcategoryForm.subcategoryName);
            formData.append('description', subcategoryForm.description);
            formData.append('subSubcategoriesId', subcategoryForm.subSubcategoriesId);
            if (subcategoryForm.image) {
                formData.append('image', subcategoryForm.image);
            }

            const response = await axios.post('http://localhost:4000/api/category/subcategory', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Subcategory created successfully');
            setSubcategoryForm({
                subcategoryName: '',
                description: '',
                subSubcategoriesId: '',
                image: null
            });
            setImagePreviews(prev => ({ ...prev, subcategory: null }));

            // Update category form with the new subcategory ID
            setCategoryForm(prev => ({
                ...prev,
                subcategoriesId: response.data._id,
                subSubcategoriesId: subcategoryForm.subSubcategoriesId
            }));

            // Move to category form
            setActiveForm('category');
            fetchAllData();
        } catch (error) {
            console.error('Error creating subcategory:', error);
            toast.error(error.response?.data?.message || 'Failed to create subcategory');
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('categoryName', categoryForm.categoryName);
            formData.append('description', categoryForm.description);
            if (categoryForm.subcategoriesId) {
                formData.append('subcategories', categoryForm.subcategoriesId);
            }
            if (categoryForm.subSubcategoriesId) {
                formData.append('subSubCategory', categoryForm.subSubcategoriesId);
            }
            if (categoryForm.image) {
                formData.append('image', categoryForm.image);
            }

            await axios.post('http://localhost:4000/api/category', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast.success('Category created successfully');
            setCategoryForm({
                categoryName: '',
                description: '',
                subcategoriesId: '',
                subSubcategoriesId: '',
                image: null
            });
            setImagePreviews(prev => ({ ...prev, category: null }));

            // Reset to start with sub-subcategory again
            setActiveForm('subSubcategory');
            fetchAllData();
        } catch (error) {
            console.error('Error creating category:', error);
            toast.error(error.response?.data?.message || 'Failed to create category');
        }
    };

    const handleDelete = async (id, type) => {
        if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
            try {
                const endpoint = type === 'category' ? 'category' :
                    type === 'subcategory' ? 'subcategory' :
                        'subsubcategory';
                await axios.delete(`http://localhost:4000/api/category/${endpoint}/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success(`${type} deleted successfully`);
                fetchAllData();
            } catch (error) {
                console.error(`Error deleting ${type}:`, error);
                toast.error(error.response?.data?.message || `Failed to delete ${type}`);
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const renderForm = () => {
        switch (activeForm) {
            case 'subSubcategory':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 1: Create Sub-subcategory</h3>
                        <form onSubmit={handleSubSubcategorySubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sub-subcategory Name *</label>
                                <input
                                    type="text"
                                    name="subSubcategoryName"
                                    value={subSubcategoryForm.subSubcategoryName}
                                    onChange={(e) => handleInputChange(e, 'subSubcategory')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={subSubcategoryForm.description}
                                    onChange={(e) => handleInputChange(e, 'subSubcategory')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'subSubcategory')}
                                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required
                                    />
                                    {imagePreviews.subSubcategory && (
                                        <img
                                            src={imagePreviews.subSubcategory}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-md shadow-sm"
                                        />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Create Sub-subcategory
                            </button>
                        </form>
                    </div>
                );

            case 'subcategory':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 2: Create Subcategory</h3>
                        <form onSubmit={handleSubcategorySubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory Name *</label>
                                <input
                                    type="text"
                                    name="subcategoryName"
                                    value={subcategoryForm.subcategoryName}
                                    onChange={(e) => handleInputChange(e, 'subcategory')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={subcategoryForm.description}
                                    onChange={(e) => handleInputChange(e, 'subcategory')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Sub-subcategory ID *</label>
                                <input
                                    type="text"
                                    name="subSubcategoriesId"
                                    value={subcategoryForm.subSubcategoriesId}
                                    onChange={(e) => handleInputChange(e, 'subcategory')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'subcategory')}
                                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required
                                    />
                                    {imagePreviews.subcategory && (
                                        <img
                                            src={imagePreviews.subcategory}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-md shadow-sm"
                                        />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Create Subcategory
                            </button>
                        </form>
                    </div>
                );

            case 'category':
                return (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Step 3: Create Category</h3>
                        <form onSubmit={handleCategorySubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
                                <input
                                    type="text"
                                    name="categoryName"
                                    value={categoryForm.categoryName}
                                    onChange={(e) => handleInputChange(e, 'category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    value={categoryForm.description}
                                    onChange={(e) => handleInputChange(e, 'category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Subcategory ID *</label>
                                <input
                                    type="text"
                                    name="subcategoriesId"
                                    value={categoryForm.subcategoriesId}
                                    onChange={(e) => handleInputChange(e, 'category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Linked Sub-subcategory ID *</label>
                                <input
                                    type="text"
                                    name="subSubcategoriesId"
                                    value={categoryForm.subSubcategoriesId}
                                    onChange={(e) => handleInputChange(e, 'category')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                    readOnly
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image *</label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, 'category')}
                                        className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                        required
                                    />
                                    {imagePreviews.category && (
                                        <img
                                            src={imagePreviews.category}
                                            alt="Preview"
                                            className="h-16 w-16 object-cover rounded-md shadow-sm"
                                        />
                                    )}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                Create Category
                            </button>
                        </form>
                    </div>
                );

            default:
                return null;
        }
    };

    const renderList = (type) => {
        const items = type === 'category' ? categories :
            type === 'subcategory' ? subcategories :
                subSubcategories;
        const title = type === 'category' ? 'Categories' :
            type === 'subcategory' ? 'Subcategories' :
                'Sub-subcategories';

        return (
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-indigo-600">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Image</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Description</th>
                                {type === 'category' && (
                                    <>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Subcategory ID</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Sub-subcategory ID</th>
                                    </>
                                )}
                                {type === 'subcategory' && (
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Sub-subcategory ID</th>
                                )}
                                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {items.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {item.image ? (
                                            <img
                                                src={`http://localhost:4000/${item.image}`}
                                                alt={item[`${type}Name`]}
                                                className="h-16 w-16 rounded-md object-cover shadow-sm"
                                            />
                                        ) : (
                                            <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center shadow-sm">
                                                <span className="text-gray-500 text-xs">No Image</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item[`${type}Name`]}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-500">{item.description}</div>
                                    </td>
                                    {type === 'category' && (
                                        <>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.subcategoriesId}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{item.subSubcategoriesId}</div>
                                            </td>
                                        </>
                                    )}
                                    {type === 'subcategory' && (
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{item.subSubcategoriesId}</div>
                                        </td>
                                    )}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleDelete(item._id, type)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            <FaTrash className="inline-block mr-1" />
                                            Delete
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

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">Category Management</h2>
                    <p className="text-gray-600 mt-1">Create and manage your menu categories</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-between mb-8">
                    <div className={`flex items-center ${activeForm === 'subSubcategory' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">1</div>
                        <span className="ml-2">Sub-subcategory</span>
                    </div>
                    <FaArrowRight className={`mx-4 ${activeForm === 'subcategory' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className={`flex items-center ${activeForm === 'subcategory' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">2</div>
                        <span className="ml-2">Subcategory</span>
                    </div>
                    <FaArrowRight className={`mx-4 ${activeForm === 'category' ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <div className={`flex items-center ${activeForm === 'category' ? 'text-indigo-600' : 'text-gray-400'}`}>
                        <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center">3</div>
                        <span className="ml-2">Category</span>
                    </div>
                </div>

                {/* Active Form */}
                {renderForm()}

                {/* Lists */}
                {activeForm === 'subSubcategory' && renderList('subSubcategory')}
                {activeForm === 'subcategory' && renderList('subcategory')}
                {activeForm === 'category' && renderList('category')}
            </div>
        </div>
    );
};

export default CategoryManagement; 
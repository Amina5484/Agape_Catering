import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaTrash, FaEdit, FaChevronDown, FaChevronUp, FaImage, FaArrowLeft, FaLayerGroup, FaTags, FaTag } from 'react-icons/fa';

const CategoryManagement = () => {
    const { token } = useStore();
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [subSubcategories, setSubSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCard, setExpandedCard] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({
        subSubcategory: null,
        subcategory: null,
        category: null
    });

    // Create lookup maps for names
    const subcategoryNameMap = new Map(subcategories.map(sub => [sub._id, sub.subcategoryName]));
    const subSubcategoryNameMap = new Map(subSubcategories.map(subSub => [subSub._id, subSub.subSubcategoryName]));

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
        subcategories: '',
        subSubCategory: '',
        image: null
    });

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, subcategoriesRes, subSubcategoriesRes] = await Promise.all([
                axios.get('http://localhost:4000/api/category', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:4000/api/category/subcategory', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
                axios.get('http://localhost:4000/api/category/subsubcategory', {
                    headers: { Authorization: `Bearer ${token}` },
                }),
            ]);

            setCategories(categoriesRes.data);
            setSubcategories(subcategoriesRes.data);
            setSubSubcategories(subSubcategoriesRes.data.data || subSubcategoriesRes.data);
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

            await axios.post('http://localhost:4000/api/category/subsubcategory', formData, {
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

            await axios.post('http://localhost:4000/api/category/subcategory', formData, {
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
            formData.append('subcategories', categoryForm.subcategories);
            formData.append('subSubCategory', categoryForm.subSubCategory);
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
                subcategories: '',
                subSubCategory: '',
                image: null
            });
            setImagePreviews(prev => ({ ...prev, category: null }));
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

    const handleEdit = async (id, type, data) => {
        try {
            const endpoint = type === 'category' ? 'category' :
                type === 'subcategory' ? 'subcategory' :
                    'subsubcategory';
            await axios.put(`http://localhost:4000/api/category/${endpoint}/${id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${type} updated successfully`);
            fetchAllData();
        } catch (error) {
            console.error(`Error updating ${type}:`, error);
            toast.error(error.response?.data?.message || `Failed to update ${type}`);
        }
    };

    const getFilteredSubSubcategories = () => {
        if (!categoryForm.subcategories) return subSubcategories;
        const selectedSubcategory = subcategories.find(sub => sub._id === categoryForm.subcategories);
        if (!selectedSubcategory) return [];
        return subSubcategories.filter(subSub =>
            selectedSubcategory.subSubcategoriesId === subSub._id
        );
    };

    const renderImage = (imagePath, alt, className = "h-12 w-12 object-cover rounded-md") => {
        const defaultImage = "https://via.placeholder.com/100?text=No+Image";
        const imageUrl = imagePath ? `http://localhost:4000${imagePath}` : defaultImage;

        return (
            <img
                src={imageUrl}
                alt={alt}
                className={className}
                onError={(e) => {
                    e.target.src = defaultImage;
                }}
            />
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    const renderMiniCard = (type, icon, title, isActive) => {
        const IconComponent = icon;
        return (
            <div
                onClick={() => setExpandedCard(type)}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-300 ${isActive ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
            >
                <div className="p-2 bg-white rounded-lg shadow-sm">
                    <IconComponent className="text-lg" />
                </div>
                <span className="font-medium">{title}</span>
            </div>
        );
    };

    const renderCard = (type, icon, title, form, onSubmit, items) => {
        const isExpanded = expandedCard === type;
        const IconComponent = icon;

        return (
            <div
                className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${isExpanded ? 'fixed top-20 left-64 right-0 bottom-0 z-40' : 'cursor-pointer hover:shadow-md'
                    }`}
            >
                {!isExpanded ? (
                    <div
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedCard(type)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="p-3 bg-indigo-100 rounded-lg">
                                    <IconComponent className="text-indigo-600 text-xl" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                            </div>
                            <FaChevronDown className="text-gray-500" />
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-indigo-100 rounded-lg">
                                        <IconComponent className="text-indigo-600 text-xl" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                                </div>
                                <button
                                    onClick={() => setExpandedCard(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                                >
                                    <FaArrowLeft className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <form onSubmit={onSubmit} className="space-y-6 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {title} Name *
                                    </label>
                                    <input
                                        type="text"
                                        name={`${type}Name`}
                                        value={form[`${type}Name`]}
                                        onChange={(e) => handleInputChange(e, type)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={(e) => handleInputChange(e, type)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        rows="2"
                                    />
                                </div>

                                {type === 'subcategory' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Linked Sub-subcategory *
                                        </label>
                                        <select
                                            name="subSubcategoriesId"
                                            value={form.subSubcategoriesId}
                                            onChange={(e) => handleInputChange(e, type)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            required
                                        >
                                            <option value="">Select a Sub-subcategory</option>
                                            {subSubcategories.map((subSubcategory) => (
                                                <option key={subSubcategory._id} value={subSubcategory._id}>
                                                    {subSubcategory.subSubcategoryName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {type === 'category' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Linked Subcategory *
                                            </label>
                                            <select
                                                name="subcategories"
                                                value={form.subcategories}
                                                onChange={(e) => handleInputChange(e, type)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Select a Subcategory</option>
                                                {subcategories.map((subcategory) => (
                                                    <option key={subcategory._id} value={subcategory._id}>
                                                        {subcategory.subcategoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Linked Sub-subcategory *
                                            </label>
                                            <select
                                                name="subSubCategory"
                                                value={form.subSubCategory}
                                                onChange={(e) => handleInputChange(e, type)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                required
                                            >
                                                <option value="">Select a Sub-subcategory</option>
                                                {getFilteredSubSubcategories().map((subSubcategory) => (
                                                    <option key={subSubcategory._id} value={subSubcategory._id}>
                                                        {subSubcategory.subSubcategoryName}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Image *
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => handleImageChange(e, type)}
                                            className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                            required
                                        />
                                        {imagePreviews[type] && (
                                            <img
                                                src={imagePreviews[type]}
                                                alt="Preview"
                                                className="h-16 w-16 object-cover rounded-md shadow-sm"
                                            />
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    Create {title}
                                </button>
                            </form>

                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                                                {type === 'subcategory' && (
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Sub-subcategory</th>
                                                )}
                                                {type === 'category' && (
                                                    <>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Subcategory</th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Linked Sub-subcategory</th>
                                                    </>
                                                )}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {items.map((item) => (
                                                <tr
                                                    key={item._id}
                                                    className="hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {item[`${type}Name`]}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="text-sm text-gray-500">{item.description}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        {renderImage(item.image, item[`${type}Name`])}
                                                    </td>
                                                    {type === 'subcategory' && (
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">
                                                                {subSubcategoryNameMap.get(item.subSubcategoriesId) || 'Not linked'}
                                                            </div>
                                                        </td>
                                                    )}
                                                    {type === 'category' && (
                                                        <>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {subcategoryNameMap.get(item.subcategoriesId) || 'Not linked'}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-sm text-gray-900">
                                                                    {subSubcategoryNameMap.get(item.subSubcategoriesId) || 'Not linked'}
                                                                </div>
                                                            </td>
                                                        </>
                                                    )}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-3">
                                                            <button
                                                                onClick={() => handleEdit(item._id, type, item)}
                                                                className="text-indigo-600 hover:text-indigo-900 transition-all duration-200 hover:scale-105 active:scale-95"
                                                            >
                                                                <FaEdit className="inline-block mr-1" />
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item._id, type)}
                                                                className="text-red-600 hover:text-red-900 transition-all duration-200 hover:scale-105 active:scale-95"
                                                            >
                                                                <FaTrash className="inline-block mr-1" />
                                                                Delete
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
                )}
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

                {expandedCard && (
                    <div className="flex space-x-4 mb-6">
                        {expandedCard !== 'subSubcategory' && renderMiniCard('subSubcategory', FaTag, 'Sub-subcategory', false)}
                        {expandedCard !== 'subcategory' && renderMiniCard('subcategory', FaTags, 'Subcategory', false)}
                        {expandedCard !== 'category' && renderMiniCard('category', FaLayerGroup, 'Category', false)}
                    </div>
                )}

                <div className={`grid ${expandedCard ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'} gap-6`}>
                    {renderCard('subSubcategory', FaTag, 'Sub-subcategory', subSubcategoryForm, handleSubSubcategorySubmit, subSubcategories)}
                    {renderCard('subcategory', FaTags, 'Subcategory', subcategoryForm, handleSubcategorySubmit, subcategories)}
                    {renderCard('category', FaLayerGroup, 'Category', categoryForm, handleCategorySubmit, categories)}
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement; 
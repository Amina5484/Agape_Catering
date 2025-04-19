import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';

const HierarchicalMenu = () => {
    const { token } = useStore();
    const [menuData, setMenuData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [expandedSubcategories, setExpandedSubcategories] = useState(new Set());

    useEffect(() => {
        fetchMenuData();
    }, []);

    const fetchMenuData = async () => {
        try {
            const response = await axios.get('http://localhost:4000/api/catering/menu', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setMenuData(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch menu data');
            setLoading(false);
        }
    };

    const toggleCategory = (category) => {
        setExpandedCategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(category)) {
                newSet.delete(category);
            } else {
                newSet.add(category);
            }
            return newSet;
        });
    };

    const toggleSubcategory = (subcategory) => {
        setExpandedSubcategories(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subcategory)) {
                newSet.delete(subcategory);
            } else {
                newSet.add(subcategory);
            }
            return newSet;
        });
    };

    // Group menu items by category and subcategory
    const groupedMenu = menuData.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = {};
        }
        if (!acc[item.category][item.subcategory]) {
            acc[item.category][item.subcategory] = [];
        }
        acc[item.category][item.subcategory].push(item);
        return acc;
    }, {});

    if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">{error}</div>;

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Our Menu</h2>
            <div className="space-y-4">
                {Object.entries(groupedMenu).map(([category, subcategories]) => (
                    <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                        <button
                            onClick={() => toggleCategory(category)}
                            className="w-full px-4 py-3 flex justify-between items-center bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                        >
                            <span className="font-semibold">{category}</span>
                            <svg
                                className={`w-5 h-5 transform transition-transform ${expandedCategories.has(category) ? 'rotate-180' : ''
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        {expandedCategories.has(category) && (
                            <div className="p-4 space-y-4">
                                {Object.entries(subcategories).map(([subcategory, items]) => (
                                    <div key={subcategory} className="border-l-4 border-indigo-200 pl-4">
                                        <button
                                            onClick={() => toggleSubcategory(subcategory)}
                                            className="w-full flex justify-between items-center text-gray-700 hover:text-indigo-600"
                                        >
                                            <span className="font-medium">{subcategory}</span>
                                            <svg
                                                className={`w-4 h-4 transform transition-transform ${expandedSubcategories.has(subcategory) ? 'rotate-180' : ''
                                                    }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {expandedSubcategories.has(subcategory) && (
                                            <div className="mt-2 space-y-2">
                                                {items.map((item) => (
                                                    <div key={item._id} className="pl-4">
                                                        <h4 className="font-medium text-gray-800">{item.name}</h4>
                                                        <p className="text-sm text-gray-600">{item.description}</p>
                                                        <div className="mt-1 space-y-1">
                                                            {item.subSubcategories.map((subSub, index) => (
                                                                <div key={index} className="flex justify-between items-center text-sm">
                                                                    <span className="text-gray-700">{subSub.name}</span>
                                                                    <span className="font-medium text-indigo-600">
                                                                        ${subSub.price.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HierarchicalMenu; 
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useStore } from '../../context/StoreContext';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const Explore = () => {
  const navigate = useNavigate();
  const { token } = useStore();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({});
  const [subSubcategories, setSubSubcategories] = useState({});
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [expandedSubcategory, setExpandedSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/category', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (subcategories[categoryId]) return;

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/category/subcategory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredSubcategories = response.data.filter(
        sub => sub.subcategoriesId === categoryId
      );
      setSubcategories(prev => ({
        ...prev,
        [categoryId]: filteredSubcategories
      }));
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubSubcategories = async (categoryId, subcategoryId) => {
    const key = `${categoryId}-${subcategoryId}`;
    if (subSubcategories[key]) return;

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/category/subsubcategory', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const filteredSubSubcategories = response.data.filter(
        subSub => subSub.subSubcategoriesId === subcategoryId
      );
      setSubSubcategories(prev => ({
        ...prev,
        [key]: filteredSubSubcategories
      }));
    } catch (error) {
      console.error('Error fetching sub-subcategories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = async (categoryId) => {
    if (expandedCategory === categoryId) {
      setExpandedCategory(null);
      setExpandedSubcategory(null);
    } else {
      setExpandedCategory(categoryId);
      if (!subcategories[categoryId]) {
        await fetchSubcategories(categoryId);
      }
    }
  };

  const handleSubcategoryClick = async (categoryId, subcategoryId) => {
    if (expandedSubcategory === subcategoryId) {
      setExpandedSubcategory(null);
    } else {
      setExpandedSubcategory(subcategoryId);
      const key = `${categoryId}-${subcategoryId}`;
      if (!subSubcategories[key]) {
        await fetchSubSubcategories(categoryId, subcategoryId);
      }
    }
  };

  const renderImage = (imagePath, alt, className = "w-full h-full object-cover") => {
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

  return (
    <div className="flex flex-col gap-8 items-center text-center px-4 py-6 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl sm:text-4xl font-bold font-serif self-start p-2 sm:p-4 text-gray-800">
        Explore our menu
      </h1>
      <p className="self-start text-sm sm:text-base px-8 text-gray-600 leading-relaxed max-w-3xl">
        Savor an exquisite selection of mouthwatering dishes, each crafted with
        the finest ingredients to delight your taste buds. Whether you're
        craving something rich and savory, light and refreshing, or indulgently
        sweet, our diverse menu has something for everyone. Explore our
        offerings and experience flavors that bring warmth, comfort, and joy to
        every bite!
      </p>

      {/* Categories Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category._id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* Category Card */}
            <div
              onClick={() => handleCategoryClick(category._id)}
              className="cursor-pointer group hover:shadow-lg transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                {renderImage(category.image, category.categoryName)}
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[tomato] transition-colors duration-300">
                    {category.categoryName}
                  </h3>
                  {expandedCategory === category._id ? (
                    <FaChevronUp className="text-gray-500" />
                  ) : (
                    <FaChevronDown className="text-gray-500" />
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    {category.description}
                  </p>
                )}
              </div>
            </div>

            {/* Subcategories Section */}
            {expandedCategory === category._id && (
              <div className="border-t border-gray-100 p-4 space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Subcategories</h4>
                <div className="space-y-3">
                  {subcategories[category._id]?.map((subcategory) => (
                    <div key={subcategory._id} className="bg-gray-50 rounded-lg overflow-hidden">
                      {/* Subcategory Card */}
                      <div
                        onClick={() => handleSubcategoryClick(category._id, subcategory._id)}
                        className="p-3 cursor-pointer group hover:bg-gray-100 transition-colors duration-200"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden">
                              {renderImage(subcategory.image, subcategory.subcategoryName)}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[tomato] transition-colors duration-300">
                                {subcategory.subcategoryName}
                              </h4>
                              {subcategory.description && (
                                <p className="text-xs text-gray-500 line-clamp-1">
                                  {subcategory.description}
                                </p>
                              )}
                            </div>
                          </div>
                          {expandedSubcategory === subcategory._id ? (
                            <FaChevronUp className="text-gray-400" />
                          ) : (
                            <FaChevronDown className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      {/* Sub-subcategories Section */}
                      {expandedSubcategory === subcategory._id && (
                        <div className="border-t border-gray-200 bg-white">
                          <h5 className="text-xs font-semibold text-gray-600 p-2">Sub-subcategories</h5>
                          <div className="space-y-2 p-2">
                            {subSubcategories[`${category._id}-${subcategory._id}`]?.map((subSubcategory) => (
                              <div
                                key={subSubcategory._id}
                                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded transition-colors duration-200"
                              >
                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                  {renderImage(subSubcategory.image, subSubcategory.subSubcategoryName)}
                                </div>
                                <div>
                                  <h6 className="text-sm font-medium text-gray-800">
                                    {subSubcategory.subSubcategoryName}
                                  </h6>
                                  {subSubcategory.description && (
                                    <p className="text-xs text-gray-500 line-clamp-1">
                                      {subSubcategory.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explore;

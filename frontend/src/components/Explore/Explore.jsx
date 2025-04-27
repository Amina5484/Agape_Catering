 import React, { useState, useEffect } from 'react';
 import axios from 'axios';
 import { useNavigate } from 'react-router-dom';
 import { useDarkMode } from '../../context/DarkModeContext';
 import { useStore } from '../../context/StoreContext';
 import { motion, AnimatePresence } from 'framer-motion';
 import { toast } from 'react-toastify';

 const Explore = ({ category, setCategory }) => {
   const navigate = useNavigate();
   const { isDarkMode } = useDarkMode();
   const { token, url } = useStore();
   const [categories, setCategories] = useState([]);
   const [menuItems, setMenuItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedItem, setSelectedItem] = useState(null); // For managing the selected item in popup
   const [quantity, setQuantity] = useState(1); // For managing quantity in the popup

   useEffect(() => {
     fetchAllData();
   }, []);

   const fetchAllData = async () => {
     try {
       setLoading(true);
       const [categoriesRes, menuRes] = await Promise.all([
         axios.get('http://localhost:4000/api/category'),
         axios.get('http://localhost:4000/api/menu'),
       ]);

       if (categoriesRes.data && Array.isArray(categoriesRes.data)) {
         setCategories(categoriesRes.data);
       } else {
         console.warn('Invalid categories data structure:', categoriesRes.data);
         setCategories([]);
       }

       if (menuRes.data && Array.isArray(menuRes.data)) {
         setMenuItems(menuRes.data);
       } else {
         console.warn('Invalid menu items data structure:', menuRes.data);
         setMenuItems([]);
       }

       setError(null);
     } catch (err) {
       setError('Failed to fetch data. Please try again later.');
       console.error('Error fetching data:', err);
       toast.error('Failed to load menu categories. Please try again.');
     } finally {
       setLoading(false);
     }
   };

   const getMenuItemsForCategory = (categoryId) => {
     if (!menuItems || !Array.isArray(menuItems)) return [];
     return menuItems.filter(
       (item) =>
         item.category &&
         (typeof item.category === 'object'
           ? item.category._id === categoryId
           : item.category === categoryId)
     );
   };

   const handleAddToCart = (item) => {
     // Handle adding to cart logic
     console.log('Added to cart:', item);
   };

   if (loading) {
     return (
       <div className="flex items-center justify-center py-12">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
       </div>
     );
   }

   if (error) {
     return (
       <div className="text-center py-12">
         <p
           className={`text-xl font-semibold ${
             isDarkMode ? 'text-red-400' : 'text-red-500'
           }`}
         >
           {error}
         </p>
         <button
           onClick={fetchAllData}
           className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
         >
           Retry
         </button>
       </div>
     );
   }

   if (categories.length === 0) {
     return (
       <div className="text-center py-12">
         <h2 className="text-2xl font-bold mb-4">No Categories Available</h2>
         <p className="text-gray-500 mb-6">
           Our menu categories are currently being updated. Please check back
           later.
         </p>
       </div>
     );
   }

   return (
     <div className="py-8">
       <div className="container mx-auto px-4">
         <h1
           className={`text-3xl font-bold text-center mb-8 ${
             isDarkMode ? 'text-white' : 'text-gray-900'
           }`}
         >
           Menu Categories
         </h1>

         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
           {categories.map((cat) => (
             <motion.div
               key={cat._id}
               className={`w-40 h-40 flex flex-col items-center justify-center rounded-lg shadow-lg cursor-pointer transition-all duration-300 ${
                 isDarkMode
                   ? 'bg-gray-800 hover:bg-gray-700'
                   : 'bg-white hover:bg-gray-50'
               }`}
               onClick={() => setCategory(cat._id)}
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.98 }}
             >
               {/* Circle container for image */}
               <div className="w-24 h-24 flex items-center justify-center rounded-full overflow-hidden">
                 {cat.image && (
                   <img
                     src={`http://localhost:4000${cat.image}`}
                     alt={cat.categoryName}
                     className="w-full h-full object-cover"
                     onError={(e) => {
                       e.target.onerror = null;
                       e.target.src =
                         'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                     }}
                   />
                 )}
               </div>
               {/* Category name below the image */}
               <div className="text-center mt-4">
                 <h2 className={`text-xl font-semibold font-mono text-red-400`}>
                   {cat.categoryName}
                 </h2>
               </div>
             </motion.div>
           ))}
         </div>

         {/* Popup card for selected item */}
         {selectedItem && (
           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
             <div className="bg-white p-6 rounded-lg w-120 space-y-6">
               {' '}
               {/* Increased width to w-120 */}
               <div className="flex justify-between items-center">
                 <h2 className="text-xl font-semibold">{selectedItem.name}</h2>
                 <p className="text-lg font-semibold text-green-500">
                   ${selectedItem.price}
                 </p>
               </div>
               <div className="flex justify-center items-center">
                 {/* Image Card */}
                 <div className="w-60 h-60 flex items-center justify-center rounded-lg overflow-hidden">
                   {selectedItem.image && (
                     <img
                       src={`http://localhost:4000${selectedItem.image}`}
                       alt={selectedItem.name}
                       className="w-full h-full object-cover"
                     />
                   )}
                 </div>
               </div>
               <div className="flex flex-col space-y-4">
                 {/* Quantity controller */}
                 <div className="flex items-center space-x-4">
                   <button
                     onClick={() =>
                       setQuantity(quantity > 1 ? quantity - 1 : 1)
                     }
                     className="px-4 py-2 bg-gray-300 rounded-md"
                   >
                     -
                   </button>
                   <input
                     type="number"
                     value={quantity}
                     onChange={(e) => setQuantity(Number(e.target.value))}
                     className="w-12 text-center border border-gray-300 rounded-md"
                   />
                   <button
                     onClick={() => setQuantity(quantity + 1)}
                     className="px-4 py-2 bg-gray-300 rounded-md"
                   >
                     +
                   </button>
                 </div>

                 {/* Add to cart button */}
                 <button
                   onClick={() => handleAddToCart(selectedItem)}
                   className="w-full px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                 >
                   Add to Cart
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

 export default Explore;

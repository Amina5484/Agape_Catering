 import React, { useState } from 'react';
 import Header from '../../components/Header/Header';
 import Explore from '../../components/Explore/Explore';
 import MenuDisplay from '../../components/MenuDisplay/MenuDisplay';

 const Home = () => {
   const [category, setCategory] = useState('All');
   const [selectedCategory, setSelectedCategory] = useState(null);
   const [showMenuModal, setShowMenuModal] = useState(false);

   return (
     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
       <Header />
       <div className="container mx-auto px-4 py-8">
         {/* Hero Section (optional) */}
         {/* <div className="relative h-[60vh] rounded-lg overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Welcome to Agape Catering
              </h1>
              <p className="text-xl text-white/90">
                Experience the finest culinary delights crafted with love and passion
              </p>
            </div>
          </div>
        </div> */}

         {/* Category Section */}
         <div className="mb-8">
           <div className="bg-white rounded-lg shadow-lg p-6">
             <Explore
               category={category}
               setCategory={(cat) => {
                 setCategory(cat);
                 setSelectedCategory(cat);
                 setShowMenuModal(true); // Show the menu modal when category is clicked
               }}
             />
           </div>
         </div>

         {/* Modal Popup for Menu Display */}
         {showMenuModal && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
             <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-3xl relative">
               <button
                 onClick={() => setShowMenuModal(false)} // Close the modal when the "X" button is clicked
                 className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-xl"
               >
                 ✖
               </button>
               {/* <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                 {selectedCategory} Menu
               </h3> */}
               <div className="max-h-[70vh] overflow-y-auto">
                 <MenuDisplay category={selectedCategory} />
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

 export default Home;

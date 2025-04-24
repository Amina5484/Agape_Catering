 import React, { useState, useEffect, useRef } from 'react';
 import { useNavigate, useLocation } from 'react-router-dom';
 import { assets } from '../../assets/assets';
 import { useStore } from '../../context/StoreContext';
 import { useSidebar } from '../../context/SidebarContext';
 import {
   HiMenu,
   HiMoon,
   HiSun,
   HiUserCircle,
   HiChevronDown,
   HiLogout,
   HiClock,
 } from 'react-icons/hi';

 const ManagerNavbar = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { darkMode: isDarkMode, toggleDarkMode, logout } = useStore();
   const {
     sidebarVisible,
     toggleSidebar,
     toggleMobileMenu,
     hideSidebar,
     isMobileView,
   } = useSidebar();

   const [profileMenuOpen, setProfileMenuOpen] = useState(false);
   const profileMenuRef = useRef(null);

   const handleHideSidebar = () => {
     hideSidebar();
     if (location.pathname !== '/manager') {
       navigate('/manager');
     }
   };

   const handleToggleSidebar = () => {
     if (sidebarVisible) {
       handleHideSidebar();
     } else {
       toggleSidebar();
     }
   };

   useEffect(() => {
     function handleClickOutside(event) {
       if (
         profileMenuRef.current &&
         !profileMenuRef.current.contains(event.target)
       ) {
         setProfileMenuOpen(false);
       }
     }

     document.addEventListener('mousedown', handleClickOutside);
     return () => {
       document.removeEventListener('mousedown', handleClickOutside);
     };
   }, []);

   const handleLogout = () => {
     logout();
     navigate('/');
   };

   const getGreeting = () => {
     const hour = new Date().getHours();
     if (hour < 12) return 'Good Morning';
     if (hour < 18) return 'Good Afternoon';
     return 'Good Evening';
   };

   return (
     <nav
       className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300
      bg-orange-500 text-white shadow-md`}
     >
       <div className="px-4 md:px-6 py-3 flex items-center justify-between">
         {/* Logo & Greeting */}
         <div className="flex items-center space-x-3">
           <img src={assets.logo} alt="Agape Catering" className="h-8" />
           <div className="hidden md:flex flex-col">
             <span className="text-xs text-blue-100">
               {getGreeting()}, Manager
             </span>
           </div>
         </div>

         {/* Actions */}
         <div className="flex items-center space-x-3 md:space-x-4">
           {/* Clock */}
           <div className="hidden md:flex items-center pr-2">
             <HiClock className="w-4 h-4 text-blue-100 mr-1" />
             <span className="text-sm text-blue-100">
               {new Date().toLocaleTimeString([], {
                 hour: '2-digit',
                 minute: '2-digit',
               })}
             </span>
           </div>

           {/* Dark Mode Toggle */}
           <button
             onClick={toggleDarkMode}
             className="p-2 rounded-full bg-royal-600/30 hover:bg-royal-600/50 text-white transition-colors duration-200"
             aria-label={
               isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'
             }
           >
             {isDarkMode ? (
               <HiSun className="w-5 h-5" />
             ) : (
               <HiMoon className="w-5 h-5" />
             )}
           </button>

           {/* Profile Dropdown */}
           <div className="relative" ref={profileMenuRef}>
             <button
               onClick={() => setProfileMenuOpen(!profileMenuOpen)}
               className="flex items-center space-x-1 py-1 px-2 rounded-lg bg-royal-600/30 hover:bg-royal-600/50 transition-colors duration-200"
             >
               <HiUserCircle className="w-8 h-8 text-white" />
               <span className="hidden md:inline-block text-sm font-medium text-white">
                 Manager
               </span>
               <HiChevronDown
                 className={`w-4 h-4 text-white transition-transform ${
                   profileMenuOpen ? 'rotate-180' : ''
                 }`}
               />
             </button>

             {profileMenuOpen && (
               <div
                 className={`absolute right-0 mt-2 w-60 py-2 rounded-lg shadow-lg transition-opacity duration-300 ease-in-out ${
                   isDarkMode
                     ? 'bg-gray-800 border border-gray-700'
                     : 'bg-white border border-misty'
                 } animate-fadeIn`}
               >
                 <button
                   onClick={handleLogout}
                   className={`flex items-center w-full px-4 py-2 text-sm text-left text-crimson ${
                     isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-cloud'
                   }`}
                 >
                   <HiLogout className="w-4 h-4 mr-3" />
                   <span>Logout</span>
                 </button>
               </div>
             )}
           </div>

           {/* Hamburger Menu - Mobile Only */}
           {isMobileView && (
             <button
               onClick={toggleMobileMenu}
               className="p-2 rounded-full bg-royal-600/30 hover:bg-royal-600/50 text-white transition-colors duration-200"
               aria-label="Toggle mobile menu"
             >
               <HiMenu className="w-6 h-6" />
             </button>
           )}
         </div>
       </div>
     </nav>
   );
 };

 export default ManagerNavbar;

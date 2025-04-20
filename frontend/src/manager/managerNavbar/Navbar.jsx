import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { FaSignOutAlt } from 'react-icons/fa';

const ManagerNavbar = () => {
  const navigate = useNavigate();

  const onLogout = () => {
    localStorage.clear();
    navigate("/");
  };
  
  // State to manage the profile picture
  const [profilePicture, setProfilePicture] = useState(assets.manager_profile);

  // Function to simulate updating the profile picture
  const handleProfilePictureUpdate = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();  
      reader.onload = (e) => {
        const newImage = e.target.result;  
        setProfilePicture(newImage);
        localStorage.setItem('managerProfilePicture', newImage);
      };
      reader.readAsDataURL(file);
    }
  };

  // On component mount, check localStorage for a saved profile picture
  useEffect(() => {
    const savedProfilePicture = localStorage.getItem('managerProfilePicture');
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture);
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-r from-indigo-600 to-indigo-800 flex items-center justify-between px-6 py-3 shadow-lg z-50">
      <img 
        className="h-10 w-auto" 
        src={assets.logo} 
        alt="Logo"
      />
      
      <div className="text-white text-2xl font-bold">
        Welcome Manager
      </div>

      <div className="flex items-center space-x-6">
        <input
          type="file"
          id="profile-upload"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePictureUpdate}
        />
        <label htmlFor="profile-upload" className="cursor-pointer">
          <img
            className="h-10 w-10 rounded-full border-2 border-white object-cover hover:border-indigo-300 transition-colors"
            src={profilePicture}
            alt="Profile"
          />
        </label>
        
        <button 
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-400 transition-colors flex items-center space-x-2 shadow-md"
          onClick={onLogout}
        >
          <FaSignOutAlt className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default ManagerNavbar;
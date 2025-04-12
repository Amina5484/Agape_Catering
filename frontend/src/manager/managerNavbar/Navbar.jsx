 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';

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
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      const reader = new FileReader();  
      reader.onload = (e) => {
        const newImage = e.target.result;  
        setProfilePicture(newImage); // Update the profile picture state
        localStorage.setItem('managerProfilePicture', newImage); // Save to localStorage
      };
      reader.readAsDataURL(file); // Read the file as a data URL
    }
  };

  // On component mount, check localStorage for a saved profile picture
  useEffect(() => {
    const savedProfilePicture = localStorage.getItem('managerProfilePicture');
    if (savedProfilePicture) {
      setProfilePicture(savedProfilePicture); // Set the saved profile picture
    }
  }, []);

  return (
    <div className=" fixed top-0 left-0 w-full bg-gray-600 flex flex-wrap items-center justify-between p2 border-b-2 border-gray-300 z-50">
       
      <img className="h-10 w-auto mb-2 md:mb-0" src={assets.logo} alt="Logo" />

       
      <div className="text-red-400 font-bold text-xl md:text-3xl text-center flex-grow">
        Welcome Manager
      </div>

  
      <div className="flex items-center">
        {/* File Input for Profile Picture Upload */}
        {/* <input
          type="file"
          id="profile-upload"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleProfilePictureUpdate}
        /> */}
        <label htmlFor="profile-upload" className="cursor-pointer pr-12">
          {/* Profile Picture */}
          <img
            className="h-10 w-10  rounded-full object-cover"
            src={profilePicture}
            alt="Profile"
          />
        </label>
      </div>
      <button className='px-4 py-1 bg-teal-700 hover:bg-teal-800 ml-8' onClick={onLogout}>
          Logout
        </button>
    </div>
  );
};

export default ManagerNavbar;
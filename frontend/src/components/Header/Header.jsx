import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';

const Header = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    assets.home,
    assets.agelgl, // Add more images from your assets
    assets.alcha,
    assets.beyaynet,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative h-[90vh] bg-cover bg-center flex items-end text-white mx-4 transition-all duration-1000"
      style={{
        backgroundImage: `url(${images[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out'
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold px-6 py-2 rounded-lg text-white">
          Welcome to Agape Catering
        </h1>
      </div>

      <div className="w-full p-4 md:p-6 relative z-10">
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white opacity-100 text-left">
            Order Your Food Here
          </h2>
          <p className="mt-2 text-sm sm:text-base text-white opacity-90 text-left">
            Food brings people together, creating moments of joy and connection.
            From rich, savory dishes to sweet delights, every bite tells a
            story. A good meal nourishes both the body and the soul.
          </p>
        </div>
      </div>

      {/* Image indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;

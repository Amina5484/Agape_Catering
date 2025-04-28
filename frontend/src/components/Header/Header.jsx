import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';

const Header = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    assets.home,
    // assets.h2, // Add more images from your assets
    // assets.h3,
    // assets.h4,
    // assets.h5,
    // assets.h6,
    // assets.h7,
    // assets.h8,
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      className="relative h-[70vh] sm:h-[80vh] md:h-[90vh] bg-cover bg-center flex items-end text-white mx-2 sm:mx-4 transition-all duration-1000 mt-16"
      style={{
        backgroundImage: `url(${images[currentImageIndex]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        transition: 'background-image 1s ease-in-out',
      }}
    >
      {/* Dark overlay with lower z-index */}
      <div className="absolute inset-0 bg-black bg-opacity-40 z-0"></div>

      {/* Center text with higher z-index */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold px-4 sm:px-6 py-2 rounded-lg text-white text-center">
          Welcome to Agape Catering
        </h1>
      </div>

      {/* Bottom content with highest z-index */}
      <div className="w-full p-3 sm:p-4 md:p-6 relative z-20">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white opacity-100 text-left">
            Order Your Food Here
          </h2>
          <p className="mt-2 text-xs sm:text-sm md:text-base text-white opacity-90 text-left">
            Food brings people together, creating moments of joy and connection.
            From rich, savory dishes to sweet delights, every bite tells a
            story. A good meal nourishes both the body and the soul.
          </p>
        </div>
      </div>

      {/* Image indicators with highest z-index */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2 z-20">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentImageIndex
                ? 'bg-white w-4 sm:w-6'
                : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Header;

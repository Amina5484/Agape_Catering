import React from 'react';
import { assets } from '../../assets/assets';

const Header = () => {
  return (
    <div
      className="relative h-[90vh] bg-cover bg-center flex items-end text-white mx-4"
      style={{ backgroundImage: `url(${assets.home})` }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold px-6 py-2 rounded-lg   ">
          Welcome to Agape Catering
        </h1>
      </div>

      <div className="w-full p-4 md:p-6 bg-opacity-50">
        <div className="max-w-md">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-800 opacity-100 text-left">
            Order Your Food Here
          </h2>
          <p className="mt-2 text-sm sm:text-base opacity-90 text-left">
            Food brings people together, creating moments of joy and connection.
            From rich, savory dishes to sweet delights, every bite tells a
            story. A good meal nourishes both the body and the soul.
          </p>
        </div>

        <div className="flex justify-center mt-4 md:mt-6">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
            View Menu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Header;

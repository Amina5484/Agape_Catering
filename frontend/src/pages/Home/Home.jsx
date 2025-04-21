import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Explore from '../../components/Explore/Explore';
import MenuDisplay from '../../components/MenuDisplay/MenuDisplay';

const Home = () => {
  const [category, setCategory] = useState('All');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
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

        {/* Menu Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-4">Our Menu</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <MenuDisplay category={category} />
          </div>
        </div>

        {/* Categories Section */}
        {/* <div className="mb-8">
          <h2 className="text-3xl font-bold text-center mb-4">Categories</h2>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Explore category={category} setCategory={setCategory} />
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default Home;

import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Explore from '../../components/Explore/Explore';
import FoodDesplay from '../../components/FoodDisplay/FoodDisplay';

const Home = () => {
  const [category, setCatagory] = useState('All');
  return (
    <div>
      <Header />
      <Explore category={category} setCatagory={setCatagory} />
      <FoodDesplay category={category} />
    </div>
  );
};

export default Home;

import React from 'react';
import { menu_list } from '../../assets/assets';

const Explore = ({ category, setCatagory }) => {
  return (
    <div className="flex flex-col gap-6 items-center text-center px-4">
      <h1 className="text-2xl sm:text-3xl font-bold font-serif self-start p-2 sm:p-4">
        Explore our menu
      </h1>
      <p className="self-start text-sm sm:text-base px-8">
        Savor an exquisite selection of mouthwatering dishes, each crafted with
        the finest ingredients to delight your taste buds. Whether you're
        craving something rich and savory, light and refreshing, or indulgently
        sweet, our diverse menu has something for everyone. Explore our
        offerings and experience flavors that bring warmth, comfort, and joy to
        every bite!
      </p>

      <div className="flex gap-4 sm:gap-6 overflow-x-auto w-full py-4 px-2 sm:px-16">
        {menu_list.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() =>
                setCatagory((prev) =>
                  prev === item.menu_name ? 'All' : item.menu_name
                )
              }
              className="flex flex-col items-center cursor-pointer min-w-[100px] sm:min-w-[120px]"
            >
              <img
                src={item.menu_image}
                alt={item.menu_name}
                className={`w-24 sm:w-32 h-24 sm:h-32 rounded-full object-cover shadow-lg border-2 cursor-pointer transition-all 
               ${
                  category === item.menu_name
                    ? 'border-[tomato] scale-105'
                    : 'border-gray-300'
                }`}
              />
              <p className="mt-2 text-xs sm:text-base font-medium">
                {item.menu_name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Explore;

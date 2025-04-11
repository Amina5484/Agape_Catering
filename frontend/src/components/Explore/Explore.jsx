import React from 'react';
import { menu_list } from '../../assets/assets';
import { useNavigate } from 'react-router-dom';

const Explore = ({ category, setCatagory }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col gap-8 items-center text-center px-4 py-6 bg-gradient-to-b from-white to-gray-50">
      <h1 className="text-3xl sm:text-4xl font-bold font-serif self-start p-2 sm:p-4 text-gray-800">
        Explore our menu
      </h1>
      <p className="self-start text-sm sm:text-base px-8 text-gray-600 leading-relaxed max-w-3xl">
        Savor an exquisite selection of mouthwatering dishes, each crafted with
        the finest ingredients to delight your taste buds. Whether you're
        craving something rich and savory, light and refreshing, or indulgently
        sweet, our diverse menu has something for everyone. Explore our
        offerings and experience flavors that bring warmth, comfort, and joy to
        every bite!
      </p>

      <div className="flex gap-6 sm:gap-8 overflow-x-auto w-full py-6 px-4 sm:px-16 scrollbar-hide">
        {menu_list.map((item, index) => {
          return (
            <div
              key={index}
              onClick={() => {
                const newCategory =
                  category === item.menu_name ? 'All' : item.menu_name;
                setCatagory(newCategory);
                navigate('/categories');
              }}
              className="flex flex-col items-center cursor-pointer min-w-[120px] sm:min-w-[140px] group"
            >
              <div
                className={`w-28 sm:w-36 h-28 sm:h-36 rounded-full overflow-hidden shadow-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-110
                ${
                  category === item.menu_name
                    ? 'border-[tomato] ring-4 ring-[tomato] ring-offset-4'
                    : 'border-gray-200 hover:border-[tomato]'
                }
                relative bg-white flex items-center justify-center`}
              >
                <img
                  src={item.menu_image}
                  alt={item.menu_name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
              </div>
              <p className="mt-4 text-sm sm:text-lg font-semibold text-gray-700 group-hover:text-[tomato] transition-colors duration-300">
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

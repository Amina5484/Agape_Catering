import PropTypes from 'prop-types';

const FoodItem = ({ name, description, image }) => {
  // Fix image URL
  const imageUrl = image?.startsWith('http')
    ? image
    : `http://localhost:4000/uploads/${image}`;

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
      <div className="relative group">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};

FoodItem.propTypes = {
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};

export default FoodItem;

import React, { useState } from 'react';
import Header from '../../components/Header/Header';
import Explore from '../../components/Explore/Explore';
import MenuDisplay from '../../components/MenuDisplay/MenuDisplay';
import { FaUtensils, FaBirthdayCake, FaGlassCheers, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaExclamationTriangle } from 'react-icons/fa';

const Home = () => {
  const [category, setCategory] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showMenuModal, setShowMenuModal] = useState(false);

  const services = [
    {
      id: 1,
      title: 'Wedding Catering',
      description: 'Elegant and memorable wedding catering services with customizable menus and professional staff.',
      icon: <FaGlassCheers className="w-8 h-8" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 2,
      title: 'Corporate Events',
      description: 'Professional catering for business meetings, conferences, and corporate gatherings.',
      icon: <FaUsers className="w-8 h-8" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 3,
      title: 'Birthday Parties',
      description: 'Fun and festive catering for birthday celebrations of all ages.',
      icon: <FaBirthdayCake className="w-8 h-8" />,
      color: 'bg-orange-100 text-orange-600'
    },
    {
      id: 4,
      title: 'Custom Menus',
      description: 'Tailored menus to suit your specific preferences and dietary requirements.',
      icon: <FaUtensils className="w-8 h-8" />,
      color: 'bg-orange-100 text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
     

        {/* Category Section with Enhanced Design */}
        <div className="mb-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 transform hover:scale-[1.02] transition-all duration-300">
          
            <Explore
              category={category}
              setCategory={(cat) => {
                setCategory(cat);
                setSelectedCategory(cat);
                setShowMenuModal(true);
              }}
            />
          </div>
        </div>

        {/* Services Section with Enhanced Design */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2"
              >
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`rounded-xl p-4 ${service.color} transform hover:scale-110 transition-transform duration-300`}>
                      {service.icon}
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-800">{service.title}</h3>
                  </div>
                  <p className="text-gray-600 text-lg leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Business Rules Section with Enhanced Design */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-2">Business Rules</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 ease-in-out transform hover:-translate-y-2">
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <div className="rounded-xl p-4 bg-orange-100 text-orange-600 transform hover:scale-110 transition-transform duration-300">
                    <FaExclamationTriangle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-800">Important Information</h3>
                </div>
                <div className="space-y-5">
                  <div className="flex items-start space-x-4">
                    <span className="text-orange-500 font-semibold text-xl">•</span>
                    <p className="text-gray-600 text-lg">Bookings must be confirmed two weeks in advance for proper planning and resource allocation.</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-orange-500 font-semibold text-xl">•</span>
                    <p className="text-gray-600 text-lg">40% non-refundable pre-payment required to secure booking. Remaining balance due on arrival.</p>
                  </div>
                  <div className="flex items-start space-x-4">
                    <span className="text-orange-500 font-semibold text-xl">•</span>
                    <p className="text-gray-600 text-lg">For urgent bookings (e.g., birthday events), 100% upfront payment required. Non-refundable.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Popup for Menu Display */}
        {showMenuModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-3xl relative">
              <button
                onClick={() => setShowMenuModal(false)}
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white text-xl"
              >
                ✖
              </button>
              <div className="max-h-[70vh] overflow-y-auto">
                <MenuDisplay category={selectedCategory} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

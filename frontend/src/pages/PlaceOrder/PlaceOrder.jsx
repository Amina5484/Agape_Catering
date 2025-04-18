import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from '../../context/StoreContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
  Popup,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { toast } from 'react-toastify';

// Fix Leaflet marker issue in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AddisAbaba = [9.03, 38.74]; // Default map center

// Map Component to Handle Location Selection
const LocationSelector = ({ setLocation, setLocationInput, setShowMap }) => {
  const map = useMap();

  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });

      // Move the map to the new location
      map.flyTo([lat, lng], 16); // Zoom in to show more details

      // Reverse Geocode to get the Address
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();
        setLocationInput(
          data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
        );
      } catch (error) {
        setLocationInput(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }

      setShowMap(false); // Hide map after selection
    },
  });

  return null;
};

const PlaceOrder = () => {
  const { totalCartPrice, cartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const locationState = useLocation();
  const { cartData } = locationState.state || {};

  // If no cart data, redirect back to cart
  useEffect(() => {
    if (!cartData) {
      toast.error('No cart data found');
      navigate('/cart');
    }
  }, [cartData, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
  });

  const [deliveryLocation, setDeliveryLocation] = useState({ lat: null, lng: null });
  const [orderedDate, setOrderedDate] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderType, setOrderType] = useState('');
  const [minDeliveryDate, setMinDeliveryDate] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [locationInput, setLocationInput] = useState('');
  const [upfrontPayment, setUpfrontPayment] = useState(0);
  const [remainingPayment, setRemainingPayment] = useState(0);

  // Set ordered date on mount
  useEffect(() => {
    const today = new Date();
    setOrderedDate(today.toISOString().split('T')[0]);
  }, []);

  // Adjust min delivery date and calculate payments based on order type
  useEffect(() => {
    const today = new Date();
    if (orderType === 'Scheduled') {
      const twoWeeksLater = new Date(today);
      twoWeeksLater.setDate(today.getDate() + 14);
      setMinDeliveryDate(twoWeeksLater.toISOString().split('T')[0]);

      // Calculate payments for scheduled orders
      setUpfrontPayment(cartData?.total * 0.4 || 0); // 40% upfront
      setRemainingPayment(cartData?.total * 0.6 || 0); // 60% remaining
    } else if (orderType === 'Urgent') {
      setMinDeliveryDate(today.toISOString().split('T')[0]);

      // Calculate payments for urgent orders
      setUpfrontPayment(cartData?.total || 0); // 100% upfront
      setRemainingPayment(0); // No remaining payment
    } else {
      setMinDeliveryDate('');
      setUpfrontPayment(0);
      setRemainingPayment(0);
    }
  }, [orderType, cartData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async (amount) => {
    try {
      const paymentData = {
        amount,
        currency: 'ETB',
        email: formData.email,
        first_name: formData.fullName.split(' ')[0],
        last_name: formData.fullName.split(' ')[1] || '',
        phone: formData.phone,
        tx_ref: 'tx-' + Date.now(),
        callback_url: 'http://localhost:3000/success',
      };

      const response = await axios.post('http://localhost:4000/api/payment/pay', paymentData);

      if (response.data.success) {
        // Save order details to database
        const orderDetails = {
          customerInfo: formData,
          location: deliveryLocation,
          orderedDate,
          deliveryDate,
          orderType,
          items: cartItems,
          totalAmount: totalCartPrice,
          upfrontPayment,
          remainingPayment,
          paymentStatus: 'pending',
          orderStatus: 'new',
        };

        await axios.post('http://localhost:4000/api/orders/create', orderDetails, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        // Redirect to Chapa payment page
        window.location.href = response.data.data.checkout_url;
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deliveryLocation.lat || !deliveryLocation.lng) {
      toast.error('Please select a delivery location.');
      return;
    }
    if (!deliveryDate) {
      toast.error('Please select a delivery date.');
      return;
    }
    if (!orderType) {
      toast.error('Please select the type of order.');
      return;
    }

    // Proceed with payment
    await handlePayment(upfrontPayment);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-100 rounded-lg max-w-full sm:max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
        <p className="text-xl font-bold mb-4">Delivery Information</p>

        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder="Full Name"
          required
          className="border p-2 rounded-md w-full text-green-600"
        />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className="border p-2 rounded-md w-full text-green-600"
        />
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="Phone number"
          required
          className="border p-2 rounded-md w-full text-green-600"
        />

        {/* Ordered Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ordered Date
          </label>
          <input
            type="text"
            value={orderedDate}
            readOnly
            className="border p-2 rounded-md w-full bg-gray-100 text-green-600"
          />
        </div>

        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type of Order
          </label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            required
            className="border p-2 rounded-md w-full text-green-600"
          >
            <option value="">Select Type of Order</option>
            <option value="Urgent">Urgent</option>
            <option value="Scheduled">Scheduled</option>
          </select>
        </div>

        {/* Delivery Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            min={minDeliveryDate}
            required
            className="border p-2 rounded-md w-full text-green-600"
          />
        </div>

        {/* Location Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Select Delivery Location
          </label>
          <input
            type="text"
            value={locationInput}
            onClick={() => setShowMap(true)}
            readOnly
            placeholder="Click to select location"
            className="border p-2 rounded-md w-full cursor-pointer text-green-500"
          />
        </div>

        {/* Map for Selecting Location */}
        {showMap && (
          <div className="h-72 w-full mt-4">
            <MapContainer
              center={AddisAbaba}
              zoom={14} // Increased zoom level for better details
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <LocationSelector
                setLocation={setDeliveryLocation}
                setLocationInput={setLocationInput}
                setShowMap={setShowMap}
              />
              {deliveryLocation.lat && (
                <Marker position={[deliveryLocation.lat, deliveryLocation.lng]}>
                  <Popup>Delivery Location</Popup>
                </Marker>
              )}
            </MapContainer>
          </div>
        )}

        {/* Payment Section */}
        <div className="space-y-2">
          <p className="text-lg text-red-400 font-serif font-bold">Payment Details</p>
          <hr />
          <div className="flex justify-between">
            <span className="font-semibold text-purple-600">Total Cart Price:</span>
            <span className="font-medium text-green-600">{cartData?.total.toFixed(2)} ETB</span>
          </div>

          {/* Upfront Payment */}
          <div className="flex justify-between">
            <span className="font-semibold text-purple-600">
              Upfront Payment ({orderType === 'Scheduled' ? '40%' : '100%'}):
            </span>
            <span className="font-medium text-green-600">{upfrontPayment.toFixed(2)} ETB</span>
          </div>

          {/* Remaining Payment (for Scheduled Orders) */}
          {orderType === 'Scheduled' && (
            <div className="flex justify-between">
              <span className="font-semibold text-purple-600">Remaining Payment (60%):</span>
              <span className="font-medium text-green-600">{remainingPayment.toFixed(2)} ETB</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 transition duration-300"
        >
          Proceed to Payment
        </button>
      </form>
    </div>
  );
};

export default PlaceOrder;
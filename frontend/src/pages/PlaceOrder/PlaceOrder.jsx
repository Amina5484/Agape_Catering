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

// Helper function for consistent date formatting throughout the app
const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';

  try {
    const date = new Date(dateValue);
    // Check if date is valid
    if (isNaN(date.getTime())) return 'Invalid Date';

    // Format: Month Day, Year (e.g., April 23, 2025)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (err) {
    console.error('Date formatting error:', err);
    return 'Date Error';
  }
};

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
  const { token, userId } = useContext(StoreContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartData } = location.state || {};
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // If no cart data, redirect back to cart
  useEffect(() => {
    if (!cartData || !cartData.cartItems || cartData.cartItems.length === 0) {
      toast.error('No items in cart. Please add items before checkout.');
      navigate('/cart');
      return;
    }
    console.log('Received cart data:', cartData);
  }, [cartData, navigate]);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    guests: 10,
    specialInstructions: '',
  });

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsProfileLoading(true);
      try {
        // Try multiple possible endpoints since it's unclear which one is correct
        let userData = null;
        let response = null;

        try {
          // First try customer endpoint
          response = await axios.get(
            'http://localhost:4000/api/customer/profile',
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          userData = response.data.user || response.data;
        } catch (err) {
          console.log('First endpoint failed, trying alternative');
          // If that fails, try user endpoint
          response = await axios.get('http://localhost:4000/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          userData = response.data.user || response.data;
        }

        if (!userData || (!userData.name && !userData.fullName)) {
          console.warn('User data incomplete, checking token info');
          // As a fallback, use token data if available
          const tokenData = token
            ? JSON.parse(atob(token.split('.')[1]))
            : null;
          if (tokenData && tokenData.name) {
            userData = { ...userData, name: tokenData.name };
          }
        }

        console.log('User profile data:', userData);

        setFormData((prev) => ({
          ...prev,
          fullName: userData?.name || userData?.fullName || 'User',
          email: userData?.email || '',
          phone: userData?.phone || '0000000000',
          address: userData?.address || 'Default Address',
        }));
        setIsProfileLoading(false);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Instead of showing error, set default values
        setFormData((prev) => ({
          ...prev,
          fullName: 'Customer',
          email: '',
          phone: '0000000000',
          address: 'Default Address',
        }));
        setIsProfileLoading(false);
      }
    };

    if (token) {
      fetchUserProfile();
    } else {
      setIsProfileLoading(false);
      // Set default values if no token
      setFormData((prev) => ({
        ...prev,
        fullName: 'Guest',
        phone: '0000000000',
      }));
    }
  }, [token]);

  const [deliveryLocation, setDeliveryLocation] = useState({
    lat: null,
    lng: null,
  });
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

      // Calculate payments for scheduled orders (40% upfront)
      if (cartData && cartData.total) {
        setUpfrontPayment(Math.round(cartData.total * 0.4));
        setRemainingPayment(Math.round(cartData.total * 0.6));
      }
    } else if (orderType === 'Urgent') {
      setMinDeliveryDate(today.toISOString().split('T')[0]);

      // Calculate payments for urgent orders (100% upfront)
      if (cartData && cartData.total) {
        setUpfrontPayment(cartData.total);
        setRemainingPayment(0);
      }
    } else {
      setMinDeliveryDate('');
      setUpfrontPayment(0);
      setRemainingPayment(0);
    }
  }, [orderType, cartData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission and checkout
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Comprehensive validation
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
    if (!formData.guests || parseInt(formData.guests) < 10) {
      toast.error('Please specify at least 10 guests.');
      return;
    }

    try {
      // Format the order data to match the backend model structure
      const orderData = {
        TypeOfOrder: orderType.toLowerCase(),
        DeliveryDate: new Date(deliveryDate).toISOString(),
        NumberOfGuest: parseInt(formData.guests),
        specialInstructions: formData.specialInstructions || '',
        Address: {
          addressText: locationInput || formData.address || 'Selected location',
          streetAddress: formData.address || 'Address',
          coordinates: deliveryLocation,
          fullName: formData.fullName || 'Customer',
          phone: formData.phone || '0000000000',
          email: formData.email || '',
        },
      };

      console.log('Sending order data:', orderData);

      // Call order creation API
      const response = await axios.post(
        'http://localhost:4000/api/order/checkout',
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.payment_url) {
        toast.success('Order placed successfully!');
        // Open payment URL in new tab
        const paymentWindow = window.open(response.data.payment_url, '_blank');
        if (paymentWindow) {
          paymentWindow.focus();
          toast.success(
            'Payment page opened in new tab. Please complete the payment.'
          );
        } else {
          toast.error(
            'Please allow popups for this site to proceed with payment.'
          );
        }
      } else {
        toast.error(
          response.data.message || 'Failed to place order. Please try again.'
        );
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(
        error.response?.data?.message || 'Checkout failed. Please try again.'
      );
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-gray-100 rounded-lg max-w-full sm:max-w-6xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-6 rounded-lg shadow-md"
      >
        <p className="text-xl font-bold mb-4">Delivery Information</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Delivery Information Section */}
          <div className="space-y-4">
            {/* Type of Order */}
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
                <option value="">Select Order Type</option>
                <option value="Urgent">Urgent (24 hours)</option>
                <option value="Scheduled">
                  Scheduled (2 weeks in advance)
                </option>
              </select>
            </div>

            {/* Number of Guests */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Number of Guests
              </label>
              <input
                type="number"
                name="guests"
                min="10"
                value={formData.guests}
                onChange={handleInputChange}
                placeholder="Minimum 10 guests"
                required
                className="border p-2 rounded-md w-full text-green-600"
              />
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Special Instructions
              </label>
              <textarea
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleInputChange}
                placeholder="Any special requirements or instructions"
                rows="3"
                className="border p-2 rounded-md w-full text-green-600"
              ></textarea>
            </div>

            {/* Delivery Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Date
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => {
                  // Ensure the date is valid and properly formatted
                  const selectedDate = e.target.value;
                  setDeliveryDate(selectedDate);
                  console.log('Selected delivery date:', selectedDate);
                  console.log('Formatted as:', formatDate(selectedDate));
                }}
                min={minDeliveryDate}
                required
                className="border p-2 rounded-md w-full text-green-600"
              />
              <div className="mt-1 text-xs text-gray-500">
                {deliveryDate &&
                  `Your selected date: ${formatDate(deliveryDate)}`}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Delivery Location
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={locationInput}
                  readOnly
                  placeholder="Select location on map"
                  className="border p-2 rounded-md flex-grow text-green-600"
                />
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="bg-red-300 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                >
                  Select Location
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary Section */}
          <div className="border-t lg:border-t-0 lg:border-l lg:pl-8 pt-6 lg:pt-0">
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {cartData?.cartItems && (
                <div className="max-h-60 overflow-y-auto">
                  {cartData.cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center py-2 border-b"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded overflow-hidden mr-3">
                          {item.menuItem?.image && (
                            <img
                              src={`http://localhost:4000${item.menuItem.image}`}
                              alt={item.menuItem.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.menuItem?.name || 'Item'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {item.totalPrice?.toLocaleString() || '0'} Birr
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span>Subtotal:</span>
                  <span>
                    {cartData?.subtotal?.toLocaleString() || '0'} Birr
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Delivery Fee:</span>
                  <span>
                    {cartData?.deliveryFee?.toLocaleString() || '0'} Birr
                  </span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>{cartData?.total?.toLocaleString() || '0'} Birr</span>
                </div>
              </div>

              {orderType && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium mb-2">Payment Information</h4>
                  <div className="flex justify-between mb-1">
                    <span>
                      Upfront Payment (
                      {orderType === 'Scheduled' ? '40%' : '100%'}):
                    </span>
                    <span className="font-semibold">
                      {upfrontPayment.toLocaleString()} Birr
                    </span>
                  </div>
                  {orderType === 'Scheduled' && (
                    <div className="flex justify-between">
                      <span>Remaining Payment (60%):</span>
                      <span className="font-semibold">
                        {remainingPayment.toLocaleString()} Birr
                      </span>
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mt-2">
                    {orderType === 'Scheduled'
                      ? 'For scheduled orders, 40% payment is required upfront and the remaining 60% is due on delivery.'
                      : 'For urgent orders, full payment is required upfront.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-300 text-white py-3 px-6 w-full rounded-lg mt-4 hover:bg-green-600 font-bold"
        >
          Place Order ({upfrontPayment.toLocaleString()} Birr)
        </button>
      </form>

      {/* Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Select Delivery Location
              </h3>
              <button
                onClick={() => setShowMap(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-grow p-4">
              <MapContainer
                center={AddisAbaba}
                zoom={13}
                style={{
                  height: '100%',
                  width: '100%',
                  borderRadius: '0.5rem',
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {deliveryLocation.lat && deliveryLocation.lng && (
                  <Marker
                    position={[deliveryLocation.lat, deliveryLocation.lng]}
                  >
                    <Popup>Your delivery location</Popup>
                  </Marker>
                )}
                <LocationSelector
                  setLocation={setDeliveryLocation}
                  setLocationInput={setLocationInput}
                  setShowMap={setShowMap}
                />
              </MapContainer>
            </div>
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600 mb-4">
                Click on the map to select your delivery location. Once
                selected, the map will close automatically.
              </p>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowMap(false)}
                  className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                >
                  Close Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaceOrder;

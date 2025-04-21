import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../../context/StoreContext';
import { FaSearch, FaFilter } from 'react-icons/fa';

const InventoryManagement = () => {
  const { token } = useStore();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [updatingItem, setUpdatingItem] = useState(null);
  const [updateQuantity, setUpdateQuantity] = useState('');

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:4000/api/chef/stock', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInventory(response.data);
    } catch (error) {
      toast.error('Failed to fetch inventory');
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleUpdate = async (id, currentQuantity) => {
    if (!updateQuantity || isNaN(updateQuantity) || updateQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:4000/api/chef/stock/update/${id}`,
        { quantity: updateQuantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success('Stock updated successfully');
      setUpdatingItem(null);
      setUpdateQuantity('');
      fetchInventory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
      console.error('Error updating stock:', error);
    }
  };

  const getStatusColor = (quantity, minimumLevel) => {
    if (quantity <= minimumLevel) return 'bg-red-100 text-red-800';
    if (quantity <= minimumLevel * 1.5) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (quantity, minimumLevel) => {
    if (quantity <= minimumLevel) return 'Low Stock';
    if (quantity <= minimumLevel * 1.5) return 'Warning';
    return 'In Stock';
  };

  const categories = [
    'all',
    ...new Set(inventory.map((item) => item.category)),
  ];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Inventory Management
          </h2>
          <p className="text-gray-600">View and update stock quantities</p>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories
                  .filter((cat) => cat !== 'all')
                  .map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-blue-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {item.category}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.quantity}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.unit}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          item.quantity,
                          item.minimumLevel
                        )}`}
                      >
                        {getStatusText(item.quantity, item.minimumLevel)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {updatingItem === item._id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={updateQuantity}
                            onChange={(e) => setUpdateQuantity(e.target.value)}
                            className="w-20 px-2 py-1 border rounded"
                            placeholder="Qty"
                          />
                          <button
                            onClick={() =>
                              handleUpdate(item._id, item.quantity)
                            }
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setUpdatingItem(null);
                              setUpdateQuantity('');
                            }}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setUpdatingItem(item._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Update
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryManagement;

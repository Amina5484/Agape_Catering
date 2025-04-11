import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';

const ManageStock = () => {
  const { token } = useStore();
  const [stockItems, setStockItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: ''
  });
  const [loading, setLoading] = useState(false);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/catering/stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setStockItems(response.data.stock);
      }
    } catch (error) {
      toast.error('Failed to fetch stock items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        'http://localhost:4000/api/catering/stock/add',
        formData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        toast.success('Stock item added successfully');
        setFormData({ name: '', quantity: '', unit: '' });
        fetchStock();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add stock item');
    }
  };

  const handleUpdate = async (id, updatedData) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/catering/stock/update/${id}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        toast.success('Stock item updated successfully');
        fetchStock();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock item');
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:4000/api/catering/stock/delete/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (response.data.success) {
        toast.success('Stock item deleted successfully');
        fetchStock();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete stock item');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Stock</h2>

      {/* Add Stock Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Add New Stock Item</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Item Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Unit</label>
            <input
              type="text"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Stock Item
          </button>
        </form>
      </div>

      {/* Stock List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Current Stock</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Item Name</th>
                <th className="px-4 py-2">Quantity</th>
                <th className="px-4 py-2">Unit</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map((item) => (
                <tr key={item._id} className="border-b">
                  <td className="px-4 py-2">{item.name}</td>
                  <td className="px-4 py-2">{item.quantity}</td>
                  <td className="px-4 py-2">{item.unit}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleUpdate(item._id, { quantity: item.quantity + 1 })}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleUpdate(item._id, { quantity: Math.max(0, item.quantity - 1) })}
                      className="text-blue-500 hover:text-blue-700 mr-2"
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStock; 
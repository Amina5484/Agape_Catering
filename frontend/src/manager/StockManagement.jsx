import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useStore } from "../context/StoreContext";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";

const StockManagement = () => {
  const { token } = useStore();
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUnit, setSelectedUnit] = useState("all");
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: ""
  });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/catering/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.success) {
        setStockItems(response.data.data || []);
      } else if (Array.isArray(response.data)) {
        setStockItems(response.data);
      } else {
        setStockItems([]);
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error(error.response?.data?.message || "Failed to fetch stock items");
      setStockItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      name: item.name || "",
      quantity: item.quantity || "",
      unit: item.unit || ""
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem) {
        // Update existing item
        const response = await axios.put(
          `http://localhost:4000/api/catering/stock/update/${selectedItem._id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        if (response.data && response.data.success) {
          // Update the item in the local state
          setStockItems(prevItems => 
            prevItems.map(item => 
              item._id === selectedItem._id 
                ? { ...item, ...response.data.data }
                : item
            )
          );
          toast.success("Stock item updated successfully");
          setIsEditing(false);
          setSelectedItem(null);
          setFormData({
            name: "",
            quantity: "",
            unit: ""
          });
        } else {
          toast.error(response.data?.message || "Failed to update stock item");
        }
      } else {
        // Add new item
        const response = await axios.post(
          "http://localhost:4000/api/catering/stock/add",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
          }
        );
        
        if (response.data && response.data.success) {
          // Add the new item to the local state
          setStockItems(prevItems => [...prevItems, response.data.data]);
          toast.success("Stock item added successfully");
          setIsEditing(false);
          setSelectedItem(null);
          setFormData({
            name: "",
            quantity: "",
            unit: ""
          });
        } else {
          toast.error(response.data?.message || "Failed to add stock item");
        }
      }
    } catch (error) {
      console.error("Error saving stock item:", error);
      toast.error(error.response?.data?.message || "Failed to save stock item");
      // Refresh the stock list in case of error
      fetchStock();
    }
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this stock item?")) {
      try {
        const response = await axios.delete(
          `http://localhost:4000/api/catering/stock/delete/${itemId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (response.data && response.data.success) {
          // Remove the item from the local state
          setStockItems(prevItems => prevItems.filter(item => item._id !== itemId));
          toast.success("Stock item deleted successfully");
        } else {
          toast.error(response.data?.message || "Failed to delete stock item");
          // Refresh the stock list in case of error
          fetchStock();
        }
      } catch (error) {
        console.error("Error deleting stock item:", error);
        toast.error(error.response?.data?.message || "Failed to delete stock item");
        // Refresh the stock list in case of error
        fetchStock();
      }
    }
  };

  const filteredItems = stockItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesUnit = selectedUnit === "all" || item.unit === selectedUnit;
    return matchesSearch && matchesUnit;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Stock Management</h2>
            
          </div>
          <button
            onClick={() => {
              setSelectedItem(null);
              setFormData({
                name: "",
                quantity: "",
                unit: ""
              });
              setIsEditing(true);
            }}
            className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center space-x-2">
              <FaPlus className="w-5 h-5 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add New Stock Item</span>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </button>
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
                value={selectedUnit}
                onChange={(e) => setSelectedUnit(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Units</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="l">Liters (L)</option>
                <option value="ml">Milliliters (mL)</option>
                <option value="pcs">Pieces (pcs)</option>
              </select>
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="bg-white rounded-xl shadow-xl p-8 mb-8 transform transition-all duration-300 border border-gray-100">
            <h3 className="text-2xl font-semibold mb-6 text-gray-700">
              {selectedItem ? "Edit Stock Item" : "Add New Stock Item"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-300"
                    required
                  >
                    <option value="">Select Unit</option>
                    <option value="kg">Kilograms (kg)</option>
                    <option value="g">Grams (g)</option>
                    <option value="l">Liters (L)</option>
                    <option value="ml">Milliliters (mL)</option>
                    <option value="pcs">Pieces (pcs)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedItem(null);
                    setFormData({
                      name: "",
                      quantity: "",
                      unit: ""
                    });
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 transform hover:scale-105"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300 transform hover:scale-105"
                >
                  {selectedItem ? "Update Stock Item" : "Add Stock Item"}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Unit
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-800">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-800">{item.quantity}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 transition duration-300 hover:scale-110 flex items-center"
                      >
                        <FaEdit className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-red-600 hover:text-red-800 transition duration-300 hover:scale-110 flex items-center"
                      >
                        <FaTrash className="mr-1" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center space-y-2">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-lg">No stock items found. Add your first stock item!</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StockManagement; 
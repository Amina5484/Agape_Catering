import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';
import { FaChartBar, FaBoxOpen, FaExclamationTriangle, FaSync, FaMoneyBillWave, FaClipboardList } from 'react-icons/fa';

const GenerateReport = () => {
  const { token } = useStore();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:4000/api/catering/report", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReport(response.data);
      toast.success("Report refreshed successfully");
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error(error.response?.data?.message || "Failed to fetch report");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center">
            <FaChartBar className="text-blue-600 text-3xl mr-3" />
            <h2 className="text-3xl font-bold text-gray-800">Business Report</h2>
          </div>
          <button
            onClick={fetchReport}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center space-x-2 shadow-lg transform hover:scale-105"
          >
            <FaSync className="w-5 h-5" />
            <span>Refresh Report</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Orders Summary */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <FaClipboardList className="text-blue-600 text-2xl mr-3" />
              <h3 className="text-2xl font-semibold text-gray-800">Orders Summary</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaBoxOpen className="text-gray-500 mr-3" />
                  <span className="text-gray-700 font-medium">Total Orders:</span>
                </div>
                <span className="text-xl font-bold text-blue-600">{report?.orders?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-yellow-500 mr-3" />
                  <span className="text-gray-700 font-medium">Pending Orders:</span>
                </div>
                <span className="text-xl font-bold text-yellow-600">
                  {report?.orders?.filter(order => order.status === "Pending").length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaBoxOpen className="text-green-500 mr-3" />
                  <span className="text-gray-700 font-medium">Accepted Orders:</span>
                </div>
                <span className="text-xl font-bold text-green-600">
                  {report?.orders?.filter(order => order.status === "Accepted").length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaBoxOpen className="text-blue-500 mr-3" />
                  <span className="text-gray-700 font-medium">Delivered Orders:</span>
                </div>
                <span className="text-xl font-bold text-blue-600">
                  {report?.orders?.filter(order => order.status === "Delivered").length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center">
                  <FaMoneyBillWave className="text-blue-600 mr-3" />
                  <span className="text-gray-800 font-medium">Total Revenue:</span>
                </div>
                <span className="text-2xl font-bold text-blue-700">
                  ${report?.orders?.reduce((sum, order) => sum + order.total, 0) || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-100 transform transition-all duration-300 hover:shadow-2xl">
            <div className="flex items-center mb-6">
              <FaBoxOpen className="text-green-600 text-2xl mr-3" />
              <h3 className="text-2xl font-semibold text-gray-800">Stock Summary</h3>
            </div>
            <div className="space-y-6">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaBoxOpen className="text-gray-500 mr-3" />
                  <span className="text-gray-700 font-medium">Total Items:</span>
                </div>
                <span className="text-xl font-bold text-green-600">{report?.stock?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-3" />
                  <span className="text-gray-700 font-medium">Low Stock Items:</span>
                </div>
                <span className="text-xl font-bold text-red-600">
                  {report?.stock?.filter(item => item.quantity < 10).length || 0}
                </span>
              </div>
              <div className="mt-6">
                <h4 className="text-lg font-medium mb-4 text-gray-800 flex items-center">
                  <FaExclamationTriangle className="text-red-500 mr-2" />
                  Low Stock Items
                </h4>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {report?.stock?.filter(item => item.quantity < 10).length > 0 ? (
                    report?.stock
                      ?.filter(item => item.quantity < 10)
                      .map(item => (
                        <div key={item._id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                          <span className="text-gray-800 font-medium">{item.name}</span>
                          <span className="font-bold text-red-600">{item.quantity} {item.unit}</span>
                        </div>
                      ))
                  ) : (
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                      <p className="text-green-700">No low stock items. All inventory levels are good!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReport; 
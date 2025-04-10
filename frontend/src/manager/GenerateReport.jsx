import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useStore } from '../context/StoreContext';

const GenerateReport = () => {
  const { token } = useStore();
  const [reportData, setReportData] = useState({
    orders: [],
    stock: []
  });
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:4000/api/catering/report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setReportData(response.data);
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const downloadReport = () => {
    const reportContent = `
      Orders Report
      -------------
      Total Orders: ${reportData.orders.length}
      
      Stock Report
      ------------
      Total Items: ${reportData.stock.length}
    `;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Generate Report</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Report Summary</h3>
          <button
            onClick={downloadReport}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Download Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">Orders Summary</h4>
            <p className="text-gray-600">Total Orders: {reportData.orders.length}</p>
            <div className="mt-4">
              <h5 className="font-medium mb-2">Recent Orders</h5>
              <div className="space-y-2">
                {reportData.orders.slice(0, 5).map((order) => (
                  <div key={order._id} className="bg-white p-2 rounded shadow">
                    <p className="text-sm">Order ID: {order._id}</p>
                    <p className="text-sm">Status: {order.status}</p>
                    <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stock Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3">Stock Summary</h4>
            <p className="text-gray-600">Total Items: {reportData.stock.length}</p>
            <div className="mt-4">
              <h5 className="font-medium mb-2">Current Stock</h5>
              <div className="space-y-2">
                {reportData.stock.slice(0, 5).map((item) => (
                  <div key={item._id} className="bg-white p-2 rounded shadow">
                    <p className="text-sm">Item: {item.name}</p>
                    <p className="text-sm">Quantity: {item.quantity}</p>
                    <p className="text-sm">Unit: {item.unit}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReport; 
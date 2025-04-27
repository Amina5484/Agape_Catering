import { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useStore } from '../context/StoreContext';
import {
  FaChartLine,
  FaBox,
  FaShoppingCart,
  FaDownload,
  FaArrowLeft,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const GenerateReport = () => {
  const { token } = useStore();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    orders: [],
    stock: [],
  });
  const navigate = useNavigate();

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        'http://localhost:4000/api/catering/report',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReportData(response.data);
    } catch (error) {
      console.error('Error fetching report data:', error);
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  // Calculate statistics
  const totalOrders = reportData.orders.length;
  const totalRevenue = reportData.orders.reduce(
    (sum, order) => sum + (order.totalAmount || 0),
    0
  );
  const lowStockItems = reportData.stock.filter(
    (item) => item.quantity <= (item.initialQuantity || item.quantity) * 0.2
  ).length;

  // Calculate number of unique customers
  const uniqueCustomers = new Set(
    reportData.orders.map((order) => order.customerId)
  ).size;

  // Order status statistics
  const pendingOrders = reportData.orders.filter(
    (order) => order.orderStatus === 'Pending'
  ).length;
  const deliveredOrders = reportData.orders.filter(
    (order) => order.orderStatus === 'Delivered'
  ).length;
  const processingOrders = reportData.orders.filter(
    (order) => order.orderStatus === 'Processing'
  ).length;

  // Prepare data for charts
  const orderStatusData = reportData.orders.reduce((acc, order) => {
    const status = order.orderStatus || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.entries(orderStatusData).map(
    ([status, count]) => ({
      status,
      count,
    })
  );

  const pieChartData = [
    { name: 'Pending', value: pendingOrders },
    { name: 'Delivered', value: deliveredOrders },
    { name: 'Processing', value: processingOrders },
  ];

  // Stock level data
  const stockLevelData = reportData.stock.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    initialQuantity: item.initialQuantity,
  }));

  const handleDownloadCSV = () => {
    try {
      if (!reportData.orders || !reportData.stock) {
        throw new Error('Report data is not available');
      }

      // Create new PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text('Catering Business Report', 14, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

      // Add summary section
      doc.setFontSize(16);
      doc.text('Summary Statistics', 14, 45);
      doc.setFontSize(12);

      // Summary data
      const summaryData = [
        ['Metric', 'Value'],
        ['Total Orders', totalOrders || 0],
        ['Number of Customers', uniqueCustomers || 0],
        [
          'Total Revenue',
          (totalRevenue || 0).toLocaleString('en-ET', {
            style: 'currency',
            currency: 'ETB',
          }),
        ],
        ['Low Stock Items', lowStockItems || 0],
        ['Pending Orders', pendingOrders || 0],
        ['Delivered Orders', deliveredOrders || 0],
        ['Processing Orders', processingOrders || 0],
        ['Total Stock Items', reportData.stock.length || 0],
        [
          'Average Order Value',
          totalOrders
            ? ((totalRevenue || 0) / totalOrders).toLocaleString('en-ET', {
                style: 'currency',
                currency: 'ETB',
              })
            : '0 ETB',
        ],
      ];

      // Add summary table
      autoTable(doc, {
        startY: 50,
        head: [summaryData[0]],
        body: summaryData.slice(1),
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Add orders section if there are orders
      if (reportData.orders.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('All Orders', 14, 20);
        doc.setFontSize(12);

        // Prepare orders data
        const ordersData = reportData.orders.map((order) => [
          order._id?.substring(0, 8) + '...' || 'N/A',
          order.orderedDate
            ? new Date(order.orderedDate).toLocaleDateString()
            : 'N/A',
          order.totalAmount
            ? order.totalAmount.toLocaleString('en-ET', {
                style: 'currency',
                currency: 'ETB',
              })
            : '0 ETB',
          order.orderStatus || 'Unknown',
          order.items?.length || 0,
        ]);

        // Add orders table
        autoTable(doc, {
          startY: 30,
          head: [['Order ID', 'Date', 'Amount', 'Status', 'Items']],
          body: ordersData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      // Add stock section if there is stock data
      if (reportData.stock.length > 0) {
        doc.addPage();
        doc.setFontSize(16);
        doc.text('Stock Levels', 14, 20);
        doc.setFontSize(12);

        // Prepare stock data
        const stockData = reportData.stock.map((item) => [
          item.name || 'N/A',
          item.quantity || 0,
          item.initialQuantity || 0,
          item.unit || 'N/A',
          item.quantity <= (item.initialQuantity || item.quantity) * 0.2
            ? 'Low'
            : 'Normal',
        ]);

        // Add stock table
        autoTable(doc, {
          startY: 30,
          head: [
            [
              'Item Name',
              'Current Quantity',
              'Initial Quantity',
              'Unit',
              'Status',
            ],
          ],
          body: stockData,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] },
        });
      }

      // Save the PDF
      doc.save('catering_report.pdf');
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error(`Failed to generate report: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="max-w-7xl mx-auto">
        <div className="relative mb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 top-8 flex items-center text-blue-600 hover:text-blue-800 transition duration-300"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            Report
          </h2>
          <button
            onClick={handleDownloadCSV}
            className="absolute right-0 top-8 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            <FaDownload className="mr-2" />
            Download Report
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaShoppingCart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Orders
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaChartLine className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Total Revenue
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {totalRevenue.toLocaleString('en-ET', {
                    style: 'currency',
                    currency: 'ETB',
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaBox className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Low Stock Items
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {lowStockItems}
                </p>
              </div>
            </div>
          </div>
{/* 
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                <FaShoppingCart className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-700">
                  Pending Orders
                </h3>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </div> */}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Order Status Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Order Status Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Order Status Pie Chart */}
          {/* <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Order Status Breakdown
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div> */}
        </div>

        {/* Stock Level Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Stock Levels
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockLevelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="quantity"
                  name="Current Quantity"
                  fill="#3B82F6"
                />
                <Bar
                  dataKey="initialQuantity"
                  name="Initial Quantity"
                  fill="#10B981"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Orders
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.orders.slice(0, 5).map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order._id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.orderedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.totalAmount.toLocaleString('en-ET', {
                        style: 'currency',
                        currency: 'ETB',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.orderStatus === 'Completed'
                            ? 'bg-green-100 text-green-800'
                            : order.orderStatus === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.orderStatus}
                      </span>
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

export default GenerateReport;

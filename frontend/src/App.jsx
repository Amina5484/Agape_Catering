import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DarkModeProvider } from './context/DarkModeContext';
import { SidebarProvider } from './context/SidebarContext';

// Customer Imports
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import Footer from './components/Footer/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/ForgotPassword/ForgotPassword';
import Explore from './components/Explore/Explore';
import FeedbackForm from './pages/Feedback/Feedback';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import PaymentSuccess from './pages/PaymentSuccess/PaymentSuccess';
import StoreContextProvider, { useStore } from './context/StoreContext';
import CustomerProfile from './customer/CustomerProfile';
import CustomerOrders from './pages/Orders/Orders';


// Chef Imports
import ChefDashboard from './chef/ChefDashboard';
import OrderManagement from './components/chef/OrderManagement';
import InventoryManagement from './components/chef/InventoryManagement';

// Manager Imports
import ManagerSidebar from './manager/managerSidebar/managerSidebar';
import ManagerNavbar from './manager/managerNavbar/Navbar';
import Add from './pages/Add/Add';
import List from './pages/List/List';
import Orders from './pages/Orders/Orders';
import ManagerHome from './manager/ManagerHome/ManagerHome';
import ViewFeedback from './manager/viewFeedback';
import GenerateReport from './manager/GenerateReport';
import ScheduleManagement from './manager/ScheduleManagement';
import MenuManagement from './manager/MenuManagement';
import StockManagement from './manager/StockManagement';
import CategoryManagement from './manager/CategoryManagement';

// System Admin Imports
import CreateAccount from './SystemAdmin/CreateAccount/createaccount';
import SystemSettings from './SystemAdmin/SystemSetting';
import UserManagement from './SystemAdmin/UserManagement';
import SystemSidebar from './SystemAdmin/SystemSidebar';
import SystemNavbar from './SystemAdmin/SystemNavbar';
import ViewUser from './SystemAdmin/ViewUser';
import EditStaff from './SystemAdmin/EditStaff';
import AdminHome from './SystemAdmin/AdminHome';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MenuDisplay from './components/MenuDisplay/MenuDisplay';

// Remove unused placeholder components
const Unauthorized = () => <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">
  <div className="text-center p-8 max-w-md bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
    <h1 className="text-2xl font-bold text-orange-500 mb-4">Unauthorized Access</h1>
    <p className="mb-6">You don't have permission to access this page.</p>
    <a href="/" className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-300">Return to Home</a>
  </div>
</div>;

const AppContent = () => {
  const url = 'http://localhost:4000';
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { isLoggedIn, userRole, darkMode } = useStore();
  const isManagerRoute = location.pathname.startsWith('/manager');
  const isSystemRoute =
    location.pathname.startsWith('/system') ||
    location.pathname.startsWith('/admin');
  const isChefRoute = location.pathname.startsWith('/chef');

  // Reset showLogin when login state changes
  useEffect(() => {
    if (!isLoggedIn) {
      setShowLogin(false);
    }
  }, [isLoggedIn]);

  return (
    <>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
        <ToastContainer
          position="top-right"
          theme={darkMode ? 'dark' : 'light'}
          toastStyle={{
            backgroundColor: darkMode ? '#1f2937' : 'white',
            color: darkMode ? 'white' : 'black',
          }}
        />
        {isManagerRoute ? (
          <SidebarProvider>
            <ManagerNavbar />
          </SidebarProvider>
        ) : isSystemRoute ? (
          <SystemNavbar />
        ) : isChefRoute ? null : (
          <Navbar setShowLogin={setShowLogin} />
        )}

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/profile"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['System Admin']}>
                <SystemSidebar />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminHome />} />
            <Route
              path="create-account"
              element={<CreateAccount url={url} />}
            />
            <Route path="edit-user" element={<EditStaff url={url} />} />
            <Route path="settings" element={<SystemSettings url={url} />} />
            <Route
              path="user-management"
              element={<UserManagement url={url} />}
            />
            <Route path="view-user" element={<ViewUser />} />
          </Route>

          {/* Chef Routes */}
          <Route
            path="/chef"
            element={
              <ProtectedRoute allowedRoles={['Executive Chef']}>
                <ChefDashboard />
              </ProtectedRoute>
            }
          >
            <Route index element={<OrderManagement />} />
            <Route path="orders" element={<OrderManagement />} />
            <Route path="stock" element={<InventoryManagement />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['Catering Manager']}>
                <SidebarProvider>
                  <ManagerSidebar />
                </SidebarProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerHome />} />
            <Route path="add-food" element={<Add url={url} />} />
            <Route path="food-list" element={<List url={url} />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<CustomerProfile />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="generate-report" element={<GenerateReport />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="feedback" element={<ViewFeedback />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/menu"
            element={<MenuDisplay category="All" />}
          />
          <Route
            path="/categories"
            element={
              <div className="pt-16 dark:bg-gray-900 transition-colors duration-300">
                <Explore category="All" setCategory={() => { }} />
              </div>
            }
          />
          <Route path="/feedback" element={<FeedbackForm />} />
          <Route path="/view-feedback" element={<ViewFeedback />} />
          <Route path="/contact" element={<Footer />} />
          <Route path="/place-order" element={<PlaceOrder />} />

          <Route
            path="/customer/orders"
            element={
              <ProtectedRoute allowedRoles={['Customer']}>
                <CustomerOrders />
              </ProtectedRoute>
            }
          />

          <Route path="/payment-success" element={<PaymentSuccess />} />

          {/* Default route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        {!isManagerRoute && !isSystemRoute && !isChefRoute && <Footer />}
      </div>

      {showLogin && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50"
          onClick={() => setShowLogin(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md max-w-sm w-full relative transform scale-100 opacity-100 transition-all duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <Login setShowLogin={setShowLogin} />
          </div>
        </div>
      )}
    </>
  );
};

const App = () => {
  return (
    <StoreContextProvider>
      <DarkModeProvider>
        <AppContent />
      </DarkModeProvider>
    </StoreContextProvider>
  );
};

export default App;

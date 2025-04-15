import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import './index.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Customer Imports
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import FoodDisplay from './components/FoodDisplay/FoodDisplay';
import Footer from './components/Footer/Footer';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Explore from './components/Explore/Explore';
import FeedbackForm from './pages/Feedback/Feedback';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
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
import Profile from './manager/Profile';
import ViewFeedback from './manager/viewFeedback';
import GenerateReport from './manager/GenerateReport';
import ScheduleManagement from './manager/ScheduleManagement';
import MenuManagement from './manager/MenuManagement';
import StockManagement from './manager/StockManagement';

// System Admin Imports
import CreateAccount from './SystemAdmin/CreateAccount/createaccount';
import SystemSettings from './SystemAdmin/SystemSetting';
import UserManagement from './SystemAdmin/UserManagement';
import SystemSidebar from './SystemAdmin/SystemSidebar';
import SystemNavbar from './SystemAdmin/SystemNavbar';
import ViewUser from './SystemAdmin/ViewUser';
import EditStaff from './SystemAdmin/EditStaff';
//import ListStaff from './SystemAdmin/ListStaff';
import AdminHome from './SystemAdmin/AdminHome';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AccountList from './admin/AccountList';

// Remove unused placeholder components
const Unauthorized = () => <div>Unauthorized Access</div>;

const AppContent = () => {
  const url = 'http://localhost:4000';
  const [showLogin, setShowLogin] = useState(false);
  const location = useLocation();
  const { isLoggedIn, userRole } = useStore();
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
      <div className="min-h-screen bg-white text-black dark:bg-gray-900 dark:text-white transition-colors duration-300">
        <ToastContainer />
        {isManagerRoute ? (
          <ManagerNavbar />
        ) : isSystemRoute ? (
          <SystemNavbar />
        ) : isChefRoute ? null : (
          <Navbar setShowLogin={setShowLogin} />
        )}

        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
            {/* <Route path="staff-list" element={<ListStaff url={url} />} /> */}
            <Route path="view-user" element={<ViewUser url={url} />} />
            <Route path="account-list" element={<AccountList />} />
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
            <Route path="inventory" element={<InventoryManagement />} />
          </Route>

          {/* Manager Routes */}
          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['Catering Manager']}>
                <ManagerSidebar />
              </ProtectedRoute>
            }
          >
            <Route index element={<ManagerHome />} />
            <Route path="add-food" element={<Add url={url} />} />
            <Route path="food-list" element={<List url={url} />} />
            <Route path="orders" element={<Orders />} />
            <Route path="profile" element={<Profile />} />
            <Route path="stock" element={<StockManagement />} />
            <Route path="generate-report" element={<GenerateReport />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="feedback" element={<ViewFeedback />} />
            <Route path="menu" element={<MenuManagement />} />
          </Route>

          {/* Customer Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route
            path="/menu"
            element={<FoodDisplay setShowLogin={setShowLogin} category="All" />}
          />
          <Route
            path="/categories"
            element={
              <div className="pt-16">
                <Explore category="All" setCatagory={() => {}} />
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
            className="bg-white p-8 rounded-lg shadow-md max-w-md w-full relative transform scale-100 opacity-100 transition-all duration-300 ease-in-out"
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
      <AppContent />
    </StoreContextProvider>
  );
};

export default App;

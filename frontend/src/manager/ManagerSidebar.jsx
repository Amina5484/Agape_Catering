import { FaHome, FaUtensils, FaUsers, FaChartBar, FaCog, FaList } from 'react-icons/fa';

const ManagerSidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: <FaHome />, path: '/manager/dashboard' },
        { name: 'Menu Management', icon: <FaUtensils />, path: '/manager/menu' },
        { name: 'Category Management', icon: <FaList />, path: '/manager/categories' },
        { name: 'Customer Management', icon: <FaUsers />, path: '/manager/customers' },
        { name: 'Analytics', icon: <FaChartBar />, path: '/manager/analytics' },
        { name: 'Settings', icon: <FaCog />, path: '/manager/settings' },
    ];

    // ... rest of the existing code ...
}; 
import React from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '../../context/SidebarContext';
import { useStore } from '../../context/StoreContext';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
    const { isDarkMode } = useStore();

    return (
        <SidebarProvider>
            <div
                className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-900'
                    }`}
            >
                <Navbar />
                <Sidebar />

                <main className={`pt-16 transition-all duration-300 min-h-screen`}>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <Outlet />
                    </div>
                </main>
            </div>
        </SidebarProvider>
    );
};

export default DashboardLayout; 
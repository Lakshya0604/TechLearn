import Navbar from '@/components/Navbar';
import React from 'react';
import { Outlet } from 'react-router-dom';

const MainLayout = () => {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            <Navbar />
            <div className="pt-16">
                <Outlet />
            </div>
        </div>
    )
}

export default MainLayout;

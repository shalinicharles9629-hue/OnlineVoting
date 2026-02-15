import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminLayout = ({ children }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: '📊' },
        { name: 'Applications', path: '/admin/applications', icon: '📝' },
        { name: 'Voters', path: '/admin/voters', icon: '👥' },
        { name: 'Manage News', path: '/admin/news', icon: '📰' },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 pt-16">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gov-blue">Admin Panel</h2>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Election Management</p>
                </div>
                <nav className="mt-4 px-4 space-y-1">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${active
                                    ? 'bg-gov-blue text-white shadow-md'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <span className="text-xl">{item.icon}</span>
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {children}
                </motion.div>
            </main>
        </div>
    );
};

export default AdminLayout;

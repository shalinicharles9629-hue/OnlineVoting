import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Contact', path: '/contact' },
        ...(user ? [
            { name: 'Dashboard', path: '/dashboard' },
        ] : []),
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-gov-blue rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
                            V
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-gov-blue leading-none group-hover:text-gov-orange transition-colors">VoteOnline</span>
                            <span className="text-xs text-gray-500 font-medium tracking-wide">GOVT. OF INDIA</span>
                        </div>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                    ? 'text-gov-blue bg-blue-50'
                                    : 'text-gray-700 hover:text-gov-blue hover:bg-gray-50'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user && user.role === 'admin' && (
                            <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-red-400">ADMIN</span>
                        )}

                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-1 rounded-full transition pr-3">
                                    <div className="w-8 h-8 bg-gov-orange rounded-full flex items-center justify-center text-white text-sm font-bold">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full text-sm font-semibold transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link to="/admin/login" className="text-gov-blue font-semibold hover:underline text-sm hover:text-blue-800 transition-colors">
                                    Admin Portal
                                </Link>
                                <Link to="/candidate/login" className="bg-gov-orange hover:bg-orange-700 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md transition-all transform hover:scale-105">
                                    Candidate Login
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-700 hover:text-gov-blue focus:outline-none"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                        ? 'text-gov-blue bg-blue-50'
                                        : 'text-gray-700 hover:text-gov-blue hover:bg-gray-50'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            {user && (
                                <Link
                                    to="/profile"
                                    onClick={() => setIsOpen(false)}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile')
                                        ? 'text-gov-blue bg-blue-50'
                                        : 'text-gray-700 hover:text-gov-blue hover:bg-gray-50'
                                        }`}
                                >
                                    My Profile
                                </Link>
                            )}

                            <div className="pt-4 border-t border-gray-100 mt-2">
                                {!user ? (
                                    <Link to="/register" onClick={() => setIsOpen(false)} className="block w-full text-center bg-gov-orange text-white px-3 py-2 rounded-lg font-bold shadow-md">
                                        Register Now
                                    </Link>
                                ) : (
                                    <button onClick={handleLogout} className="block w-full text-center bg-gray-100 text-red-600 px-3 py-2 rounded-lg font-bold">
                                        Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Register = () => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role] = useState('candidate');
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            return setError('Passwords do not match');
        }

        try {
            await register(name, email, phone, password, role);
            navigate('/apply'); // Redirect candidates to application form
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <div className="flex min-h-screen bg-gov-bg">
            {/* Left Side - Graphic */}
            <div className="hidden lg:flex w-1/2 bg-[#0b0d17] items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-30"></div>
                <div className="relative z-10 text-center text-white px-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-xl border border-white/20 mb-8 rotate-12">
                            <span className="text-5xl">🗳️</span>
                        </div>
                        <h2 className="text-5xl font-black mb-6 tracking-tight">Lead Your <br /><span className="text-gov-orange">Nation.</span></h2>
                        <p className="text-gray-400 text-xl font-light leading-relaxed">
                            Join the digital platform for candidates. Register today to apply for upcoming elections and serve your constituency.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="mb-10 text-center lg:text-left">
                        <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Candidate Portal</h2>
                        <p className="text-gray-500 font-medium">Create your official candidate account</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-xl flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Official Name</label>
                            <input
                                type="text"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                placeholder="Enter Name as per Govt. Records"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Contact Number</label>
                            <input
                                type="tel"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                placeholder="+91 00000 00000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-black uppercase tracking-widest text-gray-400">Official Email</label>
                            <input
                                type="email"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                placeholder="candidate@elections.gov.in"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Password</label>
                                <input
                                    type="password"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Confirm</label>
                                <input
                                    type="password"
                                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gov-blue hover:bg-blue-800 text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-blue-200 transition transform active:scale-[0.98] uppercase tracking-[0.2em] text-sm"
                        >
                            Register as Candidate
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
                        <p className="text-gray-500 font-bold">Already a Candidate?</p>
                        <Link to="/candidate/login" className="px-8 py-3 bg-gov-bg border-2 border-gov-blue text-gov-blue rounded-xl font-black hover:bg-gov-blue hover:text-white transition uppercase tracking-widest text-xs">
                            Login to Dashboard
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Register;

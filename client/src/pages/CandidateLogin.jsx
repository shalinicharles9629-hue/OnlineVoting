import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const CandidateLogin = () => {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await login(email, password);
            if (res.user.role !== 'candidate') {
                setError(t('candidate_login.access_denied'));
                return;
            }
            navigate('/dashboard');
        } catch (err) {
            setError(t('login.invalid_credentials', { defaultValue: 'Invalid credentials' }));
        }
    };

    return (
        <div className="flex h-screen bg-gov-bg">
            {/* Left Side - Graphic */}
            <div className="hidden md:flex w-1/2 bg-gov-orange items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 text-center text-white px-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
                            <span className="text-6xl">🤝</span>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-4">{t('candidate_login.portal_title')}</h2>
                    <p className="text-orange-100 text-lg">
                        {t('candidate_login.portal_desc')}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">{t('candidate_login.title')}</h2>
                        <p className="text-gray-500 mt-2">{t('candidate_login.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('candidate_login.email_label')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-orange focus:border-transparent outline-none transition text-gray-900"
                                    placeholder="candidate@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('candidate_login.password_label')}</label>
                            <div className="relative">
                                <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                                <input
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-orange focus:border-transparent outline-none transition text-gray-900"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-gov-orange hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                        >
                            {t('candidate_login.login_btn')}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-600">
                        {t('candidate_login.not_candidate')}{' '}
                        <Link to="/register" className="font-semibold text-gov-orange hover:text-orange-700 transition">
                            {t('candidate_login.apply_link')}
                        </Link>
                    </p>
                    <Link to="/" className="block mt-4 text-center text-xs text-gov-blue hover:underline">{t('admin_login.back_home')}</Link>
                </motion.div>
            </div>
        </div>
    );
};

export default CandidateLogin;

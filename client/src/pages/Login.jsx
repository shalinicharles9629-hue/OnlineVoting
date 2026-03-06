import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTranslation } from 'react-i18next';


const Login = () => {
    const { t } = useTranslation();
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'otp'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // OTP States
    const [identifier, setIdentifier] = useState(''); // Email or Phone
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [otpStep, setOtpStep] = useState(1); // 1: Send, 2: Verify

    const { login, verifyOtpAndLogin } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(email, password);
            if (res.user.role !== 'voter' && res.user.role !== 'candidate') {
                setError(t('login.role_mismatch'));
                return;
            }
            const redirectPath = searchParams.get('redirect');
            navigate(redirectPath || '/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/send-otp', { identifier });
            setOtpSent(true);
            setOtpStep(2);
            setSuccessMessage(`${t('login.enter_otp')} ${identifier}`);
        } catch (err) {
            setError(err.response?.data?.error || t('login.otp_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await verifyOtpAndLogin(identifier, otp);
            if (res.user.role !== 'voter' && res.user.role !== 'candidate') {
                setError(t('login.role_mismatch'));
                return;
            }
            const redirectPath = searchParams.get('redirect');
            navigate(redirectPath || '/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || t('login.invalid_otp'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-gov-bg">
            {/* Left Side - Graphic */}
            <div className="hidden md:flex w-1/2 bg-gov-blue items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="relative z-10 text-center text-white px-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="mb-8"
                    >
                        <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-sm border border-white/20">
                            <span className="text-6xl">🇮🇳</span>
                        </div>
                    </motion.div>
                    <h2 className="text-4xl font-bold mb-4">{t('login.voter_portal')}</h2>
                    <p className="text-blue-200 text-lg">
                        {t('login.exercise_right')}
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8 relative">
                <div className="md:hidden absolute top-0 left-0 w-full h-40 bg-gov-blue rounded-b-3xl -z-10"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100"
                >
                    <div className="text-center mb-6">
                        <h2 className="text-3xl font-bold text-gray-800">{t('login.voter_login')}</h2>
                        <p className="text-gray-500 mt-2">{t('login.enter_credentials')}</p>
                    </div>

                    {/* Login Method Toggle */}
                    <div className="flex p-1 bg-gray-100 rounded-lg mb-6">
                        <button
                            onClick={() => setLoginMethod('password')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${loginMethod === 'password'
                                ? 'bg-white text-gov-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('login.password_tab')}
                        </button>
                        <button
                            onClick={() => setLoginMethod('otp')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition ${loginMethod === 'otp'
                                ? 'bg-white text-gov-blue shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {t('login.otp_tab')}
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded text-sm" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    {successMessage && (
                        <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded text-sm" role="alert">
                            <p>{successMessage}</p>
                        </div>
                    )}

                    {loginMethod === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.email_label')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">✉️</span>
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent outline-none transition text-gray-900"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.password_label')}</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                                    <input
                                        type="password"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent outline-none transition text-gray-900"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gov-orange hover:bg-orange-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50"
                            >
                                {loading ? t('login.signing_in') : t('login.signin_btn')}
                            </button>
                        </form>
                    ) : (
                        <div className="space-y-6">
                            {otpStep === 1 ? (
                                <form onSubmit={handleSendOTP} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.identifier_label')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400">📱</span>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent outline-none transition text-gray-900"
                                                placeholder={t('login.identifier_placeholder')}
                                                value={identifier}
                                                onChange={(e) => setIdentifier(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gov-blue hover:bg-blue-800 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {loading ? t('login.sending_otp') : t('login.send_otp')}
                                    </button>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOTP} className="space-y-6">
                                    <div className="text-center mb-2">
                                        <p className="text-sm text-gray-600">{t('login.enter_otp')} <span className="font-semibold">{identifier}</span></p>
                                        <button
                                            type="button"
                                            onClick={() => setOtpStep(1)}
                                            className="text-xs text-gov-blue hover:underline mt-1"
                                        >
                                            {t('login.change_identifier')}
                                        </button>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('login.otp_label')}</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-3 text-gray-400">🔑</span>
                                            <input
                                                type="text"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent outline-none transition text-gray-900 tracking-widest text-center text-xl font-mono"
                                                placeholder="XXXXXX"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                maxLength={6}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 disabled:opacity-50"
                                    >
                                        {loading ? t('login.verifying') : t('login.verify_login')}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    <p className="mt-8 text-center text-sm text-gray-600">
                        {t('login.apply_candidate_prompt').split('? ')[0]}?{' '}
                        <Link to="/register" className="font-semibold text-gov-blue hover:text-blue-800 transition">
                            {t('login.apply_candidate_prompt').split('? ')[1]}
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;

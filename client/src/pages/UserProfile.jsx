import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const UserProfile = () => {
    const { t } = useTranslation();
    const { user } = useAuth();

    if (!user) {
        return <div className="min-h-screen flex items-center justify-center">{t('profile.loading')}</div>;
    }

    return (
        <div className="min-h-screen bg-gov-bg pt-24 px-6 pb-12">
            <div className="container mx-auto max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden"
                >
                    <div className="h-40 bg-gradient-to-r from-gov-blue to-blue-800 relative">
                        <div className="absolute -bottom-16 left-8 md:left-12">
                            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg">
                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-4xl overflow-hidden">
                                    {user.photo ? <img src={user.photo} alt="User" /> : "👤"}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 md:px-12 pb-12">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">{user.name}</h1>
                                <p className="text-gray-500 font-medium">{user.email}</p>
                            </div>
                            <span className="mt-2 md:mt-0 bg-blue-100 text-gov-blue px-4 py-1 rounded-full text-sm font-bold uppercase tracking-wide border border-blue-200">
                                {user.role} {t('profile.account')}
                            </span>
                        </div>

                        <div className="h-px bg-gray-200 my-6"></div>

                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('profile.personal_info')}</h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500">{t('profile.voter_id')}</p>
                                        <p className="text-lg font-semibold text-gray-800">{user._id?.substring(0, 10).toUpperCase() || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{t('profile.reg_date')}</p>
                                        <p className="text-lg font-semibold text-gray-800">{new Date().toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">{t('profile.address')}</p>
                                        <p className="text-lg font-semibold text-gray-800">{t('profile.constituency')}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">{t('profile.voting_status')}</h3>
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${user.hasVoted ? 'bg-green-500' : 'bg-yellow-500'}`}>
                                            {user.hasVoted ? '✓' : '!'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800">{user.hasVoted ? t('profile.vote_cast') : t('profile.vote_pending')}</p>
                                            <p className="text-sm text-gray-500">{user.hasVoted ? t('profile.voted_desc') : t('profile.pending_desc')}</p>
                                        </div>
                                    </div>
                                    {!user.hasVoted && (
                                        <Link to="/dashboard" className="block w-full bg-gov-orange text-white py-2 rounded-lg font-bold shadow-md hover:bg-orange-600 transition text-center">
                                            {t('profile.booth_btn')}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default UserProfile;

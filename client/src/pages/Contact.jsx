import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Contact = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gov-bg pt-20">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('contact.title')}</h1>
                        <p className="text-gray-500">{t('contact.subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-gov-blue mb-6">{t('contact.form_title')}</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.name')}</label>
                                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.email')}</label>
                                    <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('contact.message')}</label>
                                    <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder={t('contact.subtitle')}></textarea>
                                </div>
                                <button className="w-full bg-gov-orange text-white font-bold py-3 rounded-lg shadow-lg hover:bg-orange-600 transition">
                                    {t('contact.send')}
                                </button>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col justify-center space-y-8"
                        >
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📍</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{t('contact.hq')}</h3>
                                    <p className="text-gray-600">{t('contact.hq_address')}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📞</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{t('contact.helpline')}</h3>
                                    <p className="text-gray-600 font-bold text-xl text-gov-blue">1950</p>
                                    <p className="text-sm text-gray-500">{t('contact.helpline_days')}</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">✉️</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">{t('contact.email_support')}</h3>
                                    <p className="text-gray-600">support@voteonline.gov.in</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

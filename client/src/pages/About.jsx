import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const About = () => {
    const { t } = useTranslation();
    return (
        <div className="min-h-screen bg-gov-bg pt-20">
            <div className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">{t('about.title')}</h1>
                        <div className="w-24 h-1 bg-gov-orange mx-auto rounded"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                        <h2 className="text-2xl font-bold text-gov-blue mb-4">{t('about.mission_title')}</h2>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            {t('about.mission_desc1')}
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            {t('about.mission_desc2')}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{t('about.security_title')}</h3>
                            <p className="text-gray-600">
                                {t('about.security_desc')}
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{t('about.transparency_title')}</h3>
                            <p className="text-gray-600">
                                {t('about.transparency_desc')}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;

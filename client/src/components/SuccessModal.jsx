import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SuccessModal = ({ isOpen, onClose, isOffline }) => {
    const { t } = useTranslation();
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 100 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-2xl text-center relative overflow-hidden"
                    >
                        {/* Celebrate Background Elements */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                            {[...Array(12)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 400, x: Math.random() * 400 - 200, rotate: 0 }}
                                    animate={{
                                        y: -100,
                                        rotate: 360,
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2 + Math.random() * 2,
                                        repeat: Infinity,
                                        delay: Math.random() * 2
                                    }}
                                    className={`absolute w-3 h-3 rounded-full ${['bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-400'][i % 4]}`}
                                />
                            ))}
                        </div>

                        {/* Stamping Seal Animation */}
                        <motion.div
                            className="relative z-10 flex justify-center mb-8"
                            initial={{ scale: 5, rotate: -45, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            transition={{
                                type: "spring",
                                damping: 12,
                                stiffness: 200,
                                delay: 0.2
                            }}
                        >
                            <div className="w-32 h-32 rounded-full bg-gov-orange/10 border-8 border-gov-orange flex items-center justify-center relative shadow-inner">
                                <motion.span
                                    className="text-6xl text-gov-orange font-black"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    卐
                                </motion.span>

                                {/* Seal Text Decoration */}
                                <div className="absolute inset-0 border-4 border-gov-orange/30 rounded-full scale-90 border-dashed animate-spin-slow"></div>
                            </div>

                            {/* "Stamped" Impact Ripple */}
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 0.4, delay: 0.35 }}
                                className="absolute inset-0 rounded-full border-4 border-gov-orange"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="relative z-10"
                        >
                            {isOffline && (
                                <div className="mb-4">
                                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-200">
                                        {t('success_modal.offline_badge')}
                                    </span>
                                </div>
                            )}
                            <h2 className="text-3xl font-black text-gray-900 mb-2">
                                {isOffline ? t('success_modal.offline_title') : t('success_modal.title')}
                            </h2>
                            <p className="text-gray-500 font-bold mb-8">
                                {isOffline ? t('success_modal.offline_subtitle') : t('success_modal.subtitle')}
                            </p>

                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-gov-blue text-white rounded-2xl font-black shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 px-8"
                            >
                                {t('success_modal.done_btn')}
                            </button>
                        </motion.div>

                        <div className="mt-6 text-[10px] font-black uppercase tracking-widest text-gray-400 relative z-10">
                            {t('success_modal.seal_text')}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SuccessModal;

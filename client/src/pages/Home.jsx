import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation();
    const [elections, setElections] = useState([]);
    const { user } = useAuth();

    useEffect(() => {
        axios.get('http://localhost:5000/api/elections')
            .then(res => setElections(res.data))
            .catch(err => console.error(err));
    }, [user]);


    const ongoingElections = elections.filter(e => e.status === 'ongoing');


    return (
        <div className="min-h-screen bg-gov-bg font-sans">

            {/* Hero Section */}
            <header className="relative bg-[#0b0d17] text-white overflow-hidden pb-32">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567154215-6807e3cedb1a?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-100"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d17]/60 via-transparent to-[#0b0d17]/90"></div>

                <div className="container mx-auto px-6 py-20 md:py-32 relative z-10 flex flex-col items-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="bg-white/10 backdrop-blur-md border border-white/20 text-blue-100 px-4 py-1.5 rounded-full text-sm font-semibold uppercase tracking-wider mb-6 inline-block">
                            {t('home.hero.subtitle')}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                            {t('home.hero.title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
                            {t('home.hero.desc')}
                        </p>
                    </motion.div>

                    {/* Registration/Actions Cards */}
                    <div className="grid md:grid-cols-2 gap-6 w-full max-w-5xl mt-8">
                        {/* Live Elections Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition group text-left relative overflow-hidden flex flex-col justify-between"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-3xl shadow-lg">
                                        🗳️
                                    </div>
                                    <span className="bg-green-500 animate-pulse text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">{t('home.vote_card.live_now')}</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">{t('home.vote_card.title')}</h3>
                                <p className="text-blue-100 mb-6 font-medium">
                                    {ongoingElections.length > 0
                                        ? `${ongoingElections.length} ${t('home.vote_card.active_elections')}`
                                        : t('home.vote_card.no_active')}
                                    <br />
                                    <span className="text-xs mt-2 block opacity-70 italic font-bold text-yellow-300">{t('home.vote_card.security_note')}</span>
                                </p>


                                <div className="space-y-3 mb-6">
                                    {ongoingElections.slice(0, 3).map(e => (
                                        <Link key={e._id} to={`/vote/${e._id}`} className="flex items-center justify-between bg-white/5 hover:bg-white/20 p-3 rounded-xl border border-white/10 transition-all group/item">
                                            <span className="font-bold truncate max-w-[200px]">{e.title}</span>
                                            <span className="text-gov-orange font-bold text-xs group-hover/item:translate-x-1 transition-transform">{t('home.vote_card.vote_btn')} &rarr;</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        {/* Candidate Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-gov-orange to-red-600 rounded-2xl p-8 hover:shadow-2xl hover:shadow-orange-500/30 transition group text-left relative overflow-hidden"
                        >
                            <div className="absolute bottom-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center text-3xl mb-4 text-white">
                                    🤝
                                </div>
                                <h3 className="text-2xl font-bold mb-2 text-white">{t('home.nomination_card.title')}</h3>
                                <p className="text-orange-100 mb-6 h-12">{t('home.nomination_card.desc')}</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow-lg transform active:scale-95">
                                        {t('home.nomination_card.apply_btn')}
                                    </Link>
                                    <Link to="/candidate/login" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/50 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                                        {t('home.nomination_card.login_btn')}
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Wave Decoration */}
                <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none z-10">
                    <svg className="relative block w-[calc(100%+1.3px)] h-[100px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-blue-50"></path>
                    </svg>
                </div>
            </header>



            {/* Features (Updated Design) */}
            <section className="py-20 bg-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">{t('home.features.title')}</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">{t('home.features.subtitle')}</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: "🔒", title: t('home.features.security_title'), desc: t('home.features.security_desc') },
                            { icon: "⚡", title: t('home.features.results_title'), desc: t('home.features.results_desc') },
                            { icon: "🌍", title: t('home.features.access_title'), desc: t('home.features.access_desc') },
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -10 }}
                                className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition border border-gray-100"
                            >
                                <div className="text-5xl mb-6 bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center text-gov-blue">{feature.icon}</div>
                                <h3 className="text-xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Information Sections */}
            <section className="py-20 bg-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16 mb-24">
                        <div className="lg:w-1/2">
                            <h2 className="text-4xl font-bold text-gov-blue mb-6">{t('home.mission.title')}</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                {t('home.mission.desc')}
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">{t('home.mission.point1')}</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">{t('home.mission.point2')}</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">{t('home.mission.point3')}</p>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-600/5 rounded-full blur-3xl"></div>
                            <img src="https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=800&q=80" alt="Voting" className="relative z-10 rounded-3xl shadow-2xl border-4 border-white" />
                        </div>
                    </div>

                    <div className="bg-[#0b0d17] rounded-[3rem] p-12 lg:p-20 text-white relative overflow-hidden shadow-3xl shadow-blue-500/20">
                        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1567154215-6807e3cedb1a?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-40"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10 text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 italic">{t('home.quote.text')}</h2>
                            <p className="text-xl text-blue-100 mb-12 font-light">
                                {t('home.quote.desc')}
                            </p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">2.4M+</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">{t('home.stats.voters')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">100%</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">{t('home.stats.uptime')}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">AES-256</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">{t('home.stats.protection')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Voting Process section */}
            <section className="py-20 bg-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16 underline-offset-8">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 font-outfit">{t('home.process.title')}</h2>
                        <div className="w-24 h-1.5 bg-gov-orange mx-auto rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: t('home.process.step1_title'), icon: "🆔", desc: t('home.process.step1_desc') },
                            { step: "02", title: t('home.process.step2_title'), icon: "🔢", desc: t('home.process.step2_desc') },
                            { step: "03", title: t('home.process.step3_title'), icon: "🎥", desc: t('home.process.step3_desc') },
                            { step: "04", title: t('home.process.step4_title'), icon: "🔘", desc: t('home.process.step4_desc') }
                        ].map((s, i) => (
                            <div key={i} className="relative group">
                                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm group-hover:shadow-xl transition h-full">
                                    <span className="text-gray-100 text-6xl font-black absolute top-4 right-4 group-hover:text-blue-50 transition">{s.step}</span>
                                    <div className="text-4xl mb-6 relative z-10">{s.icon}</div>
                                    <h3 className="text-xl font-bold mb-2 relative z-10">{s.title}</h3>
                                    <p className="text-gray-500 text-sm leading-relaxed relative z-10">{s.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;

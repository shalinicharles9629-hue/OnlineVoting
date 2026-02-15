import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Home = () => {
    const [elections, setElections] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/elections')
            .then(res => setElections(res.data))
            .catch(err => console.error(err));
    }, []);

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
                            Election Portal of India
                        </span>
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight">
                            Democracy <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-gov-orange">Digitized.</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
                            Cast your vote securely using OTP and Face Recognition. No application required—verified voters are pre-listed for maximum security.

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
                                    <span className="bg-green-500 animate-pulse text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Live Now</span>
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Cast Your Vote</h3>
                                <p className="text-blue-100 mb-6 font-medium">
                                    {ongoingElections.length > 0
                                        ? `${ongoingElections.length} Active elections. Choose one to participate.`
                                        : "No elections are currently active. Check back later."}
                                    <br />
                                    <span className="text-xs mt-2 block opacity-70 italic font-bold text-yellow-300">Verified identity required via OTP + Live Face Match.</span>
                                </p>


                                <div className="space-y-3 mb-6">
                                    {ongoingElections.slice(0, 3).map(e => (
                                        <Link key={e._id} to={`/vote/${e._id}`} className="flex items-center justify-between bg-white/5 hover:bg-white/20 p-3 rounded-xl border border-white/10 transition-all group/item">
                                            <span className="font-bold truncate max-w-[200px]">{e.title}</span>
                                            <span className="text-gov-orange font-bold text-xs group-hover/item:translate-x-1 transition-transform">Vote &rarr;</span>
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
                                <h3 className="text-2xl font-bold mb-2 text-white">Candidate Nomination</h3>
                                <p className="text-orange-100 mb-6 h-12">Apply to stand for elections and represent your constituency. (Registered Candidates only)</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-50 transition shadow-lg transform active:scale-95">
                                        Nominate Me
                                    </Link>
                                    <Link to="/candidate/login" className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white/50 text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition">
                                        Candidate Login
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

            {/* Live Trends Section */}
            {elections.some(e => (e.status === 'ongoing' && e.showLiveResults) || e.resultsPublished) && (
                <section className="py-24 bg-white relative overflow-hidden">
                    {/* Background Accents */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -mr-48 -mt-48 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-orange-50 rounded-full blur-3xl -ml-48 -mb-48 opacity-50"></div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="max-w-3xl mb-16">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <span className="inline-flex items-center gap-2 bg-gov-blue/10 text-gov-blue px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-gov-blue/10">
                                    <span className="w-2 h-2 bg-gov-blue rounded-full animate-pulse"></span>
                                    Pulse of the Nation
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
                                    Live Election <span className="text-transparent bg-clip-text bg-gradient-to-r from-gov-blue to-blue-600">Analytics.</span>
                                </h2>
                                <p className="text-xl text-gray-600 leading-relaxed font-light">
                                    Transparency in every vote. Access verified real-time statistics and historical data released by the Election Commission.
                                </p>
                            </motion.div>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {elections.filter(e => (e.status === 'ongoing' && e.showLiveResults) || e.resultsPublished).map((elec, idx) => (
                                <motion.div
                                    key={elec._id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    viewport={{ once: true }}
                                    whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.1)" }}
                                    className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl transition-all h-full flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="w-16 h-16 bg-gradient-to-br from-gov-blue to-blue-700 text-white rounded-2xl flex items-center justify-center text-3xl shadow-lg ring-4 ring-blue-50">
                                                {elec.status === 'ongoing' ? '📈' : '🏆'}
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${elec.status === 'ongoing'
                                                    ? 'bg-green-50 text-green-600 border-green-100'
                                                    : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {elec.status === 'ongoing' ? 'Ongoing' : 'Completed'}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-gov-blue transition-colors line-clamp-1">{elec.title}</h3>
                                        <p className="text-gray-600 mb-8 line-clamp-3 font-medium opacity-80">{elec.description || 'Verified voting statistics and distribution patterns.'}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-between">
                                            <span className="text-sm font-bold text-gray-500 uppercase tracking-tighter">Status</span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {elec.status === 'ongoing' ? 'Live Trending' : 'Results Published'}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/results/${elec._id}`}
                                            className="w-full inline-flex items-center justify-center gap-3 bg-gray-900 hover:bg-gov-blue text-white py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg group"
                                        >
                                            View Analytics
                                            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Features (Updated Design) */}
            <section className="py-20 bg-blue-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why DigiVote?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">Digitizing democracy with security, speed, and absolute transparency.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-10">
                        {[
                            { icon: "🔒", title: "High Security", desc: "End-to-end encryption ensures your vote remains anonymous and tamper-proof." },
                            { icon: "⚡", title: "Instant Results", desc: "Automated counting delivers real-time results immediately after polling ends." },
                            { icon: "🌍", title: "Accessible Anywhere", desc: "Vote from the comfort of your home or anywhere in the world." },
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
                            <h2 className="text-4xl font-bold text-gov-blue mb-6">Our Mission for a Digital India</h2>
                            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                                Our goal is to empower every Indian citizen with a seamless, secure, and modern voting experience. We believe that technology can break barriers to participation and ensure that every voice is heard without compromise.
                            </p>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">100% ID verification through Aadhaar or Voter ID links.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">Transparent application review process for all candidates.</p>
                                </div>
                                <div className="flex items-start gap-4">
                                    <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-1 flex-shrink-0">✓</div>
                                    <p className="text-gray-700 font-medium">Real-time tracking of voter turnout and demographic stats.</p>
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
                            <h2 className="text-4xl lg:text-5xl font-bold mb-8 italic">"The ballot is stronger than the bullet."</h2>
                            <p className="text-xl text-blue-100 mb-12 font-light">
                                In 2026, we are taking this power to the digital age. Your vote is anonymized using advanced cryptographic protocols, ensuring that even the administrators cannot see who you voted for.
                            </p>
                            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">2.4M+</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">Verified Voters</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">100%</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">Uptime Record</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-4xl font-bold mb-1">AES-256</p>
                                    <p className="text-blue-300 uppercase tracking-widest text-sm font-bold">Vote Protection</p>
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
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 font-outfit">How Digital Voting Works</h2>
                        <div className="w-24 h-1.5 bg-gov-orange mx-auto rounded-full"></div>
                    </div>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: "01", title: "Identity", icon: "🆔", desc: "Enter your pre-registered Email or Phone number to request a secure OTP." },
                            { step: "02", title: "OTP", icon: "🔢", desc: "Verify your request with the 6-digit code sent to your linked device." },
                            { step: "03", title: "Face ID", icon: "🎥", desc: "Complete biometric matching against your official photo in the database." },
                            { step: "04", title: "Ballot", icon: "🔘", desc: "Safely cast your vote once high-security verification is successful." }
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

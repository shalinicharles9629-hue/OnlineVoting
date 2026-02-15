import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
    const { user } = useAuth();
    const [elections, setElections] = useState([]);

    const [application, setApplication] = useState(null);
    const [loadingApp, setLoadingApp] = useState(false);

    useEffect(() => {
        fetchElections();
        if (user) {
            fetchApplication();
        }
    }, [user]);

    const fetchElections = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/elections');
            setElections(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchApplication = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setLoadingApp(true);
        try {
            const res = await axios.get('http://localhost:5000/api/candidates/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplication(res.data);
        } catch (error) {
            console.error("No candidate application found or error fetching.");
        } finally {
            setLoadingApp(false);
        }
    };

    return (
        <div className="min-h-screen bg-gov-bg p-6 md:p-12">
            <div className="container mx-auto max-w-6xl">
                {/* Welcome Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-center mb-12 bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">
                            Welcome, <span className="text-gov-blue">{user?.name}</span>
                        </h1>
                        <p className="text-gray-500 mt-1 capitalize">Role: <span className="font-semibold text-gov-orange">{user?.role}</span></p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <div className="bg-blue-50 text-gov-blue px-6 py-3 rounded-xl font-bold border border-blue-100 flex items-center gap-2">
                            <span>🆔</span> ID Verified
                        </div>
                    </div>
                </motion.div>

                {/* Admin Actions */}
                {user?.role === 'admin' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                            <span className="bg-gov-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">🛠</span> Admin Control Panel
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition">
                                <h3 className="text-xl font-bold mb-2">Create New Election</h3>
                                <p className="text-gray-500 mb-6">Launch a new voting event with custom parameters.</p>
                                <Link to="/admin/create-election" className="block text-center bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold w-full transition">
                                    + Create Election
                                </Link>
                            </div>
                            <div className="bg-white p-8 rounded-xl shadow-md border-l-4 border-yellow-500 hover:shadow-lg transition">
                                <h3 className="text-xl font-bold mb-2">Manage Candidates</h3>
                                <p className="text-gray-500 mb-6">Review and approve candidate applications.</p>
                                <Link to="/admin/applications" className="block text-center bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg font-semibold w-full transition">
                                    View Applications
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Candidate Portal / Application Status Section */}
                {(user?.role === 'candidate' || application) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-12"
                    >
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="bg-gov-orange p-4 text-white font-bold text-lg flex justify-between items-center">
                                <span>Candidate Portal</span>
                                {application?.symbol && (
                                    <span className="bg-white/20 px-3 py-1 rounded-lg text-sm">Assigned Symbol: {application.symbol}</span>
                                )}
                            </div>
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-3xl overflow-hidden border-2 border-gray-100">
                                        {application?.photoUrl ? (
                                            <img src={`http://localhost:5000${application.photoUrl}`} alt="Me" className="w-full h-full object-cover" />
                                        ) : "👤"}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-xl font-bold text-gray-800">Application Status</h3>
                                        <p className="text-gray-500">
                                            {application
                                                ? `Submitted on ${new Date(application.createdAt).toLocaleDateString()}`
                                                : "No active application found."}
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        {application?.isApproved ? (
                                            <div className="flex flex-col items-end">
                                                <span className="bg-green-100 text-green-800 px-4 py-1 rounded-full text-sm font-bold border border-green-200">Approved</span>
                                                <p className="text-[10px] text-green-600 mt-1 font-bold uppercase tracking-wider">Ready for Election</p>
                                            </div>
                                        ) : application?.rejectionReason ? (
                                            <div className="flex flex-col items-end">
                                                <span className="bg-red-100 text-red-800 px-4 py-1 rounded-full text-sm font-bold border border-red-200">Rejected</span>
                                                <p className="text-[10px] text-red-500 mt-1 max-w-[150px] text-right truncate" title={application.rejectionReason}>Reason: {application.rejectionReason}</p>
                                            </div>
                                        ) : application ? (
                                            <div className="flex flex-col items-end">
                                                <span className="bg-yellow-100 text-yellow-800 px-4 py-1 rounded-full text-sm font-bold border border-yellow-200 animate-pulse">Pending Approval</span>
                                                <p className="text-[10px] text-yellow-600 mt-1 uppercase font-bold tracking-wider">Under Review</p>
                                            </div>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-500 px-4 py-1 rounded-full text-sm font-bold">Not Applied</span>
                                        )}
                                    </div>
                                </div>
                                {application?.rejectionReason && (
                                    <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-red-800 text-sm font-semibold mb-1">Feedback from Admin:</p>
                                        <p className="text-red-700 text-sm italic">"{application.rejectionReason}"</p>
                                        <Link to="/apply" className="inline-block mt-3 text-red-600 text-xs font-bold underline hover:text-red-800">
                                            Re-apply with corrections
                                        </Link>
                                    </div>
                                )}
                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <Link to="/apply" className="text-gov-blue hover:text-blue-800 font-semibold flex items-center gap-2 justify-center border border-dashed border-blue-300 p-4 rounded-lg bg-blue-50 hover:bg-blue-100 transition">
                                        📝 {application ? "View/Update Nomination Form" : "Complete Nomination Form"}
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Voter to Candidate Application CTA - Only show if NO application exists */}
                {user?.role === 'voter' && !application && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mb-12 bg-gradient-to-r from-gov-blue to-blue-700 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl md:text-3xl font-bold mb-2">Want to Represent Your People?</h2>
                                <p className="text-blue-100 md:max-w-xl">
                                    If you meet the eligibility criteria, you can apply to become a candidate in the upcoming elections. Your voice matters!
                                </p>
                            </div>
                            <Link
                                to="/apply"
                                className="bg-white text-gov-blue hover:bg-gov-orange hover:text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 whitespace-nowrap"
                            >
                                📝 Apply as Candidate
                            </Link>
                        </div>
                    </motion.div>
                )}

                {/* Active Elections Grid */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                        <span className="bg-gov-blue text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">🗳</span> Active Elections
                    </h2>

                    {elections.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {elections.map((election, idx) => (
                                <motion.div
                                    key={election._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition border border-gray-100 flex flex-col h-full"
                                >
                                    <div className={`h-2 rounded-t-xl ${election.status === 'ongoing' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                    <div className="p-6 flex-grow">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-bold text-gray-800 line-clamp-2">{election.title}</h3>
                                            <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${election.status === 'ongoing' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {election.status}
                                            </span>
                                        </div>
                                        <p className="text-gray-500 text-sm mb-6 line-clamp-3">{election.description}</p>
                                        <div className="space-y-3">
                                            {election.status === 'ongoing' && (
                                                <Link to={`/vote/${election._id}`} className="block w-full bg-gov-blue hover:bg-blue-800 text-white text-center py-3 rounded-lg font-bold shadow-md transition transform hover:-translate-y-1">
                                                    👉 Vote Now
                                                </Link>
                                            )}
                                            {election.status === 'ongoing' ? (
                                                <Link to={`/results/${election._id}`} className="block w-full bg-white border border-green-200 hover:bg-green-50 text-green-700 text-center py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    View Live Trends
                                                </Link>
                                            ) : (
                                                <Link
                                                    to={`/results/${election._id}`}
                                                    className={`block w-full border text-center py-3 rounded-lg font-semibold transition ${(election.status === 'ended' && !election.resultsPublished) || election.status === 'upcoming'
                                                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                                                        : 'bg-white border-gray-300 hover:bg-gray-50 text-gray-700'
                                                        }`}
                                                    onClick={(e) => {
                                                        if ((election.status === 'ended' && !election.resultsPublished) || election.status === 'upcoming') {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    {election.status === 'ended' && !election.resultsPublished
                                                        ? 'Results Pending'
                                                        : election.status === 'upcoming'
                                                            ? 'Not Started'
                                                            : 'View Official Results'}
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 flex justify-between items-center rounded-b-xl">
                                        <span>ID: {election._id.slice(-6)}</span>
                                        <span>Official</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-12 rounded-xl shadow-sm text-center border dashed border-gray-300">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-bold text-gray-400">No Active Elections</h3>
                            <p className="text-gray-500">Check back later for upcoming voting events.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

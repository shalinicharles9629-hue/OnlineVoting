import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalCandidates: 0,
        pendingApplications: 0,
        approvedCandidates: 0
    });
    const [elections, setElections] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [statsRes, electionsRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get('http://localhost:5000/api/elections', {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);
            setStats(statsRes.data);
            setElections(electionsRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching admin data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/elections/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData();
        } catch (error) {
            console.error('Error updating election status:', error);
            alert('Failed to update status');
        }
    };

    const handlePublishResults = async (id, currentStatus, electionTitle) => {
        const action = currentStatus ? 'unpublish' : 'publish';
        const confirmMessage = currentStatus
            ? `Are you sure you want to UNPUBLISH results for "${electionTitle}"?\n\nVoters will no longer be able to see the results.`
            : `Are you sure you want to PUBLISH results for "${electionTitle}"?\n\nThis will make the results visible to all voters.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/elections/${id}/publish-results`,
                { publish: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert(`Results ${action}ed successfully!`);
            fetchData();
        } catch (error) {
            console.error('Error publishing results:', error);
            alert(`Failed to ${action} results`);
        }
    };

    const handleToggleLiveResults = async (id, currentStatus, title) => {
        const action = currentStatus ? 'hide' : 'publicize';
        const confirmMessage = currentStatus
            ? `Hide live trends for "${title}"? Only admins will see them.`
            : `Make live trends for "${title}" public? Everyone will see them on the home page.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`http://localhost:5000/api/elections/${id}/toggle-live-results`,
                { showLiveResults: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            console.error('Error toggling live results:', error);
            alert(`Failed to ${action} live trends`);
        }
    };

    const cards = [
        { title: 'Total Candidates', value: stats.totalCandidates, icon: '👥', color: 'bg-blue-500' },
        { title: 'Pending Applications', value: stats.pendingApplications, icon: '⏳', color: 'bg-yellow-500' },
        { title: 'Approved Candidates', value: stats.approvedCandidates, icon: '✅', color: 'bg-green-500' },
    ];

    return (
        <AdminLayout>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Election Overview</h1>
                <p className="text-gray-500">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5"
                    >
                        <div className={`${card.color} w-14 h-14 rounded-xl flex items-center justify-center text-2xl text-white shadow-inner`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{card.title}</p>
                            <p className="text-3xl font-bold text-gray-900">{loading ? '...' : card.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link to="/admin/applications" className="p-4 bg-gray-50 rounded-xl hover:bg-gov-blue hover:text-white transition-all group border border-gray-100">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                            <p className="font-bold">Review Apps</p>
                            <p className="text-xs opacity-70">Check candidate forms</p>
                        </Link>
                        <Link to="/admin/create-election" className="p-4 bg-gray-50 rounded-xl hover:bg-green-600 hover:text-white transition-all group border border-gray-100">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</div>
                            <p className="font-bold">New Election</p>
                            <p className="text-xs opacity-70">Launch voting event</p>
                        </Link>
                        <Link to="/admin/news" className="p-4 bg-gray-50 rounded-xl hover:bg-gov-orange hover:text-white transition-all group border border-gray-100">
                            <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">📰</div>
                            <p className="font-bold">Post News</p>
                            <p className="text-xs opacity-70">Update election feed</p>
                        </Link>
                    </div>
                </div>

                {/* Election Management */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-6">Live Election Controls</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                        {elections.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No elections created yet.</p>
                        ) : (
                            elections.map((elec) => (
                                <div key={elec._id} className="p-4 border border-gray-100 rounded-xl bg-gray-50">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <p className="font-bold text-gray-800">{elec.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-2 h-2 rounded-full ${elec.status === 'ongoing' ? 'bg-green-500 animate-pulse' :
                                                    elec.status === 'ended' ? 'bg-red-500' : 'bg-yellow-500'
                                                    }`}></span>
                                                <span className="text-xs font-medium uppercase text-gray-500">{elec.status}</span>
                                                <span className="ml-2 text-xs font-bold text-gov-blue">
                                                    👥 {elec.candidateCount} {elec.candidateLimit > 0 ? `/ ${elec.candidateLimit}` : ''}
                                                </span>
                                                {elec.resultsPublished && (
                                                    <span className="ml-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                        📊 Published
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {elec.status === 'upcoming' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(elec._id, 'ongoing')}
                                                    className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-all"
                                                >
                                                    Start
                                                </button>
                                            )}
                                            {elec.status === 'ongoing' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(elec._id, 'ended')}
                                                    className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                                                >
                                                    End
                                                </button>
                                            )}
                                            {elec.status === 'ended' && (
                                                <span className="text-xs text-gray-400 font-bold italic">Closed</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Results & Trends Controls */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                                        {elec.status === 'ongoing' && (
                                            <button
                                                onClick={() => handleToggleLiveResults(elec._id, elec.showLiveResults, elec.title)}
                                                className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${elec.showLiveResults
                                                    ? 'bg-orange-100 text-orange-700 border border-orange-200 hover:bg-orange-200'
                                                    : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {elec.showLiveResults ? '📈 Live Trends Public (Visible)' : '📉 Live Trends Private (Admin Only)'}
                                            </button>
                                        )}

                                        {elec.status === 'ended' && (
                                            <button
                                                onClick={() => handlePublishResults(elec._id, elec.resultsPublished, elec.title)}
                                                className={`w-full px-3 py-2 text-xs font-bold rounded-lg transition-all ${elec.resultsPublished
                                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                    }`}
                                            >
                                                {elec.resultsPublished ? '🔒 Unpublish Results' : '📢 Publish Results'}
                                            </button>
                                        )}

                                        {/* Always allow admin to view current trends */}
                                        <Link
                                            to={`/results/${elec._id}`}
                                            className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-center block"
                                        >
                                            👁️ View Current Stats
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;

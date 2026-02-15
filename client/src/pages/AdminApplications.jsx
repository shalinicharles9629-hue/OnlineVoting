import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { Link } from 'react-router-dom';

const AdminApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/admin/applications', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setApplications(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching applications:', error);
            setLoading(false);
        }
    };

    const filteredApps = applications.filter(app => {
        if (filter === 'all') return true;
        if (filter === 'pending') return !app.isApproved && !app.rejectionReason;
        if (filter === 'approved') return app.isApproved;
        if (filter === 'rejected') return !!app.rejectionReason;
        return true;
    });

    return (
        <AdminLayout>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Candidate Applications</h1>
                    <p className="text-gray-500">Review and manage candidate nominations</p>
                </div>
                <div className="flex gap-2 bg-white p-1 rounded-lg border border-gray-200">
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${filter === f ? 'bg-gov-blue text-white' : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Candidate</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Party</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Constituency</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading applications...</td></tr>
                        ) : filteredApps.length === 0 ? (
                            <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-500">No applications found.</td></tr>
                        ) : filteredApps.map((app) => (
                            <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={`http://localhost:5000${app.photoUrl || '/uploads/default.png'}`}
                                            alt={app.name}
                                            className="w-10 h-10 rounded-full object-cover border border-gray-200 bg-gray-100"
                                            onError={(e) => e.target.src = 'https://via.placeholder.com/40'}
                                        />
                                        <div>
                                            <p className="font-bold text-gray-900">{app.name}</p>
                                            <p className="text-xs text-gray-500">{app.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-medium">{app.party}</td>
                                <td className="px-6 py-4 text-gray-600">{app.constituency}</td>
                                <td className="px-6 py-4">
                                    {app.isApproved ? (
                                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Approved</span>
                                    ) : app.rejectionReason ? (
                                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Rejected</span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <Link
                                        to={`/admin/applications/${app._id}`}
                                        className="text-gov-blue hover:text-blue-800 font-bold text-sm underline"
                                    >
                                        View Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
};

export default AdminApplications;

import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const AdminApplicationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [app, setApp] = useState(null);
    const [loading, setLoading] = useState(true);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [symbol, setSymbol] = useState('');
    const [takenSymbols, setTakenSymbols] = useState([]);

    const token = localStorage.getItem('token');

    const symbols = [
        { name: 'Cycle', icon: '🚲' },
        { name: 'Lotus', icon: '🪷' },
        { name: 'Hand', icon: '✋' },
        { name: 'Car', icon: '🚗' },
        { name: 'Elephant', icon: '🐘' },
        { name: 'Sun', icon: '☀️' },
        { name: 'Broom', icon: '🧹' },
        { name: 'Clock', icon: '⏰' },
    ];

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const fetchDetail = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/admin/applications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const applicationData = response.data;
            setApp(applicationData);
            setSymbol(applicationData.symbol || '');

            // Fetch all candidates for this election to check taken symbols
            try {
                const candidatesResponse = await axios.get(`http://localhost:5000/api/candidate/election/${applicationData.electionId}`);
                const others = candidatesResponse.data.filter(c => c._id !== id);
                setTakenSymbols(others.map(c => c.symbol).filter(Boolean));
            } catch (err) {
                console.error('Error fetching sibling candidates:', err);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching detail:', error);
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (approved) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/applications/${id}/status`, {
                isApproved: approved,
                rejectionReason: approved ? '' : rejectionReason
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Show success message with email notification
            if (approved) {
                alert(`✅ Candidate approved successfully!\n\n📧 Approval email has been sent to: ${app.email}`);
            } else {
                alert(`❌ Application rejected.\n\n📧 Rejection email has been sent to: ${app.email}`);
            }

            fetchDetail();
            setShowRejectForm(false);
        } catch (error) {
            alert('Error updating status');
        }
    };

    const handleAssignSymbol = async (sName) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin/applications/${id}/symbol`, {
                symbol: sName
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSymbol(sName);
            alert('Symbol assigned successfully!');
            fetchDetail();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Error assigning symbol';
            alert(`⚠️ ${errorMsg}`);
        }
    };

    if (loading) return <AdminLayout><div className="flex justify-center p-20">Loading...</div></AdminLayout>;
    if (!app) return <AdminLayout><div className="flex justify-center p-20 text-red-500">Application not found</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    ← Back
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Application Detail</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Info Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex gap-6 mb-8">
                            <img
                                src={`http://localhost:5000${app.photoUrl}`}
                                alt={app.name}
                                className="w-32 h-32 rounded-xl object-cover border-2 border-gray-100 shadow-md"
                                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
                            />
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{app.name}</h2>
                                <p className="text-gov-blue font-bold text-lg mb-2">{app.party}</p>
                                <div className="flex gap-4">
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">Age: {app.age}</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">Gender: {app.gender}</span>
                                    <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-semibold">Constituency: {app.constituency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 text-sm">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-500 font-medium border-b mb-1 pb-1">Personal & Family</p>
                                    <p><span className="font-semibold">DOB:</span> {new Date(app.dob).toLocaleDateString()}</p>
                                    <p><span className="font-semibold">Mobile:</span> {app.mobile}</p>
                                    <p><span className="font-semibold">Email:</span> {app.email}</p>
                                    <p><span className="font-semibold">Address:</span> {app.address}, {app.city}, {app.state}</p>
                                    <p><span className="font-semibold">Blood Group:</span> {app.bloodGroup}</p>
                                    <div className="mt-2 text-xs">
                                        <p><span className="font-semibold">Father:</span> {app.fatherName}</p>
                                        <p><span className="font-semibold">Mother:</span> {app.motherName}</p>
                                        <p><span className="font-semibold">Spouse:</span> {app.spouseName || 'N/A'}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium border-b mb-1 pb-1">Education</p>
                                    <p className="font-bold">{app.qualification}</p>
                                    <p>{app.university}</p>
                                    <p>Passing Year: {app.passingYear} ({app.percentage}%)</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-gray-500 font-medium border-b mb-1 pb-1">Identity & Financials</p>
                                    <p><span className="font-semibold">Aadhaar:</span> {app.aadhaar}</p>
                                    <p><span className="font-semibold">Voter ID:</span> {app.voterId}</p>
                                    <p><span className="font-semibold">PAN:</span> {app.pan || 'N/A'}</p>
                                    <p><span className="font-semibold">Annual Income:</span> ₹{app.familyIncome?.toLocaleString()}</p>
                                    <p><span className="font-semibold">Assets Value:</span> ₹{app.assetsValue?.toLocaleString()}</p>
                                    <p className="text-red-600 font-bold mt-1">Criminal Record: {app.criminalRecord}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 font-medium border-b mb-1 pb-1">Election Preference</p>
                                    <p><span className="font-semibold">Symbol Pref:</span> {app.symbolPreference || 'No Preference'}</p>
                                    <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-100">
                                        <p className="font-bold text-xs uppercase text-blue-700 mb-1">Manifesto:</p>
                                        <p className="text-xs italic leading-relaxed">"{app.manifesto || 'No manifesto provided.'}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents section */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Supporting Documents</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-center">
                            {['idProofUrl', 'educationCertUrl', 'incomeCertUrl', 'communityCertUrl', 'signatureUrl'].map((field) => (
                                <a
                                    key={field}
                                    href={`http://localhost:5000${app[field]}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-3 border border-gray-200 rounded-lg hover:border-gov-blue hover:text-gov-blue transition-all"
                                >
                                    View {field.replace('Url', '').replace(/([A-Z])/g, ' $1')}
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="space-y-6">
                    {/* Status Management */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold mb-4">Application Status</h3>

                        {!app.isApproved && !app.rejectionReason && (
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleStatusUpdate(true)}
                                    className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition shadow-lg"
                                >
                                    Approve Candidate
                                </button>
                                <button
                                    onClick={() => setShowRejectForm(true)}
                                    className="w-full bg-gray-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition border border-red-100"
                                >
                                    Reject Application
                                </button>

                                {showRejectForm && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 space-y-2">
                                        <textarea
                                            placeholder="Reason for rejection..."
                                            className="w-full p-3 border border-gray-300 rounded-lg text-sm"
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                        />
                                        <div className="flex gap-2">
                                            <button onClick={() => handleStatusUpdate(false)} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-bold">Confirm Reject</button>
                                            <button onClick={() => setShowRejectForm(false)} className="flex-1 bg-gray-200 py-2 rounded-lg text-sm font-bold">Cancel</button>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {app.isApproved && (
                            <div className="bg-green-50 p-4 rounded-xl text-green-700 border border-green-100 flex flex-col items-center">
                                <span className="text-3xl mb-2">✅</span>
                                <p className="font-bold">Approved</p>
                                <p className="text-xs text-center opacity-70">This candidate will appear on the voting ballot once a symbol is assigned.</p>
                            </div>
                        )}

                        {app.rejectionReason && (
                            <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-100">
                                <p className="font-bold flex items-center gap-2">❌ Rejected</p>
                                <p className="text-sm mt-2 font-medium">Reason:</p>
                                <p className="text-sm italic">"{app.rejectionReason}"</p>
                                <button onClick={() => handleStatusUpdate(true)} className="mt-4 text-xs font-bold underline">Change to Approve</button>
                            </div>
                        )}
                    </div>

                    {/* Symbol Assignment */}
                    {app.isApproved && (
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold mb-4">Symbol Assignment</h3>
                            <div className="grid grid-cols-4 gap-3">
                                {symbols.map((sym) => {
                                    const isTaken = takenSymbols.includes(sym.name);
                                    return (
                                        <button
                                            key={sym.name}
                                            disabled={isTaken}
                                            onClick={() => handleAssignSymbol(sym.name)}
                                            className={`w-full aspect-square flex flex-col items-center justify-center rounded-xl border-2 transition-all ${symbol === sym.name
                                                ? 'border-gov-orange bg-orange-50 text-gov-orange scale-105 shadow-md'
                                                : isTaken
                                                    ? 'border-gray-50 bg-gray-50 opacity-40 cursor-not-allowed'
                                                    : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                        >
                                            <span className="text-2xl">{sym.icon}</span>
                                            <span className="text-[10px] font-bold uppercase mt-1 text-center">{sym.name}</span>
                                            {isTaken && (
                                                <span className="text-[7px] text-red-600 font-black mt-1 bg-red-50 px-1 rounded">TAKEN</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {symbol && (
                                <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
                                    <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-1">Assigned Symbol</p>
                                    <p className="text-2xl font-bold flex items-center justify-center gap-2">
                                        {symbols.find(s => s.name === symbol)?.icon} {symbol}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminApplicationDetail;

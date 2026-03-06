import React, { useState, useEffect, useRef, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import * as faceapi from 'face-api.js';


const AdminVoters = () => {
    const [voters, setVoters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [adding, setAdding] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Form states
    const [newVoter, setNewVoter] = useState({ name: '', email: '', phone: '' });
    const [photo, setPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [error, setError] = useState('');
    const [repairingId, setRepairingId] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const handleRepairBiometrics = async (voter) => {
        if (!voter.photo) return;
        setRepairingId(voter._id);

        try {
            // 1. Load the existing image
            const imgUrl = `http://localhost:5000${voter.photo}`;
            const img = await faceapi.fetchImage(imgUrl);

            // 2. Perform detection
            const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                alert('No face detected in the profile photo. Please upload a new one.');
                return;
            }

            // 3. Update backend
            const token = localStorage.getItem('token');
            const res = await axios.patch(`http://localhost:5000/api/admin/voters/${voter._id}/biometrics`, {
                faceDescriptor: JSON.stringify(Array.from(detection.descriptor))
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 4. Update state
            setVoters(voters.map(v => v._id === voter._id ? res.data : v));
            alert(`Biometrics successfully repaired for ${voter.name}!`);
        } catch (err) {
            console.error('Repair failed:', err);
            alert('Failed to repair biometrics: ' + (err.response?.data?.error || err.message));
        } finally {
            setRepairingId(null);
        }
    };

    const fetchVoters = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/admin/voters', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVoters(res.data);
            setLastUpdated(new Date());
            setLoading(false);
        } catch (error) {
            console.error('Error fetching voters:', error);
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchVoters();

        const loadModels = async () => {
            const MODEL_URL = 'https://cdn.jsdelivr.net/gh/vladmandic/face-api/model/';
            try {
                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
                ]);
                setModelsLoaded(true);
            } catch (err) {
                console.error("Error loading models:", err);
            }
        };
        loadModels();

        // Polling every 60 seconds to keep status updated
        const interval = setInterval(fetchVoters, 60000);
        return () => clearInterval(interval);
    }, [fetchVoters]);

    const refreshData = () => {
        setLoading(true);
        fetchVoters();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            setError('');
        }
    };

    const handleAddVoter = async (e) => {
        e.preventDefault();
        if (!newVoter.name || (!newVoter.email && !newVoter.phone) || !photo) {
            return setError('Please provide Name, Email/Phone, and Photo.');
        }

        setAdding(true);
        setError('');

        try {
            // 1. Generate Face Descriptor from uploaded photo
            const img = await faceapi.bufferToImage(photo);
            const detection = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                setAdding(false);
                return setError('No face detected in the photo. Please use a clear portrait.');
            }

            // 2. Upload to server
            const formData = new FormData();
            formData.append('name', newVoter.name);
            formData.append('email', newVoter.email);
            formData.append('phone', newVoter.phone);
            formData.append('photo', photo);
            formData.append('faceDescriptor', JSON.stringify(Array.from(detection.descriptor)));

            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/admin/voters', formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setVoters([res.data, ...voters]);
            setShowModal(false);
            setNewVoter({ name: '', email: '', phone: '' });
            setPhoto(null);
            setPhotoPreview(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to add voter.');
        } finally {
            setAdding(false);
        }
    };


    const filteredVoters = voters.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.email && v.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (v.phone && v.phone.includes(searchTerm))
    );

    return (
        <AdminLayout>
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Voter Registry</h1>
                        <p className="text-gray-500">
                            View and manage all enrolled voters.
                            {lastUpdated && (
                                <span className="ml-2 text-xs text-gov-blue">
                                    Last synced: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gov-blue text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition shadow-lg flex items-center gap-2"
                    >
                        <span>➕</span> Add Voter
                    </button>
                    <button
                        onClick={refreshData}
                        className="bg-white text-gov-blue border-2 border-gov-blue px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition shadow-sm flex items-center gap-2"
                        title="Refresh Voter Status"
                    >
                        <span>🔄</span> Refresh
                    </button>
                </div>
                <div className="relative group w-full md:w-96">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        className="w-full px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-blue-100 focus:border-gov-blue outline-none transition font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Voter Profile</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Contact Details</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Enrollment Date</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Voting Status</th>
                                <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Biometric Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-gray-100 rounded-xl"></div><div className="h-4 bg-gray-100 w-32 rounded"></div></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-48 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-24 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-20 rounded"></div></td>
                                        <td className="px-8 py-6"><div className="h-4 bg-gray-100 w-20 rounded"></div></td>
                                    </tr>
                                ))
                            ) : filteredVoters.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center text-gray-500 font-medium">No voters found.</td>
                                </tr>
                            ) : (
                                filteredVoters.map((voter) => (
                                    <motion.tr
                                        key={voter._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-blue-50/30 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                                                    {voter.photo ? (
                                                        <img src={`http://localhost:5000${voter.photo}`} alt={voter.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-2xl">👤</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg leading-tight">{voter.name}</p>
                                                    <p className="text-xs text-gov-blue font-black uppercase tracking-tighter mt-1">ID: {voter._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-700">{voter.email || '—'}</p>
                                                <p className="text-xs text-gray-500">{voter.phone || '—'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-medium text-gray-600">
                                                {new Date(voter.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${voter.hasVoted ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${voter.hasVoted ? 'bg-green-600' : 'bg-gray-400'}`}></span>
                                                {voter.hasVoted ? 'Voted' : 'Not Voted'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${voter.faceDescriptor?.length > 0 ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${voter.faceDescriptor?.length > 0 ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                                    {voter.faceDescriptor?.length > 0 ? 'Biometrics Active' : 'No Face Data'}
                                                </span>
                                                {(!voter.faceDescriptor || voter.faceDescriptor.length === 0) && voter.photo && (
                                                    <button
                                                        onClick={() => handleRepairBiometrics(voter)}
                                                        disabled={repairingId === voter._id}
                                                        className="text-[10px] font-bold text-gov-orange hover:underline text-left uppercase tracking-tighter disabled:opacity-50"
                                                    >
                                                        {repairingId === voter._id ? 'Repairing...' : '🛠 Repair Data'}
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-xl shadow-2xl relative"
                        >
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
                            >✕</button>

                            <h2 className="text-2xl font-black text-gray-900 mb-6">Enroll New Voter</h2>

                            {error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border-l-4 border-red-500">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleAddVoter} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-gov-blue outline-none transition font-bold"
                                            placeholder="Citizen Name"
                                            value={newVoter.name}
                                            onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Email Address</label>
                                        <input
                                            type="email"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-gov-blue outline-none transition font-bold"
                                            placeholder="voter@example.com"
                                            value={newVoter.email}
                                            onChange={(e) => setNewVoter({ ...newVoter, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full px-5 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-gov-blue outline-none transition font-bold"
                                            placeholder="+91 XXXXX XXXXX"
                                            value={newVoter.phone}
                                            onChange={(e) => setNewVoter({ ...newVoter, phone: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Official Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="hidden"
                                            id="voter-photo-upload"
                                        />
                                        <label
                                            htmlFor="voter-photo-upload"
                                            className="w-full px-5 py-3 bg-blue-50 border border-dashed border-blue-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-blue-100 transition text-gov-blue font-bold text-sm"
                                        >
                                            {photo ? photo.name : 'Upload Portrait'}
                                        </label>
                                    </div>
                                </div>

                                {photoPreview && (
                                    <div className="flex justify-center">
                                        <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg ring-1 ring-gray-100">
                                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-gray-50">
                                    <button
                                        type="submit"
                                        disabled={adding || !modelsLoaded}
                                        className={`w-full py-4 bg-gov-blue text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-3 ${adding ? 'opacity-70' : 'hover:-translate-y-1'}`}
                                    >
                                        {adding ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                Processing Biometrics...
                                            </>
                                        ) : !modelsLoaded ? (
                                            'Initializing AI...'
                                        ) : (
                                            'Enroll Voter'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminLayout>
    );
};

export default AdminVoters;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CandidateForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [formData, setFormData] = useState({
        party: '',
        manifesto: '',
        electionId: ''
    });
    const [photo, setPhoto] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        axios.get('http://localhost:5000/api/elections').then(res => setElections(res.data));
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        data.append('name', user.name);
        data.append('party', formData.party);
        data.append('manifesto', formData.manifesto);
        data.append('electionId', formData.electionId);
        data.append('userId', user.id);
        if (photo) data.append('photo', photo);

        const token = localStorage.getItem('token');
        try {
            await axios.post('http://localhost:5000/api/candidates/apply', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            alert('Application Submitted Successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Error submitting application');
        }
    };

    return (
        <div className="min-h-screen bg-gov-bg p-6 md:p-12 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Panel */}
                <div className="md:w-1/3 bg-gov-blue p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-4">Candidate Nomination</h2>
                        <ul className="space-y-4 text-blue-100 text-sm">
                            <li className="flex items-start gap-3">
                                <span className="text-yellow-400 text-xl">✓</span>
                                <div>
                                    <strong className="block text-white">Eligibility Check</strong>
                                    Ensure you meet all criteria.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-yellow-400 text-xl">✓</span>
                                <div>
                                    <strong className="block text-white">Document Verified</strong>
                                    Upload clear photo.
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-yellow-400 text-xl">✓</span>
                                <div>
                                    <strong className="block text-white">Manifesto</strong>
                                    State your clear vision.
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Right Panel - Form */}
                <div className="md:w-2/3 p-8 md:p-12 bg-white">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Application Form</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Select Election</label>
                                <select
                                    name="electionId"
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition"
                                    required
                                >
                                    <option value="">-- Choose Election --</option>
                                    {elections.map(e => <option key={e._id} value={e._id}>{e.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Party Name / Affiliation</label>
                                <input
                                    type="text"
                                    name="party"
                                    placeholder="e.g. Independent, Tech Party"
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Manifesto (Vision Statement)</label>
                            <textarea
                                name="manifesto"
                                rows="4"
                                placeholder="Describe why people should vote for you..."
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition"
                                required
                            ></textarea>
                            <p className="text-right text-xs text-gray-400 mt-1">Max 500 words</p>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Candidate Photo</label>
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center">
                                    {preview ? (
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-3xl text-gray-300">📷</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="block w-full text-sm text-gray-500
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-blue-50 file:text-gov-blue
                                        hover:file:bg-blue-100
                                        transition"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">JPG, PNG only. Max 2MB.</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button
                                type="submit"
                                className="w-full bg-gov-orange hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition transform hover:-translate-y-1"
                            >
                                Submit Nomination
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    );
};

export default CandidateForm;

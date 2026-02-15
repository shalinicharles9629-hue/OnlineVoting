import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdminNews = () => {
    const [news, setNews] = useState([]);
    const [content, setContent] = useState('');
    const [type, setType] = useState('announcement');
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/admin/news');
            setNews(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching news:', error);
            setLoading(false);
        }
    };

    const handleAddNews = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/admin/news', {
                content,
                type
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setContent('');
            fetchNews();
        } catch (error) {
            alert('Error adding news: ' + error.response?.data?.message || error.message);
        }
    };

    const handleDeleteNews = async (id) => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/news/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchNews();
        } catch (error) {
            alert('Error deleting news');
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Election News Management</h1>
                        <p className="text-gray-500">Manage the scrolling news ticker on the homepage</p>
                    </div>
                </div>

                {/* Add News Form */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-lg font-bold mb-4">Add New Update</h2>
                    <form onSubmit={handleAddNews} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">News Content</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue focus:border-transparent"
                                placeholder="Enter election update or announcement..."
                                rows="3"
                                required
                            />
                        </div>
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="announcement">Announcement</option>
                                    <option value="registration">Registration</option>
                                    <option value="update">General Update</option>
                                    <option value="election">Election Event</option>
                                </select>
                            </div>
                            <button
                                type="submit"
                                className="bg-gov-blue text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors shadow-lg"
                            >
                                Publish News
                            </button>
                        </div>
                    </form>
                </div>

                {/* News List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold">Existing News Items</h2>
                    {loading ? (
                        <p>Loading news...</p>
                    ) : news.length === 0 ? (
                        <div className="bg-gray-100 p-8 rounded-xl text-center text-gray-500">
                            No news items found. Add one above to start the ticker.
                        </div>
                    ) : (
                        news.map((item) => (
                            <div key={item._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center group">
                                <div className="flex items-center gap-4">
                                    <span className="w-2 h-2 bg-gov-orange rounded-full"></span>
                                    <div>
                                        <p className="font-medium text-gray-800">{item.content}</p>
                                        <span className="text-xs text-gray-500 uppercase font-bold tracking-tight bg-gray-100 px-2 py-0.5 rounded">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDeleteNews(item._id)}
                                    className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminNews;

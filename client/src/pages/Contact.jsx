import { motion } from 'framer-motion';

const Contact = () => {
    return (
        <div className="min-h-screen bg-gov-bg pt-20">
            <div className="container mx-auto px-6 py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Support</h1>
                        <p className="text-gray-500">We are here to help you with any issues related to voting or registration.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-2xl shadow-xl p-8"
                        >
                            <h2 className="text-2xl font-bold text-gov-blue mb-6">Get in Touch</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                                    <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder="john@example.com" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <textarea rows="4" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition" placeholder="How can we help you?"></textarea>
                                </div>
                                <button className="w-full bg-gov-orange text-white font-bold py-3 rounded-lg shadow-lg hover:bg-orange-600 transition">
                                    Send Message
                                </button>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col justify-center space-y-8"
                        >
                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📍</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Headquarters</h3>
                                    <p className="text-gray-600">Election Commission of India,<br/>Maduravayal, Ashoka Road,<br />Chennai 680 061</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">📞</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Helpline</h3>
                                    <p className="text-gray-600 font-bold text-xl text-gov-blue">1950</p>
                                    <p className="text-sm text-gray-500">(Toll-free, 24/7)</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-2xl shadow-sm">✉️</div>
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">Email Support</h3>
                                    <p className="text-gray-600">support@voteonline.gov.in</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;

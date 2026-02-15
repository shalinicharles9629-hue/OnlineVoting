import { motion } from 'framer-motion';

const About = () => {
    return (
        <div className="min-h-screen bg-gov-bg pt-20">
            <div className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="mb-12 text-center">
                        <h1 className="text-4xl font-bold text-gray-800 mb-4">About VoteOnline</h1>
                        <div className="w-24 h-1 bg-gov-orange mx-auto rounded"></div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-8">
                        <h2 className="text-2xl font-bold text-gov-blue mb-4">Our Mission</h2>
                        <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                            VoteOnline is a secure, transparent, and user-friendly digital voting platform designed to modernize the democratic process.
                            Our mission is to increase voter participation by making voting accessible to everyone, everywhere, while ensuring the highest
                            standards of security and integrity.
                        </p>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            Leveraging modern web technologies and secure authentication protocols, we provide a seamless experience for both voters and election officials.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Security First</h3>
                            <p className="text-gray-600">
                                We utilize advanced encryption and secure socket layers to protect every vote. Our system ensures that once a vote is cast, it cannot be tampered with.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h3 className="text-xl font-bold text-gray-800 mb-3">Transparency</h3>
                            <p className="text-gray-600">
                                The entire process, from voter registration to result declaration, is designed to be transparent and auditable, fostering trust in the electoral system.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default About;

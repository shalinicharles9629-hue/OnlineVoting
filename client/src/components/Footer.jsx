import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gov-blue text-white pt-10 pb-6 mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">🗳️</span> VoteOnline
                        </h3>
                        <p className="text-gray-300 text-sm">
                            An initiative to enable secure, transparent, and accessible digital voting for everyone.
                            Empowering democracy through technology.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gov-orange">Quick Links</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/" className="hover:text-white transition">Home</Link></li>
                            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
                            <li><Link to="/guidelines" className="hover:text-white transition">Voting Guidelines</Link></li>
                            <li><Link to="/results" className="hover:text-white transition">Election Results</Link></li>
                            <li><Link to="/login" className="hover:text-white transition">Admin Login</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gov-orange">Contact & Support</h4>
                        <p className="text-gray-300 text-sm mb-2">
                            <strong>Helpline:</strong> 1800-VOTE-NOW
                        </p>
                        <p className="text-gray-300 text-sm mb-2">
                            <strong>Email:</strong> support@voteonline.gov.in
                        </p>
                        <p className="text-gray-300 text-sm">
                            Ministry of Digital Affairs,<br />
                            New Delhi, India - 110001
                        </p>
                    </div>
                </div>
                <div className="border-t border-blue-800 pt-6 text-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Online Voting System. All Rights Reserved. | <span className="hover:text-white cursor-pointer">Privacy Policy</span> | <span className="hover:text-white cursor-pointer">Terms of Service</span></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

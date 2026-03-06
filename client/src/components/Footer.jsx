import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Footer = () => {
    const { t } = useTranslation();
    return (
        <footer className="bg-gov-blue text-white pt-10 pb-6 mt-auto">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <span className="text-3xl">🗳️</span> VoteOnline
                        </h3>
                        <p className="text-gray-300 text-sm">
                            {t('footer.desc')}
                        </p>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gov-orange">{t('footer.quick_links')}</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><Link to="/" className="hover:text-white transition">{t('nav.home')}</Link></li>
                            <li><Link to="/about" className="hover:text-white transition">{t('nav.dashboard')}</Link></li>
                            <li><Link to="/guidelines" className="hover:text-white transition">{t('footer.voting_guidelines')}</Link></li>
                            <li><Link to="/results" className="hover:text-white transition">{t('nav.results')}</Link></li>
                            <li><Link to="/login" className="hover:text-white transition">{t('footer.contact_support')}</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-gov-orange">{t('footer.contact_support')}</h4>
                        <p className="text-gray-300 text-sm mb-2">
                            <strong>{t('footer.helpline')}:</strong> 1800-VOTE-NOW
                        </p>
                        <p className="text-gray-300 text-sm mb-2">
                            <strong>{t('footer.email')}:</strong> support@voteonline.gov.in
                        </p>
                        <p className="text-gray-300 text-sm">
                            {t('footer.address').split(',')[0]},<br />
                            {t('footer.address').split(',').slice(1).join(',')}
                        </p>
                    </div>
                </div>
                <div className="border-t border-blue-800 pt-6 text-center text-xs text-gray-400">
                    <p>&copy; {new Date().getFullYear()} Online Voting System. {t('footer.rights_reserved')} | <span className="hover:text-white cursor-pointer">{t('footer.privacy_policy')}</span> | <span className="hover:text-white cursor-pointer">{t('footer.terms_service')}</span></p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

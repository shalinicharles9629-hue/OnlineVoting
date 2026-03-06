import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const Results = () => {
    const { t } = useTranslation();
    const { electionId } = useParams();
    const [results, setResults] = useState([]);
    const [electionMeta, setElectionMeta] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`http://localhost:5000/api/votes/results/${electionId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                });
                const data = res.data;
                if (Array.isArray(data)) {
                    setResults(data);
                } else {
                    setResults(data.results || []);
                    setElectionMeta({
                        ...data.election,
                        message: data.message,
                        totalVotes: data.totalVotes // Capture the true total count
                    });
                }
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchResults();

        // Auto refresh every 10 seconds
        const interval = setInterval(fetchResults, 10000);
        return () => clearInterval(interval);
    }, [electionId]);

    const totalVotes = electionMeta?.totalVotes ?? results.reduce((acc, curr) => acc + curr.count, 0);

    return (
        <div className="min-h-screen bg-gov-bg p-6 md:p-12">
            <div className="container mx-auto max-w-4xl">
                <div className="text-center mb-12 relative">
                    {electionMeta?.status === 'ongoing' ? (
                        <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider animate-pulse">● {t('results.live_trends')}</span>
                    ) : electionMeta?.resultsPublished ? (
                        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t('results.official_results')}</span>
                    ) : (
                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{t('results.pending')}</span>
                    )}

                    <h1 className="text-3xl font-bold text-gray-800 mt-4">{electionMeta?.title || t('results.election_results', { defaultValue: 'Election Results' })}</h1>
                    <p className="text-gray-500 mt-2">
                        {electionMeta?.status === 'ongoing'
                            ? t('results.realtime_desc')
                            : t('results.official_desc')}
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-12 h-12 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-500">{t('results.fetching')}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="p-6 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="font-bold text-gray-700">{t('results.total_votes')}</h2>
                            <span className="text-2xl font-bold text-gov-blue">{totalVotes}</span>
                        </div>

                        <div className="p-8 space-y-8">
                            {results.map((candidate, idx) => {
                                const percentage = totalVotes === 0 ? 0 : ((candidate.count / totalVotes) * 100).toFixed(1);
                                const isWinner = idx === 0 && totalVotes > 0;

                                return (
                                    <div key={candidate.candidateId} className="relative">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border border-gray-200">
                                                    {candidate.candidateDetails?.photoUrl ? (
                                                        <img src={`http://localhost:5000${candidate.candidateDetails.photoUrl}`} alt={candidate.candidateDetails.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>👤</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold ${isWinner ? 'text-gov-orange' : 'text-gray-800'}`}>
                                                        {candidate.candidateDetails ? candidate.candidateDetails.name : t('results.unknown')}
                                                        {isWinner && (
                                                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full border border-yellow-200">
                                                                {electionMeta?.status === 'ended' && electionMeta?.resultsPublished ? `${t('results.winner')} 🏆` : t('results.leading')}
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-xs text-gray-500">{candidate.candidateDetails?.party || t('results.independent')}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
                                                <p className="text-xs text-gray-500">{candidate.count} {t('results.votes', { defaultValue: 'Votes' })}</p>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full rounded-full ${isWinner ? 'bg-gradient-to-r from-orange-500 to-yellow-400' : 'bg-gov-blue'}`}
                                            ></motion.div>
                                        </div>
                                    </div>
                                );
                            })}

                            {results.length === 0 && (
                                <div className="text-center py-10 px-4">
                                    <div className="text-6xl mb-4">📊</div>
                                    <p className="text-gray-500 text-lg font-medium">
                                        {electionMeta?.message || (
                                            electionMeta?.status === 'ended' && !electionMeta?.resultsPublished
                                                ? t('results.ended_not_published')
                                                : t('results.no_stats')
                                        )}
                                    </p>
                                    <p className="text-gray-400 text-sm mt-2">
                                        {electionMeta?.status === 'ongoing' ? (t('results.live_trends_soon')) : t('results.final_counts_soon')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8 text-center">
                    <Link to="/" className="text-gov-blue hover:text-blue-800 font-semibold transition">
                        &larr; {t('results.back_home')}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Results;

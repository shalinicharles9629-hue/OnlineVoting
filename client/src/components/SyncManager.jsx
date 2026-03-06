import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { getPendingVotes, removePendingVote } from '../utils/offlineStorage';
import { useTranslation } from 'react-i18next';

const SyncManager = () => {
    const { t } = useTranslation();
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncNotification, setSyncNotification] = useState(false);

    const performSync = async () => {
        if (!navigator.onLine || isSyncing) return;

        const pendingVotes = await getPendingVotes();
        if (pendingVotes.length === 0) return;

        setIsSyncing(true);
        let successCount = 0;

        for (const vote of pendingVotes) {
            try {
                await axios.post('http://localhost:5000/api/votes/verify-and-cast', {
                    identifier: vote.identifier,
                    otp: vote.otp,
                    electionId: vote.electionId,
                    candidateId: vote.candidateId
                });
                await removePendingVote(vote.id);
                successCount++;
            } catch (error) {
                console.error('Failed to sync vote:', vote.id, error);
                // Keep the vote in IndexedDB if sync fails (e.g., server down)
            }
        }

        if (successCount > 0) {
            setSyncNotification(true);
            setTimeout(() => setSyncNotification(false), 5000);
        }
        setIsSyncing(false);
    };

    useEffect(() => {
        // Initial sync on mount
        performSync();

        // Listen for online events
        window.addEventListener('online', performSync);
        
        // Polling as a fallback for intermittent connectivity
        const interval = setInterval(performSync, 60000); // Every 1 minute

        return () => {
            window.removeEventListener('online', performSync);
            clearInterval(interval);
        };
    }, []);

    return (
        <AnimatePresence>
            {syncNotification && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[300] bg-green-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold"
                >
                    <span className="text-xl">🚀</span>
                    <span>{t('success_modal.sync_success')}</span>
                    <button 
                        onClick={() => setSyncNotification(false)}
                        className="ml-2 hover:opacity-70"
                    >
                        ✕
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SyncManager;

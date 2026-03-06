import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import SuccessModal from '../components/SuccessModal';
import { useTranslation } from 'react-i18next';
import { savePendingVote } from '../utils/offlineStorage';

const Vote = () => {
    const { t } = useTranslation();
    const { electionId } = useParams();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    // Flow State: 1: Enter ID, 2: Enter OTP, 3: Face Recognition
    const [flowStep, setFlowStep] = useState(1);
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [voterData, setVoterData] = useState(null);
    const [isOfflineVote, setIsOfflineVote] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceMatched, setFaceMatched] = useState(false);
    const [matchError, setMatchError] = useState('');
    const [cameraReady, setCameraReady] = useState(false);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/candidates/election/${electionId}`);
                setCandidates(res.data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchCandidates();

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
                setTimeout(loadModels, 3000);
            }
        };
        loadModels();
    }, [electionId]);

    const handleSendOTP = async () => {
        if (!identifier) return alert(t('vote.email_alert'));
        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/votes/send-otp', {
                identifier,
                electionId
            });
            setFlowStep(2);
        } catch (error) {
            alert(error.response?.data?.message || t('login.otp_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return alert(t('vote.otp_alert'));
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/votes/verify-otp', {
                identifier,
                otp
            });
            setVoterData(res.data);
            setFlowStep(3);
        } catch (error) {
            alert(error.response?.data?.message || t('login.invalid_otp'));
        } finally {
            setLoading(false);
        }
    };

    const verifyFace = async () => {
        if (!webcamRef.current || !voterData?.faceDescriptor || !modelsLoaded || !cameraReady) return;

        const video = webcamRef.current.video;
        if (video.readyState !== 4) {
            setMatchError(t('vote.camera_not_ready'));
            return;
        }

        setLoading(true);
        setMatchError('');
        try {
            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!detection) {
                setMatchError(t('voter_register.face_required'));
                setLoading(false);
                return;
            }

            const storedDescriptor = new Float32Array(voterData.faceDescriptor);
            const distance = faceapi.euclideanDistance(detection.descriptor, storedDescriptor);
            console.log("Face distance:", distance);

            if (distance < 0.7) { // Increased threshold from 0.6 to 0.7
                setFaceMatched(true);
                handleCastVote();
            } else {
                setMatchError(t('vote.mismatch', { distance: distance.toFixed(3) }));
            }
        } catch (err) {
            console.error(err);
            setMatchError(t('vote.face_error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCastVote = async () => {
        setLoading(true);
        const voteData = {
            identifier,
            otp,
            electionId,
            candidateId: selectedCandidate
        };

        try {
            if (!navigator.onLine) {
                await savePendingVote(voteData);
                setIsOfflineVote(true);
                setShowModal(false);
                setShowSuccess(true);
                return;
            }

            await axios.post('http://localhost:5000/api/votes/verify-and-cast', voteData);
            setIsOfflineVote(false);
            setShowModal(false);
            setShowSuccess(true);
        } catch (error) {
            alert(error.response?.data?.message || t('login.invalid_credentials'));
        } finally {
            setLoading(false);
        }
    };

    const getSymbolIcon = (sName) => {
        const symbols = {
            'Cycle': '🚲', 'Lotus': '🪷', 'Hand': '✋', 'Car': '🚗',
            'Elephant': '🐘', 'Sun': '☀️', 'Broom': '🧹', 'Clock': '⏰'
        };
        return symbols[sName] || "🏳️";
    };

    return (
        <div className="min-h-screen bg-gov-bg p-6 md:p-12">
            <div className="container mx-auto max-w-5xl">
                <div className="text-center mb-12 relative">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{t('vote.ballot_box')}</h1>
                    <p className="text-gray-500 mt-2">{t('vote.security_subtitle')}</p>
                    <div className="w-24 h-1.5 bg-gov-orange mx-auto rounded-full mt-4"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {candidates.map((candidate) => (
                        <motion.div
                            key={candidate._id}
                            whileHover={{ scale: 1.02, y: -5 }}
                            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedCandidate === candidate._id ? 'border-gov-orange ring-4 ring-orange-100' : 'border-transparent hover:border-blue-200'}`}
                            onClick={() => setSelectedCandidate(candidate._id)}
                        >
                            <div className="h-44 bg-gradient-to-r from-blue-100 to-blue-50 flex items-center justify-center relative">
                                {candidate.photoUrl ? (
                                    <img src={`http://localhost:5000${candidate.photoUrl}`} alt={candidate.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-6xl">👤</span>
                                )}
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md rounded-2xl p-2 shadow-lg w-16 h-16 flex flex-col items-center justify-center text-center border border-gray-100">
                                    <span className="text-3xl leading-none">{getSymbolIcon(candidate.symbol)}</span>
                                    <span className="text-[10px] font-black uppercase mt-1 text-gray-800">{candidate.symbol || t('vote.ind')}</span>
                                </div>
                            </div>
                            <div className="p-6 text-center">
                                <h3 className="text-xl font-black text-gray-900 leading-tight">{candidate.name}</h3>
                                <div className="inline-block px-3 py-1 bg-blue-50 rounded-full mt-1 mb-3">
                                    <p className="text-gov-blue font-black text-[10px] uppercase tracking-[0.2em]">{candidate.party}</p>
                                </div>
                                <div className={`w-10 h-10 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${selectedCandidate === candidate._id ? 'border-gov-orange bg-gov-orange shadow-lg shadow-orange-200 scale-110' : 'border-gray-200'}`}>
                                    {selectedCandidate === candidate._id && <span className="text-white font-bold italic text-lg">✓</span>}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        disabled={!selectedCandidate}
                        onClick={() => setShowModal(true)}
                        className={`px-12 py-4 rounded-full font-bold text-lg shadow-2xl transition-all transform ${selectedCandidate ? 'bg-gov-blue hover:bg-blue-800 text-white hover:-translate-y-1' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        {t('vote.proceed_verify')}
                    </button>

                </div>

                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
                        >
                            <motion.div
                                initial={{ scale: 0.9, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.9, y: 20 }}
                                className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-3xl text-center relative overflow-hidden"
                            >
                                <button
                                    onClick={() => { setShowModal(false); setFlowStep(1); setOtp(''); }}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
                                >✕</button>

                                <div className="mb-6 flex justify-center">
                                    <div className="w-20 h-20 bg-gov-bg rounded-2xl flex items-center justify-center text-4xl shadow-inner border border-gray-100">
                                        {flowStep === 1 ? '🆔' : flowStep === 2 ? '🔐' : '🎥'}
                                    </div>
                                </div>

                                <h3 className="text-2xl font-black text-gray-900 mb-2">
                                    {flowStep === 1 ? t('vote.voter_identity') : flowStep === 2 ? t('vote.otp_verification') : t('vote.face_verification')}
                                </h3>

                                {flowStep === 1 && (
                                    <div className="space-y-4 mt-6">
                                        <input
                                            type="text"
                                            placeholder={t('login.email_label')}
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-gov-blue outline-none font-medium"
                                        />
                                        <button
                                            onClick={handleSendOTP}
                                            disabled={loading || !identifier}
                                            className="w-full py-4 bg-gov-blue text-white rounded-2xl font-bold shadow-xl disabled:opacity-50"
                                        >
                                            {loading ? t('login.sending_otp') : t('login.send_otp')}
                                        </button>
                                    </div>
                                )}

                                {flowStep === 2 && (
                                    <div className="space-y-4 mt-6">
                                        <input
                                            type="text"
                                            placeholder={t('voter_register.enter_otp')}
                                            maxLength="6"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full text-center text-3xl tracking-[0.5em] px-6 py-4 rounded-2xl bg-gray-50 border border-gray-200 focus:border-gov-orange outline-none font-black"
                                        />
                                        <button
                                            onClick={handleVerifyOTP}
                                            disabled={loading || otp.length < 6}
                                            className="w-full py-4 bg-gov-orange text-white rounded-2xl font-bold shadow-xl disabled:opacity-50"
                                        >
                                            {loading ? t('login.verifying') : t('vote.next_step')}
                                        </button>
                                    </div>
                                )}

                                {flowStep === 3 && (
                                    <div className="space-y-4 mt-6">
                                        <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                                            <Webcam
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                className="w-full h-full object-cover"
                                                onUserMedia={() => setCameraReady(true)}
                                            />
                                            {!cameraReady && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20">
                                                    <div className="w-10 h-10 border-4 border-gov-blue border-t-transparent rounded-full animate-spin mb-4"></div>
                                                    <p className="text-sm font-bold">{t('voter_register.activating_camera')}</p>
                                                </div>
                                            )}
                                            {faceMatched && (
                                                <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                                                    <span className="text-white text-5xl font-bold">✓</span>
                                                </div>
                                            )}
                                        </div>
                                        {matchError && <p className="text-red-500 text-sm font-bold">{matchError}</p>}
                                        <p className="text-sm text-gray-500">{t('vote.match_facing', { name: voterData?.name })}</p>
                                        <button
                                            onClick={verifyFace}
                                            disabled={loading || !modelsLoaded || faceMatched}
                                            className="w-full py-4 bg-gov-blue text-white rounded-2xl font-bold shadow-xl disabled:opacity-50"
                                        >
                                            {loading ? t('vote.analyzing') : t('vote.match_vote_btn')}
                                        </button>
                                    </div>
                                )}

                                <div className="mt-8 pt-6 border-t border-gray-100">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                        {t('vote.biometric_layer')}
                                    </p>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <SuccessModal
                    isOpen={showSuccess}
                    isOffline={isOfflineVote}
                    onClose={() => navigate('/')}
                />
            </div>
        </div>
    );
};

export default Vote;

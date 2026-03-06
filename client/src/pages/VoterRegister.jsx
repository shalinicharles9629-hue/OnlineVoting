import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { useTranslation } from 'react-i18next';


const VoterRegister = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const webcamRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info & OTP, 2: Face Capture

    // Form State
    const [name, setName] = useState('');
    const [identifier, setIdentifier] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [error, setError] = useState('');

    const [cameraReady, setCameraReady] = useState(false);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const [faceDescriptor, setFaceDescriptor] = useState(null);

    useEffect(() => {
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
                setError(t('voter_register.preparing_models'));
                // Retry loading after 3 seconds if failed
                setTimeout(loadModels, 3000);
            }
        };
        loadModels();
    }, []);

    const handleSendOTP = async () => {
        if (!identifier) return setError(t('voter_register.id_required'));
        setLoading(true);
        setError('');
        try {
            await axios.post('http://localhost:5000/api/auth/send-otp', { identifier });
            setOtpSent(true);
        } catch (err) {
            setError(err.response?.data?.error || t('login.otp_fail'));
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp) return setError(t('voter_register.enter_otp'));
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { identifier, otp });
            if (res.data.exists) {
                alert(t('voter_register.already_registered'));
                navigate('/');
            } else {
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.error || t('login.invalid_otp'));
        } finally {
            setLoading(false);
        }
    };

    const detectFace = async () => {
        if (webcamRef.current && modelsLoaded && cameraReady) {
            const video = webcamRef.current.video;
            if (video.readyState !== 4) return null;

            try {
                const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
                    .withFaceLandmarks()
                    .withFaceDescriptor();

                if (detection) {
                    setFaceDetected(true);
                    return detection;
                } else {
                    setFaceDetected(false);
                    return null;
                }
            } catch (err) {
                console.error("Detection error:", err);
                return null;
            }
        }
        return null;
    };

    // Auto-detect face
    useEffect(() => {
        let interval;
        if (step === 2 && modelsLoaded && !capturedImage && cameraReady) {
            interval = setInterval(async () => {
                await detectFace();
            }, 800);
        }
        return () => clearInterval(interval);
    }, [step, modelsLoaded, capturedImage, cameraReady]);

    const handleCapture = async () => {
        const detection = await detectFace();
        if (detection) {
            const imageSrc = webcamRef.current.getScreenshot();
            setCapturedImage(imageSrc);
            setFaceDescriptor(Array.from(detection.descriptor));
        } else {
            setError(t('voter_register.face_required'));
        }
    };

    const handleSubmit = async () => {
        if (!name || !capturedImage || !faceDescriptor) return setError(t('voter_register.fields_required'));
        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', identifier.includes('@') ? identifier : '');
            formData.append('phone', identifier.includes('@') ? '' : identifier);
            formData.append('faceDescriptor', JSON.stringify(faceDescriptor));

            // Convert base64 to blob
            const response = await fetch(capturedImage);
            const blob = await response.blob();
            formData.append('photo', blob, 'voter_photo.jpg');

            await axios.post('http://localhost:5000/api/auth/register-voter', formData);
            alert(t('voter_register.reg_success'));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || t('register.reg_failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 py-12 px-4 flex items-center justify-center relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col md:flex-row"
            >
                {/* Visual Sidebar */}
                <div className="md:w-1/3 bg-[#0b0d17] p-8 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gov-orange/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl mb-6 backdrop-blur-md border border-white/20">
                            🛡️
                        </div>
                        <h2 className="text-2xl font-black mb-4 tracking-tight">{t('voter_register.sidebar_title')}</h2>
                        <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {t('voter_register.sidebar_desc')}
                        </p>
                    </div>
                    <div className="relative z-10 mt-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-gov-orange' : 'bg-gray-700'}`}></div>
                            <div className={`w-full h-0.5 rounded-full ${step >= 2 ? 'bg-gov-orange' : 'bg-gray-700'}`}></div>
                            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-gov-orange' : 'bg-gray-700'}`}></div>
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                            {t('voter_register.step_info', { step })}
                        </p>
                    </div>
                </div>

                {/* Form Content */}
                <div className="md:w-2/3 p-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-bold border-l-4 border-red-500 flex items-center gap-2">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('voter_register.full_name')}</label>
                                    <input
                                        type="text"
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold"
                                        placeholder={t('voter_register.full_name')}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('voter_register.email_phone')}</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            disabled={otpSent}
                                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-gov-blue outline-none transition font-bold disabled:opacity-50"
                                            placeholder={t('login.identifier_placeholder')}
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                        />
                                        {!otpSent && (
                                            <button
                                                onClick={handleSendOTP}
                                                disabled={loading || !identifier}
                                                className="bg-gov-blue text-white px-6 rounded-2xl font-bold hover:bg-blue-800 transition shadow-lg shadow-blue-100 disabled:opacity-50 whitespace-nowrap"
                                            >
                                                {loading ? '...' : (t('login.send_otp') || 'Send OTP')}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {otpSent && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="space-y-1"
                                    >
                                        <label className="text-xs font-black uppercase text-gray-400 tracking-widest">{t('voter_register.enter_otp')}</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                maxLength="6"
                                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:bg-white focus:border-gov-orange outline-none transition font-black tracking-[0.5em] text-center"
                                                placeholder="000000"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                            <button
                                                onClick={handleVerifyOTP}
                                                disabled={loading || otp.length < 6}
                                                className="bg-gov-orange text-white px-6 rounded-2xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-100 disabled:opacity-50"
                                            >
                                                {loading ? '...' : t('voter_register.verify_btn')}
                                            </button>
                                        </div>
                                        <button onClick={() => setOtpSent(false)} className="text-xs text-gov-blue font-bold hover:underline mt-2">{t('voter_register.change_details')}</button>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6 text-center"
                            >
                                <div className="relative rounded-3xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center border-4 border-white shadow-xl">
                                    {!capturedImage ? (
                                        <>
                                            <Webcam
                                                ref={webcamRef}
                                                screenshotFormat="image/jpeg"
                                                className="w-full h-full object-cover"
                                                onUserMedia={() => setCameraReady(true)}
                                            />
                                            {!cameraReady && (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white z-20">
                                                    <div className="w-10 h-10 border-4 border-gov-orange border-t-transparent rounded-full animate-spin mb-4"></div>
                                                    <p className="text-sm font-bold">{t('voter_register.activating_camera')}</p>
                                                </div>
                                            )}
                                            <div className={`absolute inset-0 border-4 transition-colors ${faceDetected ? 'border-green-500 ring-4 ring-green-500/20' : 'border-red-500/50'}`}></div>
                                            {!modelsLoaded && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white font-bold">
                                                    {t('voter_register.loading_models')}
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                                    )}
                                </div>

                                <div className="px-4">
                                    <h3 className="text-xl font-bold text-gray-900">{t('voter_register.biometric_identity')}</h3>
                                    <p className="text-sm text-gray-500 mt-2">
                                        {capturedImage
                                            ? t('voter_register.capture_success')
                                            : t('voter_register.position_face')
                                        }
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    {!capturedImage ? (
                                        <button
                                            onClick={handleCapture}
                                            disabled={!faceDetected}
                                            className="w-full py-4 bg-gov-blue text-white rounded-2xl font-bold shadow-xl hover:shadow-blue-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                                        >
                                            {t('voter_register.capture_btn')}
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => { setCapturedImage(null); setFaceDescriptor(null); }}
                                                className="w-1/3 py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-all"
                                            >
                                                {t('voter_register.retake_btn')}
                                            </button>
                                            <button
                                                onClick={handleSubmit}
                                                disabled={loading}
                                                className="w-2/3 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-green-200 transition-all active:scale-[0.98]"
                                            >
                                                {loading ? t('voter_register.saving') : t('voter_register.finish_btn')}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default VoterRegister;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { statesAndCities, educationQualifications } from '../data/options';

const CandidateNomination = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [elections, setElections] = useState([]);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        // Election
        electionId: '',
        party: '',
        manifesto: '',
        constituency: '',
        symbolPreference: '',

        // Personal
        name: user?.name || '',
        dob: '',
        age: '',
        gender: '',
        bloodGroup: '',
        mobile: '',
        email: user?.email || '',
        address: '',
        state: '',
        city: '',

        // Family
        fatherName: '',
        motherName: '',
        spouseName: '',
        familyIncome: '',

        // Education
        qualification: '',
        university: '',
        passingYear: '',
        percentage: '',

        // Identity
        aadhaar: '',
        voterId: '',
        pan: '',

        // Declaration
        assetsValue: '',
        criminalRecord: '',
    });

    // File State
    const [files, setFiles] = useState({
        photo: null,
        signature: null,
        idProof: null,
        educationCert: null,
        incomeCert: null,
        communityCert: null
    });

    const [previews, setPreviews] = useState({});

    useEffect(() => {
        axios.get('http://localhost:5000/api/elections').then(res => setElections(res.data));
    }, []);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Auto Calculate Age
        if (name === 'dob') {
            const birthDate = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            setFormData(prev => ({ ...prev, dob: value, age: age }));
        }
    };

    // Handle File Change with Preview
    const handleFileChange = (e) => {
        const { name, files: uploadedFiles } = e.target;
        const file = uploadedFiles[0];
        if (file) {
            setFiles(prev => ({ ...prev, [name]: file }));

            // Create preview for images
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreviews(prev => ({ ...prev, [name]: reader.result }));
                };
                reader.readAsDataURL(file);
            } else {
                setPreviews(prev => ({ ...prev, [name]: null }));
            }
        }
    };

    // Validation
    const validateStep = (step) => {
        switch (step) {
            case 1: // Personal & Family
                if (!formData.name || !formData.dob || !formData.mobile || !formData.address || !formData.state || !formData.city || !formData.fatherName) return false;
                return true;
            case 2: // Education & Identity
                if (!formData.qualification || !formData.aadhaar || !formData.voterId) return false;
                return true;
            case 3: // Election & Uploads
                if (!formData.electionId || !formData.party || !files.photo || !files.signature || !formData.assetsValue || !formData.criminalRecord) return false;
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
            window.scrollTo(0, 0);
        } else {
            alert("Please fill all required fields in this section.");
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
        window.scrollTo(0, 0);
    };

    // Submit Form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!window.confirm("Are you sure you want to submit your nomination? This action cannot be undone.")) return;

        setIsSubmitting(true);
        const data = new FormData();

        // Append all text fields
        Object.keys(formData).forEach(key => {
            data.append(key, formData[key]);
        });

        // Append all files
        Object.keys(files).forEach(key => {
            if (files[key]) data.append(key, files[key]);
        });

        try {
            await axios.post('http://localhost:5000/api/candidates/apply', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            alert('Nomination Submitted Successfully! Your symbol will be assigned by Admin after verification.');
            navigate('/dashboard');
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.error || 'Error submitting application');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Render Steps
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2">Personal Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Date of Birth" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
                                <Input label="Age" name="age" value={formData.age} readOnly bg="bg-gray-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                                <Select label="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} options={["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} />
                            </div>
                            <Input label="Mobile Number" name="mobile" value={formData.mobile} onChange={handleChange} required />
                            <Input label="Email" name="email" value={formData.email} onChange={handleChange} required />

                            <div className="grid grid-cols-2 gap-4 md:col-span-2">
                                <Select
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value, city: '' }))}
                                    options={Object.keys(statesAndCities)}
                                />
                                <Select
                                    label="City"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    options={formData.state ? statesAndCities[formData.state] : []}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permanent Address (Street/Locality) <span className="text-red-500">*</span></label>
                                <textarea name="address" rows="3" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none" required></textarea>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2 mt-8">Family Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Father's Name" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                            <Input label="Mother's Name" name="motherName" value={formData.motherName} onChange={handleChange} />
                            <Input label="Spouse Name" name="spouseName" value={formData.spouseName} onChange={handleChange} />
                            <Input label="Family Annual Income" name="familyIncome" type="number" value={formData.familyIncome} onChange={handleChange} />
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2">Education Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Select label="Highest Qualification" name="qualification" value={formData.qualification} onChange={handleChange} options={educationQualifications} />
                            <Input label="University / Board" name="university" value={formData.university} onChange={handleChange} />
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Passing Year" name="passingYear" value={formData.passingYear} onChange={handleChange} />
                                <Input label="Percentage / CGPA" name="percentage" value={formData.percentage} onChange={handleChange} />
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2 mt-8">Identity Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Aadhaar Number" name="aadhaar" value={formData.aadhaar} onChange={handleChange} required />
                            <Input label="Voter ID" name="voterId" value={formData.voterId} onChange={handleChange} required />
                            <Input label="PAN Number" name="pan" value={formData.pan} onChange={handleChange} />
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2">Election Details</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Election <span className="text-red-500">*</span></label>
                                <select name="electionId" value={formData.electionId} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none" required>
                                    <option value="">-- Choose --</option>
                                    {elections.map(e => {
                                        const isFull = e.candidateLimit > 0 && e.candidateCount >= e.candidateLimit;
                                        const isStarted = e.status !== 'upcoming';
                                        const disabled = isFull || isStarted;

                                        let label = e.title;
                                        if (e.candidateLimit > 0) label += ` (${e.candidateCount}/${e.candidateLimit} Candidates)`;
                                        if (isStarted) label += ` - [CLOSED: ${e.status.toUpperCase()}]`;
                                        else if (isFull) label += ` - [FULL]`;

                                        return (
                                            <option key={e._id} value={e._id} disabled={disabled}>
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                                {formData.electionId && (
                                    <div className="mt-2 text-xs">
                                        {(() => {
                                            const sel = elections.find(e => e._id === formData.electionId);
                                            if (!sel) return null;
                                            return (
                                                <div className="flex gap-2">
                                                    <span className={`px-2 py-0.5 rounded-full font-bold ${sel.status === 'upcoming' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        Status: {sel.status.toUpperCase()}
                                                    </span>
                                                    {sel.candidateLimit > 0 && (
                                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                                            Spots: {sel.candidateCount} / {sel.candidateLimit} Filled
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                            <Input label="Party Name (or Independent)" name="party" value={formData.party} onChange={handleChange} required />
                            <Input label="Constituency" name="constituency" value={formData.constituency} onChange={handleChange} />
                            <Input label="Symbol Preference" name="symbolPreference" value={formData.symbolPreference} onChange={handleChange} />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Manifesto (Vision)</label>
                                <textarea name="manifesto" rows="4" value={formData.manifesto} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none"></textarea>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2 mt-8">Financial & Criminal Declaration</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Input label="Total Assets Value (₹)" name="assetsValue" type="number" value={formData.assetsValue} onChange={handleChange} required />
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Criminal Record (If any, provide details. If none, type 'NO') <span className="text-red-500">*</span></label>
                                <textarea name="criminalRecord" rows="2" value={formData.criminalRecord} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-gov-blue outline-none" required></textarea>
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gov-blue border-b pb-2 mt-8">Document Uploads</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <FileUpload label="Candidate Photo" name="photo" onChange={handleFileChange} preview={previews.photo} required />
                            <FileUpload label="Signature" name="signature" onChange={handleFileChange} preview={previews.signature} required />
                            <FileUpload label="ID Proof (Aadhaar/Voter)" name="idProof" onChange={handleFileChange} preview={previews.idProof} />
                            <FileUpload label="Highest Qualification Cert" name="educationCert" onChange={handleFileChange} preview={previews.educationCert} />
                        </div>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="text-center py-8">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                            ✅
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Review Application</h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            Please review all your details carefully before submitting. Once submitted,
                            you cannot edit your application until it is processed by the admin.
                        </p>

                        <div className="bg-gray-50 p-6 rounded-xl text-left max-w-3xl mx-auto border border-gray-200 mb-8 max-h-96 overflow-y-auto space-y-4">
                            <div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                                    <h4 className="font-bold text-gov-blue">Personal & Family</h4>
                                    <button onClick={() => setCurrentStep(1)} className="text-sm text-gov-orange hover:underline font-semibold">Edit</button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-semibold">Name:</span> {formData.name}</p>
                                    <p><span className="font-semibold">DOB:</span> {formData.dob} ({formData.age} Yrs)</p>
                                    <p><span className="font-semibold">Mobile:</span> {formData.mobile}</p>
                                    <p><span className="font-semibold">Email:</span> {formData.email}</p>
                                    <p className="col-span-2"><span className="font-semibold">Address:</span> {formData.address}</p>
                                    <p><span className="font-semibold">Father:</span> {formData.fatherName}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                                    <h4 className="font-bold text-gov-blue">Education & Identity</h4>
                                    <button onClick={() => setCurrentStep(2)} className="text-sm text-gov-orange hover:underline font-semibold">Edit</button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-semibold">Qualification:</span> {formData.qualification}</p>
                                    <p><span className="font-semibold">Aadhaar:</span> {formData.aadhaar}</p>
                                    <p><span className="font-semibold">Voter ID:</span> {formData.voterId}</p>
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-1 mb-2">
                                    <h4 className="font-bold text-gov-blue">Election & Declaration</h4>
                                    <button onClick={() => setCurrentStep(3)} className="text-sm text-gov-orange hover:underline font-semibold">Edit</button>
                                </div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <p><span className="font-semibold">Election:</span> {elections.find(e => e._id === formData.electionId)?.title || formData.electionId}</p>
                                    <p><span className="font-semibold">Party:</span> {formData.party}</p>
                                    <p><span className="font-semibold">Assets:</span> ₹{formData.assetsValue}</p>
                                    <p className="col-span-2"><span className="font-semibold">Criminal Record:</span> {formData.criminalRecord}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 mb-8">
                            <input type="checkbox" id="declare" className="w-5 h-5 text-gov-blue" />
                            <label htmlFor="declare" className="text-sm text-gray-700">I hereby declare that all information provided is true to the best of my knowledge.</label>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gov-orange hover:bg-orange-600 text-white px-12 py-4 rounded-full font-bold text-lg shadow-xl transition transform hover:-translate-y-1 disabled:opacity-50"
                        >
                            {isSubmitting ? 'Submitting...' : 'Final Submit'}
                        </button>
                    </motion.div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-gov-bg p-6 md:p-12">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                {/* Header */}
                <div className="bg-gov-blue p-8 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold">Candidate Nomination Form</h1>
                            <p className="text-blue-200 mt-1">General Elections 2026</p>
                        </div>
                        <div className="text-right hidden md:block">
                            <p className="font-bold text-xl">Step {currentStep} of 4</p>
                            <p className="text-sm text-blue-200">Completing Application</p>
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-gray-100 h-2 w-full">
                    <div className="h-full bg-yellow-400 transition-all duration-500" style={{ width: `${(currentStep / 4) * 100}%` }}></div>
                </div>

                {/* Form Content */}
                <div className="p-8 md:p-12">
                    <form onSubmit={(e) => e.preventDefault()}>
                        {renderStep()}
                    </form>
                </div>

                {/* Footer Navigation */}
                {currentStep < 4 && (
                    <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-between">
                        <button
                            onClick={prevStep}
                            disabled={currentStep === 1}
                            className="px-6 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-white transition disabled:opacity-50"
                        >
                            &larr; Previous
                        </button>
                        <button
                            onClick={nextStep}
                            className="px-8 py-2 rounded-lg font-bold bg-gov-blue text-white hover:bg-blue-800 transition shadow-lg"
                        >
                            Save & Next &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// Reusable Components
const Input = ({ label, name, type = "text", value, onChange, required, readOnly, bg = "bg-white" }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            readOnly={readOnly}
            className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none transition ${bg} text-gray-900`}
            required={required}
        />
    </div>
);

const Select = ({ label, name, value, onChange, options }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gov-blue outline-none bg-white text-gray-900">
            <option value="">Select</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const FileUpload = ({ label, name, onChange, preview, required }) => (
    <div className="border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 text-center hover:bg-blue-50 transition">
        <label className="cursor-pointer block">
            <span className="block font-medium text-gray-700 mb-2">{label} {required && <span className="text-red-500">*</span>}</span>
            <div className="w-full h-32 bg-white border border-gray-200 rounded flex items-center justify-center overflow-hidden mb-2 mx-auto max-w-[200px]">
                {preview ? (
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                    <span className="text-gray-400 text-3xl">📂</span>
                )}
            </div>
            <input type="file" name={name} onChange={onChange} className="hidden" accept="image/*,.pdf" />
            <span className="text-xs text-gov-blue font-bold">Click to Upload</span>
        </label>
        <p className="text-xs text-gray-400 mt-1">Max 5MB (JPG, PNG, PDF)</p>
    </div>
);

export default CandidateNomination;

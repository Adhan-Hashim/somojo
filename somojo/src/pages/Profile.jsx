import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPinHouse, FileUser } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";
import LocationInput from "../components/LocationInput";

export default function Profile() {
    const navigate = useNavigate();
    const { themeText, themeBg, themeBorder } = useThemeColor();

    // Load from local storage initially, but we will overwrite with DB data
    const [user, setUser] = useState(() => {
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        return {
            _id: stored.id || stored._id, // Support different formats
            email: stored.email || "",
            role: stored.role || "job-seeker",
            name: stored.name || (stored.email ? stored.email.split('@')[0] : "User Name"),
            contact: stored.contact || "",
            location: stored.location || "",
            profilePicture: stored.profilePicture || null,
            resume: stored.resume || null,
            interests: stored.interests || [],
            experience: stored.experience || [],
            education: stored.education || [],
            certifications: stored.certifications || [],
            jobPreferences: stored.jobPreferences || {
                titles: [], types: [], schedules: [], basePay: "", relocation: "Not open to relocation"
            }
        };
    });

    // -- Fetch Profile on Mount --
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/api/profile/me');
                const dbProfile = res.data;

                // Merge DB profile into local user state
                setUser(prev => {
                    const merged = {
                        ...prev,
                        name: dbProfile.user?.name || prev.name,
                        email: dbProfile.user?.email || prev.email,
                        contact: dbProfile.contact || prev.contact,
                        location: dbProfile.location || prev.location,
                        interests: dbProfile.interests && dbProfile.interests.length > 0 ? dbProfile.interests : (dbProfile.skills && dbProfile.skills.length > 0 ? dbProfile.skills : prev.interests),
                        experience: dbProfile.experience || prev.experience,
                        education: dbProfile.education || prev.education,
                        certifications: dbProfile.certifications || prev.certifications,
                        jobPreferences: dbProfile.preferences || prev.jobPreferences,
                        resume: dbProfile.resumeUrl ? {
                            url: dbProfile.resumeUrl,
                            name: dbProfile.resumeUrl.split('/').pop(),
                            size: "Unknown",
                            uploadedDate: "Prior Session"
                        } : prev.resume
                    };
                    localStorage.setItem("user", JSON.stringify(merged));
                    return merged;
                });
            } catch (err) {
                console.error("Failed to fetch profile from DB", err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        localStorage.setItem("user", JSON.stringify(user));
    }, [user]);

    // -- Helper to sync profile to backend --
    const syncProfileToBackend = async (dataToSync) => {
        try {
            // Map the frontend user state to the backend profile fields
            const payload = {
                contact: dataToSync.contact,
                location: dataToSync.location,
                interests: dataToSync.interests,
                experience: dataToSync.experience,
                education: dataToSync.education,
                certifications: dataToSync.certifications,
                preferences: dataToSync.jobPreferences,
                resumeUrl: dataToSync.resume?.url
            };
            await api.post('/api/profile', payload);
        } catch (err) {
            console.error("Failed to sync profile to DB", err);
        }
    };

    // -- Employer Jobs State --
    const [postedJobs, setPostedJobs] = useState([]);
    const [isLoadingJobs, setIsLoadingJobs] = useState(false);
    const [isAutofilling, setIsAutofilling] = useState(false); // Added for AI autofill loading

    useEffect(() => {
        if (user.role === 'employer') {
            const fetchEmployerJobs = async () => {
                setIsLoadingJobs(true);
                try {
                    const res = await api.get('/api/jobs/my-jobs');
                    setPostedJobs(res.data);
                } catch (err) {
                    console.error("Failed to fetch employer jobs", err);
                } finally {
                    setIsLoadingJobs(false);
                }
            };
            fetchEmployerJobs();
        }
    }, [user]);

    // -- Edit Modes State --
    const [editingSection, setEditingSection] = useState(null); // 'header', 'experience', 'education', etc.
    const fileInputRef = useRef(null);
    const resumeInputRef = useRef(null);
    const sectionDocRef = useRef(null); // Used for nested document uploads

    // -- Temporary Edit Buffers --
    const [headerEdit, setHeaderEdit] = useState({ name: "", contact: "", location: "" });
    const [interestsEdit, setInterestsEdit] = useState("");
    const [tempDoc, setTempDoc] = useState(null); // Holds the currently uploaded nested document

    // Arrays for adding new items
    const [newExp, setNewExp] = useState({ title: "", company: "", duration: "", description: "" });
    const [newEdu, setNewEdu] = useState({ school: "", degree: "", year: "" });
    const [newCert, setNewCert] = useState({ name: "", issuer: "", year: "" });
    const [prefsEdit, setPrefsEdit] = useState({ ...user.jobPreferences });

    // -- Handlers --
    const handleSaveHeader = () => {
        const updated = { ...user, ...headerEdit };
        setUser(updated);
        syncProfileToBackend(updated);
        setEditingSection(null);
    };

    const handleSaveInterests = () => {
        const interestsArray = interestsEdit.split(",").map(i => i.trim()).filter(i => i !== "");
        const updated = { ...user, interests: interestsArray };
        setUser(updated);
        syncProfileToBackend(updated);
        setEditingSection(null);
    };

    const handleSavePrefs = () => {
        const parseList = (str) => typeof str === 'string' ? str.split(",").map(i => i.trim()).filter(i => i) : str;
        const updated = {
            ...user,
            jobPreferences: {
                ...prefsEdit,
                titles: parseList(prefsEdit.titles),
                types: parseList(prefsEdit.types),
                schedules: parseList(prefsEdit.schedules),
            }
        };
        setUser(updated);
        syncProfileToBackend(updated);
        setEditingSection(null);
    };

    const handleAddExperience = () => {
        if (!newExp.title || !newExp.company) return;
        const updatedExp = [...user.experience, { ...newExp, document: tempDoc, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }];
        const updated = { ...user, experience: updatedExp };
        setUser(updated);
        syncProfileToBackend(updated);
        setNewExp({ title: "", company: "", duration: "", description: "" });
        setTempDoc(null);
        setEditingSection(null);
    };

    const handleAddEducation = () => {
        if (!newEdu.school || !newEdu.degree) return;
        const updatedEdu = [...user.education, { ...newEdu, document: tempDoc, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }];
        const updated = { ...user, education: updatedEdu };
        setUser(updated);
        syncProfileToBackend(updated);
        setNewEdu({ school: "", degree: "", year: "" });
        setTempDoc(null);
        setEditingSection(null);
    };

    const handleAddCert = () => {
        if (!newCert.name) return;
        const updatedCert = [...user.certifications, { ...newCert, document: tempDoc, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }];
        const updated = { ...user, certifications: updatedCert };
        setUser(updated);
        syncProfileToBackend(updated);
        setNewCert({ name: "", issuer: "", year: "" });
        setTempDoc(null);
        setEditingSection(null);
    };

    const handleDeleteItem = (section, id) => {
        const filteredSection = user[section].filter(item => item.id !== id && item._id !== id);
        const updated = { ...user, [section]: filteredSection };
        setUser(updated);
        syncProfileToBackend(updated);
    };

    const handleCancelEdit = () => {
        setTempDoc(null);
        setEditingSection(null);
    };

    // -- File Uploads --
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUser(prev => ({ ...prev, profilePicture: reader.result }));
            reader.readAsDataURL(file);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Start AI Autofill Process
        setIsAutofilling(true);
        try {
            const formData = new FormData();
            formData.append('resume', file);

            const res = await api.post('/api/profile/upload-resume', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const { profile, message } = res.data;

            // Merge returned data into local state
            setUser(prev => {
                const merged = {
                    ...prev,
                    resume: {
                        name: file.name,
                        size: (file.size / 1024 / 1024).toFixed(2) + " MB",
                        uploadedDate: new Date().toLocaleDateString(),
                        url: profile.resumeUrl
                    },
                    contact: profile.contact || prev.contact,
                    location: profile.location || prev.location,
                    interests: profile.interests || prev.interests,
                    experience: profile.experience || prev.experience,
                    education: profile.education || prev.education,
                    certifications: profile.certifications || prev.certifications,
                    jobPreferences: profile.preferences || prev.jobPreferences
                };
                localStorage.setItem("user", JSON.stringify(merged));
                return merged;
            });

            alert(`✨ ${message}`);
        } catch (err) {
            console.error("Resume Upload/AI Autofill failed:", err);
            console.error("Error Response:", err.response?.data);
            const errMsg = err.response?.data?.message || err.message || "Could not automatically fill profile from resume.";
            alert(`❌ AI Autofill failed: ${errMsg}`);
        } finally {
            setIsAutofilling(false);
        }
    };

    const handleSectionDocUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setTempDoc({ name: file.name, size: (file.size / 1024 / 1024).toFixed(2) + " MB" });
        }
    };

    const removeResume = async (e) => {
        e.stopPropagation();
        setUser(prev => ({ ...prev, resume: null }));
        try {
            await api.post('/api/profile', { resumeUrl: '' });
        } catch (err) {
            console.error("Failed to clear resume from backend", err);
        }
    };

    // -- Smooth Scrolling --
    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            const y = el.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white pt-8 pb-32">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 relative z-20">

                {/* Left Sidebar (Progress / Nav) */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[30px] sticky top-24 shadow-2xl">
                        <h2 className={`font-bold mb-4 ${themeText}`}>Profile Completion</h2>

                        {/* Calculate completeness roughly */}
                        {(() => {
                            let score = 20; // base score for account existing
                            if (user.contact) score += 10;
                            if (user.location) score += 10;
                            if (user.resume) score += 20;
                            if (user.experience.length > 0) score += 15;
                            if (user.education.length > 0) score += 10;
                            if (user.interests.length > 0) score += 15;
                            return (
                                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                                    <div className={`h-full ${themeBg} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                                </div>
                            );
                        })()}
                        <p className="text-xs text-gray-400 mb-6 flex justify-between">
                            <span>Completeness</span>
                        </p>

                        <ul className="space-y-2 text-sm text-gray-300 font-medium tracking-wide">
                            {[
                                { id: 'contact', label: 'Contact Info' },
                                ...(user.role === 'admin' ? [
                                    { id: 'admin-dashboard', label: 'Admin Dashboard', action: () => navigate('/admin') }
                                ] : user.role === 'employer' ? [
                                    { id: 'posted-jobs', label: 'Posted Jobs' }
                                ] : [
                                    { id: 'my-applications', label: 'My Applications', action: () => navigate('/my-applications') },
                                    { id: 'resume', label: 'Resume / CV' },
                                    { id: 'experience', label: 'Experience' },
                                    { id: 'education', label: 'Education' },
                                    { id: 'skills', label: 'Skills & Interests' },
                                    { id: 'preferences', label: 'Job Preferences' },
                                    { id: 'certifications', label: 'Certifications' }
                                ])
                            ].map(item => (
                                <li
                                    key={item.id}
                                    onClick={() => item.action ? item.action() : scrollToSection(item.id)}
                                    className={`cursor-pointer hover:bg-white/5 hover:${themeText} p-3 rounded-xl transition-all duration-300 flex items-center justify-between group`}
                                >
                                    {item.label}
                                    <span className={`opacity-0 group-hover:opacity-100 ${themeText} transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300`}>→</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="md:col-span-3 space-y-8">

                    {/* Header Card (Contact Info) */}
                    <div id="contact" className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8 rounded-[40px] relative overflow-hidden group hover:border-white/20 transition-colors duration-500 shadow-xl">
                        {editingSection !== 'header' ? (
                            <button
                                onClick={() => {
                                    setHeaderEdit({ name: user.name, contact: user.contact, location: user.location });
                                    setEditingSection('header');
                                }}
                                className={`absolute top-8 right-8 cursor-pointer opacity-50 hover:opacity-100 ${themeText} transition flex items-center gap-2 font-bold bg-white/5 px-4 py-2 rounded-xl`}
                            >
                                ✏️ Edit
                            </button>
                        ) : (
                            <div className="absolute top-8 right-8 flex gap-3 z-20">
                                <button onClick={() => setEditingSection(null)} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition">Cancel</button>
                                <button onClick={handleSaveHeader} className={`px-5 py-2 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:brightness-110`}>Save</button>
                            </div>
                        )}

                        {/* Profile Picture */}
                        <div className="relative group/avatar cursor-pointer shrink-0 mt-4 sm:mt-0" onClick={() => fileInputRef.current?.click()}>
                            <div className={`w-36 h-36 rounded-3xl border-2 ${themeBorder}/30 bg-black overflow-hidden flex items-center justify-center transform group-hover/avatar:scale-105 transition duration-500 shadow-2xl`}>
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className={`text-6xl ${themeText} opacity-50`}>👤</span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/60 rounded-3xl flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-sm">
                                <span className={`text-white font-bold tracking-widest uppercase text-sm`}>Upload Photo</span>
                            </div>
                        </div>
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />

                        {/* User Details */}
                        <div className="flex-1 text-center sm:text-left w-full mt-2 sm:mt-4">
                            {editingSection === 'header' ? (
                                <div className="space-y-4 max-w-md mx-auto sm:mx-0">
                                    <input
                                        type="text" value={headerEdit.name} onChange={(e) => setHeaderEdit({ ...headerEdit, name: e.target.value })}
                                        className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-2xl font-bold focus:outline-none focus:border-2 ${themeBorder}`}
                                        placeholder="Your Name"
                                    />
                                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                                        <span className="text-xl grayscale">📞</span>
                                        <input
                                            type="text" value={headerEdit.contact} onChange={(e) => setHeaderEdit({ ...headerEdit, contact: e.target.value })}
                                            className={`w-full bg-transparent text-white focus:outline-none placeholder-gray-600`}
                                            placeholder="Phone Number"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-2 border border-white/5">
                                        <MapPinHouse className="w-5 h-5 text-gray-500" />
                                        <LocationInput
                                            value={headerEdit.location}
                                            onChange={(val) => setHeaderEdit({ ...headerEdit, location: val })}
                                            className="w-full bg-transparent text-white focus:outline-none placeholder-gray-600"
                                            placeholder="City, State"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <h1 className="text-4xl font-extrabold mb-1 tracking-tight">{user.name}</h1>
                                    <p className={`text-sm tracking-widest uppercase font-bold ${themeText} mb-6 opacity-80`}>{user.role}</p>

                                    <div className="space-y-3 text-sm text-gray-300 font-medium">
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">📧</div>
                                            <span className="text-gray-200">{user.email}</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">📞</div>
                                            <span className={user.contact ? "text-gray-200" : "text-gray-500 italic"}>{user.contact || "Add contact number"}</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-4">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10"><MapPinHouse className="w-4 h-4" /></div>
                                            <span className={user.location ? "text-gray-200" : "text-gray-500 italic"}>{user.location || "Add location"}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Employer specific sections */}
                    {user.role === 'employer' && (
                        <div id="posted-jobs" className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[40px] relative hover:border-white/20 transition shadow-xl">
                            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                <h2 className="text-2xl font-extrabold tracking-tight">Posted Jobs</h2>
                                <Link to="/employer" className={`px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ${themeText} font-bold border border-white/5 flex items-center transition`}>
                                    Manage Jobs
                                </Link>
                            </div>

                            {isLoadingJobs ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                                    <p className="text-gray-400">Loading jobs...</p>
                                </div>
                            ) : postedJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {postedJobs.map((job) => (
                                        <div
                                            key={job._id || job.id}
                                            onClick={() => navigate(`/employer/job/${job._id || job.id}`)}
                                            className="group relative bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/20 hover:bg-white/10 transition cursor-pointer"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className={`text-xl font-bold mb-1 transition text-white group-hover:${themeText}`}>{job.title}</h3>
                                                    <p className={`font-semibold ${themeText} mb-2`}>{job.company}</p>
                                                </div>
                                                <span className={`${job.status === 'pending' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'bg-[#5CB144]/20 text-[#5CB144]'} px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider`}>
                                                    {job.status === 'pending' ? 'Pending Approval' : 'Active'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 sm:flex sm:gap-6 mt-4 pt-4 border-t border-white/10">
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Location</span>
                                                    <span className="text-sm text-gray-300 font-medium truncate max-w-[120px] sm:max-w-none" title={job.location}>{job.location}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Pay</span>
                                                    <span className="text-sm text-gray-300 font-medium">{job.salary || job.pay || 'Not specified'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Type</span>
                                                    <span className="text-sm text-gray-300 font-medium">{job.type}</span>
                                                </div>
                                            </div>

                                            <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300">
                                                →
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-2xl bg-white/5">
                                    <span className="text-5xl opacity-50 mb-4 block">🏢</span>
                                    <h3 className="text-xl font-bold text-white mb-2">No jobs posted yet</h3>
                                    <p className="text-gray-400 mb-6">Create your first job listing to start attracting talent.</p>
                                    <Link to="/employer" className={`px-6 py-3 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:opacity-90 inline-block`}>
                                        Post a Job
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Student/Candidate specific sections */}
                    {user.role !== 'employer' && user.role !== 'admin' && (
                        <>
                            {/* Resume Upload and AI Builder */}
                            <div id="resume" className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[40px] relative hover:border-white/20 transition shadow-xl">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-extrabold tracking-tight">Resume / CV</h2>
                                </div>
                                <input type="file" accept=".pdf,.doc,.docx" className="hidden" ref={resumeInputRef} onChange={handleResumeUpload} />

                                {isAutofilling && (
                                    <div className="mb-6 flex items-center gap-4 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl animate-pulse">
                                        <div className="w-8 h-8 rounded-full border-2 border-t-emerald-400 border-emerald-400/20 animate-spin"></div>
                                        <p className="text-emerald-400 font-bold text-sm">✨ Somojo AI is analyzing your resume and autofilling your profile...</p>
                                    </div>
                                )}

                                {user.resume ? (
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${themeBg}/20 flex items-center justify-center text-3xl shrink-0`}><FileUser className={`w-8 h-8 ${themeText}`} /></div>
                                            <div>
                                                <a
                                                    href={user.resume.url.startsWith('http') ? user.resume.url : `http://localhost:5000${user.resume.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-bold text-lg text-white hover:text-[#CF9EFF] transition decoration-dotted underline-offset-4 hover:underline"
                                                >
                                                    {user.resume.name}
                                                </a>
                                                <p className="text-sm text-gray-400">Uploaded {user.resume.uploadedDate} • {user.resume.size}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-3">
                                            <button onClick={() => resumeInputRef.current?.click()} className="text-gray-400 hover:text-white bg-white/5 px-4 py-2 rounded-xl transition font-medium">Replace</button>
                                            <button onClick={removeResume} className="text-red-400 hover:text-red-300 hover:bg-red-400/10 px-4 py-2 rounded-xl transition font-medium">Delete</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        {/* Upload Option */}
                                        <div onClick={() => resumeInputRef.current?.click()} className={`border-2 border-dashed ${themeBorder}/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 hover:${themeBorder}/50 transition cursor-pointer group`}>
                                            <div className={`w-16 h-16 rounded-full bg-white/5 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}>
                                                <FileUser className="w-8 h-8 opacity-50 group-hover:opacity-100 transition" />
                                            </div>
                                            <h3 className="font-bold text-lg mb-1 text-white group-hover:text-gray-200 transition">Upload Resume</h3>
                                            <p className="text-gray-400 text-sm">PDF or DOCX, up to 10MB</p>
                                        </div>

                                        {/* AI Builder Option */}
                                        <Link to="/build-resume">
                                            <div className={`border-2 border-transparent bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center hover:from-white/10 hover:to-white/20 transition cursor-pointer group relative overflow-hidden h-full shadow-[0_0_15px_rgba(255,255,255,0.05)]`}>
                                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 transform -translate-x-full group-hover:translate-x-full"></div>
                                                <div className={`w-16 h-16 rounded-full ${themeBg}/20 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.1)]`}>
                                                    <span className="text-3xl transition">✨</span>
                                                </div>
                                                <h3 className={`font-bold text-lg mb-1 text-white transition flex items-center gap-2`}>
                                                    Create with <span className={themeText}>Somojo AI</span>
                                                </h3>
                                                <p className="text-gray-400 text-sm">Generate a professional resume instantly</p>
                                                <div className={`absolute -bottom-2 -right-2 w-24 h-24 ${themeBg} blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Hidden Generic Document Input for nested sections */}
                            <input type="file" className="hidden" ref={sectionDocRef} onChange={handleSectionDocUpload} />

                            {/* Section Builder Helper */}
                            {[
                                { id: 'experience', title: 'Work Experience', state: user.experience, addNew: newExp, setAddNew: setNewExp, keys: ['title', 'company', 'duration', 'description'], saveFn: handleAddExperience },
                                { id: 'education', title: 'Education', state: user.education, addNew: newEdu, setAddNew: setNewEdu, keys: ['degree', 'school', 'year'], saveFn: handleAddEducation },
                                { id: 'certifications', title: 'Certifications', state: user.certifications, addNew: newCert, setAddNew: setNewCert, keys: ['name', 'issuer', 'year'], saveFn: handleAddCert }
                            ].map(section => (
                                <div key={section.id} id={section.id} className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[40px] relative transition hover:border-white/20 shadow-xl">
                                    <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                        <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
                                        {editingSection !== section.id && (
                                            <button onClick={() => setEditingSection(section.id)} className={`px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ${themeText} font-bold border border-white/5 flex gap-2 items-center transition`}>
                                                <span className="text-lg leading-none">+</span> Add
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        {section.state.map(item => (
                                            <div key={item.id} className="group relative bg-white/5 border border-white/5 rounded-2xl p-6 hover:border-white/20 transition">
                                                <button onClick={() => handleDeleteItem(section.id, item.id || item._id)} className="absolute top-6 right-6 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition font-bold text-xl leading-none">×</button>
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gray-200 transition">{item[section.keys[0]]}</h3>
                                                <p className={`font-semibold ${themeText} mb-3`}>{item[section.keys[1]]}</p>
                                                {section.keys.slice(2).map(key => item[key] && <p key={key} className="text-gray-400 text-sm mt-3">{item[key]}</p>)}

                                                {/* Display Attached Document if present */}
                                                {item.document && (
                                                    <div className="mt-4 inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-sm text-gray-300">
                                                        <span>📎</span> <span className="font-medium truncate max-w-[200px]">{item.document.name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {section.state.length === 0 && editingSection !== section.id && (
                                            <p className="text-gray-500 italic text-center py-6">No {section.title.toLowerCase()} added yet.</p>
                                        )}

                                        {editingSection === section.id && (
                                            <div className="bg-black/60 border border-white/10 rounded-2xl p-6 space-y-4">
                                                {section.keys.map(key => (
                                                    <input
                                                        key={key}
                                                        type="text"
                                                        placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                                                        value={section.addNew[key]}
                                                        onChange={e => section.setAddNew({ ...section.addNew, [key]: e.target.value })}
                                                        className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 ${themeBorder}`}
                                                    />
                                                ))}

                                                {/* Nested Document Upload Area */}
                                                <div className="pt-2">
                                                    {tempDoc ? (
                                                        <div className="inline-flex items-center justify-between bg-white/5 border border-white/10 p-3 rounded-xl gap-4">
                                                            <div className="flex items-center gap-2">
                                                                <span>📎</span>
                                                                <span className="text-sm text-white font-medium">{tempDoc.name}</span>
                                                            </div>
                                                            <button onClick={() => setTempDoc(null)} className="text-gray-500 hover:text-red-400 text-sm font-bold">×</button>
                                                        </div>
                                                    ) : (
                                                        <button onClick={() => sectionDocRef.current?.click()} className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2 transition bg-white/5 px-4 py-2 rounded-xl border border-white/5 hover:border-white/20">
                                                            📎 Attach Document
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                                    <button onClick={handleCancelEdit} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition">Cancel</button>
                                                    <button onClick={section.saveFn} className={`px-5 py-2 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:opacity-90`}>Save</button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Skills & Interests */}
                            <div id="skills" className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[40px] relative transition hover:border-white/20 shadow-xl">
                                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-extrabold tracking-tight">Skills & Interests</h2>
                                    {editingSection !== 'skills' && (
                                        <button onClick={() => { setInterestsEdit(user.interests.join(", ")); setEditingSection('skills'); }} className={`px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ${themeText} font-bold border border-white/5 flex gap-2 items-center transition`}>
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'skills' ? (
                                    <div className="space-y-4">
                                        <label className="block text-sm text-gray-400 font-medium">Separate skills with commas</label>
                                        <textarea
                                            value={interestsEdit}
                                            onChange={(e) => setInterestsEdit(e.target.value)}
                                            className={`w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-2 ${themeBorder} min-h-[120px] font-medium leading-relaxed uppercase tracking-wide text-sm`}
                                            placeholder="e.g. Retail, Management, POS Systems, Customer Service"
                                        />
                                        <div className="flex justify-end gap-3 pt-2">
                                            <button onClick={() => setEditingSection(null)} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition">Cancel</button>
                                            <button onClick={handleSaveInterests} className={`px-5 py-2 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:opacity-90`}>Save Skills</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-3">
                                        {user.interests.length > 0 ? (
                                            user.interests.map((interest, idx) => (
                                                <span key={idx} className={`px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 font-bold tracking-wide uppercase text-xs hover:border-white/30 transition`}>
                                                    {interest}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 italic text-center w-full py-4">No skills added yet.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Job Preferences */}
                            <div id="preferences" className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[40px] relative transition hover:border-white/20 shadow-xl overflow-hidden">
                                <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                    <h2 className="text-2xl font-extrabold tracking-tight">Job Preferences</h2>
                                    {editingSection !== 'prefs' && (
                                        <button onClick={() => {
                                            setPrefsEdit({
                                                titles: user.jobPreferences.titles.join(", "),
                                                types: user.jobPreferences.types.join(", "),
                                                schedules: user.jobPreferences.schedules.join(", "),
                                                basePay: user.jobPreferences.basePay,
                                                relocation: user.jobPreferences.relocation
                                            });
                                            setEditingSection('prefs');
                                        }} className={`px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 ${themeText} font-bold border border-white/5 flex gap-2 items-center transition`}>
                                            ✏️ Edit
                                        </button>
                                    )}
                                </div>

                                {editingSection === 'prefs' ? (
                                    <div className="space-y-5 bg-black/40 p-6 rounded-3xl border border-white/5">
                                        {[
                                            { label: 'Desired Job Titles', key: 'titles', placeholder: 'e.g. Store Manager, Cashier (comma separated)' },
                                            { label: 'Job Types', key: 'types', placeholder: 'e.g. Full-time, Part-time, Contract' },
                                            { label: 'Work Schedules', key: 'schedules', placeholder: 'e.g. Weekend, Evening, Flexible' },
                                            { label: 'Base Pay', key: 'basePay', placeholder: 'e.g. $25/hr or $60,000/yr' },
                                        ].map(field => (
                                            <div key={field.key}>
                                                <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">{field.label}</label>
                                                <input
                                                    type="text"
                                                    value={prefsEdit[field.key]}
                                                    onChange={(e) => setPrefsEdit({ ...prefsEdit, [field.key]: e.target.value })}
                                                    className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 ${themeBorder}`}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}
                                        <div>
                                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">Relocation</label>
                                            <select
                                                value={prefsEdit.relocation}
                                                onChange={(e) => setPrefsEdit({ ...prefsEdit, relocation: e.target.value })}
                                                className={`w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 ${themeBorder} appearance-none`}
                                            >
                                                <option className="bg-gray-900">Not open to relocation</option>
                                                <option className="bg-gray-900">Open to relocation</option>
                                            </select>
                                        </div>
                                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                                            <button onClick={() => setEditingSection(null)} className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition">Cancel</button>
                                            <button onClick={handleSavePrefs} className={`px-5 py-2 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:opacity-90`}>Save Preferences</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Desired Job Titles', val: user.jobPreferences.titles.join(", ") },
                                            { label: 'Job Types', val: user.jobPreferences.types.join(", ") },
                                            { label: 'Work Schedules', val: user.jobPreferences.schedules.join(", ") },
                                            { label: 'Base Pay', val: user.jobPreferences.basePay },
                                            { label: 'Relocation', val: user.jobPreferences.relocation },
                                        ].map(pref => (
                                            <div key={pref.label} className="flex flex-col sm:flex-row sm:justify-between py-4 border-b border-white/5 last:border-0 group hover:bg-white/5 px-4 rounded-xl transition cursor-default">
                                                <span className="font-bold text-white group-hover:text-gray-200">{pref.label}</span>
                                                <span className="text-gray-400 font-medium sm:text-right">{pref.val || <span className="italic opacity-50">Not specified</span>}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                </div>
            </div>
        </div>
    );
}

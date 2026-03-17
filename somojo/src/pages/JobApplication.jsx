import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPinHouse, Bookmark, Rocket, Users } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function JobApplication() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Agreement Flow
    const [viewingAgreement, setViewingAgreement] = useState(null); // application data
    const [seekerSig, setSeekerSig] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/jobs/${id}`);
                setJob(res.data);
                // Check if already applied
                const appRes = await api.get(`/api/applications/status/${id}`);
                if (appRes.data) {
                    setApplicationStatus(appRes.data);
                    setSubmitted(appRes.data.status !== 'none');
                }
                // Check if job is saved
                const saveRes = await api.get(`/api/saved-jobs/check/${id}`);
                setIsSaved(saveRes.data.isSaved);
            } catch (err) {
                console.error("Error fetching job details", err);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/api/applications/${id}`);
            // Server returns { message, application } — extract the application object
            const savedApp = res.data.application || res.data;
            setSubmitted(true);
            setApplicationStatus({
                status: savedApp.status || 'applied',
                appliedAt: savedApp.createdAt || new Date()
            });
        } catch (err) {
            console.error("Apply Error:", err);
            const errorMsg = err.response?.data?.message || err.message || 'Failed to apply. Please try again.';
            alert(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveJob = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (isSaved) {
                await api.delete(`/api/saved-jobs/${id}`);
            } else {
                await api.post(`/api/saved-jobs/${id}`);
            }
            setIsSaved(!isSaved);
        } catch (err) {
            console.error(err);
            alert('Failed to update saved status');
        }
    };

    const handleAcceptAgreement = async () => {
        if (!seekerSig.trim()) {
            alert("Please type your signature to accept.");
            return;
        }

        setIsAccepting(true);
        try {
            await api.post(`/api/applications/${viewingAgreement._id}/agreement/accept`, {
                signature: seekerSig
            });
            alert("Congratulations! You have accepted the agreement.");
            setViewingAgreement(null);
            setSeekerSig("");
            
            // Update status local state
            setApplicationStatus(prev => ({
                ...prev,
                status: 'accepted',
                agreement: { ...prev.agreement, status: 'accepted', candidateSignature: seekerSig }
            }));
        } catch (err) {
            console.error(err);
            alert("Failed to accept agreement");
        } finally {
            setIsAccepting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#CF9EFF] border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-xl text-gray-400 font-medium">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
                <p className="text-gray-400 mb-8">This opportunity may have been removed or filled.</p>
                <button onClick={() => navigate('/jobs')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition">
                    ← Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            {/* Background Ambience */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${themeBg} opacity-[0.05] blur-[100px] rounded-full mix-blend-screen pointer-events-none`}></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span> Back to Jobs
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Job Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            {/* Header Section */}
                            <div className="flex gap-6 items-start mb-10">
                                {/* Company Logo */}
                                <div className="w-24 h-24 shrink-0 bg-[#111] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg">
                                    <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                                </div>

                                {/* Title and Base Info */}
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold text-white mb-2">{job.title}</h1>
                                    <p className={`${themeText} text-xl font-medium mb-6`}>{job.company}</p>

                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                            <MapPinHouse className="w-5 h-5 text-gray-500" /> {job.location}
                                        </span>
                                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                            <span className="text-gray-500">💼</span> {job.type}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-white/10 mb-10 pb-10">
                                {/* Status Banner */}
                                {submitted && (
                                    <div className="mb-6 bg-[#5CB144]/10 border border-[#5CB144]/30 rounded-2xl p-4 flex items-center gap-3">
                                        <span className="text-2xl">✓</span>
                                        <div>
                                            <p className="font-bold text-[#5CB144]">Application Submitted</p>
                                            <p className="text-sm text-gray-400">Your application has been submitted. We'll notify you of updates.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="space-y-10">
                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">About the Role</h3>
                                    <div className="text-gray-400 text-lg leading-relaxed space-y-4">
                                        <p>{job.description}</p>
                                        <p>As a key member of our team at {job.company}, you will be expected to uphold our high standards and ensure a positive environment. We offer opportunities for growth and a supportive localized team structure.</p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Requirements</h3>
                                    <ul className="space-y-3">
                                        {job.requirements && job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-4">
                                                <span className="text-[#CF9EFF] mt-1 text-xl">✓</span>
                                                <span className="text-gray-300 text-lg">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Benefits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Health Insurance</p>
                                            <p className="font-bold text-white">✓ Included</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Paid Time Off</p>
                                            <p className="font-bold text-white">15+ Days</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Professional Growth</p>
                                            <p className="font-bold text-white">Training & Development</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Flexible Schedule</p>
                                            <p className="font-bold text-white">Available</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Application Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 shadow-2xl sticky top-32 space-y-6">
                                <h3 className="text-xl font-bold mb-4 text-white">Application Actions</h3>
                                <div className="text-sm text-gray-400 mb-6 space-y-2">
                                    <p className="flex items-center gap-2">⏱️ Posted {new Date(job.createdAt).toLocaleString("en-IN", { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                    <p className="flex items-center gap-2 text-[#CF9EFF] font-semibold bg-[#CF9EFF]/10 w-fit px-3 py-1 rounded-lg">
                                        <Users className="w-4 h-4" /> {job.applicants || 0} people applied
                                    </p>
                                </div>

                            {(!user || user.role === 'job-seeker') ? (
                                <>
                                    {/* Apply Now Button */}
                                    <button
                                        onClick={handleApply}
                                        disabled={submitted || submitting}
                                        className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 ${submitted
                                            ? "bg-[#5CB144]/20 text-[#5CB144] border border-[#5CB144]/30 cursor-default"
                                            : `${themeBg} text-black hover:scale-105 active:scale-95 shadow-lg`
                                            } ${submitting ? "opacity-75 cursor-wait" : ""}`}
                                    >
                                        {submitting && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                                        {submitted ? "✓ Applied" : <><Rocket className="w-4 h-4 inline-block mr-2" /> Apply Now</>}
                                    </button>

                                    {/* Save/Bookmark Button */}
                                    <button
                                        onClick={handleSaveJob}
                                        className={`w-full font-bold py-3 px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 ${isSaved
                                            ? "bg-[#5CB144]/20 border-[#5CB144]/30 text-[#5CB144]"
                                            : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                            }`}
                                    >
                                        {isSaved ? "💾 Saved" : <><Bookmark className="w-5 h-5" /> Save Job</>}
                                    </button>

                                    {/* Application Status */}
                                    {applicationStatus && (
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4">
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Your Status</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-bold capitalize text-white">{applicationStatus.status}</p>
                                                    {applicationStatus.agreement?.status === 'sent' && applicationStatus.status !== 'accepted' && (
                                                        <button 
                                                            onClick={() => setViewingAgreement(applicationStatus)}
                                                            className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black px-3 py-1.5 rounded-lg font-bold text-[10px] transition animate-pulse"
                                                        >
                                                            📜 Review Agreement
                                                        </button>
                                                    )}
                                                    {applicationStatus.agreement?.status === 'accepted' && (
                                                        <button 
                                                            onClick={() => setViewingAgreement(applicationStatus)}
                                                            className="text-gray-400 hover:text-white transition"
                                                            title="View Signed Agreement"
                                                        >
                                                            📜 View
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {applicationStatus.appliedAt && (
                                                <p className="text-[10px] text-gray-500">
                                                    Applied on {new Date(applicationStatus.appliedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="bg-[#CF9EFF]/5 border border-[#CF9EFF]/20 rounded-2xl p-4 text-center">
                                    <p className="text-sm text-[#CF9EFF] font-medium italic">Viewing as {user.role}</p>
                                    <p className="text-xs text-gray-500 mt-1">Application options are restricted to candidate accounts.</p>
                                </div>
                            )}

                            {/* Share Job */}
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    if (navigator.share) {
                                        navigator.share({ title: job.title, text: `Check out this job: ${job.title} at ${job.company}`, url });
                                    } else {
                                        navigator.clipboard.writeText(url);
                                        alert('Job link copied to clipboard!');
                                    }
                                }}
                                className="w-full font-semibold py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                            >
                                <span>📤</span> Share Job
                            </button>

                            {/* Report Job */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Report this job as inappropriate or fraudulent?')) {
                                        alert('Thank you for the report. Our team will review this listing.');
                                    }
                                }}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition font-medium py-2"
                            >
                                Report Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Agreement Review Modal */}
            {viewingAgreement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => !isAccepting && setViewingAgreement(null)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Employement Agreement</h3>
                                <p className="text-gray-400 text-sm">Review the terms provided by <span className={themeText}>{job.company}</span></p>
                            </div>
                            <button onClick={() => setViewingAgreement(null)} className="text-gray-500 hover:text-white transition text-2xl">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
                                {viewingAgreement.agreement?.fields?.map((field, index) => (
                                    <div key={index} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                        <h4 className="text-[#CF9EFF] text-xs font-bold uppercase tracking-widest mb-2">{field.question}</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{field.answer}</p>
                                    </div>
                                ))}
                                {(!viewingAgreement.agreement?.fields || viewingAgreement.agreement.fields.length === 0) && (
                                    <p className="text-gray-500 italic text-center">No specific terms provided. Please contact the employer for details.</p>
                                )}
                            </div>

                            {viewingAgreement.agreement?.status === 'accepted' ? (
                                <div className="grid grid-cols-2 gap-6 bg-white/5 border border-white/10 rounded-2xl p-6">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-gray-500 uppercase">Employer Signature</p>
                                        <p className="text-white font-mono text-lg italic">{viewingAgreement.agreement?.employerSignature}</p>
                                        <p className="text-[9px] text-gray-600">Signed on {new Date(viewingAgreement.agreement?.sentAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-white/10 pl-6">
                                        <p className="text-[10px] font-bold text-[#5CB144] uppercase">Candidate Signature</p>
                                        <p className="text-white font-mono text-lg italic">{viewingAgreement.agreement?.candidateSignature}</p>
                                        <p className="text-[9px] text-gray-600">Signed on {new Date(viewingAgreement.agreement?.acceptedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-[#5CB144]/5 border border-[#5CB144]/20 rounded-2xl p-6">
                                    <label className="block text-sm font-bold text-[#5CB144] uppercase tracking-widest mb-3">Acceptance & Digital Signature</label>
                                    <input 
                                        type="text"
                                        value={seekerSig}
                                        onChange={(e) => setSeekerSig(e.target.value)}
                                        placeholder="Type your full name to sign"
                                        className="w-full bg-black/40 border border-[#5CB144]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#5CB144]"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-2 italic">* By signing, you accept the terms and conditions mentioned above.</p>
                                </div>
                            )}
                        </div>

                        {viewingAgreement.agreement?.status !== 'accepted' && (
                            <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
                                <button 
                                    onClick={() => setViewingAgreement(null)}
                                    className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                                >
                                    Review Later
                                </button>
                                <button 
                                    onClick={handleAcceptAgreement}
                                    disabled={!seekerSig || isAccepting}
                                    className="flex-[2] py-4 rounded-2xl bg-[#5CB144] hover:bg-[#4a9136] text-white font-bold transition shadow-lg shadow-[#5CB144]/20 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isAccepting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                                    Confirm Acceptance
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

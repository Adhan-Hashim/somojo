import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPinHouse, FileUser } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function EmployerJobDetails() {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();

    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sorting, setSorting] = useState("aiScore"); // aiScore, appliedDate, name
    const [filterStatus, setFilterStatus] = useState("all"); // all, new, accepted, rejected, saved
    const [contactingApplicant, setContactingApplicant] = useState(null);
    const [contactMessage, setContactMessage] = useState("");
    
    // Agreement Flow
    const [draftingAgreement, setDraftingAgreement] = useState(null); // application
    const [agreementFields, setAgreementFields] = useState([]); // [{ question, answer }]
    const [isGenerating, setIsGenerating] = useState(false);
    const [employerSig, setEmployerSig] = useState("");

    useEffect(() => {
        const fetchJobAndApplications = async () => {
            setLoading(true);
            try {
                const jobRes = await api.get(`/api/jobs/${jobId}`);
                setJob(jobRes.data);

                const appRes = await api.get(`/api/applications/job/${jobId}`);
                setApplications(appRes.data);
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchJobAndApplications();
    }, [jobId]);

    const getScoreColor = (score) => {
        if (!score) return "text-gray-500 bg-gray-500/10 border-gray-500/20";
        if (score >= 80) return "text-[#5CB144] bg-[#5CB144]/10 border-[#5CB144]/20";
        if (score >= 60) return "text-[#CF9EFF] bg-[#CF9EFF]/10 border-[#CF9EFF]/20";
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    };

    const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
        try {
            await api.put(`/api/applications/${applicationId}/status`, { status: newStatus });
            setApplications(prev =>
                prev.map(app =>
                    app._id === applicationId ? { ...app, status: newStatus } : app
                )
            );
        } catch (err) {
            console.error("Failed to update application status", err);
            alert("Failed to update application status");
        }
    };

    const handleGenerateAgreementDraft = async (applicationId) => {
        setIsGenerating(true);
        try {
            const res = await api.post(`/api/applications/${applicationId}/agreement/generate`);
            setAgreementFields(res.data.fields || []);
        } catch (err) {
            console.error(err);
            alert("Failed to generate agreement draft");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleAddField = () => {
        setAgreementFields([...agreementFields, { question: "", answer: "" }]);
    };

    const handleUpdateField = (index, key, value) => {
        const newFields = [...agreementFields];
        newFields[index][key] = value;
        setAgreementFields(newFields);
    };

    const handleRemoveField = (index) => {
        setAgreementFields(agreementFields.filter((_, i) => i !== index));
    };

    const handleSendAgreementDraft = async (applicationId) => {
        if (agreementFields.length === 0 || !employerSig.trim()) {
            alert("Please provide the agreement fields and your signature.");
            return;
        }

        try {
            await api.post(`/api/applications/${applicationId}/agreement/send`, {
                fields: agreementFields,
                employerSignature: employerSig
            });
            alert("Agreement sent to candidate!");
            setDraftingAgreement(null);
            setAgreementFields([]);
            setEmployerSig("");
            
            // Re-fetch to update status UI
            const appRes = await api.get(`/api/applications/job/${jobId}`);
            setApplications(appRes.data);
        } catch (err) {
            console.error(err);
            alert("Failed to send agreement");
        }
    };

    const handleContactCandidate = async (applicationId) => {
        if (!contactMessage.trim()) {
            alert("Please enter a message");
            return;
        }

        try {
            await api.post(`/api/applications/${applicationId}/contact`, {
                message: contactMessage
            });
            alert("Message sent to candidate!");
            setContactingApplicant(null);
            setContactMessage("");
        } catch (err) {
            console.error(err);
            alert("Failed to send message");
        }
    };

    const handleReEvaluate = async (applicationId) => {
        try {
            const res = await api.post(`/api/applications/${applicationId}/re-evaluate`);
            setApplications(prev =>
                prev.map(app =>
                    app._id === applicationId ? { ...app, aiMatchScore: res.data.score, aiAnalysis: res.data.analysis } : app
                )
            );
        } catch (err) {
            console.error(err);
            alert("Failed to re-evaluate application.");
        }
    };

    // Sort applications
    const sortedAndFilteredApps = applications
        .filter(app => filterStatus === "all" || app.status === filterStatus)
        .sort((a, b) => {
            if (sorting === "aiScore") {
                return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
            } else if (sorting === "appliedDate") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sorting === "name") {
                return (a.applicant?.name || "").localeCompare(b.applicant?.name || "");
            }
            return 0;
        });

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
                <button onClick={() => navigate('/profile')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition">
                    ← Back to Profile
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            {/* Background */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${themeBg} opacity-[0.05] blur-[100px] rounded-full mix-blend-screen pointer-events-none`}></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span> Back to Profile
                </button>

                {/* Job Header */}
                <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 md:p-12 shadow-2xl mb-8">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 shrink-0 bg-[#111] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg">
                            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                        </div>
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
                                <span className="bg-[#5CB144]/10 border border-[#5CB144]/20 px-4 py-2 rounded-xl text-[#5CB144] font-bold">
                                    {job.pay}
                                </span>
                                <span className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 px-4 py-2 rounded-xl text-[#CF9EFF] font-bold">
                                    👥 {applications.length} Applications
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Sorting */}
                <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[30px] p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Filter by Status</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 focus:border-[#CF9EFF]"
                            >
                                <option value="all">All Applications</option>
                                <option value="new">New</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="saved">Saved</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Sort by</label>
                            <select
                                value={sorting}
                                onChange={(e) => setSorting(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 focus:border-[#CF9EFF]"
                            >
                                <option value="aiScore">🤖 AI Match Score (Best)</option>
                                <option value="appliedDate">📅 Recently Applied</option>
                                <option value="name">👤 Candidate Name</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applicants List */}
                <div>
                    {sortedAndFilteredApps.length === 0 ? (
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[30px] p-16 text-center">
                            <div className="text-5xl mb-4">📭</div>
                            <h3 className="text-2xl font-bold mb-2">No Applications</h3>
                            <p className="text-gray-400">
                                {filterStatus !== "all" ? "No applications with this status." : "No applications yet."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {sortedAndFilteredApps.map((app) => (
                                <div key={app._id} className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 hover:border-[#CF9EFF]/30 rounded-[30px] p-8 transition-all shadow-lg">
                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        {/* Applicant Info */}
                                        <div className="lg:col-span-2">
                                            <div className="flex items-start gap-4 mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-600 overflow-hidden border border-white/10 shrink-0">
                                                    <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${app.applicant?.name || app._id}`} alt="Avatar" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-white">{app.applicant?.name || "Unknown"}</h3>
                                                    <p className="text-gray-400">{app.applicant?.email}</p>
                                                    <p className="text-sm text-gray-500 mt-2">
                                                        Applied {new Date(app.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Resume Link */}
                                            {app.resumeUrl && (
                                                <div className="mt-4">
                                                    <a
                                                        href={`http://localhost:5000${app.resumeUrl}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-[#CF9EFF]/50 rounded-xl text-sm font-bold text-gray-300 transition-all hover:bg-white/10"
                                                    >
                                                        <FileUser className="w-4 h-4" /> View Resume
                                                    </a>
                                                </div>
                                            )}

                                            {/* Skills Tags */}
                                            <div className="flex flex-wrap gap-2 mt-6">
                                                {(app.applicant?.skills || app.applicant?.interests || []).slice(0, 5).map((skill, idx) => (
                                                    <span key={idx} className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 px-3 py-1 rounded-lg text-[10px] text-[#CF9EFF] font-bold uppercase tracking-wider">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* AI Analysis */}
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="text-sm font-bold text-gray-400">✨ AI Match</span>
                                                <div className={`px-3 py-1 rounded-full border font-bold text-sm ${getScoreColor(app.aiMatchScore)}`}>
                                                    {app.aiMatchScore && app.aiMatchScore > 0 ? `${app.aiMatchScore}%` : "Pending"}
                                                </div>
                                            </div>
                                            <p className={`text-sm leading-relaxed mb-3 ${!app.aiAnalysis ? "text-gray-500 italic" : "text-gray-400"}`}>
                                                {app.aiAnalysis || "AI is currently evaluating this candidate's profile against the job requirements..."}
                                            </p>
                                            {(!app.aiMatchScore || app.aiMatchScore === 0 || !app.aiAnalysis) && (
                                                <button
                                                    onClick={() => handleReEvaluate(app._id)}
                                                    className="w-full py-2 bg-[#CF9EFF]/10 hover:bg-[#CF9EFF]/20 border border-[#CF9EFF]/30 text-[#CF9EFF] text-xs font-bold rounded-xl transition flex items-center justify-center gap-1"
                                                >
                                                    ✨ Regenerate AI Analysis
                                                </button>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="space-y-3">
                                            {/* Status Badge */}
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Current Status</p>
                                                <p className="text-lg font-bold capitalize text-white mb-3">{app.status || "New"}</p>

                                                {/* Status Actions */}
                                                <div className="space-y-2">
                                                    {app.status !== "accepted" && app.status !== "rejected" && app.agreement?.status !== 'sent' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setDraftingAgreement(app);
                                                                    handleGenerateAgreementDraft(app._id);
                                                                }}
                                                                className="w-full py-2.5 px-3 rounded-xl text-sm font-bold transition bg-[#5CB144]/10 text-[#5CB144] hover:bg-[#5CB144]/20 border border-[#5CB144]/20"
                                                            >
                                                                ✓ Accept & Start Agreement
                                                            </button>
                                                            <button
                                                                onClick={() => handleUpdateApplicationStatus(app._id, "rejected")}
                                                                className="w-full py-2.5 px-3 rounded-xl text-sm font-bold transition bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20"
                                                            >
                                                                ✕ Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {app.agreement?.status === 'sent' && (
                                                        <div className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 p-3 rounded-xl text-center">
                                                            <p className="text-[#CF9EFF] text-xs font-bold uppercase">Agreement Sent</p>
                                                            <p className="text-gray-400 text-[10px] mt-1">Awaiting Candidate Signature</p>
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={() => handleUpdateApplicationStatus(app._id, "saved")}
                                                        disabled={app.status === "saved"}
                                                        className={`w-full py-2 px-3 rounded-lg text-sm font-bold transition ${app.status === "saved"
                                                            ? "bg-[#CF9EFF]/10 text-[#CF9EFF]"
                                                            : "bg-[#CF9EFF]/10 text-[#CF9EFF] hover:bg-[#CF9EFF]/20"
                                                            }`}
                                                    >
                                                        💾 Save
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Contact Button */}
                                            <button
                                                onClick={() => setContactingApplicant(app._id)}
                                                className="w-full bg-[#CF9EFF] hover:bg-[#b880f0] text-black py-2 px-4 rounded-lg font-bold transition text-sm"
                                            >
                                                💬 Contact
                                            </button>
                                        </div>
                                    </div>

                                    {/* Contact Message Modal */}
                                    {contactingApplicant === app._id && (
                                        <div className="mt-6 bg-black/60 border border-white/10 rounded-2xl p-4">
                                            <textarea
                                                value={contactMessage}
                                                onChange={(e) => setContactMessage(e.target.value)}
                                                placeholder="Type your message here..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 focus:border-[#CF9EFF] text-sm"
                                                rows="3"
                                            />
                                            <div className="flex gap-3 mt-3">
                                                <button
                                                    onClick={() => {
                                                        setContactingApplicant(null);
                                                        setContactMessage("");
                                                    }}
                                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg font-semibold transition text-sm"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleContactCandidate(app._id)}
                                                    className="flex-1 bg-[#CF9EFF] hover:bg-[#b880f0] text-black py-2 rounded-lg font-bold transition text-sm"
                                                >
                                                    Send Message
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Agreement Drafting Modal */}
            {draftingAgreement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[30px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Draft Employment Agreement</h2>
                                <p className="text-gray-400 text-sm mt-1">For {draftingAgreement.applicant?.name} • {job.title}</p>
                            </div>
                            <button 
                                onClick={() => setDraftingAgreement(null)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">Agreement Conditions & Terms</label>
                                    <button 
                                        onClick={() => handleGenerateAgreementDraft(draftingAgreement._id)}
                                        disabled={isGenerating}
                                        className="text-[10px] font-bold text-[#CF9EFF] border border-[#CF9EFF]/30 px-3 py-1 rounded-full bg-[#CF9EFF]/5 hover:bg-[#CF9EFF]/10 transition disabled:opacity-50"
                                    >
                                        {isGenerating ? "🤖 AI Filling..." : "✨ AI Autofill Form"}
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {agreementFields.map((field, index) => (
                                        <div key={index} className="flex gap-4 items-start group">
                                            <div className="flex-1 space-y-2">
                                                <input 
                                                    type="text"
                                                    value={field.question}
                                                    onChange={(e) => handleUpdateField(index, 'question', e.target.value)}
                                                    placeholder="Question/Topic (e.g. Monthly Salary)"
                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white font-bold text-sm focus:outline-none focus:border-[#CF9EFF]/50"
                                                />
                                                <textarea
                                                    value={field.answer}
                                                    onChange={(e) => handleUpdateField(index, 'answer', e.target.value)}
                                                    placeholder="Answer/Terms (e.g. 50,000 INR)"
                                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-gray-300 text-sm focus:outline-none focus:border-[#CF9EFF]/30 resize-none h-20"
                                                />
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveField(index)}
                                                className="mt-2 text-gray-500 hover:text-red-400 transition"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                    
                                    <button 
                                        onClick={handleAddField}
                                        className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-gray-500 font-bold hover:border-[#CF9EFF]/30 hover:text-[#CF9EFF] transition duration-300"
                                    >
                                        + Add New Condition/Field
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <label className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Employer Digital Signature</label>
                                <input 
                                    type="text"
                                    value={employerSig}
                                    onChange={(e) => setEmployerSig(e.target.value)}
                                    placeholder="Type your full name as signature"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CF9EFF]"
                                />
                                <p className="text-[10px] text-gray-500 mt-2 italic">* By typing your name, you agree to the terms listed above.</p>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
                            <button 
                                onClick={() => setDraftingAgreement(null)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleSendAgreementDraft(draftingAgreement._id)}
                                disabled={agreementFields.length === 0 || !employerSig}
                                className="flex-[2] py-4 rounded-2xl bg-[#5CB144] hover:bg-[#4a9136] text-white font-bold transition shadow-lg shadow-[#5CB144]/20 disabled:opacity-50"
                            >
                                Send Professional Agreement
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

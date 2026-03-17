import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinHouse } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function MyApplications() {
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("all"); // all, applied, accepted, rejected, withdrawn
    const [sorting, setSorting] = useState("recent"); // recent, oldest, company

    // Agreement Flow
    const [viewingAgreement, setViewingAgreement] = useState(null);
    const [seekerSig, setSeekerSig] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        const fetchApplications = async () => {
            setLoading(true);
            try {
                const res = await api.get("/api/applications/my-applications");
                setApplications(res.data);
            } catch (err) {
                console.error("Failed to fetch applications", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchApplications();
            // Poll for status updates every 20 seconds
            const interval = setInterval(fetchApplications, 20000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const handleAcceptAgreement = async (applicationId) => {
        if (!seekerSig.trim()) {
            alert("Please type your name as a digital signature.");
            return;
        }

        setIsAccepting(true);
        try {
            await api.post(`/api/applications/${applicationId}/agreement/accept`, {
                signature: seekerSig
            });
            alert("Congratulations! You have accepted the agreement. A finalized copy has been sent to your email.");
            setViewingAgreement(null);
            setSeekerSig("");
            
            // Refresh list
            const res = await api.get("/api/applications/my-applications");
            setApplications(res.data);
        } catch (err) {
            console.error(err);
            alert("Failed to accept agreement");
        } finally {
            setIsAccepting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "accepted":
                return "text-[#5CB144] bg-[#5CB144]/10 border-[#5CB144]/20";
            case "rejected":
                return "text-red-400 bg-red-400/10 border-red-400/20";
            case "saved":
                return "text-[#CF9EFF] bg-[#CF9EFF]/10 border-[#CF9EFF]/20";
            case "applied":
                return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
            default:
                return "text-gray-400 bg-gray-400/10 border-gray-400/20";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "accepted":
                return "✓";
            case "rejected":
                return "✕";
            case "saved":
                return "💾";
            case "applied":
                return "⏳";
            default:
                return "•";
        }
    };

    // Filter and sort applications
    const filteredAndSorted = applications
        .filter(app => filterStatus === "all" || app.status === filterStatus)
        .sort((a, b) => {
            if (sorting === "recent") {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (sorting === "oldest") {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (sorting === "company") {
                return (a.job?.company || "").localeCompare(b.job?.company || "");
            }
            return 0;
        });

    if (!user) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Please Log In</h1>
                <p className="text-gray-400 mb-8">Sign in to view your applications.</p>
                <button onClick={() => navigate('/login')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition">
                    ← Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            {/* Background */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${themeBg} opacity-[0.05] blur-[100px] rounded-full mix-blend-screen pointer-events-none`}></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span> Back to Profile
                </button>

                {/* Header */}
                <div className="mb-8 border-b border-white/10 pb-6">
                    <h1 className="text-4xl font-bold mb-2">My Applications</h1>
                    <p className="text-gray-400 text-lg">Track the status of your job applications</p>
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
                                <option value="applied">Applied</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                                <option value="saved">Saved</option>
                                <option value="withdrawn">Withdrawn</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Sort by</label>
                            <select
                                value={sorting}
                                onChange={(e) => setSorting(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-2 focus:border-[#CF9EFF]"
                            >
                                <option value="recent">Recently Applied</option>
                                <option value="oldest">Oldest First</option>
                                <option value="company">Company Name</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                <div>
                    {loading ? (
                        <div className="text-center py-20 text-gray-400 animate-pulse">
                            <div className="w-16 h-16 border-4 border-[#CF9EFF] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-xl font-medium">Loading applications...</p>
                        </div>
                    ) : filteredAndSorted.length === 0 ? (
                        <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[30px] p-16 text-center">
                            <div className="text-5xl mb-4">📋</div>
                            <h3 className="text-2xl font-bold mb-2">No Applications</h3>
                            <p className="text-gray-400 mb-6">
                                {filterStatus !== "all" ? "No applications with this status." : "You haven't applied to any jobs yet."}
                            </p>
                            <button
                                onClick={() => navigate('/jobs')}
                                className={`px-6 py-3 rounded-xl text-black font-extrabold transition shadow-lg ${themeBg} hover:opacity-90`}
                            >
                                Browse Jobs
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAndSorted.map((app) => (
                                <div
                                    key={app._id}
                                    className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 hover:border-[#CF9EFF]/30 rounded-[30px] p-6 transition-all shadow-lg group cursor-pointer"
                                    onClick={() => navigate(`/apply/${app.job?._id}`)}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                        {/* Job Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-gray-300 transition">{app.job?.title || "Deleted Job"}</h3>
                                            <p className={`font-semibold ${themeText} mb-2`}>{app.job?.company || "Unknown Company"}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs text-gray-400 font-medium flex items-center gap-1">
                                                    <MapPinHouse className="w-3 h-3" /> {app.job?.location}
                                                </span>
                                                <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-xs text-gray-400 font-medium">
                                                    💼 {app.job?.type}
                                                </span>
                                                <span className="bg-[#5CB144]/10 border border-[#5CB144]/20 px-3 py-1 rounded-lg text-xs text-[#5CB144] font-medium">
                                                    {app.job?.pay}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Application Date */}
                                        <div className="flex flex-col items-start md:items-end">
                                            <span className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Applied on</span>
                                            <span className="text-sm text-gray-300 font-medium">
                                                {new Date(app.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        {/* Status Badge */}
                                        <div className="flex flex-col gap-2 items-end">
                                            <div className={`px-4 py-3 rounded-xl border font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${getStatusColor(app.status)}`}>
                                                <span className="text-lg">{getStatusIcon(app.status)}</span>
                                                {app.status || "Pending"}
                                            </div>
                                            
                                            {app.agreement?.status === 'sent' && app.status !== 'accepted' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingAgreement(app);
                                                    }}
                                                    className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black px-4 py-2 rounded-lg font-bold text-xs transition animate-pulse"
                                                >
                                                    📜 Review Agreement
                                                </button>
                                            )}
                                            {app.agreement?.status === 'accepted' && app.status === 'accepted' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setViewingAgreement(app);
                                                    }}
                                                    className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 px-4 py-2 rounded-lg font-bold text-xs transition"
                                                >
                                                    📜 View Signed Agreement
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* AI Match Score (if available) */}
                                    {app.aiMatchScore && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-400 font-medium">✨ AI Match Score</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${app.aiMatchScore >= 80
                                                                    ? "bg-[#5CB144]"
                                                                    : app.aiMatchScore >= 60
                                                                        ? "bg-[#CF9EFF]"
                                                                        : "bg-yellow-500"
                                                                }`}
                                                            style={{ width: `${app.aiMatchScore}%` }}
                                                        />
                                                    </div>
                                                    <span className="font-bold text-white">{app.aiMatchScore}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status Update Message */}
                                    {app.lastStatusUpdate && (
                                        <div className="mt-3 text-xs text-gray-500">
                                            Last updated: {new Date(app.lastStatusUpdate).toLocaleString()}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Agreement Review Modal */}
            {viewingAgreement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#0a0a0a] border border-white/10 rounded-[30px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Employment Agreement</h2>
                                <p className="text-gray-400 text-sm mt-1">From {viewingAgreement.job?.company} • {viewingAgreement.job?.title}</p>
                            </div>
                            <button 
                                onClick={() => setViewingAgreement(null)}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition"
                            >
                                ✕
                            </button>
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

                        <div className="p-8 border-t border-white/10 bg-white/5 flex gap-4">
                            <button 
                                onClick={() => setViewingAgreement(null)}
                                className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold transition"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => handleAcceptAgreement(viewingAgreement._id)}
                                disabled={!seekerSig || isAccepting}
                                className="flex-[2] py-4 rounded-2xl bg-[#5CB144] hover:bg-[#4a9136] text-white font-bold transition shadow-lg shadow-[#5CB144]/20 disabled:opacity-50"
                            >
                                {isAccepting ? "Signing..." : "Accept & Sign Agreement"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

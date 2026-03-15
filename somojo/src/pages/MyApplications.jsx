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
            // Poll for status updates every 30 seconds
            const interval = setInterval(fetchApplications, 30000);
            return () => clearInterval(interval);
        }
    }, [user]);

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
                                                    💸 {app.job?.pay}
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
                                        <div className={`px-4 py-3 rounded-xl border font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${getStatusColor(app.status)}`}>
                                            <span className="text-lg">{getStatusIcon(app.status)}</span>
                                            {app.status || "Pending"}
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
        </div>
    );
}

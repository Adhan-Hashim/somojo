import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

const STATUS_CONFIG = {
    applied: { label: "Applied", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", icon: "🚀" },
    accepted: { label: "Accepted", color: "text-[#5CB144]", bg: "bg-[#5CB144]/10", border: "border-[#5CB144]/20", icon: "✅" },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", icon: "❌" },
    saved: { label: "Shortlisted", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", icon: "⭐" },
    withdrawn: { label: "Withdrawn", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20", icon: "↩️" },
};

const POLL_INTERVAL = 15000; // 15 seconds

export default function MyJobs() {
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();

    const [activeTab, setActiveTab] = useState("applied");
    const [applied, setApplied] = useState([]);
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [newUpdates, setNewUpdates] = useState([]);  // IDs that just changed status
    const prevApplied = useRef([]);

    const fetchApplied = useCallback(async (silent = false) => {
        try {
            const res = await api.get("/applications/my-applications");
            const data = Array.isArray(res.data) ? res.data : [];

            // Detect status changes for animation
            if (prevApplied.current.length > 0) {
                const changed = data.filter(app => {
                    const prev = prevApplied.current.find(p => p._id === app._id);
                    return prev && prev.status !== app.status;
                }).map(a => a._id);
                if (changed.length) {
                    setNewUpdates(changed);
                    setTimeout(() => setNewUpdates([]), 3000);
                }
            }
            prevApplied.current = data;
            setApplied(data);
            setLastUpdated(new Date());
        } catch (err) {
            if (!silent) throw err;
        }
    }, []);

    const fetchSaved = useCallback(async () => {
        const res = await api.get("/saved-jobs");
        setSaved(Array.isArray(res.data) ? res.data : []);
    }, []);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            await Promise.all([fetchApplied(), fetchSaved()]);
        } catch (err) {
            console.error("MyJobs fetch error:", err);
            setError(err.response?.data?.message || "Failed to load your jobs. Are you logged in?");
        } finally {
            setLoading(false);
        }
    }, [fetchApplied, fetchSaved]);

    // Initial load
    useEffect(() => { loadData(); }, [loadData]);

    // Live polling for applied jobs status
    useEffect(() => {
        const timer = setInterval(() => {
            fetchApplied(true); // silent = no throw on error
        }, POLL_INTERVAL);
        return () => clearInterval(timer);
    }, [fetchApplied]);

    const handleUnsave = async (jobId) => {
        try {
            await api.delete(`/saved-jobs/${jobId}`);
            setSaved(prev => prev.filter(j => j._id !== jobId));
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove saved job.");
        }
    };

    const handleWithdraw = async (appId) => {
        if (!window.confirm("Withdraw this application?")) return;
        setApplied(prev => prev.filter(a => a._id !== appId));
    };

    if (loading) {
        return (
            <div className="min-h-screen text-white pt-32 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#CF9EFF] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-gray-400 text-lg">Loading your jobs...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen text-white pt-32 flex flex-col items-center justify-center px-6 text-center">
                <div className="text-5xl mb-4">⚠️</div>
                <h2 className="text-2xl font-bold mb-2">Could not load your jobs</h2>
                <p className="text-gray-400 mb-6">{error}</p>
                <button
                    onClick={loadData}
                    className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3 rounded-2xl transition"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const tabs = [
        { id: "applied", label: "Applied Jobs", count: applied.length, icon: "🚀" },
        { id: "saved", label: "Saved Jobs", count: saved.length, icon: "🔖" },
    ];

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-[#CF9EFF] opacity-[0.05] blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 left-[5%] w-[400px] h-[400px] bg-[#5CB144] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-5xl mx-auto px-6 relative z-10">

                {/* Header */}
                <div className="mb-10 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-2">
                            My <span className={`${themeText}`}>Jobs</span>
                        </h1>
                        <p className="text-gray-400 text-lg">Track your applications and saved opportunities.</p>
                    </div>
                    {/* Live indicator */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
                        <span className="w-1.5 h-1.5 bg-[#5CB144] rounded-full animate-pulse" />
                        Live · updates every 15s
                        {lastUpdated && (
                            <span className="hidden sm:inline">· {lastUpdated.toLocaleTimeString()}</span>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl mb-8 w-fit gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id
                                ? `${themeBg} text-black shadow-lg`
                                : "text-gray-400 hover:text-white"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                            <span className={`text-xs px-2 py-0.5 rounded-full ${activeTab === tab.id ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
                                }`}>
                                {tab.count}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Applied Jobs Tab */}
                {activeTab === "applied" && (
                    applied.length === 0 ? (
                        <EmptyState
                            icon="🚀"
                            title="No applications yet"
                            desc="Start applying to jobs and your applications will appear here with live status updates."
                            btnLabel="Browse Jobs"
                            onBtn={() => navigate("/jobs")}
                        />
                    ) : (
                        <div className="space-y-4">
                            {applied.map(app => {
                                const job = app.job || { title: "Job (removed)", company: "—", location: "—", type: "—", pay: "—", _id: null };
                                const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                                const isNew = newUpdates.includes(app._id);

                                return (
                                    <div
                                        key={app._id}
                                        className={`group bg-[#0a0a0a]/90 border rounded-[24px] p-6 transition-all duration-500 ${isNew
                                            ? "border-[#CF9EFF]/60 shadow-[0_0_30px_-5px_rgba(207,158,255,0.3)] scale-[1.008]"
                                            : "border-white/10 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg"
                                            }`}
                                    >
                                        {isNew && (
                                            <div className="flex items-center gap-2 mb-3 text-[#CF9EFF] text-xs font-bold animate-pulse">
                                                <span className="w-2 h-2 bg-[#CF9EFF] rounded-full" />
                                                Status just updated!
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {/* Logo */}
                                            <div className="w-14 h-14 shrink-0 bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                                                <img
                                                    src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(job.company || "?")}&backgroundColor=111111&textColor=ffffff`}
                                                    alt={job.company}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{job.title}</h3>
                                                        <p className="text-gray-400 text-sm">{job.company}</p>
                                                    </div>

                                                    {/* Status badge with icon */}
                                                    <div className={`self-start flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-2xl border ${st.bg} ${st.border} ${st.color}`}>
                                                        <span className="text-base">{st.icon}</span>
                                                        {st.label}
                                                    </div>
                                                </div>

                                                {/* Status message */}
                                                <StatusMessage status={app.status} />

                                                {/* Messages from Employer */}
                                                {app.messages && app.messages.length > 0 && (
                                                    <div className="bg-[#CF9EFF]/5 border border-[#CF9EFF]/10 rounded-2xl p-4 my-4">
                                                        <p className="text-[10px] text-[#CF9EFF] uppercase font-bold mb-3 tracking-widest flex items-center gap-2">
                                                            <span className="text-sm">💬</span> Messages from Employer
                                                        </p>
                                                        <div className="space-y-3">
                                                            {app.messages.map((msg, i) => (
                                                                <div key={i} className="flex gap-3">
                                                                    <div className="w-1.5 h-1.5 bg-[#CF9EFF] rounded-full mt-1.5 shrink-0" />
                                                                    <div>
                                                                        <p className="text-gray-300 text-sm leading-relaxed">{msg.message}</p>
                                                                        <span className="text-[10px] text-gray-500 block mt-1">
                                                                            {new Date(msg.timestamp).toLocaleString("en-IN", { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Chips */}
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-400 my-3">
                                                    {job.location && <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">📍 {job.location}</span>}
                                                    {job.type && <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">💼 {job.type}</span>}
                                                    {job.pay && <span className="bg-[#5CB144]/10 border border-[#5CB144]/10 px-2.5 py-1 rounded-lg text-[#5CB144] font-bold">💸 {job.pay}</span>}
                                                </div>

                                                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                    <span className="text-xs text-gray-500">
                                                        Applied {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "recently"}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => navigate(`/apply/${job._id}`)}
                                                            className="text-xs font-bold bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition"
                                                        >
                                                            View Job
                                                        </button>
                                                        {app.status !== "withdrawn" && (
                                                            <button
                                                                onClick={() => handleWithdraw(app._id)}
                                                                className="text-xs font-bold bg-red-500/10 border border-red-500/20 px-4 py-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                                                            >
                                                                Withdraw
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* Saved Jobs Tab */}
                {activeTab === "saved" && (
                    saved.length === 0 ? (
                        <EmptyState
                            icon="🔖"
                            title="No saved jobs"
                            desc='Tap the "Save Job" button on any job page and it will appear here.'
                            btnLabel="Browse Jobs"
                            onBtn={() => navigate("/jobs")}
                        />
                    ) : (
                        <div className="space-y-4">
                            {saved.map(job => (
                                <div
                                    key={job._id}
                                    className="group bg-[#0a0a0a]/90 border border-white/10 rounded-[24px] p-6 transition-all hover:-translate-y-0.5 hover:border-white/20 hover:shadow-lg"
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <div className="w-14 h-14 shrink-0 bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                                            <img
                                                src={`https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(job.company || "?")}&backgroundColor=111111&textColor=ffffff`}
                                                alt={job.company}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{job.title}</h3>
                                                    <p className="text-gray-400 text-sm">{job.company}</p>
                                                </div>
                                                <span className="self-start text-xs font-bold px-3 py-1.5 rounded-full border bg-yellow-400/10 border-yellow-400/20 text-yellow-400">
                                                    🔖 Saved
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-gray-400 mb-3">
                                                {job.location && <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">📍 {job.location}</span>}
                                                {job.type && <span className="bg-white/5 border border-white/5 px-2.5 py-1 rounded-lg">💼 {job.type}</span>}
                                                {job.pay && <span className="bg-[#5CB144]/10 border border-[#5CB144]/10 px-2.5 py-1 rounded-lg text-[#5CB144] font-bold">💸 {job.pay}</span>}
                                            </div>
                                            <div className="flex justify-between items-center pt-3 border-t border-white/5">
                                                <span className="text-xs text-gray-500">
                                                    {job.savedAt ? `Saved ${new Date(job.savedAt).toLocaleDateString()}` : `Posted ${job.posted || ""}`}
                                                </span>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/apply/${job._id}`)}
                                                        className="text-xs font-bold bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 px-4 py-1.5 rounded-lg text-[#CF9EFF] hover:bg-[#CF9EFF] hover:text-black transition"
                                                    >
                                                        Apply Now →
                                                    </button>
                                                    <button
                                                        onClick={() => handleUnsave(job._id)}
                                                        className="text-xs font-bold bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:border-red-400/30 transition"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

            </div>
        </div>
    );
}

function StatusMessage({ status }) {
    const messages = {
        applied: "Your application is under review. We'll notify you of any updates.",
        saved: "⭐ Great news! You've been shortlisted by the employer.",
        accepted: "🎉 Congratulations! The employer has accepted your application.",
        rejected: "The employer has moved forward with other candidates.",
        withdrawn: "You withdrew this application.",
    };
    const msg = messages[status];
    if (!msg) return null;
    return (
        <p className={`text-xs leading-relaxed mb-1 ${status === "accepted" ? "text-[#5CB144]" :
            status === "saved" ? "text-yellow-400" :
                status === "rejected" ? "text-red-400/80" :
                    "text-gray-500"
            }`}>
            {msg}
        </p>
    );
}

function EmptyState({ icon, title, desc, btnLabel, onBtn }) {
    return (
        <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-[32px] p-16 text-center">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-5 border border-white/10">
                <span className="text-3xl opacity-50">{icon}</span>
            </div>
            <h3 className="text-2xl font-bold mb-3">{title}</h3>
            <p className="text-gray-400 mb-8 max-w-sm mx-auto">{desc}</p>
            <button
                onClick={onBtn}
                className="bg-white hover:bg-gray-200 text-black font-bold py-3 px-10 rounded-2xl transition hover:scale-105"
            >
                {btnLabel}
            </button>
        </div>
    );
}

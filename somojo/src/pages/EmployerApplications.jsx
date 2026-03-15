import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

const STATUS_CONFIG = {
    applied: { label: "Applied", color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
    accepted: { label: "Accepted", color: "text-[#5CB144]", bg: "bg-[#5CB144]/10", border: "border-[#5CB144]/20" },
    rejected: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    saved: { label: "Shortlisted", color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
    withdrawn: { label: "Withdrawn", color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/20" },
};

const SCORE_COLOR = (score) => {
    if (!score) return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    if (score >= 80) return "text-[#5CB144] bg-[#5CB144]/10 border-[#5CB144]/20";
    if (score >= 60) return "text-[#CF9EFF] bg-[#CF9EFF]/10 border-[#CF9EFF]/20";
    return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
};

export default function EmployerApplications() {
    const { jobId } = useParams();
    const navigate = useNavigate();

    const [applications, setApplications] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [sortBy, setSortBy] = useState("ai"); // "ai" | "date"
    const [expandedId, setExpandedId] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            const [appsRes, jobRes] = await Promise.all([
                api.get(`/api/applications/job/${jobId}`),
                api.get(`/api/jobs/${jobId}`),
            ]);
            setApplications(appsRes.data);
            setJob(jobRes.data);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        } finally {
            setLoading(false);
        }
    }, [jobId]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const updateStatus = async (appId, status) => {
        setUpdatingId(appId);
        try {
            await api.put(`/api/applications/${appId}/status`, { status });
            setApplications(prev =>
                prev.map(a => a._id === appId ? { ...a, status } : a)
            );
        } catch (err) {
            console.error("Status update failed", err);
            alert(err.response?.data?.message || "Failed to update status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const reEvaluate = async (appId) => {
        setUpdatingId(appId);
        try {
            const res = await api.post(`/api/applications/${appId}/re-evaluate`);
            setApplications(prev =>
                prev.map(a => a._id === appId ? { ...a, aiMatchScore: res.data.score, aiAnalysis: res.data.analysis } : a)
            );
        } catch (err) {
            console.error(err);
            alert("Evaluation failed.");
        } finally {
            setUpdatingId(null);
        }
    };

    // Filter + sort
    const filtered = applications
        .filter(a => filterStatus === "all" || a.status === filterStatus)
        .sort((a, b) => {
            if (sortBy === "ai") return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

    const counts = applications.reduce((acc, a) => {
        acc[a.status] = (acc[a.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            {/* Ambient */}
            <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-[#CF9EFF] opacity-[0.04] blur-[150px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto px-6 relative z-10">

                {/* Back */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-bold mb-2">
                        Candidates <span className="text-[#CF9EFF]">Review</span>
                    </h1>
                    {job && (
                        <p className="text-gray-400 text-lg">
                            {job.title} — {job.company} · {job.location}
                        </p>
                    )}
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                    {[
                        { key: "all", label: "Total", count: applications.length, color: "border-white/20 text-white" },
                        { key: "applied", label: "Applied", count: counts.applied || 0, color: "border-blue-400/30 text-blue-400" },
                        { key: "saved", label: "Shortlisted", count: counts.saved || 0, color: "border-yellow-400/30 text-yellow-400" },
                        { key: "accepted", label: "Accepted", count: counts.accepted || 0, color: "border-[#5CB144]/30 text-[#5CB144]" },
                        { key: "rejected", label: "Rejected", count: counts.rejected || 0, color: "border-red-400/30 text-red-400" },
                    ].map(s => (
                        <button
                            key={s.key}
                            onClick={() => setFilterStatus(s.key)}
                            className={`bg-[#0a0a0a]/80 border rounded-2xl p-4 text-left transition-all ${s.color} ${filterStatus === s.key ? "ring-1 ring-current scale-[1.02]" : "hover:scale-[1.01]"}`}
                        >
                            <p className="text-2xl font-black">{s.count}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                        </button>
                    ))}
                </div>

                {/* Toolbar */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                    <div className="flex bg-white/5 border border-white/10 p-1 rounded-xl gap-1">
                        <button
                            onClick={() => setSortBy("ai")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${sortBy === "ai" ? "bg-[#CF9EFF] text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            ✨ AI Score
                        </button>
                        <button
                            onClick={() => setSortBy("date")}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition ${sortBy === "date" ? "bg-[#CF9EFF] text-black" : "text-gray-400 hover:text-white"}`}
                        >
                            📅 Date
                        </button>
                    </div>
                    <p className="text-sm text-gray-500">{filtered.length} candidate{filtered.length !== 1 ? "s" : ""}</p>
                </div>

                {/* AI Best Candidates Banner */}
                {applications.some(a => a.aiMatchScore > 0) && (
                    <div className="mb-6 bg-gradient-to-r from-[#CF9EFF]/10 to-transparent border border-[#CF9EFF]/20 rounded-2xl px-6 py-4 flex items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-[#CF9EFF] flex items-center gap-2">✨ AI Ranking Active</p>
                            <p className="text-sm text-gray-400 mt-0.5">Candidates are sorted by AI match score. Top candidates appear first.</p>
                        </div>
                        <button
                            onClick={() => {
                                setSortBy("ai");
                                // Accept all 80%+ automatically
                                const topCandidates = applications.filter(a => (a.aiMatchScore || 0) >= 80 && a.status === "applied");
                                if (topCandidates.length === 0) return alert("No new 80%+ match candidates to auto-shortlist.");
                                if (!window.confirm(`Shortlist ${topCandidates.length} candidate(s) with 80%+ AI match?`)) return;
                                topCandidates.forEach(a => updateStatus(a._id, "saved"));
                            }}
                            className="shrink-0 bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold px-5 py-2 rounded-xl text-sm transition shadow-lg"
                        >
                            Auto-Shortlist Best →
                        </button>
                    </div>
                )}

                {/* Content */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white/5 border border-white/5 rounded-[24px] p-6 h-40 animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="bg-[#0a0a0a]/80 border border-white/10 rounded-[32px] p-16 text-center">
                        <div className="text-5xl mb-4">📭</div>
                        <h3 className="text-2xl font-bold mb-2">
                            {filterStatus === "all" ? "No applications yet" : `No ${filterStatus} candidates`}
                        </h3>
                        <p className="text-gray-400">
                            {filterStatus === "all"
                                ? "When job seekers apply, their AI-scored profiles will appear here."
                                : "Try switching the filter above."}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filtered.map((app, idx) => {
                            const st = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
                            const isExpanded = expandedId === app._id;
                            const isUpdating = updatingId === app._id;
                            const isTop = sortBy === "ai" && idx === 0 && app.aiMatchScore >= 80;

                            return (
                                <div
                                    key={app._id}
                                    className={`group bg-[#0a0a0a]/90 backdrop-blur-2xl border rounded-[24px] overflow-hidden transition-all duration-300 ${isTop ? "border-[#CF9EFF]/40 shadow-[0_0_40px_-10px_rgba(207,158,255,0.2)]" : "border-white/10 hover:border-white/20"
                                        }`}
                                >
                                    {isTop && (
                                        <div className="bg-gradient-to-r from-[#CF9EFF] to-[#A374FF] px-6 py-1.5 flex items-center gap-2">
                                            <span className="text-black font-bold text-xs uppercase tracking-widest">⭐ Best Match</span>
                                        </div>
                                    )}

                                    <div className="p-6">
                                        <div className="flex flex-col lg:flex-row gap-6">

                                            {/* Left: Applicant Info */}
                                            <div className="flex-1">
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-gray-700 to-gray-600 overflow-hidden border border-white/10 shrink-0">
                                                        <img
                                                            src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${app.applicant?.name || app._id}`}
                                                            alt="Avatar"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 flex-wrap mb-1">
                                                            <h3 className="text-xl font-bold">{app.applicant?.name || "Unknown User"}</h3>
                                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${st.bg} ${st.border} ${st.color}`}>
                                                                {st.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-gray-400 text-sm">{app.applicant?.email}</p>
                                                        <p className="text-gray-500 text-xs mt-1">
                                                            Applied {new Date(app.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                                        </p>
                                                    </div>

                                                    {/* AI Score Badge */}
                                                    <div className={`shrink-0 px-4 py-2 rounded-2xl border font-black text-lg flex flex-col items-center justify-center relative group`}>
                                                        <div className={SCORE_COLOR(app.aiMatchScore)}>
                                                            {app.aiMatchScore && app.aiMatchScore > 0 ? `${app.aiMatchScore}%` : "—"}
                                                        </div>
                                                        <p className="text-xs font-normal opacity-60">AI Match</p>
                                                        {(!app.aiMatchScore || app.aiMatchScore === 0) && (
                                                            <button
                                                                onClick={() => reEvaluate(app._id)}
                                                                className="absolute -top-2 -right-2 bg-[#CF9EFF] text-black w-6 h-6 rounded-full flex items-center justify-center text-[10px] shadow-lg hover:scale-110 transition active:scale-95"
                                                                title="Retry AI Evaluation"
                                                            >
                                                                ✨
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* AI Analysis (expandable) */}
                                                {app.aiAnalysis && (
                                                    <div className="mb-4">
                                                        <button
                                                            onClick={() => setExpandedId(isExpanded ? null : app._id)}
                                                            className="text-xs text-[#CF9EFF] hover:text-white transition font-semibold flex items-center gap-1"
                                                        >
                                                            {isExpanded ? "▲ Hide AI Analysis" : "▼ View AI Analysis"}
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
                                                                {app.aiAnalysis}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Cover Letter */}
                                                {app.coverLetter && (
                                                    <p className="text-sm text-gray-400 italic line-clamp-2 bg-white/5 rounded-xl px-4 py-3 border border-white/5">
                                                        "{app.coverLetter}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Right: Action Buttons */}
                                            <div className="flex flex-row lg:flex-col gap-2 flex-wrap lg:shrink-0 lg:w-44">
                                                {app.status !== "accepted" && app.status !== "rejected" && (
                                                    <>
                                                        <ActionBtn
                                                            label="✓ Accept"
                                                            active={app.status === "accepted"}
                                                            loading={isUpdating}
                                                            activeClass="bg-[#5CB144] text-black"
                                                            inactiveClass="bg-[#5CB144]/10 border border-[#5CB144]/20 text-[#5CB144] hover:bg-[#5CB144] hover:text-black"
                                                            onClick={() => updateStatus(app._id, "accepted")}
                                                        />
                                                        <ActionBtn
                                                            label="★ Shortlist"
                                                            active={app.status === "saved"}
                                                            loading={isUpdating}
                                                            activeClass="bg-yellow-400 text-black"
                                                            inactiveClass="bg-yellow-400/10 border border-yellow-400/20 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                                                            onClick={() => updateStatus(app._id, "saved")}
                                                        />
                                                        <ActionBtn
                                                            label="✕ Reject"
                                                            active={app.status === "rejected"}
                                                            loading={isUpdating}
                                                            activeClass="bg-red-500 text-white"
                                                            inactiveClass="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white"
                                                            onClick={() => updateStatus(app._id, "rejected")}
                                                        />
                                                    </>
                                                )}
                                                {app.status === "accepted" && (
                                                    <div className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-[#5CB144]/10 border border-[#5CB144]/30 text-[#5CB144] text-center">
                                                        Approved ✅
                                                    </div>
                                                )}
                                                <ActionBtn
                                                    label="— Reset"
                                                    active={false}
                                                    loading={isUpdating}
                                                    activeClass=""
                                                    inactiveClass="bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white"
                                                    onClick={() => updateStatus(app._id, "applied")}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionBtn({ label, active, loading, activeClass, inactiveClass, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={loading || active}
            className={`flex-1 lg:flex-none lg:w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all duration-200 text-center ${active ? activeClass : inactiveClass
                } ${loading ? "opacity-50 cursor-wait" : ""} ${active ? "cursor-default scale-[1.02]" : "hover:scale-[1.02] active:scale-95"}`}
        >
            {label}
        </button>
    );
}

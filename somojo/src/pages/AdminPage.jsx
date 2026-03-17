import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AdminLayout from "../components/AdminLayout";
import {
    FiUserX,
    FiShield,
    FiTrash2,
    FiCheckCircle,
    FiTrendingUp,
    FiZap,
    FiSearch,
    FiChevronLeft,
    FiChevronRight,
    FiActivity,
    FiEye,
    FiBriefcase,
    FiUsers,
    FiMapPin,
    FiStar
} from "react-icons/fi";

// ─── helpers ──────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
    "job-seeker": "text-sky-400 bg-sky-400/10 border-sky-400/20",
    employer: "text-[#CF9EFF] bg-[#CF9EFF]/10 border-[#CF9EFF]/20",
    admin: "text-[#5CB144] bg-[#5CB144]/10 border-[#5CB144]/20",
};

const STATUS_COLORS = {
    applied: "text-sky-400 bg-sky-400/10",
    accepted: "text-emerald-400 bg-emerald-400/10",
    rejected: "text-rose-400 bg-rose-400/10",
    saved: "text-amber-400 bg-amber-400/10",
    withdrawn: "text-slate-400 bg-slate-400/10",
    active: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    inactive: "text-amber-400 bg-amber-400/10 border-amber-400/20",
    closed: "text-rose-400 bg-rose-400/10 border-rose-400/20",
    pending: "text-amber-400 bg-amber-400/10 border-amber-400/20",
};

const fmt = (n) => n?.toLocaleString() ?? "0";

const ago = (d) => {
    if (!d) return "—";
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "2-digit" });
};

// ─── components ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, sub, color = "text-white", trend }) {
    return (
        <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:border-[#5CB144]/30 hover:bg-white/[0.07] group shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl text-xl group-hover:scale-110 group-hover:bg-[#5CB144]/10 transition-all duration-300 text-slate-300 group-hover:text-[#5CB144]">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full ${trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'}`}>
                        <FiTrendingUp className={trend < 0 ? 'rotate-180' : ''} />
                        {trend}%
                    </div>
                )}
            </div>
            <p className={`text-3xl sm:text-4xl font-bold tracking-tight mb-1 ${color}`}>{fmt(value)}</p>
            <p className="text-xs text-slate-400 font-medium tracking-wide">{label}</p>
            {sub && <p className="text-[11px] text-slate-500 mt-2">{sub}</p>}
        </div>
    );
}

function SectionHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{title}</h2>
                {subtitle && <p className="text-slate-400 font-medium mt-1.5">{subtitle}</p>}
            </div>
            <div className="flex items-center gap-3">
                {actions}
            </div>
        </div>
    );
}

function SearchBar({ value, onChange, placeholder }) {
    return (
        <div className="relative group flex-1 min-w-[200px] max-w-sm">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#5CB144]" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black/40 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#5CB144]/50 transition-all font-medium placeholder:text-slate-500 shadow-inner"
            />
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const navigate = useNavigate();
    const userSnapshot = JSON.parse(localStorage.getItem("user") || "{}");

    const [activeTab, setActiveTab] = useState("Overview");
    const [powerMode, setPowerMode] = useState(false);
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [userTotal, setUserTotal] = useState(0);
    const [userPage, setUserPage] = useState(1);
    const [userSearch, setUserSearch] = useState("");
    const [userRole, setUserRole] = useState("all");
    const [jobs, setJobs] = useState([]);
    const [jobTotal, setJobTotal] = useState(0);
    const [jobPage, setJobPage] = useState(1);
    const [jobSearch, setJobSearch] = useState("");
    const [apps, setApps] = useState([]);
    const [appTotal, setAppTotal] = useState(0);
    const [appPage, setAppPage] = useState(1);
    const [appStatus, setAppStatus] = useState("all");
    const [loading, setLoading] = useState(false);
    const [promoteEmail, setPromoteEmail] = useState("");
    const [promoteMsg, setPromoteMsg] = useState("");
    const [recatStatus, setRecatStatus] = useState("");
    const [isRecategorizing, setIsRecategorizing] = useState(false);

    // Agreement Viewing
    const [viewingAgreement, setViewingAgreement] = useState(null);

    useEffect(() => {
        if (!userSnapshot || userSnapshot.role !== "admin") {
            navigate("/");
        }
    }, [userSnapshot, navigate]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get("/api/admin/stats");
            setStats(res.data);
        } catch { /* ignore */ }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/users", {
                params: { page: userPage, limit: 15, search: userSearch, role: userRole },
            });
            setUsers(res.data.users);
            setUserTotal(res.data.total);
        } finally { setLoading(false); }
    }, [userPage, userSearch, userRole]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/jobs", {
                params: { page: jobPage, limit: 15, search: jobSearch },
            });
            setJobs(res.data.jobs);
            setJobTotal(res.data.total);
        } finally { setLoading(false); }
    }, [jobPage, jobSearch]);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/admin/applications", {
                params: { page: appPage, limit: 15, status: appStatus },
            });
            setApps(res.data.applications);
            setAppTotal(res.data.total);
        } finally { setLoading(false); }
    }, [appPage, appStatus]);

    useEffect(() => { if (activeTab === "Overview") fetchStats(); }, [activeTab, fetchStats]);
    useEffect(() => { if (activeTab === "Users") fetchUsers(); }, [activeTab, fetchUsers]);
    useEffect(() => { if (activeTab === "Jobs") fetchJobs(); }, [activeTab, fetchJobs]);
    useEffect(() => { if (activeTab === "Applications") fetchApps(); }, [activeTab, fetchApps]);

    const toggleBan = async (userId) => {
        await api.put(`/api/admin/users/${userId}/ban`);
        fetchUsers();
    };

    const changeRole = async (userId, role) => {
        await api.put(`/api/admin/users/${userId}/role`, { role });
        fetchUsers();
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("CRITICAL: Delete user data permanently?")) return;
        await api.delete(`/api/admin/users/${userId}`);
        fetchUsers();
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm("CRITICAL: Delete this job and all its applications?")) return;
        await api.delete(`/api/admin/jobs/${jobId}`);
        fetchJobs();
    };

    const changeJobStatus = async (jobId, status) => {
        await api.put(`/api/admin/jobs/${jobId}/status`, { status });
        fetchJobs();
    };

    const promote = async () => {
        if (!promoteEmail) return;
        try {
            const res = await api.post("/api/admin/promote", { email: promoteEmail });
            setPromoteMsg(res.data.message);
            setPromoteEmail("");
        } catch (e) {
            setPromoteMsg(`❌ ${e.response?.data?.message || "Failed"}`);
        }
    };

    const executeBulkCategorize = async () => {
        if (!window.confirm("This will use AI to re-categorize every job in the database. Continue?")) return;
        setIsRecategorizing(true);
        setRecatStatus("Processing jobs with Gemini AI...");
        try {
            const res = await api.post("/api/jobs/bulk-categorize");
            setRecatStatus(res.data.message);
            // Force fetch stats to update category counts
            fetchStats();
        } catch (err) {
            setRecatStatus("❌ Error: " + (err.response?.data?.message || err.message));
        } finally {
            setIsRecategorizing(false);
        }
    };

    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="w-full">
                {/* OVERVIEW TAB */}
                {activeTab === "Overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="Dashboard Overview"
                            subtitle="Platform metrics and recent activity"
                            actions={
                                <button
                                    onClick={() => setPowerMode(!powerMode)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${powerMode ? "bg-[#5CB144] text-white shadow-[0_4px_20px_-4px_rgba(92,177,68,0.5)]" : "bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10"
                                        }`}
                                >
                                    <FiZap className={powerMode ? "animate-pulse" : ""} />
                                    {powerMode ? "Elevated Access Active" : "Enable Elevation"}
                                </button>
                            }
                        />

                        {!stats ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-white/5 rounded-3xl animate-pulse" />)}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard icon={<FiUsers />} label="Total Users" value={stats.totals.users} trend={12} color="text-white" />
                                    <StatCard icon={<FiBriefcase />} label="Active Jobs" value={stats.totals.jobs} trend={8} color="text-white" />
                                    <StatCard icon={<FiActivity />} label="Applications" value={stats.totals.applications} trend={24} color="text-white" />
                                    <StatCard icon={<FiShield />} label="Administrators" value={stats.users.admins} color="text-[#5CB144]" />
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-[#5CB144] rounded-full" />
                                                <h3 className="text-xl font-bold tracking-tight text-white">Platform Analytics</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-black/40 border border-white/5 px-3 py-1.5 rounded-full">
                                                    <span className="w-2 h-2 rounded-full bg-[#5CB144]" /> Seekers
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-black/40 border border-white/5 px-3 py-1.5 rounded-full">
                                                    <span className="w-2 h-2 rounded-full bg-[#CF9EFF]" /> Employers
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-3">
                                                    <span>User Distribution</span>
                                                    <span className="text-slate-300">{(stats.users.jobSeekers / (stats.totals.users || 1) * 100).toFixed(1)}% Seekers</span>
                                                </div>
                                                <div className="h-3.5 w-full bg-black/40 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-[#5CB144] transition-all duration-1000" style={{ width: `${(stats.users.jobSeekers / (stats.totals.users || 1) * 100)}%` }} />
                                                    <div className="h-full bg-[#CF9EFF] transition-all duration-1000" style={{ width: `${(stats.users.employers / (stats.totals.users || 1) * 100)}%` }} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="bg-[#5CB144]/5 rounded-2xl p-5 border border-[#5CB144]/10">
                                                    <p className="text-3xl font-bold text-[#5CB144] tracking-tight">{stats.applications.accepted}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Accepted Apps</p>
                                                </div>
                                                <div className="bg-rose-500/5 rounded-2xl p-5 border border-rose-500/10">
                                                    <p className="text-3xl font-bold text-rose-400 tracking-tight">{stats.applications.rejected}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Rejected Apps</p>
                                                </div>
                                                <div className="bg-[#CF9EFF]/5 rounded-2xl p-5 border border-[#CF9EFF]/10">
                                                    <p className="text-3xl font-bold text-[#CF9EFF] tracking-tight">{stats.applications.pending}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Pending Review</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col shadow-xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#5CB144]/10 blur-3xl rounded-full" />
                                        <div className="flex items-center gap-3 mb-8 relative z-10">
                                            <div className="w-1.5 h-6 bg-[#5CB144] rounded-full" />
                                            <h3 className="text-xl font-bold tracking-tight text-white">Recent Joins</h3>
                                        </div>
                                        <div className="space-y-5 flex-1 relative z-10">
                                            {stats.recent.users.map(u => (
                                                <div key={u._id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-[#5CB144]/20 text-[#5CB144] flex items-center justify-center font-bold text-xs uppercase border border-[#5CB144]/20 group-hover:bg-[#5CB144] group-hover:text-white transition-all">
                                                            {u.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-200 group-hover:text-[#5CB144] transition-colors">{u.name}</p>
                                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{u.role}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-400">{ago(u.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setActiveTab("Users")} className="w-full mt-6 py-3.5 bg-white/5 hover:bg-[#5CB144] text-slate-200 hover:text-white rounded-xl font-medium text-sm transition-all border border-white/10 hover:border-[#5CB144]/50 relative z-10">
                                            View All Users
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === "Users" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="User Management"
                            subtitle={`Managing ${fmt(userTotal)} registered users`}
                            actions={
                                <>
                                    <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search names, emails..." />
                                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto">
                                        {["all", "job-seeker", "employer", "admin"].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => { setUserRole(r); setUserPage(1); }}
                                                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${userRole === r ? "bg-[#5CB144] text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                                                    }`}
                                            >
                                                {r === "all" ? "All Users" : r.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            }
                        />

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role & Status</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u._id} className={`group hover:bg-white/5 transition-all duration-300 ${u.isBanned ? 'opacity-50' : ''}`}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5CB144] to-[#CF9EFF] flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
                                                            {u.name[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-200 text-sm">{u.name}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex flex-col gap-2 items-start">
                                                        <select
                                                            value={u.role}
                                                            onChange={e => changeRole(u._id, e.target.value)}
                                                            className={`bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#5CB144] cursor-pointer transition-all ${ROLE_COLORS[u.role]}`}
                                                        >
                                                            <option value="job-seeker" className="bg-slate-900 text-slate-200">Seeker</option>
                                                            <option value="employer" className="bg-slate-900 text-slate-200">Employer</option>
                                                            <option value="admin" className="bg-slate-900 text-slate-200">Admin</option>
                                                        </select>
                                                        <p className="text-[10px] text-slate-500 font-medium pl-1">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                        {powerMode && (
                                                            <button onClick={() => deleteUser(u._id)} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all tooltip-trigger" title="Permanently Delete">
                                                                <FiTrash2 size={16} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => toggleBan(u._id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all ${u.isBanned ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white' : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white'}`}>
                                                            {u.isBanned ? <><FiCheckCircle size={14} /> Unban</> : <><FiUserX size={14} /> Ban</>}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-white/5">
                                <p className="text-xs font-medium text-slate-500">Page {userPage} of {Math.ceil(userTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setUserPage(p => p - 1)} disabled={userPage <= 1} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setUserPage(p => p + 1)} disabled={userPage >= Math.ceil(userTotal / 15)} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* JOBS TAB */}
                {activeTab === "Jobs" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="Job Listings"
                            subtitle={`Managing ${fmt(jobTotal)} employment opportunities`}
                            actions={
                                <SearchBar value={jobSearch} onChange={setJobSearch} placeholder="Search jobs, companies..." />
                            }
                        />

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Listing Details</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {jobs.map(j => (
                                            <tr key={j._id} className="group hover:bg-white/5 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-[#5CB144] group-hover:shadow-md transition-all">
                                                            <FiBriefcase size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-200 group-hover:text-[#5CB144] transition-colors">{j.title}</p>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <p className="text-xs font-medium text-slate-500">{j.company}</p>
                                                                <span className="w-1 h-1 bg-slate-600 rounded-full" />
                                                                <p className="flex items-center gap-1 text-xs font-medium text-slate-500"><FiMapPin size={10} /> {j.location}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <select
                                                        value={j.status || "active"}
                                                        onChange={e => changeJobStatus(j._id, e.target.value)}
                                                        className={`bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-[#5CB144] transition-all cursor-pointer ${STATUS_COLORS[j.status || 'active']}`}
                                                    >
                                                        <option value="active" className="bg-slate-900 text-slate-200">Active</option>
                                                        <option value="inactive" className="bg-slate-900 text-slate-200">Inactive</option>
                                                        <option value="closed" className="bg-slate-900 text-slate-200">Closed</option>
                                                    </select>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all duration-200">
                                                        <button onClick={() => navigate(`/jobs/${j._id}`)} className="p-2.5 bg-white/5 text-slate-400 rounded-lg hover:bg-white/10 hover:text-white transition-all" title="View Listing">
                                                            <FiEye size={18} />
                                                        </button>
                                                        {j.status === 'pending' && (
                                                            <button
                                                                onClick={() => changeJobStatus(j._id, 'active')}
                                                                className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                                                title="Approve Job"
                                                            >
                                                                <FiCheckCircle size={18} />
                                                            </button>
                                                        )}
                                                        <button onClick={() => deleteJob(j._id)} className="p-2.5 bg-rose-500/10 text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-all" title="Delete Listing">
                                                            <FiTrash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-white/5">
                                <p className="text-xs font-medium text-slate-500">Page {jobPage} of {Math.ceil(jobTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setJobPage(p => p - 1)} disabled={jobPage <= 1} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setJobPage(p => p + 1)} disabled={jobPage >= Math.ceil(jobTotal / 15)} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* APPLICATIONS TAB */}
                {activeTab === "Applications" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="Application Tracking"
                            subtitle={`Reviewing ${fmt(appTotal)} candidate submissions`}
                            actions={
                                <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 overflow-x-auto">
                                    {["all", "applied", "accepted", "rejected"].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setAppStatus(s); setAppPage(1); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${appStatus === s ? "bg-[#5CB144] text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            }
                        />

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-white/5">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Score</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {apps.map(a => (
                                            <tr key={a._id} className="group hover:bg-white/5 transition-all">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 font-semibold group-hover:bg-[#5CB144]/20 group-hover:text-[#5CB144] transition-colors">
                                                            {(a.applicant?.name || "?")[0].toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-200">{a.applicant?.name || "Deleted User"}</p>
                                                            <p className="text-xs text-slate-500 mt-0.5">{a.applicant?.email || "N/A"}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="font-medium text-sm text-slate-300">{a.job?.title || "Deleted Job"}</p>
                                                    <p className="text-xs text-slate-500 mt-0.5">{a.job?.company}</p>
                                                </td>
                                                <td className="px-8 py-5">
                                                    {a.aiMatchScore ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-16 h-1.5 bg-black/40 rounded-full overflow-hidden">
                                                                <div className={`h-full ${a.aiMatchScore >= 80 ? "bg-emerald-500" : a.aiMatchScore >= 50 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${a.aiMatchScore}%` }} />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-300">{a.aiMatchScore}%</span>
                                                        </div>
                                                    ) : <span className="text-xs text-slate-500 italic">Pending</span>}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[a.status]}`}>
                                                            {a.status}
                                                        </span>
                                                        {(a.agreement?.status === 'sent' || a.agreement?.status === 'accepted') && (
                                                            <button 
                                                                onClick={() => setViewingAgreement(a)}
                                                                className="text-[10px] text-[#CF9EFF] font-bold underline transition-all"
                                                            >
                                                                📜 View Agreement
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-white/5">
                                <p className="text-xs font-medium text-slate-500">Page {appPage} of {Math.ceil(appTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setAppPage(p => p - 1)} disabled={appPage <= 1} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setAppPage(p => p + 1)} disabled={appPage >= Math.ceil(appTotal / 15)} className="w-9 h-9 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center hover:bg-[#5CB144] hover:text-white disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOOLS TAB */}
                {activeTab === "Tools" && (
                    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="System Administration"
                            subtitle="Advanced tools and configuration"
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-[#5CB144]/30 transition-all shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#5CB144]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-[#5CB144]/20 rounded-xl flex items-center justify-center text-[#5CB144] group-hover:bg-[#5CB144] group-hover:text-white transition-all">
                                        <FiShield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Promote to Admin</h3>
                                        <p className="text-xs text-slate-400 mt-1">Grant administrative privileges</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <FiUserX className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-[#5CB144]" />
                                        <input
                                            value={promoteEmail}
                                            onChange={(e) => setPromoteEmail(e.target.value)}
                                            placeholder="User Email Address"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#5CB144]/50 transition-all placeholder:text-slate-500"
                                        />
                                    </div>
                                    <button onClick={promote} className="w-full py-3 bg-[#5CB144] hover:bg-[#4a8f37] text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.98]">
                                        Execute Promotion
                                    </button>
                                    {promoteMsg && <p className={`text-xs font-medium text-center flex items-center justify-center gap-1 ${promoteMsg.includes('successfully') || promoteMsg.includes('Admin') ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        {(promoteMsg.includes('successfully') || promoteMsg.includes('Admin')) && <FiCheckCircle />} {promoteMsg}
                                    </p>}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-[#CF9EFF]/30 transition-all shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#CF9EFF]/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-[#CF9EFF]/20 rounded-xl flex items-center justify-center text-[#CF9EFF] group-hover:bg-[#CF9EFF] group-hover:text-white transition-all">
                                        <FiStar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">AI Categorization</h3>
                                        <p className="text-xs text-slate-400 mt-1">Sync legacy jobs with AI categories</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs text-slate-500 leading-relaxed italic">
                                        Use this to fix jobs like "Delivery boy" that aren't showing in core categories.
                                    </p>
                                    <button 
                                        onClick={executeBulkCategorize} 
                                        disabled={isRecategorizing}
                                        className="w-full py-3 bg-[#CF9EFF] hover:bg-[#b880f0] text-black rounded-xl font-extrabold text-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isRecategorizing ? 'Categorizing...' : 'Recategorize All Jobs'}
                                    </button>
                                    {recatStatus && <p className={`text-[10px] font-medium text-center mt-2 flex items-center justify-center gap-1 ${recatStatus.includes('successfully') ? 'text-emerald-400' : 'text-[#CF9EFF]'}`}>
                                        {recatStatus.includes('successfully') && <FiCheckCircle />} {recatStatus}
                                    </p>}
                                </div>
                            </div>
                        </div>

                        {/* Danger Zone - Exclusive to Power Mode */}
                        {powerMode && (
                            <div className="bg-rose-950/30 border border-rose-500/30 rounded-3xl p-8 sm:p-10 animate-in zoom-in duration-500 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[80px] rounded-full" />
                                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                    <div className="w-20 h-20 bg-rose-500/20 rounded-2xl flex items-center justify-center text-rose-500 shrink-0">
                                        <FiTrash2 size={32} />
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <h3 className="text-2xl font-bold text-rose-500">Danger Zone</h3>
                                        <p className="text-sm text-rose-200/70 mt-2 max-w-lg">Advanced destructive operations. These actions are irreversible and will permanently remove data from the system.</p>
                                        <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                                            <button className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold text-xs transition-all shadow-lg shadow-rose-500/20 active:scale-95">
                                                Clear Test Data
                                            </button>
                                            <button className="px-6 py-2.5 bg-transparent border border-rose-500/50 text-rose-400 hover:bg-rose-500/10 rounded-xl font-semibold text-xs transition-all active:scale-95">
                                                Rebuild Indexes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* AGREEMENT MODAL (Overlay) */}
            {viewingAgreement && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setViewingAgreement(null)}></div>
                    <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in duration-300">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-lg">
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-1">Employment Agreement</h3>
                                <p className="text-slate-400 text-sm">Reviewing offer from <span className="text-[#CF9EFF] font-bold">{viewingAgreement.job?.company}</span> to <span className="text-[#5CB144] font-bold">{viewingAgreement.applicant?.name}</span></p>
                            </div>
                            <button onClick={() => setViewingAgreement(null)} className="text-slate-500 hover:text-white transition-all text-2xl p-2 hover:bg-white/5 rounded-full">✕</button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-8 space-y-6 shadow-inner">
                                {viewingAgreement.agreement?.fields?.map((field, index) => (
                                    <div key={index} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                        <h4 className="text-[#CF9EFF] text-xs font-bold uppercase tracking-widest mb-2">{field.question}</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{field.answer}</p>
                                    </div>
                                ))}
                                {(!viewingAgreement.agreement?.fields || viewingAgreement.agreement.fields.length === 0) && (
                                    <p className="text-slate-500 italic text-center">No structured terms found.</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 border border-white/5 rounded-2xl p-6">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employer Signature</p>
                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                        <p className="text-white font-mono text-xl italic">{viewingAgreement.agreement?.employerSignature || "Not yet signed"}</p>
                                        {viewingAgreement.agreement?.sentAt && (
                                            <p className="text-[9px] text-slate-500 mt-2">Signed on {new Date(viewingAgreement.agreement.sentAt).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-[#5CB144]/80 uppercase tracking-widest">Candidate Signature</p>
                                    <div className="bg-black/40 border border-[#5CB144]/10 p-4 rounded-xl">
                                        <p className="text-white font-mono text-xl italic">{viewingAgreement.agreement?.candidateSignature || "Awaiting signature..."}</p>
                                        {viewingAgreement.agreement?.acceptedAt && (
                                            <p className="text-[9px] text-slate-500 mt-2">Signed on {new Date(viewingAgreement.agreement.acceptedAt).toLocaleDateString()}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-white/5 bg-white/5 flex justify-end">
                            <button 
                                onClick={() => setViewingAgreement(null)}
                                className="px-8 py-3 rounded-xl bg-[#5CB144] hover:bg-[#4a8f37] text-white font-bold transition-all shadow-lg active:scale-95"
                            >
                                Close Record
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

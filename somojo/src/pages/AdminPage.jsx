import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import AdminLayout from "../components/AdminLayout";
import {
    FiUserX,
    FiShield,
    FiTrash2,
    FiCheckCircle,
    FiXCircle,
    FiTrendingUp,
    FiClock,
    FiZap,
    FiSearch,
    FiFilter,
    FiChevronLeft,
    FiChevronRight,
    FiActivity,
    FiEye,
    FiBriefcase,
    FiUsers,
    FiFileText,
    FiMapPin,
    FiHome
} from "react-icons/fi";

// ─── helpers ──────────────────────────────────────────────────────────────────
const ROLE_COLORS = {
    "job-seeker": "text-sky-400 bg-sky-400/10 border-sky-400/20",
    employer: "text-violet-400 bg-violet-400/10 border-violet-400/20",
    admin: "text-indigo-400 bg-indigo-400/10 border-indigo-400/20",
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
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-6 transition-all duration-300 hover:border-indigo-500/30 hover:bg-slate-800/50 group shadow-lg">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-white/5 rounded-2xl text-xl group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-300 text-slate-300 group-hover:text-indigo-400">
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
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-400" />
            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all font-medium placeholder:text-slate-500 shadow-inner"
            />
        </div>
    );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user") || "{}");

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

    useEffect(() => {
        if (!user || user.role !== "admin") {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchStats = useCallback(async () => {
        try {
            const res = await api.get("/admin/stats");
            setStats(res.data);
        } catch { /* ignore */ }
    }, []);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/users", {
                params: { page: userPage, limit: 15, search: userSearch, role: userRole },
            });
            setUsers(res.data.users);
            setUserTotal(res.data.total);
        } finally { setLoading(false); }
    }, [userPage, userSearch, userRole]);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/jobs", {
                params: { page: jobPage, limit: 15, search: jobSearch },
            });
            setJobs(res.data.jobs);
            setJobTotal(res.data.total);
        } finally { setLoading(false); }
    }, [jobPage, jobSearch]);

    const fetchApps = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/admin/applications", {
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
        await api.put(`/admin/users/${userId}/ban`);
        fetchUsers();
    };

    const changeRole = async (userId, role) => {
        await api.put(`/admin/users/${userId}/role`, { role });
        fetchUsers();
    };

    const deleteUser = async (userId) => {
        if (!window.confirm("CRITICAL: Delete user data permanently?")) return;
        await api.delete(`/admin/users/${userId}`);
        fetchUsers();
    };

    const deleteJob = async (jobId) => {
        if (!window.confirm("CRITICAL: Delete this job and all its applications?")) return;
        await api.delete(`/admin/jobs/${jobId}`);
        fetchJobs();
    };

    const changeJobStatus = async (jobId, status) => {
        await api.put(`/admin/jobs/${jobId}/status`, { status });
        fetchJobs();
    };

    const promote = async () => {
        if (!promoteEmail) return;
        try {
            const res = await api.post("/admin/promote", { email: promoteEmail });
            setPromoteMsg(`✅ ${res.data.message}`);
            setPromoteEmail("");
        } catch (e) {
            setPromoteMsg(`❌ ${e.response?.data?.message || "Failed"}`);
        }
    };

    return (
        <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
            <div className="w-full">
                {/* OVERVIEW */}
                {activeTab === "Overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="Dashboard Overview"
                            subtitle="Platform metrics and recent activity"
                            actions={
                                <button
                                    onClick={() => setPowerMode(!powerMode)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm ${powerMode ? "bg-indigo-500 text-white shadow-[0_4px_20px_-4px_rgba(99,102,241,0.5)]" : "bg-slate-800 border border-white/10 text-slate-300 hover:bg-slate-700"
                                        }`}
                                >
                                    <FiZap className={powerMode ? "animate-pulse" : ""} />
                                    {powerMode ? "Elevated Access Active" : "Enable Elevation"}
                                </button>
                            }
                        />

                        {!stats ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {[1, 2, 3, 4].map(i => <div key={i} className="h-36 bg-slate-800/50 rounded-3xl animate-pulse" />)}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <StatCard icon={<FiUsers />} label="Total Users" value={stats.totals.users} trend={12} />
                                    <StatCard icon={<FiBriefcase />} label="Active Jobs" value={stats.totals.jobs} trend={8} />
                                    <StatCard icon={<FiActivity />} label="Applications" value={stats.totals.applications} trend={24} />
                                    <StatCard icon={<FiShield />} label="Administrators" value={stats.users.admins} />
                                </div>

                                <div className="grid lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                                <h3 className="text-xl font-bold tracking-tight text-white">Platform Analytics</h3>
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-800/50 border border-white/5 px-3 py-1.5 rounded-full">
                                                    <span className="w-2 h-2 rounded-full bg-sky-400" /> Seekers
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 bg-slate-800/50 border border-white/5 px-3 py-1.5 rounded-full">
                                                    <span className="w-2 h-2 rounded-full bg-violet-400" /> Employers
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div>
                                                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-3">
                                                    <span>User Distribution</span>
                                                    <span className="text-slate-300">{(stats.users.jobSeekers / (stats.totals.users || 1) * 100).toFixed(1)}% Seekers</span>
                                                </div>
                                                <div className="h-3.5 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-sky-500 transition-all duration-1000" style={{ width: `${(stats.users.jobSeekers / (stats.totals.users || 1) * 100)}%` }} />
                                                    <div className="h-full bg-violet-500 transition-all duration-1000" style={{ width: `${(stats.users.employers / (stats.totals.users || 1) * 100)}%` }} />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                <div className="bg-emerald-500/5 rounded-2xl p-5 border border-emerald-500/10">
                                                    <p className="text-3xl font-bold text-emerald-400 tracking-tight">{stats.applications.accepted}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Accepted Apps</p>
                                                </div>
                                                <div className="bg-rose-500/5 rounded-2xl p-5 border border-rose-500/10">
                                                    <p className="text-3xl font-bold text-rose-400 tracking-tight">{stats.applications.rejected}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Rejected Apps</p>
                                                </div>
                                                <div className="bg-sky-500/5 rounded-2xl p-5 border border-sky-500/10">
                                                    <p className="text-3xl font-bold text-sky-400 tracking-tight">{stats.applications.pending}</p>
                                                    <p className="text-xs text-slate-400 font-medium mt-1">Pending Review</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col shadow-xl">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-3xl rounded-full" />
                                        <div className="flex items-center gap-3 mb-8 relative z-10">
                                            <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                            <h3 className="text-xl font-bold tracking-tight text-white">Recent Joins</h3>
                                        </div>
                                        <div className="space-y-5 flex-1 relative z-10">
                                            {stats.recent.users.map(u => (
                                                <div key={u._id} className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs uppercase border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                            {u.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm text-slate-200 group-hover:text-indigo-300 transition-colors">{u.name}</p>
                                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-0.5">{u.role}</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-slate-400">{ago(u.createdAt)}</p>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={() => setActiveTab("Users")} className="w-full mt-6 py-3.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl font-medium text-sm transition-all border border-white/10 hover:border-white/20 relative z-10">
                                            View All Users
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* USERS */}
                {activeTab === "Users" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="User Management"
                            subtitle={`Managing ${fmt(userTotal)} registered users`}
                            actions={
                                <>
                                    <SearchBar value={userSearch} onChange={setUserSearch} placeholder="Search names, emails..." />
                                    <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 shadow-inner overflow-x-auto">
                                        {["all", "job-seeker", "employer", "admin"].map(r => (
                                            <button
                                                key={r}
                                                onClick={() => { setUserRole(r); setUserPage(1); }}
                                                className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${userRole === r ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                                                    }`}
                                            >
                                                {r === "all" ? "All Users" : r.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            }
                        />

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-800/30">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">User</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Role & Status</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {users.map(u => (
                                            <tr key={u._id} className={`group hover:bg-slate-800/30 transition-all duration-300 ${u.isBanned ? 'opacity-50' : ''}`}>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
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
                                                            className={`bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer transition-all ${ROLE_COLORS[u.role]}`}
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

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-slate-800/20">
                                <p className="text-xs font-medium text-slate-500">Page {userPage} of {Math.ceil(userTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setUserPage(p => p - 1)} disabled={userPage <= 1} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setUserPage(p => p + 1)} disabled={userPage >= Math.ceil(userTotal / 15)} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
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

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-800/30">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Listing Details</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {jobs.map(j => (
                                            <tr key={j._id} className="group hover:bg-slate-800/30 transition-all duration-300">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-slate-800 rounded-xl border border-white/10 flex items-center justify-center text-indigo-400 group-hover:shadow-md transition-all">
                                                            <FiBriefcase size={22} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300 transition-colors">{j.title}</p>
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
                                                        className={`bg-slate-900 border rounded-lg px-3 py-1.5 text-xs font-medium focus:outline-none transition-all cursor-pointer ${STATUS_COLORS[j.status || 'active']}`}
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

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-slate-800/20">
                                <p className="text-xs font-medium text-slate-500">Page {jobPage} of {Math.ceil(jobTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setJobPage(p => p - 1)} disabled={jobPage <= 1} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setJobPage(p => p + 1)} disabled={jobPage >= Math.ceil(jobTotal / 15)} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
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
                                <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 overflow-x-auto">
                                    {["all", "applied", "accepted", "rejected"].map(s => (
                                        <button
                                            key={s}
                                            onClick={() => { setAppStatus(s); setAppPage(1); }}
                                            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all whitespace-nowrap ${appStatus === s ? "bg-indigo-500 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
                                                }`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            }
                        />

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-800/30">
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Candidate</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Score</th>
                                            <th className="px-8 py-5 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {apps.map(a => (
                                            <tr key={a._id} className="group hover:bg-slate-800/30 transition-all">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-semibold group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
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
                                                            <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                <div className={`h-full ${a.aiMatchScore >= 80 ? "bg-emerald-500" : a.aiMatchScore >= 50 ? "bg-amber-400" : "bg-rose-500"}`} style={{ width: `${a.aiMatchScore}%` }} />
                                                            </div>
                                                            <span className="text-xs font-semibold text-slate-300">{a.aiMatchScore}%</span>
                                                        </div>
                                                    ) : <span className="text-xs text-slate-500 italic">Pending</span>}
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${STATUS_COLORS[a.status]}`}>
                                                        {a.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="px-8 py-5 flex justify-between items-center border-t border-white/5 bg-slate-800/20">
                                <p className="text-xs font-medium text-slate-500">Page {appPage} of {Math.ceil(appTotal / 15) || 1}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setAppPage(p => p - 1)} disabled={appPage <= 1} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronLeft size={18} /></button>
                                    <button onClick={() => setAppPage(p => p + 1)} disabled={appPage >= Math.ceil(appTotal / 15)} className="w-9 h-9 bg-slate-800 rounded-lg border border-white/10 flex items-center justify-center hover:bg-indigo-500 hover:text-white disabled:opacity-50 disabled:hover:bg-slate-800 disabled:hover:text-current transition-all text-slate-300"><FiChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* TOOLS */}
                {activeTab === "Tools" && (
                    <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <SectionHeader
                            title="System Administration"
                            subtitle="Advanced tools and configuration"
                        />

                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-indigo-500/30 transition-all shadow-xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <FiShield size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Promote to Admin</h3>
                                        <p className="text-xs text-slate-400 mt-1">Grant administrative privileges</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="relative group/input">
                                        <FiUserX className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-indigo-400" />
                                        <input
                                            value={promoteEmail}
                                            onChange={(e) => setPromoteEmail(e.target.value)}
                                            placeholder="User Email Address"
                                            className="w-full bg-slate-800 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-500"
                                        />
                                    </div>
                                    <button onClick={promote} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-all shadow-md active:scale-[0.98]">
                                        Execute Promotion
                                    </button>
                                    {promoteMsg && <p className={`text-xs font-medium text-center ${promoteMsg.startsWith('✅') ? 'text-emerald-400' : 'text-rose-400'}`}>{promoteMsg}</p>}
                                </div>
                            </div>

                            <div className="bg-slate-950 border border-white/5 rounded-3xl p-8 font-mono shadow-xl relative">
                                <div className="flex items-center gap-2 mb-6">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                                    <span className="text-xs text-slate-400">System Services</span>
                                </div>
                                <div className="space-y-3">
                                    {[
                                        { s: "Auth Module", st: "OK" },
                                        { s: "Database Connect", st: "STABLE" },
                                        { s: "AI Processing", st: "ACTIVE" },
                                        { s: "Storage Buckets", st: "SYNCHED" },
                                    ].map((log, i) => (
                                        <div key={i} className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2.5">
                                            <span className="text-slate-300 text-xs">{log.s}</span>
                                            <span className="text-emerald-400 text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded font-bold">{log.st}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <div className="flex justify-between text-xs mb-2">
                                        <span className="text-slate-400">System Load</span>
                                        <span className="text-indigo-400">12%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 w-[12%]" />
                                    </div>
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
        </AdminLayout>
    );
}

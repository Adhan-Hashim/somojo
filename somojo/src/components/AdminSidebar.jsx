import { Link, useLocation } from "react-router-dom";
import {
    FiPieChart, FiUsers, FiBriefcase, FiFileText, FiLogOut, FiTerminal
} from "react-icons/fi";

const NAV_ITEMS = [
    { id: "Overview", label: "Overview", icon: <FiPieChart />, path: "/admin" },
    { id: "Users", label: "Users", icon: <FiUsers />, path: "/admin" },
    { id: "Jobs", label: "Jobs", icon: <FiBriefcase />, path: "/admin" },
    { id: "Applications", label: "Applications", icon: <FiFileText />, path: "/admin" },
    { id: "Tools", label: "Tools", icon: <FiTerminal />, path: "/admin" },
];

export default function AdminSidebar({ activeTab, onTabChange }) {
    const handleLogout = () => {
        localStorage.removeItem("user");
        window.location.href = "/";
    };

    return (
        <div className="w-64 h-screen bg-[#0a0a0a]/60 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed left-0 top-0 z-[60] shadow-2xl">
            {/* Logo */}
            <div className="p-8">
                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => (window.location.href = "/")}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5CB144] to-[#CF9EFF] flex items-center justify-center font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                        S
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-white">Somojo</h1>
                        <p className="text-[11px] text-[#5CB144] font-medium uppercase tracking-wider">Admin Workspace</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1.5 mt-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onTabChange(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative overflow-hidden ${isActive
                                    ? "text-[#5CB144] bg-[#5CB144]/10 shadow-[0_4px_20px_-4px_rgba(92,177,68,0.2)]"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                }`}
                        >
                            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-[#5CB144] rounded-r-full" />}
                            <span className="text-lg opacity-90">{item.icon}</span>
                            {item.label}
                        </button>
                    )
                })}
            </nav>

            {/* System Status / Footer */}
            <div className="p-6 border-t border-white/5">
                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Status Node</span>
                        <div className="w-2 h-2 bg-[#5CB144] rounded-full animate-pulse shadow-[0_0_8px_rgba(92,177,68,0.5)]" />
                    </div>
                    <p className="text-xs text-slate-400 font-medium tracking-wide">Operational Logs OK</p>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-300"
                >
                    <FiLogOut className="text-lg" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

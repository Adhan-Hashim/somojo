import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children, activeTab, onTabChange }) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans selection:bg-indigo-500/30">
            {/* Sidebar - Fixed */}
            <AdminSidebar activeTab={activeTab} onTabChange={onTabChange} />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 min-h-screen relative overflow-hidden">
                {/* Elegant Glassmorphic Accents */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full pointer-events-none -translate-x-1/3 translate-y-1/3" />

                <div className="relative z-10 w-full max-w-7xl mx-auto p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}

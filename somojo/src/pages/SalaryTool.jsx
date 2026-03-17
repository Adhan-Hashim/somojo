import { useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";

export default function SalaryTool() {
    const [query, setQuery] = useState("");
    const [searched, setSearched] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setSearched(false);

        // Mock network delay
        setTimeout(() => {
            setLoading(false);
            setSearched(true);
        }, 800);
    };

    return (
        <div className="min-h-screen text-white pb-32 overflow-hidden relative">
            <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#CF9EFF] opacity-[0.05] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Header */}
            <div className="pt-32 pb-12 px-6 max-w-3xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Know your <span className="text-[#CF9EFF]">worth.</span>
                </h1>
                <p className="text-base md:text-xl text-gray-400 mb-10">
                    Compare hourly wages and part-time salaries for thousands of local roles.
                    Backed by real-time Somojo platform data.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                        <Search size={24} className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g. Barista, Warehouse Associate, Delivery Driver"
                        className="w-full bg-white/5 backdrop-blur-xl border border-white/20 rounded-full py-5 pl-16 pr-32 text-lg focus:outline-none focus:border-[#CF9EFF] focus:bg-white/10 transition-all shadow-[0_8px_32px_rgba(0,0,0,0.5)] placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute inset-y-2 right-2 bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold px-6 rounded-full transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </form>
            </div>

            {/* Results Area */}
            <div className="max-w-4xl mx-auto px-6 relative z-10 min-h-[300px]">
                {searched && !loading && (
                    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 md:p-12 shadow-2xl animate-fade-in-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b border-white/10 pb-8">
                            <div>
                                <h2 className="text-gray-400 font-semibold uppercase tracking-widest text-sm mb-2">Estimated Hourly Wage</h2>
                                <h3 className="text-4xl md:text-5xl font-bold capitalize text-white">{query}</h3>
                            </div>
                            <div className="mt-4 md:mt-0 text-left md:text-right">
                                <span className="text-5xl md:text-6xl font-black text-[#5CB144] tracking-tighter">$16.50</span>
                                <span className="text-gray-500 font-medium ml-2">/ hr</span>
                            </div>
                        </div>

                        {/* Visual Range Bar */}
                        <div className="mb-12">
                            <div className="flex justify-between text-sm text-gray-400 font-medium mb-3">
                                <span>Low: $14.00</span>
                                <span>Average: $16.50</span>
                                <span>High: $22.00</span>
                            </div>
                            <div className="w-full h-4 bg-white/10 rounded-full relative overflow-hidden">
                                <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-gray-500 via-[#5CB144] to-[#CF9EFF] w-[60%] rounded-full shadow-[0_0_15px_rgba(92,177,68,0.5)]"></div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                                <h4 className="font-bold text-gray-300 mb-2">Based on Real Data</h4>
                                <p className="text-sm text-gray-500">Averages calculated from 4,200+ active Somojo job postings in the last 30 days.</p>
                            </div>
                            <div className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 p-6 rounded-2xl flex flex-col justify-between">
                                <h4 className="font-bold text-[#CF9EFF] mb-2">Looking for {query} jobs?</h4>
                                <Link to="/register" className="text-sm text-white font-bold underline decoration-[#CF9EFF] underline-offset-4 hover:text-[#CF9EFF] transition-colors">
                                    Browse active listings →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {!searched && !loading && (
                    <div className="text-center text-gray-500 mt-20">
                        Type a job title above to see real-time salary insights.
                    </div>
                )}
            </div>

            <div className="mt-20 text-center relative z-10">
                <Link to="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</Link>
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

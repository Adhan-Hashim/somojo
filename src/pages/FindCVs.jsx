import { useState } from "react";
import api from "../api";

export default function FindCVs() {
    const [activeTab, setActiveTab] = useState("search"); // 'search' or 'saved'
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setIsSearching(true);
        setHasSearched(true);
        try {
            const res = await api.post('/profile/search', { query });
            setResults(res.data);
        } catch (error) {
            console.error("AI Search Failed:", error);
            alert("Failed to search candidates.");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className="min-h-screen text-white pb-20">
            {/* Sub Navbar */}
            <div className="bg-white/5 border-b border-white/10 px-6 py-3 flex gap-8 z-40 relative">
                <button
                    onClick={() => setActiveTab("search")}
                    className={`font-semibold transition-colors duration-300 pb-2 border-b-2 ${activeTab === 'search' ? 'text-[#5CB144] border-[#5CB144]' : 'text-gray-400 border-transparent hover:text-white'}`}
                >
                    Search CVs
                </button>
                <button
                    onClick={() => setActiveTab("saved")}
                    className={`font-semibold transition-colors duration-300 pb-2 border-b-2 ${activeTab === 'saved' ? 'text-[#5CB144] border-[#5CB144]' : 'text-gray-400 border-transparent hover:text-white'}`}
                >
                    Saved CVs
                </button>
            </div>

            {activeTab === "search" ? (
                <>
                    {/* Hero Section */}
                    <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto relative z-10">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            Find the right fit, <span className="text-[#5CB144]">fast.</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10">
                            Describe the perfect candidate in your own words. Our AI will instantly find the best matches.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white/5 backdrop-blur-xl border border-[#CF9EFF]/30 p-2 rounded-full flex flex-col md:flex-row gap-2 max-w-4xl mx-auto shadow-[0_0_40px_-10px_rgba(207,158,255,0.2)]">
                            <div className="flex-1 flex items-center bg-transparent px-4 py-3">
                                <span className="text-2xl mr-3">✨</span>
                                <input
                                    type="text"
                                    placeholder="e.g. 'I need a bilingual customer service rep with 3 years of retail experience in Chicago'"
                                    className="w-full bg-transparent text-white outline-none placeholder-gray-500 text-base md:text-lg"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>

                            <button
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-4 px-10 rounded-full transition shadow-lg shadow-[#CF9EFF]/30 text-lg md:w-auto w-full disabled:opacity-70 flex items-center justify-center"
                            >
                                {isSearching ? <span className="animate-pulse">Analyzing...</span> : "Find Candidates"}
                            </button>
                        </div>
                    </div>

                    {/* AI Suggested Resumes grid */}
                    <div className="max-w-6xl mx-auto px-6 mt-10 relative z-10">
                        {hasSearched && (
                            <h2 className="text-2xl font-bold mb-8 border-b border-white/10 pb-4">
                                {isSearching ? "Our AI is scanning thousands of resumes..." : `Found ${results.length} Candidates`}
                            </h2>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.map(resume => (
                                <div key={resume._id} className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#CF9EFF]/20 p-6 rounded-3xl hover:-translate-y-1 transition-transform duration-300 group cursor-pointer hover:border-[#CF9EFF]/60 hover:shadow-[0_10px_30px_-10px_rgba(207,158,255,0.15)] flex flex-col justify-between">

                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-full bg-[#CF9EFF]/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform text-white">
                                                    {resume.user?.name?.charAt(0) || '👤'}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-white group-hover:text-[#CF9EFF] transition-colors">{resume.user?.name || 'Candidate'}</h3>
                                                    <p className="text-gray-400 text-sm">{resume.location || 'Location Not Specified'}</p>
                                                </div>
                                            </div>
                                            <div className="bg-[#CF9EFF]/20 text-[#CF9EFF] font-bold px-3 py-1 rounded-xl flex items-center gap-1">
                                                <span className="text-xs">✨ AI Score:</span>
                                                <span className="text-lg">{resume.aiMatchScore}%</span>
                                            </div>
                                        </div>

                                        <p className="text-white font-medium mb-4">{resume.headline}</p>

                                        <div className="bg-[#CF9EFF]/5 border border-[#CF9EFF]/10 p-4 rounded-xl mb-6">
                                            <p className="text-sm text-gray-300 italic">
                                                <span className="font-bold text-[#CF9EFF] not-italic mr-2">Why they fit:</span>
                                                "{resume.aiMatchReason}"
                                            </p>
                                        </div>

                                        {resume.skills && resume.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-6">
                                                {resume.skills.slice(0, 4).map((s, i) => (
                                                    <span key={i} className="text-xs font-semibold px-2 py-1 bg-white/5 rounded text-gray-300 border border-white/10">{s}</span>
                                                ))}
                                                {resume.skills.length > 4 && <span className="text-xs font-semibold px-2 py-1 bg-transparent rounded text-gray-500">+{resume.skills.length - 4} more</span>}
                                            </div>
                                        )}
                                    </div>

                                    <button className="w-full bg-[#CF9EFF]/10 hover:bg-[#CF9EFF]/30 text-[#CF9EFF] font-semibold py-3 rounded-xl border border-[#CF9EFF]/30 transition">
                                        View Full Profile
                                    </button>
                                </div>
                            ))}
                            {hasSearched && !isSearching && results.length === 0 && (
                                <div className="col-span-full py-12 text-center text-gray-400 border border-white/10 rounded-3xl bg-white/5">
                                    <span className="text-4xl block mb-4">🤔</span>
                                    <p className="text-lg">No exact matches found. Try broadening your AI search prompt.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10 animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-3xl font-bold">Your Saved CVs</h2>
                        <span className="bg-[#5CB144]/20 text-[#5CB144] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#5CB144]/30">2 Candidates</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center text-gray-500 py-20 border border-white/10 rounded-3xl bg-white/5 col-span-full">
                        <div className="col-span-full">
                            <span className="text-4xl block mb-4">🛒</span>
                            <p>You haven't saved any candidates yet.</p>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

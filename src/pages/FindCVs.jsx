import { useState } from "react";

export default function FindCVs() {
    const [activeTab, setActiveTab] = useState("search"); // 'search' or 'saved'
    const [query, setQuery] = useState("");
    const [location, setLocation] = useState("");

    const mockResumes = [
        { name: "Rahul Sharma", title: "Senior Retail Associate", exp: "5 years", id: 1 },
        { name: "Priya Patel", title: "Customer Service Specialist", exp: "3 years", id: 2 },
        { name: "Amit Kumar", title: "Warehouse Manager", exp: "7 years", id: 3 },
        { name: "Sneha Reddy", title: "Barista & Cafe Manager", exp: "2 years", id: 4 },
    ];

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
                            Search millions of resumes and find candidates that match your exact requirements instantly.
                        </p>

                        {/* Search Bar */}
                        <div className="bg-white/5 backdrop-blur-xl border border-white/20 p-2 rounded-full flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl">
                            <div className="flex-1 flex items-center bg-transparent px-4 py-2 border-b md:border-b-0 md:border-r border-white/10">
                                <span className="text-xl mr-3">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Job title, skills, or company"
                                    className="w-full bg-transparent text-white outline-none placeholder-gray-500 text-lg"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 flex items-center bg-transparent px-4 py-2">
                                <span className="text-xl mr-3">📍</span>
                                <input
                                    type="text"
                                    placeholder="City, state, or zip"
                                    className="w-full bg-transparent text-white outline-none placeholder-gray-500 text-lg"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                />
                            </div>
                            <button className="bg-[#5CB144] hover:bg-[#4a8f37] text-white font-bold py-4 px-10 rounded-full transition shadow-lg shadow-[#5CB144]/30 text-lg md:w-auto w-full">
                                Find Resumes
                            </button>
                        </div>
                    </div>

                    {/* Suggested Resumes grid */}
                    <div className="max-w-6xl mx-auto px-6 mt-10 relative z-10">
                        <h2 className="text-2xl font-bold mb-8 border-b border-white/10 pb-4">Top Candidates Recently Active in your Area</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {mockResumes.map(resume => (
                                <div key={resume.id} className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer hover:border-[#5CB144]/50 hover:shadow-[0_10px_30px_-10px_rgba(92,177,68,0.2)]">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                                        👤
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#5CB144] transition-colors">{resume.name}</h3>
                                    <p className="text-[#CF9EFF] font-medium text-sm mb-3">{resume.title}</p>
                                    <p className="text-gray-400 text-sm mb-6">Experience: {resume.exp}</p>

                                    <button className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-2 rounded-xl border border-white/10 transition">
                                        View Resume
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10 animate-fade-in">
                    <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                        <h2 className="text-3xl font-bold">Your Saved CVs</h2>
                        <span className="bg-[#5CB144]/20 text-[#5CB144] px-4 py-1.5 rounded-full text-sm font-semibold border border-[#5CB144]/30">2 Candidates</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockResumes.slice(0, 2).map(resume => (
                            <div key={resume.id} className="bg-[#0a0a0a]/80 backdrop-blur-md border border-[#5CB144]/30 p-6 rounded-3xl group cursor-pointer shadow-[0_10px_30px_-10px_rgba(92,177,68,0.1)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                                        👤
                                    </div>
                                    <button className="text-[#CF9EFF] text-xl" title="Remove from saved">
                                        ★
                                    </button>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#5CB144] transition-colors">{resume.name}</h3>
                                <p className="text-[#CF9EFF] font-medium text-sm mb-3">{resume.title}</p>
                                <p className="text-gray-400 text-sm mb-6">Experience: {resume.exp}</p>

                                <button className="w-full bg-[#5CB144]/10 hover:bg-[#5CB144]/30 text-[#5CB144] font-bold py-2 rounded-xl border border-[#5CB144]/30 transition">
                                    Message
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}

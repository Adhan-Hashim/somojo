import { Link } from "react-router-dom";

export default function CareerAdvice() {
    const articles = [
        { cat: "Interviews", title: "5 Questions You'll Definitely Be Asked at a Retail Interview", time: "4 min read", img: "bg-gradient-to-br from-[#CF9EFF]/40 to-transparent" },
        { cat: "Resumes", title: "How to Build a Resume When You Have No Experience", time: "6 min read", img: "bg-gradient-to-br from-[#5CB144]/40 to-transparent" },
        { cat: "Growth", title: "Turning a Part-Time Hustle into a Full-Time Career", time: "5 min read", img: "bg-gradient-to-br from-[#3b82f6]/40 to-transparent" },
        { cat: "Work/Life", title: "Balancing College Classes with a Weekend Warehouse Job", time: "8 min read", img: "bg-gradient-to-br from-[#f59e0b]/40 to-transparent" }
    ];

    return (
        <div className="min-h-screen text-white pb-20 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#5CB144] opacity-[0.05] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Header */}
            <div className="pt-32 pb-16 px-6 max-w-5xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Somojo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5CB144] to-[#CF9EFF]">Insights</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Expert advice, tips, and stories to help you navigate the local job market and advance your career.
                </p>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-3">
                    {["All", "Interviews", "Resumes", "Career Growth", "Student Jobs", "Gig Economy"].map((cat, i) => (
                        <button key={i} className={`px-6 py-2 rounded-full border border-white/10 text-sm font-semibold transition-colors ${i === 0 ? 'bg-[#5CB144] text-black border-transparent' : 'bg-white/5 hover:bg-white/10 text-gray-300'}`}>
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Featured Post */}
            <div className="max-w-6xl mx-auto px-6 mb-16 relative z-10">
                <div className="group bg-black/40 backdrop-blur-xl border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row cursor-pointer hover:border-white/20 transition-all">
                    <div className="md:w-1/2 h-64 md:h-auto bg-gradient-to-br from-[#CF9EFF]/30 via-[#5CB144]/20 to-transparent relative">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                        <div className="absolute top-6 left-6 bg-[#CF9EFF] text-black text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">Featured</div>
                    </div>
                    <div className="md:w-1/2 p-10 md:p-16 flex flex-col justify-center">
                        <span className="text-[#CF9EFF] font-bold text-sm tracking-widest uppercase mb-4">Market Trends</span>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 group-hover:text-[#5CB144] transition-colors leading-tight">
                            The Rise of Instant Shift Booking in Local Markets
                        </h2>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Discover how businesses are abandoning traditional two-week schedules in favor of dynamic, on-demand workforce management—and what it means for your earning potential.
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium mt-auto">
                            <span>By Sarah Jenkins</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            <span>10 min read</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Post Grid */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {articles.map((art, idx) => (
                    <div key={idx} className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[30px] overflow-hidden hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                        <div className={`w-full h-40 ${art.img}`}></div>
                        <div className="p-6">
                            <span className="text-[#5CB144] font-bold text-xs uppercase tracking-widest mb-3 block">{art.cat}</span>
                            <h3 className="text-lg font-bold mb-4 group-hover:text-[#CF9EFF] transition-colors line-clamp-2 leading-snug">
                                {art.title}
                            </h3>
                            <div className="text-sm text-gray-500 font-medium">
                                {art.time}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-20 text-center relative z-10">
                <button className="px-8 py-3 rounded-full border border-white/20 text-white font-bold hover:bg-white/10 transition-colors">
                    Load More Articles
                </button>
            </div>

            <div className="mt-12 text-center relative z-10">
                <Link to="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</Link>
            </div>
        </div>
    );
}

import { Link } from "react-router-dom";

export default function Press() {
    const releases = [
        { date: "Feb 28, 2026", title: "Somojo Secures $15M Series A to Expand Local Hiring Platform", source: "Press Release" },
        { date: "Jan 12, 2026", title: "How Somojo is Rethinking the Part-Time Economy for Students", source: "TechLocal Weekly" },
        { date: "Nov 05, 2025", title: "Somojo Launches AI Smart-Matching for Restaurant Franchises", source: "Restaurant Tech Insider" }
    ];

    return (
        <div className="min-h-screen text-white pb-20 overflow-hidden relative">
            <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-white opacity-[0.03] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Header */}
            <div className="pt-32 pb-16 px-6 max-w-4xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    News & <span className="text-[#5CB144]">Media</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    Get the latest company news, press releases, and brand resources from the Somojo team.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">

                {/* Main Content: Releases */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                        <span className="w-8 h-[2px] bg-[#5CB144]"></span> Recent Coverage
                    </h2>

                    <div className="space-y-6">
                        {releases.map((release, idx) => (
                            <div key={idx} className="group bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl hover:bg-white/10 transition-colors cursor-pointer block">
                                <div className="flex justify-between items-center mb-4 text-sm font-semibold">
                                    <span className="text-[#5CB144]">{release.source}</span>
                                    <span className="text-gray-500">{release.date}</span>
                                </div>
                                <h3 className="text-2xl font-bold group-hover:text-[#CF9EFF] transition-colors mb-4 pr-8">
                                    {release.title}
                                </h3>
                                <div className="flex items-center text-gray-400 text-sm font-medium group-hover:text-white transition-colors">
                                    Read full article <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* Media Contact */}
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl">
                        <h3 className="text-xl font-bold mb-4">Media Enquiries</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            For press inquiries, interview requests, and media relations, please reach out to our communications team.
                        </p>
                        <a href="mailto:press@somojo.com" className="text-[#CF9EFF] font-bold hover:underline break-all">
                            press@somojo.com
                        </a>
                    </div>

                    {/* Brand Kit */}
                    <div className="bg-gradient-to-br from-[#5CB144]/20 to-transparent border border-[#5CB144]/30 p-8 rounded-3xl relative overflow-hidden group">
                        <h3 className="text-xl font-bold mb-4">Brand Asset Kit</h3>
                        <p className="text-gray-300 text-sm mb-6">
                            Download high-resolution logos, product screenshots, and executive headshots.
                        </p>
                        <button className="w-full bg-white text-black font-bold py-3 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                            <span>Download Assets</span> <span>(.ZIP)</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-20 text-center relative z-10">
                <Link to="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</Link>
            </div>
        </div>
    );
}

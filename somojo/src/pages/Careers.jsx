import { Link } from "react-router-dom";

export default function Careers() {
    const openRoles = [
        { title: "Senior React Developer", dept: "Engineering", location: "Remote (India)", type: "Full-Time" },
        { title: "Product Designer", dept: "Design", location: "Remote (Global)", type: "Contract" },
        { title: "Local Market Manager", dept: "Operations", location: "Mumbai", type: "Full-Time" }
    ];

    const perks = [
        { icon: "🌍", title: "Work Anywhere", desc: "Remote-first culture allowing you to work from anywhere." },
        { icon: "💸", title: "Competitive Salary", desc: "Top of market compensation and equity packages." },
        { icon: "🩺", title: "Health Focus", desc: "Premium health, dental, and vision insurance for you and your family." },
        { icon: "🏄", title: "Unlimited PTO", desc: "Take the time you need to recharge and come back inspired." }
    ];

    return (
        <div className="min-h-screen text-white pb-20 overflow-hidden relative">
            {/* Header / Hero */}
            <div className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center relative z-10">
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#CF9EFF] opacity-10 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Build the future of <span className="text-[#CF9EFF]">local work.</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                    We're a fast-growing team on a mission to instantly connect local businesses with reliable talent. Come build something that matters.
                </p>
                <div className="flex justify-center gap-4">
                    <a href="#open-roles" className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-3 px-8 rounded-full transition shadow-[0_0_20px_rgba(207,158,255,0.3)]">
                        View Open Roles
                    </a>
                </div>
            </div>

            {/* Perks Section */}
            <div className="max-w-6xl mx-auto px-6 mb-24 relative z-10">
                <h2 className="text-3xl font-bold mb-10 text-center">Why join Somojo?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {perks.map((perk, idx) => (
                        <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] hover:border-[#CF9EFF]/30 transition-colors group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{perk.icon}</div>
                            <h3 className="text-xl font-bold mb-2">{perk.title}</h3>
                            <p className="text-gray-400 text-sm">{perk.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Open Roles */}
            <div id="open-roles" className="max-w-4xl mx-auto px-6 relative z-10">
                <h2 className="text-3xl font-bold mb-8">Open Positions</h2>
                <div className="space-y-4">
                    {openRoles.map((role, idx) => (
                        <div key={idx} className="group bg-black/40 backdrop-blur-xl border border-white/10 p-6 rounded-[24px] flex flex-col md:flex-row justify-between items-start md:items-center hover:bg-white/5 transition-colors cursor-pointer">
                            <div>
                                <h3 className="text-2xl font-bold mb-2 group-hover:text-[#CF9EFF] transition-colors">{role.title}</h3>
                                <div className="flex gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-1">🏢 {role.dept}</span>
                                    <span className="flex items-center gap-1">📍 {role.location}</span>
                                    <span className="flex items-center gap-1">⏱️ {role.type}</span>
                                </div>
                            </div>
                            <button className="hidden md:block px-6 py-2 rounded-full border border-white/20 group-hover:bg-[#CF9EFF] group-hover:text-black group-hover:border-transparent transition-all font-semibold">
                                Apply Now
                            </button>
                        </div>
                    ))}
                </div>

                {/* Return */}
                <div className="mt-16 text-center">
                    <Link to="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</Link>
                </div>
            </div>
        </div>
    );
}

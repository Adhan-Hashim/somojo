import { useNavigate } from "react-router-dom";

export default function EmployerHome() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="min-h-screen text-white pb-20">

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-6 flex flex-col lg:flex-row items-center justify-between max-w-7xl mx-auto">

                {/* Left Copy */}
                <div className="flex-1 text-center lg:text-left z-20 mb-16 lg:mb-0 lg:pr-12">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
                        Let's make your next <br className="hidden lg:block" />
                        <span className="text-[#CF9EFF]">great hire. Fast.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl mx-auto lg:mx-0">
                        Reach thousands of local, immediate-availability candidates. Fill your urgent shifts within hours, not days.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                        <button
                            onClick={() => navigate(user && user.role === 'employer' ? "/dashboard?post=true" : "/register?role=employer")}
                            className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-4 px-10 rounded-2xl transition shadow-lg shadow-[#CF9EFF]/30 text-lg"
                        >
                            Post a Job
                        </button>
                        <button
                            onClick={() => navigate(user ? "/dashboard" : "/login")}
                            className="bg-black/40 border border-white/20 text-white font-bold py-4 px-10 rounded-2xl hover:bg-white/10 transition text-lg backdrop-blur-md"
                        >
                            {user ? "Go to Dashboard" : "Sign In"}
                        </button>
                    </div>
                </div>

                {/* Right Visual / Glass Card */}
                <div className="flex-1 w-full max-w-md lg:max-w-lg relative z-10">
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#CF9EFF]/30 to-transparent rounded-full blur-3xl opacity-50"></div>

                    <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-8 shadow-[0_15px_50px_rgba(0,0,0,0.5)] transform rotate-3 hover:rotate-0 transition-transform duration-700">
                        <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6">
                            <div>
                                <div className="w-12 h-12 bg-[#CF9EFF] rounded-xl mb-4 flex items-center justify-center text-black text-2xl font-bold">
                                    S
                                </div>
                                <h3 className="text-xl font-bold text-white">Store Manager (<span className="text-[#CF9EFF]">Urgent</span>)</h3>
                                <p className="text-gray-400">Retail & Sales • Full-time</p>
                            </div>
                            <span className="bg-[#CF9EFF]/20 text-[#CF9EFF] px-3 py-1 rounded-full text-sm font-semibold border border-[#CF9EFF]/30">
                                Active
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4 border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                                        <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="Candidate" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Alex M.</p>
                                        <p className="text-xs text-gray-500">Applied 5 mins ago</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/find-cvs")}
                                    className="text-[#CF9EFF] hover:text-white transition text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                                >
                                    Review
                                </button>
                            </div>

                            <div className="flex justify-between items-center bg-black/40 rounded-2xl p-4 border border-white/5 filter brightness-75">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-600 overflow-hidden">
                                        <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Aneka" alt="Candidate" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">Sarah J.</p>
                                        <p className="text-xs text-gray-500">Applied 12 mins ago</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate("/find-cvs")}
                                    className="text-[#CF9EFF] hover:text-white transition text-sm font-bold bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"
                                >
                                    Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Stats/Trust Bar */}
            <div className="w-full border-y border-white/10 bg-white/5 backdrop-blur-md py-10 mt-10 relative z-10">
                <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <h4 className="text-4xl text-white font-bold mb-1">Smart</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">AI Precision Matching</p>
                    </div>
                    <div>
                        <h4 className="text-4xl text-white font-bold mb-1">Instant</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Direct Talent Alerts</p>
                    </div>
                    <div>
                        <h4 className="text-4xl text-white font-bold mb-1"><span className="text-[#CF9EFF]">Vetted</span></h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Quality Assured CVs</p>
                    </div>
                    <div>
                        <h4 className="text-4xl text-white font-bold mb-1">100%</h4>
                        <p className="text-sm text-gray-400 uppercase tracking-widest">Local Community Focus</p>
                    </div>
                </div>
            </div>

            {/* Value Propositions */}
            <div className="max-w-6xl mx-auto px-6 mt-32 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold mb-4">Why hire on Somojo?</h2>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">We've streamlined the hiring process so you can get back to running your business.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: "⚡",
                            title: "Save Time & Effort",
                            desc: "Post a job in minutes. Our platform automatically distributes it to thousands of relevant, local candidates who are actively looking for shifts today."
                        },
                        {
                            icon: "🎯",
                            title: "Smart Matching",
                            desc: "Don't sift through unqualified resumes. Our algorithm matches your job requirements with candidate availability, location, and skills automatically."
                        },
                        {
                            icon: "🤝",
                            title: "Built for Local",
                            desc: "Somojo is designed specifically for part-time, temporary, and urgent local hiring. Connect with people right in your neighborhood community."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-10 hover:border-[#CF9EFF]/50 transition-colors duration-500 group">
                            <div className="text-5xl mb-6 bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 group-hover:bg-[#CF9EFF]/10">
                                {feature.icon}
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-[#CF9EFF] transition-colors">{feature.title}</h3>
                            <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Final CTA */}
            {!user && (
                <div className="max-w-5xl mx-auto px-6 mt-32 mb-10 text-center relative z-10">
                    <div className="bg-gradient-to-r from-[#CF9EFF]/20 via-[#CF9EFF]/40 to-[#CF9EFF]/20 rounded-[40px] p-16 border border-white/10 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/40 z-0"></div>
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to build your team?</h2>
                            <p className="text-gray-300 mb-10 text-xl max-w-2xl mx-auto">
                                Join Somojo today and experience the fastest way to hire local talent.
                            </p>
                            <button
                                onClick={() => navigate(user && user.role === 'employer' ? "/dashboard?post=true" : "/register?role=employer")}
                                className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-4 px-12 rounded-2xl transition shadow-xl shadow-[#CF9EFF]/20 text-xl"
                            >
                                Post a Job Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

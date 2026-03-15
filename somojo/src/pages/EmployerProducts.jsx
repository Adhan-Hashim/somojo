import { FileUser } from "lucide-react";

export default function EmployerProducts() {
    return (
        <div className="min-h-screen text-white pb-20">
            {/* Hero */}
            <div className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto relative z-10">
                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                    Tools to help you <span className="text-[#CF9EFF]">hire better.</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10">
                    From Sponsored Jobs to Smart Interview scheduling, explore all the products Somojo offers to streamline your recruitment.
                </p>
            </div>

            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">

                {/* Product Cards */}
                {[
                    {
                        title: "Sponsored Jobs",
                        desc: "Get your job in front of more candidates by sponsoring it. Sponsored jobs get up to 3x more applications on average.",
                        icon: "🚀",
                        color: "from-[#CF9EFF]"
                    },
                    {
                        title: "Resume Subscriptions",
                        desc: "Gain unlimited access to our database of thousands of local resumes. Proactively reach out to the perfect fit.",
                        icon: <FileUser size={48} />,
                        color: "from-[#5CB144]"
                    },
                    {
                        title: "Smart Interivew",
                        desc: "Let our AI schedule and manage your phone screens. Save hours of back-and-forth emails every week.",
                        icon: "🤖",
                        color: "from-[#3b82f6]"
                    },
                    {
                        title: "Employer Branding",
                        desc: "Build a premium company profile that showcases your culture, perks, and employee testimonials to attract top talent.",
                        icon: "🌟",
                        color: "from-[#f59e0b]"
                    }
                ].map((prod, idx) => (
                    <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[30px] flex gap-6 hover:bg-white/10 transition-colors group cursor-pointer overflow-hidden relative">
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${prod.color} to-transparent opacity-10 rounded-bl-full group-hover:scale-110 transition-transform`}></div>

                        <div className="text-5xl">
                            {prod.icon}
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">{prod.title}</h3>
                            <p className="text-gray-400 leading-relaxed mb-6">{prod.desc}</p>
                            <button className="text-white font-semibold flex items-center gap-2 group-hover:text-[#CF9EFF] transition-colors">
                                Learn more <span className="group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>
                ))}

            </div>

        </div>
    );
}

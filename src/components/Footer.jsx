import { Link } from "react-router-dom";

export default function Footer() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <footer className="relative text-white pt-24 pb-12">
            {/* Massive Background Typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none select-none z-0 overflow-hidden">
                <h1 className="text-[12rem] md:text-[18rem] lg:text-[24rem] font-black tracking-tighter text-white/[0.02] leading-none whitespace-nowrap">
                    SOMOJO
                </h1>
            </div>

            {/* Glowing Accents */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#CF9EFF] opacity-[0.5] blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5CB144] opacity-[0.5] blur-[150px] rounded-full pointer-events-none mix-blend-screen"></div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">

                {/* CTA Section */}
                <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 md:p-16 mb-24 flex flex-col md:flex-row items-center justify-between gap-8 group hover:border-white/20 transition-colors duration-500">
                    <div className="max-w-xl text-center md:text-left">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Ready to transform your workforce?</h2>
                        <p className="text-gray-400 text-lg">Join thousands of local businesses and candidates connecting instantly on Somojo.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto flex-col sm:flex-row">
                        <Link
                            to={user && user.role === 'employer' ? "/dashboard?post=true" : "/register?role=employer"}
                            className="bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-gray-200 transition text-center text-lg whitespace-nowrap"
                        >
                            Post a Job
                        </Link>
                        <Link
                            to={user ? "/dashboard" : "/register"}
                            className="bg-[#5CB144] hover:bg-[#4a8f37] text-white font-bold py-4 px-8 rounded-full transition text-center text-lg shadow-[0_0_20px_rgba(92,177,68,0.3)] whitespace-nowrap"
                        >
                            Find Work
                        </Link>
                    </div>
                </div>

                {/* Main Links Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20 text-sm">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-2">
                        <Link to="/" className="text-3xl font-bold text-white mb-6 inline-block tracking-tighter">
                            <span className="text-[#5CB144]">So</span>mojo.
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-sm mb-8">
                            A premium platform designed to bridge the gap between reliable local talent and top-tier businesses. Fast, transparent, and beautifully simple.
                        </p>
                        <div className="flex gap-4">
                            {['LinkedIn', 'Twitter', 'Instagram'].map((social) => (
                                <a key={social} href="#" className="text-gray-500 hover:text-white transition-colors duration-300 font-medium">
                                    {social}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Platform</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/about" className="hover:text-[#5CB144] transition-colors duration-300 flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">→</span> About Us</Link></li>
                            <li><Link to="/careers" className="hover:text-[#5CB144] transition-colors duration-300 flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">→</span> Careers</Link></li>
                            <li><Link to="/pricing" className="hover:text-[#5CB144] transition-colors duration-300 flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">→</span> Pricing</Link></li>
                            <li><Link to="/press" className="hover:text-[#5CB144] transition-colors duration-300 flex items-center gap-2 group"><span className="w-0 overflow-hidden group-hover:w-3 transition-all duration-300">→</span> Press</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Employers</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/employer" className="hover:text-[#CF9EFF] transition-colors duration-300">Post a Job</Link></li>
                            <li><Link to="/find-cvs" className="hover:text-[#CF9EFF] transition-colors duration-300">Search Resumes</Link></li>
                            <li><Link to="/products" className="hover:text-[#CF9EFF] transition-colors duration-300">Hiring Products</Link></li>
                            <li><Link to="/resources" className="hover:text-[#CF9EFF] transition-colors duration-300">Resource Center</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-6 uppercase tracking-widest text-xs">Candidates</h4>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/register" className="hover:text-white transition-colors duration-300">Browse Jobs</Link></li>
                            <li><Link to="/profile" className="hover:text-white transition-colors duration-300">Your Profile</Link></li>
                            <li><Link to="/salary-tool" className="hover:text-white transition-colors duration-300">Salary Tool</Link></li>
                            <li><Link to="/career-advice" className="hover:text-white transition-colors duration-300">Career Advice</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs font-medium">
                    <p>© {new Date().getFullYear()} Somojo Inc. Built with precise craftsmanship.</p>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="hover:text-white transition-colors duration-300">Privacy Policy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors duration-300">Terms of Service</Link>
                        <Link to="/cookies" className="hover:text-white transition-colors duration-300">Cookies</Link>
                    </div>
                </div>

            </div>
        </footer>
    );
}

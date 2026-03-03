import { Link } from "react-router-dom";

export default function About() {
    const user = JSON.parse(localStorage.getItem("user"));

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">

            {/* Transparent Background */}

            {/* Content Card */}
            <div className="relative z-20 w-full max-w-3xl 
        bg-white/5 
        backdrop-blur-2xl 
        border border-white/10 
        rounded-3xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.6)] 
        p-12 text-center text-white mt-16 mb-8">

                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none"></div>

                <h1 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">
                    About <span className="text-[#CF9EFF]">Somojo</span>
                </h1>

                <div className="space-y-6 text-lg text-gray-300 relative z-10 text-left">
                    <p>
                        Welcome to Somojo, the premier marketplace for fast, reliable, and local part-time opportunities.
                    </p>
                    <p>
                        Our mission is simple: to connect motivated individuals with local businesses that need their help right now. We believe that finding work shouldn't be a tedious process filled with endless paperwork and waiting games.
                    </p>
                    <p>
                        Whether you are a student looking to earn some extra cash between classes, or an employer needing to fill an emergency shift, Somojo provides the smart matching tools to make it happen instantly.
                    </p>

                    <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-white/10 mt-8 text-center">
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">10k+</h3>
                            <p className="text-sm">Jobs Filled</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">500+</h3>
                            <p className="text-sm">Local Companies</p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold text-white mb-2">24/7</h3>
                            <p className="text-sm">Support</p>
                        </div>
                    </div>
                </div>

                {!user && (
                    <div className="mt-12 relative z-10">
                        <Link to="/register" className="inline-block bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-[#CF9EFF]/30">
                            Join Us Today
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}

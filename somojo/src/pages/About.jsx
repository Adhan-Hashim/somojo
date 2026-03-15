import { Link } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";
import { motion } from "framer-motion";

export default function About() {
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
    const { themeText, themeBg } = useThemeColor();

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden py-20 px-6">

            {/* Background Ambience */}
            <div className={`absolute top-0 right-0 w-[50vw] h-[50vh] ${themeBg} opacity-[0.03] blur-[150px] rounded-full pointer-events-none`}></div>
            <div className={`absolute bottom-0 left-0 w-[50vw] h-[50vh] ${themeBg} opacity-[0.03] blur-[150px] rounded-full pointer-events-none`}></div>

            {/* Main Content Container */}
            <div className="relative z-20 w-full max-w-4xl">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white">
                        About <span className={`${themeText} transition-colors duration-500`}>Somojo</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
                        We're building the future of local, flexible work. Connecting motivated individuals with businesses that need them, instantly.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-16 px-4">
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300">
                        <div className={`w-12 h-12 rounded-2xl ${themeBg} bg-opacity-20 flex items-center justify-center text-3xl mb-6 shadow-inner`}>
                            🎯
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">Our Mission</h3>
                        <p className="text-gray-400 leading-relaxed">
                            To eliminate the friction in finding and filling part-time roles. We believe that finding work shouldn't be a tedious process filled with endless paperwork and waiting games.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-colors duration-300">
                        <div className={`w-12 h-12 rounded-2xl ${themeBg} bg-opacity-20 flex items-center justify-center text-3xl mb-6 shadow-inner`}>
                            ⚡
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-4">The Vision</h3>
                        <p className="text-gray-400 leading-relaxed">
                            Whether you are a student looking to earn extra cash, or an employer needing to fill an emergency shift, Somojo provides the smart matching tools to make it happen right now.
                        </p>
                    </div>
                </div>

                {/* Team Section - Creative Slices */}
                <div className="mb-32 mt-24 relative w-full flex flex-col items-center max-w-7xl mx-auto px-4 md:px-8">

                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.2em] mb-4"
                        >
                            The Team
                        </motion.h2>
                        <motion.div
                            initial={{ opacity: 0, scaleX: 0 }}
                            whileInView={{ opacity: 1, scaleX: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="w-16 h-1 bg-white mx-auto origin-center"
                        />
                    </div>

                    {/* Image Slices Container */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="w-full h-[500px] md:h-[650px] flex flex-row items-stretch justify-center bg-[#050505] border border-white/10 shadow-2xl rounded-2xl overflow-hidden"
                    >
                        {[
                            { name: 'Adhan', img: '/team/ai_adhan.png', role: 'Creator' },
                            { name: 'Anaswara', img: '/team/ai_anaswara.png', role: 'Creator' },
                            { name: 'Swathi', img: '/team/ai_swathi.png', role: 'Creator' },
                            { name: 'Devapriya', img: '/team/ai_devapriya.png', role: 'Creator' }
                        ].map((member, i) => (
                            <div key={i} className="group relative flex-1 hover:flex-[2.5] md:hover:flex-[3] transition-all duration-700 ease-[cubic-bezier(0.25,0.8,0.25,1)] overflow-hidden border-r border-white/20 last:border-r-0 cursor-pointer">

                                {/* Background Image */}
                                <img
                                    src={member.img}
                                    alt={member.name}
                                    className="absolute inset-0 w-full h-full object-cover object-center grayscale contrast-[1.25] brightness-75 transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0 group-hover:brightness-105"
                                />

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                                {/* Vertical Text (Default State) */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                                    <h3 className="text-white text-xl md:text-3xl font-bold uppercase tracking-[0.4em] origin-center -rotate-90 whitespace-nowrap opacity-50 mix-blend-overlay">
                                        {member.name}
                                    </h3>
                                </div>

                                {/* Hover Content */}
                                <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex flex-col items-center text-center pointer-events-none">
                                    <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-[0.2em] mb-2 shadow-black drop-shadow-2xl">
                                        {member.name}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-300 font-medium tracking-[0.3em] uppercase opacity-80">
                                        {member.role}
                                    </p>
                                    <div className="w-8 h-[2px] bg-white mt-5 origin-center scale-x-0 group-hover:scale-x-100 transition-transform duration-700 delay-300" />
                                </div>

                            </div>
                        ))}
                    </motion.div>

                    {/* Bottom CTA Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="w-full flex flex-col md:flex-row items-center justify-between mt-20 px-4 md:px-8 border-t border-white/5 pt-12"
                    >
                        <div className="text-center md:text-left mb-10 md:mb-0">
                            <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4 tracking-tighter">
                                Find Small Jobs.<br />
                                Earn Your Own Money.
                            </h2>
                            <p className="text-lg text-gray-400 font-medium tracking-wide">
                                Flexible &bull; Simple &bull; For Students
                            </p>
                        </div>

                        <div className="flex items-center group cursor-pointer transition-transform duration-300">
                            <Link to="/jobs" className="relative flex items-center">
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-white absolute -left-36 transition-transform group-hover:-translate-x-4">EXPLORE JOBS</span>
                                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-white/20 flex items-center justify-center relative bg-transparent hover:bg-white/5 transition-colors">
                                    <div className="absolute w-12 h-[1px] bg-white translate-x-8 transition-transform group-hover:translate-x-12"></div>
                                    <div className="absolute right-[-1.5rem] w-3 h-3 border-t border-r border-white rotate-45 transition-transform group-hover:translate-x-4"></div>
                                </div>
                            </Link>
                        </div>
                    </motion.div>

                </div>

                {/* Action Section */}
                {!user ? (
                    <div className={`relative overflow-hidden rounded-3xl border border-white/10 p-12 text-center`}>
                        {/* Subtle inner glow */}
                        <div className={`absolute inset-0 ${themeBg} opacity-5`}></div>

                        <h2 className="text-3xl font-bold text-white mb-4 relative z-10">Ready to get started?</h2>
                        <p className="text-gray-400 mb-8 max-w-xl mx-auto relative z-10">
                            Join our growing community today. It's completely free to create an account and start exploring opportunities in your area.
                        </p>
                        <Link
                            to="/register"
                            className={`relative z-10 inline-block ${themeBg} text-black font-extrabold px-10 py-4 rounded-2xl transition hover:scale-[1.05] active:scale-[0.98] shadow-xl`}
                        >
                            Join Somojo Today
                        </Link>
                    </div>
                ) : (
                    <div className="text-center mt-12">
                        <Link
                            to="/home"
                            className={`inline-block border border-white/20 hover:border-white/40 bg-white/5 text-white font-bold px-8 py-3 rounded-2xl transition backdrop-blur-sm`}
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                )}

            </div>
        </div>
    );
}

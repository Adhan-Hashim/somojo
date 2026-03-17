import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPinHouse, FileUser, ChevronLeft, Mail, Phone, Calendar, Briefcase, GraduationCap, Award, Search } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function CandidateProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeBg, themeText, themeBorder } = useThemeColor();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/api/profile/user/${id}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch candidate profile:", err);
                setError(err.response?.data?.message || "Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-[#CF9EFF] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-400 animate-pulse">Scanning candidate profile...</p>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 px-6 text-center">
                <div className="flex justify-center mb-6">
                    <Search className="w-16 h-16 text-gray-600" />
                </div>
                <h1 className="text-3xl font-bold mb-4">{error || "Profile Not Found"}</h1>
                <button 
                    onClick={() => navigate(-1)}
                    className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition"
                >
                    Return to Previous Page
                </button>
            </div>
        );
    }

    const { user, headline, bio, location, experience, education, skills, certifications, preferences, resumeUrl } = profile;

    return (
        <div className="min-h-screen bg-transparent text-white pt-24 pb-32 relative overflow-hidden">
            {/* Ambient Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[60vw] h-[40vh] ${themeBg} opacity-[0.05] blur-[120px] rounded-full pointer-events-none`}></div>

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Back Link */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
                >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-medium">Back</span>
                </button>

                {/* Profile Header */}
                <div className="bg-[#0a0a0a]/80 backdrop-blur-3xl border border-white/10 rounded-[40px] p-8 md:p-12 mb-8 shadow-2xl relative overflow-hidden group hover:border-[#CF9EFF]/30 transition-all duration-500">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#CF9EFF]/20 to-[#A374FF]/20 border border-white/10 flex items-center justify-center overflow-hidden shadow-2xl shrink-0">
                             <img 
                                src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${user?.name || id}`} 
                                alt="Avatar" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl md:text-5xl font-extrabold mb-2 tracking-tight">{user?.name}</h1>
                            <p className={`text-lg font-semibold ${themeText} mb-4 uppercase tracking-widest`}>{headline || "Professional Candidate"}</p>
                            
                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-400 mb-6 font-medium">
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <MapPinHouse className="w-4 h-4 text-gray-500" />
                                    {location || "Location Not Specified"}
                                </div>
                                <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    {user?.email}
                                </div>
                            </div>

                            {resumeUrl && (
                                <a 
                                    href={`http://localhost:5000${resumeUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-3 ${themeBg} text-black font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95`}
                                >
                                    <FileUser className="w-5 h-5" />
                                    View Resume
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Info */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Summary */}
                        <Section title="Professional Summary" icon="✨">
                            <p className="text-gray-300 leading-relaxed font-medium">
                                {bio || "No bio provided."}
                            </p>
                        </Section>

                        {/* Experience */}
                        <Section title="Experience" icon={<Briefcase className="w-5 h-5" />}>
                            {experience && experience.length > 0 ? (
                                <div className="space-y-6">
                                    {experience.map((exp, i) => (
                                        <div key={i} className="border-l-2 border-[#CF9EFF]/30 pl-6 relative">
                                            <div className="absolute w-3 h-3 bg-[#CF9EFF] rounded-full -left-[7px] top-1.5 shadow-[0_0_10px_#CF9EFF]"></div>
                                            <h3 className="text-xl font-bold text-white mb-1">{exp.title}</h3>
                                            <p className={`${themeText} font-bold text-sm mb-2`}>{exp.company}</p>
                                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-2 font-bold uppercase tracking-wider">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {exp.duration}
                                            </p>
                                            <p className="text-sm text-gray-400 leading-relaxed">{exp.description}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No experience added.</p>
                            )}
                        </Section>

                        {/* Education */}
                        <Section title="Education" icon={<GraduationCap className="w-5 h-5" />}>
                            {education && education.length > 0 ? (
                                <div className="space-y-6">
                                    {education.map((edu, i) => (
                                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                                            <h3 className="text-lg font-bold text-white mb-1">{edu.degree}</h3>
                                            <p className="text-gray-400 font-semibold mb-2">{edu.school}</p>
                                            <p className={`text-xs ${themeText} font-bold`}>{edu.year}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No education history added.</p>
                            )}
                        </Section>
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-8">
                        {/* Skills */}
                        <Section title="Skills" icon={<Award className="w-5 h-5" />}>
                            <div className="flex flex-wrap gap-2">
                                {skills && skills.length > 0 ? (
                                    skills.map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-gray-300 uppercase tracking-wider">
                                            {skill}
                                        </span>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No skills listed.</p>
                                )}
                            </div>
                        </Section>

                        {/* Job Preferences */}
                        {preferences && (
                            <Section title="Preferences" icon="🎯">
                                <div className="space-y-4">
                                    <PrefItem label="Titles" val={preferences.titles?.join(", ")} />
                                    <PrefItem label="Types" val={preferences.types?.join(", ")} />
                                    <PrefItem label="Pay Expectation" val={preferences.basePay} />
                                    <PrefItem label="Relocation" val={preferences.relocation} />
                                </div>
                            </Section>
                        )}

                        {/* Quick Contact Form Placeholder */}
                        <div className="bg-gradient-to-br from-[#CF9EFF]/10 to-[#A374FF]/10 border border-[#CF9EFF]/20 rounded-3xl p-6 shadow-xl">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                                💬 Interested?
                            </h3>
                            <button className={`w-full ${themeBg} text-black font-bold py-3 rounded-2xl transition hover:brightness-110 active:scale-95`}>
                                Send Message
                            </button>
                            <p className="text-[10px] text-gray-500 mt-4 text-center">
                                Direct messaging is available for verified employers.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <div className="bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-sm border border-white/5">
                    {icon}
                </span>
                {title}
            </h2>
            {children}
        </div>
    );
}

function PrefItem({ label, val }) {
    return (
        <div className="border-b border-white/5 pb-3 last:border-0">
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">{label}</p>
            <p className="text-sm text-gray-300 font-medium">{val || "Any"}</p>
        </div>
    );
}

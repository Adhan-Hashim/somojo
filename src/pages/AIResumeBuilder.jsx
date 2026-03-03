import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";

export default function AIResumeBuilder() {
    const { themeBg, themeText, themeBorder } = useThemeColor();
    const navigate = useNavigate();

    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || {});

    // UI States: 'intro' -> 'generating' -> 'preview'
    const [step, setStep] = useState("intro");
    const [progress, setProgress] = useState(0);

    const startProcessing = () => {
        setStep("generating");
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 15;
            if (currentProgress >= 100) {
                clearInterval(interval);
                setProgress(100);
                setTimeout(() => setStep("preview"), 800);
            } else {
                setProgress(currentProgress);
            }
        }, 300);
    };

    const handleSaveToProfile = () => {
        const updatedUser = {
            ...user,
            resume: {
                name: "Somojo_AI_Resume.pdf",
                size: "Generated",
                uploadedDate: new Date().toLocaleDateString()
            }
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        navigate("/profile");
    };

    return (
        <div className="min-h-screen pt-24 pb-32 text-white px-6">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => navigate("/profile")} className="text-gray-400 hover:text-white mb-8 flex items-center gap-2 transition font-bold">
                    ← Back to Profile
                </button>

                {step === "intro" && (
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-10 sm:p-16 rounded-[40px] text-center shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                        <div className={`w-24 h-24 mx-auto bg-gradient-to-br from-white/10 to-transparent rounded-full flex items-center justify-center border border-white/10 mb-8 shadow-[0_0_30px_rgba(255,255,255,0.05)]`}>
                            <span className={`text-5xl ${themeText} animate-pulse`}>✨</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight">
                            Build with <span className={themeText}>Somojo AI</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                            We'll aggregate your profile data, work experience, and skills into a strictly formatted, highly-converting professional resume designed to pass ATS filters immediately.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-left">
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <span className="text-2xl mb-3 block">⚡</span>
                                <h3 className="font-bold text-lg mb-2 text-white">Instant Generation</h3>
                                <p className="text-sm text-gray-400">Zero manual formatting. We handle the layout and typography.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <span className="text-2xl mb-3 block">🎯</span>
                                <h3 className="font-bold text-lg mb-2 text-white">ATS Optimized</h3>
                                <p className="text-sm text-gray-400">Keywords extracted directly from your selected interests.</p>
                            </div>
                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl">
                                <span className="text-2xl mb-3 block">🎨</span>
                                <h3 className="font-bold text-lg mb-2 text-white">Auto Sync</h3>
                                <p className="text-sm text-gray-400">Saves directly to your profile for immediate job applications.</p>
                            </div>
                        </div>

                        <button
                            onClick={startProcessing}
                            className={`px-10 py-5 rounded-2xl text-black font-extrabold text-xl transition shadow-xl ${themeBg} hover:opacity-90 transform hover:scale-105 active:scale-95`}
                        >
                            Generate My Resume Now
                        </button>
                    </div>
                )}

                {step === "generating" && (
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-16 rounded-[40px] text-center shadow-2xl flex flex-col items-center justify-center min-h-[500px]">
                        <div className="relative w-40 h-40 mb-10">
                            <div className={`absolute inset-0 border-4 border-dashed ${themeBorder} rounded-full animate-[spin_4s_linear_infinite]`}></div>
                            <div className={`absolute inset-2 border-4 border-t-transparent border-l-transparent border-r-transparent ${themeBorder} rounded-full animate-[spin_2s_linear_infinite_reverse]`}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold">{Math.min(Math.round(progress), 100)}%</span>
                            </div>
                        </div>
                        <h2 className={`text-2xl font-bold mb-4 ${themeText} animate-pulse`}>
                            {progress < 30 ? "Analyzing Profile Data..." : progress < 60 ? "Drafting Work Experience..." : progress < 90 ? "Optimizing Layout..." : "Finalizing Document..."}
                        </h2>
                        <div className="w-full max-w-md bg-white/10 rounded-full h-2 overflow-hidden">
                            <div className={`h-full ${themeBg} transition-all duration-300 ease-out`} style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                {step === "preview" && (
                    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-xl">
                            <div>
                                <h2 className="text-2xl font-extrabold tracking-tight mb-2">Generation Complete ✨</h2>
                                <p className="text-gray-400">Your AI-optimized resume is ready. Review the preview below.</p>
                            </div>
                            <button
                                onClick={handleSaveToProfile}
                                className={`px-8 py-4 rounded-2xl text-black font-extrabold transition shadow-xl ${themeBg} hover:opacity-90 flex items-center gap-3`}
                            >
                                <span>Save to Profile</span>
                                <span className="text-xl">→</span>
                            </button>
                        </div>

                        {/* Resume Preview Box (A4 Paper Aspect Ratio) */}
                        <div className="bg-white text-black p-10 sm:p-16 rounded-xl shadow-2xl mx-auto max-w-3xl aspect-[1/1.4] overflow-hidden relative">
                            {/* Watermark */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                <span className="text-9xl font-bold transform -rotate-45 tracking-tighter">SOMOJO AI</span>
                            </div>

                            <div className="border-b-2 border-gray-300 pb-6 mb-6 text-center">
                                <h1 className="text-4xl font-extrabold mb-2 uppercase tracking-tight">{user.name || "YOUR NAME"}</h1>
                                <p className="text-gray-600 font-medium tracking-widest text-sm uppercase">
                                    {user.email} {user.contact ? ` • ${user.contact}` : ""} {user.location ? ` • ${user.location}` : ""}
                                </p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800 tracking-wider">Professional Summary</h2>
                                <p className="text-gray-700 leading-relaxed text-sm">
                                    Highly motivated professional with expertise in {user.interests?.length > 0 ? user.interests.slice(0, 3).join(", ") : "various domains"}.
                                    Proven track record of delivering high-quality results and adapting to dynamic environments.
                                    Seeking opportunities to leverage skills in {user.jobPreferences?.titles?.length > 0 ? user.jobPreferences.titles[0] : "a challenging role"}.
                                </p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800 tracking-wider">Experience</h2>
                                {user.experience && user.experience.length > 0 ? (
                                    <div className="space-y-4">
                                        {user.experience.map(exp => (
                                            <div key={exp.id}>
                                                <div className="flex justify-between font-bold text-gray-900 mb-1">
                                                    <span>{exp.title}</span>
                                                    <span>{exp.duration}</span>
                                                </div>
                                                <div className="italic text-gray-600 text-sm mb-2">{exp.company}</div>
                                                <p className="text-gray-700 text-sm pl-4 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400">
                                                    {exp.description || "Contributed to overall project success and team objectives."}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No professional experience listed.</p>
                                )}
                            </div>

                            <div className="mb-8 hidden sm:block">
                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800 tracking-wider">Education</h2>
                                {user.education && user.education.length > 0 ? (
                                    <div className="space-y-3">
                                        {user.education.map(edu => (
                                            <div key={edu.id} className="flex justify-between">
                                                <div>
                                                    <span className="font-bold text-gray-900 block">{edu.degree}</span>
                                                    <span className="text-gray-600 text-sm">{edu.school}</span>
                                                </div>
                                                <span className="font-bold text-gray-700">{edu.year}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm">No education history listed.</p>
                                )}
                            </div>

                            <div className="mb-8">
                                <h2 className="text-lg font-bold uppercase border-b border-gray-300 pb-1 mb-3 text-gray-800 tracking-wider">Skills</h2>
                                <div className="flex flex-wrap gap-2">
                                    {user.interests && user.interests.length > 0 ? (
                                        user.interests.map((skill, idx) => (
                                            <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm font-medium border border-gray-200">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic text-sm">No skills added.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

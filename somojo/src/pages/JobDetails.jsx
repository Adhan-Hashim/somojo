import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { MapPinHouse } from "lucide-react";
import { useThemeColor } from "../hooks/useThemeColor";

import api from "../api";

export default function JobDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/api/jobs/${id}`);
                setJob(res.data);
            } catch (err) {
                console.error("Error fetching job details", err);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        // Redirect to the JobApplication page instead
        navigate(`/apply/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-center text-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-[#CF9EFF] border-t-transparent rounded-full animate-spin mb-6"></div>
                    <p className="text-xl text-gray-400 font-medium">Loading job details...</p>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-6 flex flex-col items-center text-center text-white">
                <h1 className="text-4xl font-bold mb-4">Job Not Found</h1>
                <p className="text-gray-400 mb-8">This opportunity may have been removed or filled.</p>
                <button onClick={() => navigate('/jobs')} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl transition">
                    ← Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">
            {/* Background Ambience */}
            <div className={`absolute top-0 right-0 w-[400px] h-[400px] ${themeBg} opacity-[0.05] blur-[100px] rounded-full mix-blend-screen pointer-events-none`}></div>

            <div className="max-w-4xl mx-auto px-6 relative z-10">

                {/* Back Link */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span> Back to Search
                </button>

                {/* Main Card */}
                <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 md:p-12 shadow-2xl relative overflow-hidden">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row gap-8 items-start mb-10 border-b border-white/10 pb-10">
                        {/* Company Logo */}
                        <div className="w-24 h-24 shrink-0 bg-[#111] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg">
                            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                        </div>

                        {/* Title and Base Info */}
                        <div className="flex-1">
                            <h1 className="text-4xl font-bold text-white mb-2">{job.title}</h1>
                            <Link to="#" className={`${themeText} text-xl font-medium hover:underline`}>{job.company}</Link>

                            <div className="flex flex-wrap gap-3 mt-6">
                                <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                    <MapPinHouse className="w-5 h-5 text-gray-500" /> {job.location}
                                </span>
                                <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                    <span className="text-gray-500">💼</span> {job.type}
                                </span>
                                <span className="bg-[#5CB144]/10 border border-[#5CB144]/20 px-4 py-2 rounded-xl text-[#5CB144] font-bold flex items-center gap-2">
                                    <span className="text-gray-500 opacity-50">💸</span> {job.pay}
                                </span>
                            </div>
                        </div>

                        {/* Apply Action (Header) */}
                        <div className="w-full md:w-auto flex flex-col items-center md:items-end gap-3 shrink-0">
                            <button
                                onClick={handleApply}
                                className={`w-full md:w-auto ${themeBg} text-black font-extrabold px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center`}
                            >
                                Apply Now
                            </button>
                            <span className="text-sm text-gray-500 font-medium flex items-center gap-2">
                                ⏱ Posted {job.posted}
                            </span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="grid md:grid-cols-3 gap-12">
                        {/* Left Column (Description) */}
                        <div className="md:col-span-2 space-y-10">

                            <section>
                                <h3 className="text-2xl font-bold mb-4 text-white">About the Role</h3>
                                <div className="text-gray-400 text-lg leading-relaxed space-y-4">
                                    <p>{job.description}</p>
                                    <p>As a key member of our team at {job.company}, you will be expected to uphold our high standards and ensure a positive environment. We offer opportunities for growth and a supportive localized team structure.</p>
                                </div>
                            </section>

                            <section>
                                <h3 className="text-2xl font-bold mb-4 text-white">Requirements</h3>
                                {job.requirements && job.requirements.length > 0 ? (
                                    <ul className="space-y-3">
                                        {job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-4">
                                                <span className="text-[#CF9EFF] mt-1 text-xl">✓</span>
                                                <span className="text-gray-300 text-lg">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-400 italic">No specific requirements listed.</p>
                                )}
                            </section>

                            {job.benefits && job.benefits.length > 0 && (
                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Benefits</h3>
                                    <div className="flex flex-wrap gap-4">
                                        {job.benefits.map((b, idx) => {
                                            // Optional: Pick a random icon or use a generic one if we don't have mapping
                                            let icon = "✨";
                                            const lowerB = b.toLowerCase();
                                            if (lowerB.includes("health") || lowerB.includes("medical") || lowerB.includes("dental") || lowerB.includes("vision")) icon = "🏥";
                                            if (lowerB.includes("time off") || lowerB.includes("pto") || lowerB.includes("vacation") || lowerB.includes("holiday")) icon = "🏖️";
                                            if (lowerB.includes("growth") || lowerB.includes("training") || lowerB.includes("development") || lowerB.includes("education")) icon = "🚀";
                                            if (lowerB.includes("flex") || lowerB.includes("schedule") || lowerB.includes("remote")) icon = "⏰";
                                            if (lowerB.includes("401(k)") || lowerB.includes("retirement") || lowerB.includes("pension") || lowerB.includes("equity")) icon = "📈";

                                            return (
                                                <div key={idx} className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/30 text-[#CF9EFF] px-5 py-3 rounded-xl flex items-center gap-3 w-fit">
                                                    <span className="text-xl">{icon}</span> {b}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                        </div>

                        {/* Right Column (Meta Specs) */}
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                                <h4 className="font-bold text-gray-300 mb-4 uppercase tracking-wider text-sm">Job Overview</h4>
                                <ul className="space-y-4 text-gray-400">
                                    <li>
                                        <span className="block text-gray-500 text-sm mb-1">Industry</span>
                                        <span className="font-medium text-white">{job.category || "General"}</span>
                                    </li>
                                    <li>
                                        <span className="block text-gray-500 text-sm mb-1">Job Type</span>
                                        <span className="font-medium text-white">{job.type}</span>
                                    </li>
                                    <li>
                                        <span className="block text-gray-500 text-sm mb-1">Applicants</span>
                                        <span className="font-medium text-white">{job.applicants || 0} people applied</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

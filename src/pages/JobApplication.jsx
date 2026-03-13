import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function JobApplication() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { themeBg, themeText } = useThemeColor();
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitted, setSubmitted] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/jobs/${id}`);
                setJob(res.data);
                // Check if already applied
                const appRes = await api.get(`/applications/status/${id}`);
                if (appRes.data) {
                    setApplicationStatus(appRes.data);
                    setSubmitted(appRes.data.status !== 'none');
                }
                // Check if job is saved
                const saveRes = await api.get(`/saved-jobs/check/${id}`);
                setIsSaved(saveRes.data.isSaved);
            } catch (err) {
                console.error("Error fetching job details", err);
                setJob(null);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setSubmitting(true);
        try {
            const res = await api.post(`/applications/${id}`);
            // Server returns { message, application } — extract the application object
            const savedApp = res.data.application || res.data;
            setSubmitted(true);
            setApplicationStatus({
                status: savedApp.status || 'applied',
                appliedAt: savedApp.createdAt || new Date()
            });
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Failed to apply. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveJob = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            if (isSaved) {
                await api.delete(`/saved-jobs/${id}`);
            } else {
                await api.post(`/saved-jobs/${id}`);
            }
            setIsSaved(!isSaved);
        } catch (err) {
            console.error(err);
            alert('Failed to update saved status');
        }
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

            <div className="max-w-5xl mx-auto px-6 relative z-10">
                {/* Back Link */}
                <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors group font-medium"
                >
                    <span className="transform group-hover:-translate-x-1 transition-transform mr-2">←</span> Back to Jobs
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Job Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                            {/* Header Section */}
                            <div className="flex gap-6 items-start mb-10">
                                {/* Company Logo */}
                                <div className="w-24 h-24 shrink-0 bg-[#111] border border-white/10 rounded-3xl flex items-center justify-center overflow-hidden shadow-lg">
                                    <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                                </div>

                                {/* Title and Base Info */}
                                <div className="flex-1">
                                    <h1 className="text-4xl font-bold text-white mb-2">{job.title}</h1>
                                    <p className={`${themeText} text-xl font-medium mb-6`}>{job.company}</p>

                                    <div className="flex flex-wrap gap-3">
                                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                            <span className="text-gray-500">📍</span> {job.location}
                                        </span>
                                        <span className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-gray-300 flex items-center gap-2">
                                            <span className="text-gray-500">💼</span> {job.type}
                                        </span>
                                        <span className="bg-[#5CB144]/10 border border-[#5CB144]/20 px-4 py-2 rounded-xl text-[#5CB144] font-bold flex items-center gap-2">
                                            <span className="text-gray-500 opacity-50">💸</span> {job.pay}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="border-b border-white/10 mb-10 pb-10">
                                {/* Status Banner */}
                                {submitted && (
                                    <div className="mb-6 bg-[#5CB144]/10 border border-[#5CB144]/30 rounded-2xl p-4 flex items-center gap-3">
                                        <span className="text-2xl">✓</span>
                                        <div>
                                            <p className="font-bold text-[#5CB144]">Application Submitted</p>
                                            <p className="text-sm text-gray-400">Your application has been submitted. We'll notify you of updates.</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Content Section */}
                            <div className="space-y-10">
                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">About the Role</h3>
                                    <div className="text-gray-400 text-lg leading-relaxed space-y-4">
                                        <p>{job.description}</p>
                                        <p>As a key member of our team at {job.company}, you will be expected to uphold our high standards and ensure a positive environment. We offer opportunities for growth and a supportive localized team structure.</p>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Requirements</h3>
                                    <ul className="space-y-3">
                                        {job.requirements && job.requirements.map((req, idx) => (
                                            <li key={idx} className="flex items-start gap-4">
                                                <span className="text-[#CF9EFF] mt-1 text-xl">✓</span>
                                                <span className="text-gray-300 text-lg">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Benefits</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Health Insurance</p>
                                            <p className="font-bold text-white">✓ Included</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Paid Time Off</p>
                                            <p className="font-bold text-white">15+ Days</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Professional Growth</p>
                                            <p className="font-bold text-white">Training & Development</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                            <p className="text-gray-400 text-sm mb-1">Flexible Schedule</p>
                                            <p className="font-bold text-white">Available</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Application Actions */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 rounded-[30px] p-8 shadow-2xl sticky top-32 space-y-6">
                            <div>
                                <h3 className="text-xl font-bold mb-4 text-white">Application Actions</h3>
                                <div className="text-sm text-gray-400 mb-6">
                                    <p>📝 Posted {job.posted}</p>
                                    <p>👥 {job.applicants} people applied</p>
                                </div>
                            </div>

                            {/* Apply Now Button */}
                            <button
                                onClick={handleApply}
                                disabled={submitted || submitting}
                                className={`w-full font-extrabold py-4 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 ${submitted
                                    ? "bg-[#5CB144]/20 text-[#5CB144] border border-[#5CB144]/30 cursor-default"
                                    : `${themeBg} text-black hover:scale-105 active:scale-95 shadow-lg`
                                    } ${submitting ? "opacity-75 cursor-wait" : ""}`}
                            >
                                {submitting && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>}
                                {submitted ? "✓ Applied" : "🚀 Apply Now"}
                            </button>

                            {/* Save/Bookmark Button */}
                            <button
                                onClick={handleSaveJob}
                                className={`w-full font-bold py-3 px-6 rounded-2xl border transition-all flex items-center justify-center gap-2 ${isSaved
                                    ? "bg-[#5CB144]/20 border-[#5CB144]/30 text-[#5CB144]"
                                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                                    }`}
                            >
                                {isSaved ? "💾 Saved" : "🔖 Save Job"}
                            </button>

                            {/* Application Status */}
                            {applicationStatus && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                    <p className="text-xs text-gray-500 uppercase font-bold mb-2">Your Status</p>
                                    <p className="text-lg font-bold capitalize text-white">{applicationStatus.status}</p>
                                    {applicationStatus.appliedAt && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            Applied on {new Date(applicationStatus.appliedAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Share Job */}
                            <button
                                onClick={() => {
                                    const url = window.location.href;
                                    if (navigator.share) {
                                        navigator.share({ title: job.title, text: `Check out this job: ${job.title} at ${job.company}`, url });
                                    } else {
                                        navigator.clipboard.writeText(url);
                                        alert('Job link copied to clipboard!');
                                    }
                                }}
                                className="w-full font-semibold py-3 px-6 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition flex items-center justify-center gap-2"
                            >
                                <span>📤</span> Share Job
                            </button>

                            {/* Report Job */}
                            <button
                                onClick={() => {
                                    if (window.confirm('Report this job as inappropriate or fraudulent?')) {
                                        alert('Thank you for the report. Our team will review this listing.');
                                    }
                                }}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-300 transition font-medium py-2"
                            >
                                Report Job
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

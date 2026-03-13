import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import LocationInput from "../components/LocationInput";

export default function EmployerDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem("user"));

    // View State
    const [activeTab, setActiveTab] = useState("listings"); // 'listings', 'branding'
    const [showPostForm, setShowPostForm] = useState(false);

    // Jobs State
    const [jobs, setJobs] = useState([]);

    // Branding State
    const [brandCompanyName, setBrandCompanyName] = useState("");
    const [brandDescription, setBrandDescription] = useState("");
    const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
    const [brandProfile, setBrandProfile] = useState(null);

    // Form State
    const [jobTitle, setJobTitle] = useState("");
    const [jobCompany, setJobCompany] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobCoordinates, setJobCoordinates] = useState(null);
    const [jobSalary, setJobSalary] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [jobRequirements, setJobRequirements] = useState("");
    const [jobBenefits, setJobBenefits] = useState([]);
    const [benefitInput, setBenefitInput] = useState("");

    const SUGGESTED_BENEFITS = [
        "Health Insurance", "Paid Time Off", "Professional Growth",
        "Flexible Schedule", "Dental Insurance", "Vision Insurance", "401(k) Matching"
    ];

    const handleAddBenefit = () => {
        if (benefitInput.trim() && !jobBenefits.includes(benefitInput.trim())) {
            setJobBenefits([...jobBenefits, benefitInput.trim()]);
            setBenefitInput("");
        }
    };

    const handleRemoveBenefit = (b) => {
        setJobBenefits(jobBenefits.filter(item => item !== b));
    };

    const toggleSuggestedBenefit = (b) => {
        if (jobBenefits.includes(b)) {
            handleRemoveBenefit(b);
        } else {
            setJobBenefits([...jobBenefits, b]);
        }
    };
    const [isEnhancing, setIsEnhancing] = useState(false);

    const fetchJobs = async () => {
        try {
            const res = await api.get('/jobs');
            // Check both _id and id because the token payload might map it to 'id', while raw mongo is '_id'
            const myJobs = res.data.filter(j => {
                const posterId = j.postedBy?._id || j.postedBy;
                return posterId === user._id || posterId === user.id || j.employerEmail === user.email;
            });
            setJobs(myJobs);
        } catch (err) {
            console.error("Failed to fetch jobs", err);
        }
    };

    const fetchProfile = async () => {
        try {
            const res = await api.get('/profile/me');
            if (res.data && res.data.employerBranding && res.data.employerBranding.manifesto) {
                setBrandProfile(res.data.employerBranding);
            }
        } catch (err) {
            console.error("Failed to fetch profile", err);
        }
    };

    // Load jobs on mount and check query params
    useEffect(() => {
        fetchJobs();
        fetchProfile();

        if (searchParams.get("post") === "true") {
            setShowPostForm(true);
        }
    }, [searchParams]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handlePostJob = async (e) => {
        e.preventDefault();

        const splitRequirements = jobRequirements ? jobRequirements.split('\n').filter(r => r.trim() !== '') : [];

        const newJob = {
            title: jobTitle,
            company: jobCompany,
            location: jobLocation,
            locationPoint: jobCoordinates ? {
                type: "Point",
                coordinates: jobCoordinates
            } : null,
            type: "Full-time", // Defaulting for simple form
            category: "General",
            pay: jobSalary.toString(),
            description: jobDescription,
            requirements: splitRequirements,
            benefits: jobBenefits
        };

        try {
            await api.post('/jobs', newJob);
            await fetchJobs(); // Refresh 

            // Reset and close form
            setJobTitle("");
            setJobCompany("");
            setJobLocation("");
            setJobCoordinates(null);
            setJobSalary("");
            setJobDescription("");
            setJobRequirements("");
            setJobBenefits([]);
            setShowPostForm(false);
            alert("Job posted successfully!");
        } catch (err) {
            console.error("Failed to post job", err);
            alert("Failed to post job");
        }
    };

    const handleEnhanceJob = async () => {
        if (!jobTitle || !jobDescription) {
            alert("Please provide at least a Job Title and a basic Description to enhance it.");
            return;
        }

        setIsEnhancing(true);
        try {
            const res = await api.post('/jobs/enhance', {
                title: jobTitle,
                company: jobCompany,
                description: jobDescription
            });
            setJobDescription(res.data.enhancedDescription);
        } catch (err) {
            console.error("Failed to enhance job", err);
            alert("Failed to enhance job description.");
        } finally {
            setIsEnhancing(false);
        }
    };

    const handleGenerateBrand = async (e) => {
        e.preventDefault();
        setIsGeneratingBrand(true);
        try {
            const res = await api.post('/profile/employer-branding', {
                companyName: brandCompanyName,
                companyDescription: brandDescription
            });
            setBrandProfile(res.data.employerBranding);
            setBrandCompanyName("");
            setBrandDescription("");
        } catch (err) {
            console.error("Brand Generation Failed:", err);
            alert("Failed to generate brand profile.");
        } finally {
            setIsGeneratingBrand(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-white">



            {/* Main Content */}
            <div className="grid md:grid-cols-4 gap-6 p-6">

                {/* Sidebar */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl h-fit">
                    <div className="flex flex-col gap-6">
                        <button
                            onClick={() => setShowPostForm(!showPostForm)}
                            className="w-full bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-3 rounded-xl transition shadow-lg shadow-[#CF9EFF]/30"
                        >
                            {showPostForm ? "Cancel Posting" : "+ Post New Job"}
                        </button>

                        <div>
                            <h2 className="font-semibold mb-4 text-lg border-b border-white/10 pb-2">
                                Manage
                            </h2>
                            <ul className="space-y-4 text-gray-300">
                                <li
                                    onClick={() => setActiveTab("listings")}
                                    className={`cursor-pointer transition font-semibold ${activeTab === 'listings' ? 'text-[#CF9EFF]' : 'hover:text-[#CF9EFF]'}`}
                                >
                                    Active Listings
                                </li>
                                <li className="hover:text-[#CF9EFF] cursor-pointer transition text-gray-500 line-through" title="Coming soon">
                                    Review Applicants
                                </li>
                                <li
                                    onClick={() => setActiveTab("branding")}
                                    className={`cursor-pointer transition font-semibold flex items-center gap-2 ${activeTab === 'branding' ? 'text-[#f59e0b]' : 'hover:text-[#f59e0b]'}`}
                                >
                                    ✨ AI Brand Builder
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Main Panel */}
                <div className="md:col-span-3 space-y-6">

                    {/* Post Job Form (Conditional) */}
                    {showPostForm && (
                        <div className="bg-white/5 backdrop-blur-2xl border border-[#CF9EFF]/30 rounded-2xl p-6 mb-8 animate-fade-in">
                            <h2 className="text-2xl font-bold mb-6 text-[#CF9EFF]">Create a New Job Listing</h2>
                            <form onSubmit={handlePostJob} className="space-y-4 text-sm">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-gray-400 mb-1">Job Title</label>
                                        <input type="text" required value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]" placeholder="e.g. Barista" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Company Name</label>
                                        <input type="text" required value={jobCompany} onChange={e => setJobCompany(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]" placeholder="e.g. Urban Brew" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Location</label>
                                        <LocationInput
                                            value={jobLocation}
                                            onChange={setJobLocation}
                                            onLocationSelect={(place) => setJobCoordinates([place.lng, place.lat])}
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]"
                                            placeholder="e.g. Downtown, NY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Salary / Month (₹)</label>
                                        <input type="number" required value={jobSalary} onChange={e => setJobSalary(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]" placeholder="15000" />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="block text-gray-400">Job Description</label>
                                        <button
                                            type="button"
                                            onClick={handleEnhanceJob}
                                            disabled={isEnhancing}
                                            className="text-xs bg-[#f59e0b]/20 hover:bg-[#f59e0b]/40 text-[#f59e0b] border border-[#f59e0b]/50 px-3 py-1 rounded-full font-bold transition disabled:opacity-50 flex items-center gap-1"
                                        >
                                            {isEnhancing ? "Enhancing..." : "✨ Enhance with AI"}
                                        </button>
                                    </div>
                                    <textarea
                                        required
                                        rows="6"
                                        value={jobDescription}
                                        onChange={e => setJobDescription(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]"
                                        placeholder="Enter basic responsibilities and requirements, and let AI do the rest..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-1">Requirements (one per line)</label>
                                    <textarea
                                        rows="4"
                                        value={jobRequirements}
                                        onChange={e => setJobRequirements(e.target.value)}
                                        className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]"
                                        placeholder="e.g. 2+ years of experience in retail..."
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-gray-400 mb-2">Benefits Offered</label>
                                    <div className="flex gap-2 mb-3">
                                        <input
                                            type="text"
                                            value={benefitInput}
                                            onChange={e => setBenefitInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                                            className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]"
                                            placeholder="Type a benefit and press Enter (e.g. Free lunch)"
                                        />
                                        <button type="button" onClick={handleAddBenefit} className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 rounded-xl transition">Add</button>
                                    </div>

                                    {/* Added Benefits */}
                                    {jobBenefits.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {jobBenefits.map((b, idx) => (
                                                <div key={idx} className="bg-[#CF9EFF]/20 border border-[#CF9EFF]/40 text-[#CF9EFF] px-3 py-1 rounded-full text-sm flex items-center gap-2 shadow-sm">
                                                    {b}
                                                    <button type="button" onClick={() => handleRemoveBenefit(b)} className="hover:text-white transition">&times;</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 mb-2">Suggestions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {SUGGESTED_BENEFITS.map((suggest, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => toggleSuggestedBenefit(suggest)}
                                                    className={`text-xs px-3 py-1.5 rounded-full border transition font-medium ${jobBenefits.includes(suggest) ? 'bg-[#CF9EFF]/20 border-[#CF9EFF]/40 text-[#CF9EFF]' : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'}`}
                                                >
                                                    {jobBenefits.includes(suggest) ? '✓ ' : '+ '} {suggest}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button type="submit" className="mt-4 w-full bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-3 rounded-xl transition shadow-lg">
                                    Publish Job
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === "listings" ? (
                        <>
                            <h2 className="text-2xl font-bold mb-4">Your Active Job Postings</h2>
                            {jobs.length === 0 ? (
                                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                                    <div className="text-5xl mb-4">📄</div>
                                    <h3 className="text-xl text-white font-semibold mb-2">No active jobs</h3>
                                    <p>You haven't posted any jobs yet. Create a new listing to start receiving applications.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {jobs.map(job => (
                                        <div key={job._id || job.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-between hover:border-[#CF9EFF]/30 transition-colors">
                                            <div>
                                                <h3 className="text-xl font-bold text-[#CF9EFF] mb-1">{job.title}</h3>
                                                <p className="text-gray-300 font-medium">{job.company}</p>
                                                <p className="text-sm text-gray-400 mt-2">📍 {job.location}</p>
                                                <p className="text-sm text-gray-400 mt-1">💰 {job.pay}</p>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                                                <span>Posted: {new Date(job.createdAt || job.postedAt || Date.now()).toLocaleDateString()}</span>
                                                <div className="flex gap-2">
                                                    <span className="bg-[#5CB144]/20 text-[#5CB144] px-2 py-1 rounded">Active</span>
                                                    <button
                                                        onClick={() => navigate(`/dashboard/applications/${job._id || job.id}`)}
                                                        className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition font-semibold"
                                                    >
                                                        View Applicants →
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="animate-fade-in space-y-8">
                            <div className="bg-gradient-to-br from-[#f59e0b]/20 to-transparent border border-[#f59e0b]/30 rounded-3xl p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#f59e0b] opacity-10 blur-3xl rounded-full"></div>
                                <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                                    <span className="text-4xl">✨</span> AI Brand Builder
                                </h2>
                                <p className="text-gray-300 mb-8 max-w-2xl text-lg">
                                    Instantly generate a premium company profile. Attract top talent with a compelling culture manifesto and synthetic employee testimonials.
                                </p>

                                <form onSubmit={handleGenerateBrand} className="flex gap-4 max-w-2xl flex-col md:flex-row">
                                    <input
                                        type="text"
                                        required
                                        placeholder="Company Name"
                                        value={brandCompanyName}
                                        onChange={e => setBrandCompanyName(e.target.value)}
                                        className="bg-black/50 border border-[#f59e0b]/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] flex-1"
                                    />
                                    <input
                                        type="text"
                                        required
                                        placeholder="One sentence describing what you do..."
                                        value={brandDescription}
                                        onChange={e => setBrandDescription(e.target.value)}
                                        className="bg-black/50 border border-[#f59e0b]/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b] flex-[2]"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isGeneratingBrand}
                                        className="bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-[#f59e0b]/20 disabled:opacity-50 whitespace-nowrap"
                                    >
                                        {isGeneratingBrand ? "Generating..." : "Generate Pro Profile"}
                                    </button>
                                </form>
                            </div>

                            {brandProfile && (
                                <div className="space-y-6">
                                    <div className="flex gap-6 flex-col md:flex-row">
                                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex-[2]">
                                            <h3 className="text-xl font-bold text-[#f59e0b] mb-4 uppercase tracking-wider text-sm">Company Manifesto</h3>
                                            <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-4">
                                                {brandProfile.manifesto.split('\n\n').map((para, i) => (
                                                    <p key={i}>{para}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-b from-[#f59e0b]/10 to-transparent border border-[#f59e0b]/20 rounded-3xl p-8 flex-1 h-fit">
                                            <h3 className="text-xl font-bold text-white mb-4">Why Join Us? 🚀</h3>
                                            <p className="text-[#f59e0b] font-medium leading-relaxed bg-black/30 p-4 rounded-xl border border-[#f59e0b]/30">
                                                {brandProfile.whyJoinUs}
                                            </p>
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-bold pt-4">Employee Testimonials</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {brandProfile.testimonials?.map((t, i) => (
                                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 relative">
                                                <span className="absolute top-4 right-4 text-4xl opacity-20 text-[#f59e0b]">"</span>
                                                <p className="text-gray-300 italic mb-6 relative z-10">"{t.quote}"</p>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b] font-bold">
                                                        {t.author.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-white text-sm">{t.author}</p>
                                                        <p className="text-xs text-gray-500">{t.role}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

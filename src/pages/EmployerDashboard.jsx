import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function EmployerDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const user = JSON.parse(localStorage.getItem("user"));

    // State for Jobs
    const [jobs, setJobs] = useState([]);
    const [showPostForm, setShowPostForm] = useState(false);

    // Form State
    const [jobTitle, setJobTitle] = useState("");
    const [jobCompany, setJobCompany] = useState("");
    const [jobLocation, setJobLocation] = useState("");
    const [jobSalary, setJobSalary] = useState("");

    // Load jobs on mount and check query params
    useEffect(() => {
        const storedJobs = JSON.parse(localStorage.getItem("somojo_jobs")) || [];
        setJobs(storedJobs);

        if (searchParams.get("post") === "true") {
            setShowPostForm(true);
        }
    }, [searchParams]);

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };

    const handlePostJob = (e) => {
        e.preventDefault();

        const newJob = {
            id: Date.now(),
            title: jobTitle,
            company: jobCompany,
            location: jobLocation,
            salary: jobSalary,
            employerEmail: user?.email,
            postedAt: new Date().toISOString()
        };

        const updatedJobs = [newJob, ...jobs];
        setJobs(updatedJobs);
        localStorage.setItem("somojo_jobs", JSON.stringify(updatedJobs));

        // Reset and close form
        setJobTitle("");
        setJobCompany("");
        setJobLocation("");
        setJobSalary("");
        setShowPostForm(false);
    };

    return (
        <div className="min-h-screen bg-transparent text-white">

            {/* Top Navbar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center text-black">
                <h1 className="text-2xl font-bold text-[#CF9EFF]">
                    Employer Portal
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-[#CF9EFF]/30"
                    >
                        Logout
                    </button>
                </div>
            </div>

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
                                <li className="text-[#CF9EFF] cursor-pointer transition font-semibold">
                                    Active Listings
                                </li>
                                <li className="hover:text-[#CF9EFF] cursor-pointer transition">
                                    Review Applicants
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
                                        <input type="text" required value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]" placeholder="e.g. Downtown, NY" />
                                    </div>
                                    <div>
                                        <label className="block text-gray-400 mb-1">Salary / Month (₹)</label>
                                        <input type="number" required value={jobSalary} onChange={e => setJobSalary(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-[#CF9EFF]" placeholder="15000" />
                                    </div>
                                </div>
                                <button type="submit" className="mt-4 w-full bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold py-3 rounded-xl transition shadow-lg">
                                    Publish Job
                                </button>
                            </form>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold mb-4">
                        Your Active Job Postings
                    </h2>

                    {jobs.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 text-center text-gray-400">
                            <div className="text-5xl mb-4">📄</div>
                            <h3 className="text-xl text-white font-semibold mb-2">No active jobs</h3>
                            <p>You haven't posted any jobs yet. Create a new listing to start receiving applications.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {jobs.map(job => (
                                <div key={job.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-[#CF9EFF] mb-1">{job.title}</h3>
                                        <p className="text-gray-300 font-medium">{job.company}</p>
                                        <p className="text-sm text-gray-400 mt-2">📍 {job.location}</p>
                                        <p className="text-sm text-gray-400 mt-1">💰 ₹{job.salary} / month</p>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
                                        <span>Posted: {new Date(job.postedAt).toLocaleDateString()}</span>
                                        <span className="bg-[#5CB144]/20 text-[#5CB144] px-2 py-1 rounded">Active</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
}

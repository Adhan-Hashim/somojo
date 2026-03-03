import { useState } from "react";
import { useNavigate } from "react-router-dom";
import JobCard from "../components/JobCard";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const isGuest = user?.role === "guest";
    const [jobs] = useState(() => {
        const storedJobs = JSON.parse(localStorage.getItem("somojo_jobs")) || [];
        if (storedJobs.length > 0) return storedJobs;

        const defaultJobs = [
            {
                id: 1,
                title: "Cafe Assistant",
                company: "Urban Brew",
                location: "Chennai",
                salary: 12000,
                postedAt: new Date().toISOString()
            },
            {
                id: 2,
                title: "Delivery Executive",
                company: "QuickDrop",
                location: "Chennai",
                salary: 15000,
                postedAt: new Date().toISOString()
            }
        ];
        localStorage.setItem("somojo_jobs", JSON.stringify(defaultJobs));
        return defaultJobs;
    });

    const handleLogout = () => {
        localStorage.removeItem("user");
        navigate("/");
    };


    return (
        <div className="min-h-screen bg-transparent text-white">

            {/* Top Navbar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center text-black">
                <h1 className="text-2xl font-bold text-[#5CB144]">
                    {isGuest ? "Guest Portal" : "Student Portal"}
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-gray-300 text-sm">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-[#5CB144] hover:bg-[#4a8f37] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-[#5CB144]/30"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-4 gap-6 p-6">

                {/* Sidebar */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                    <h2 className="font-semibold mb-6 text-lg">
                        Your Panel
                    </h2>

                    <ul className="space-y-4 text-gray-300">
                        <li className={`${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#5CB144] cursor-pointer'} transition`}>
                            Saved Jobs
                        </li>
                        <li className={`${isGuest ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#5CB144] cursor-pointer'} transition`}>
                            Applied Jobs
                        </li>
                        <li className="hover:text-[#5CB144] cursor-pointer transition">
                            Nearby Jobs
                        </li>
                    </ul>
                </div>

                {/* Job Listings */}
                <div className="md:col-span-3 space-y-6">
                    {isGuest && (
                        <div className="bg-[#5CB144]/10 border border-[#5CB144]/30 text-[#5CB144] p-4 rounded-xl mb-6">
                            <strong>Limited Access Mode:</strong> You are browsing as a guest. Please <a href="/register" className="underline font-bold">register</a> to apply for jobs and unlock all features.
                        </div>
                    )}

                    <h2 className="text-2xl font-bold mb-4">
                        Available Part-Time Jobs
                    </h2>

                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} isGuest={isGuest} />
                    ))}
                </div>

            </div>
        </div>
    );
}

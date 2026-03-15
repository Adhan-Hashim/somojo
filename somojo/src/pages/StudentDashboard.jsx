import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinHouse } from "lucide-react";
import JobCard from "../components/JobCard";
import api from "../api";

export default function StudentDashboard() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem("user"));
    const isGuest = user?.role === "guest";

    const [activeTab, setActiveTab] = useState("nearby");
    const [allJobs, setAllJobs] = useState([]);
    const [nearbyJobs, setNearbyJobs] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [appliedJobs, setAppliedJobs] = useState([]);
    const [userLocation, setUserLocation] = useState(user?.location || "");
    const [userCoordinates, setUserCoordinates] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (isGuest) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // 1. Fetch Profile for savedJobs and location
            const profileRes = await api.get('/api/profile/me');
            const profile = profileRes.data;
            if (profile.location) setUserLocation(profile.location);
            if (profile.locationPoint?.coordinates) {
                setUserCoordinates(profile.locationPoint.coordinates);
            }

            // 2. Fetch All active jobs (baseline for saved/applied filtering)
            const jobsRes = await api.get('/api/jobs');
            setAllJobs(jobsRes.data);

            // 3. Conditionally Fetch Nearby Jobs if coordinates exist
            if (profile.locationPoint?.coordinates) {
                const [lng, lat] = profile.locationPoint.coordinates;
                // Default maxDistance is 50km in backend. We can adjust or let backend decide.
                const nearbyRes = await api.get(`/api/jobs/nearby?lng=${lng}&lat=${lat}`);
                setNearbyJobs(nearbyRes.data);
            } else {
                // Fallback to substring matching if no exact geometry
                const fallbackNearby = jobsRes.data.filter(job =>
                    !profile.location || (job.location && job.location.toLowerCase().includes(profile.location.toLowerCase()))
                );
                setNearbyJobs(fallbackNearby);
            }

            // 4. Fetch Applied jobs
            const appliedRes = await api.get('/api/applications/my-applications');
            setAppliedJobs(appliedRes.data);

            // 4. Map saved job IDs to actual job objects
            const savedJobIds = profile.savedJobs || [];
            const saved = jobsRes.data.filter(j => savedJobIds.includes(j._id));
            setSavedJobs(saved);

        } catch (err) {
            console.error("Error fetching dashboard data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/");
    };

    const handleSaveJob = async (jobId) => {
        if (isGuest) return;
        try {
            const res = await api.put(`/api/profile/save-job/${jobId}`);
            const updatedSavedIds = res.data.savedJobs;
            // Re-calculate saved jobs based on the new array of IDs
            setSavedJobs(allJobs.filter(j => updatedSavedIds.includes(j._id)));
        } catch (err) {
            console.error("Failed to toggle save job", err);
        }
    };

    const isJobSaved = (jobId) => savedJobs.some(j => j._id === jobId);
    const hasAppliedToJob = (jobId) => appliedJobs.some(app => app.job._id === jobId || app.job === jobId);

    const renderJobs = () => {
        if (loading) return <div className="text-white">Loading jobs...</div>;

        if (isGuest) {
            return (
                <div className="bg-[#5CB144]/10 border border-[#5CB144]/30 text-[#5CB144] p-4 rounded-xl mb-6">
                    <strong>Limited Access Mode:</strong> You are browsing as a guest. Please <a href="/register" className="underline font-bold">register</a> to apply for jobs and unlock all features.
                </div>
            );
        }

        let displayList = [];
        let emptyMessage = "";

        if (activeTab === "nearby") {
            displayList = nearbyJobs;
            emptyMessage = userLocation ? `No jobs found near ${userLocation}.` : "No active jobs available right now.";
        } else if (activeTab === "saved") {
            displayList = savedJobs;
            emptyMessage = "You haven't saved any jobs yet.";
        } else if (activeTab === "applied") {
            displayList = appliedJobs.map(app => app.job); // Extract job from application
            emptyMessage = "You haven't applied to any jobs yet.";
        }

        if (displayList.length === 0) {
            return (
                <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl">
                    <p className="text-gray-400 text-lg">{emptyMessage}</p>
                </div>
            );
        }

        return displayList.map(job => (
            <JobCard
                key={job._id || job.id}
                job={job}
                isGuest={isGuest}
                isSaved={isJobSaved(job._id)}
                hasApplied={hasAppliedToJob(job._id)}
                onSave={handleSaveJob}
            />
        ));
    };

    return (
        <div className="min-h-screen bg-transparent text-white">

            {/* Top Navbar */}
            <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex justify-between items-center text-black">
                <h1 className="text-2xl font-bold text-[#5CB144]">
                    {isGuest ? "Guest Portal" : "Job Seeker Portal"}
                </h1>

                <div className="flex items-center gap-4">
                    <span className="text-gray-600 font-semibold text-sm">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="bg-[#5CB144] hover:bg-[#4a8f37] text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8 p-6 mt-4">

                {/* Sidebar */}
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl h-fit sticky top-6">
                    <h2 className="font-extrabold text-white text-xl mb-6 tracking-tight">
                        Your Panel
                    </h2>

                    <ul className="space-y-3 font-medium">
                        <li
                            onClick={() => !isGuest && setActiveTab("nearby")}
                            className={`p-3 rounded-xl transition cursor-pointer ${isGuest ? 'opacity-50 cursor-not-allowed' : activeTab === 'nearby' ? 'bg-[#5CB144] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            Nearby Jobs
                        </li>
                        <li
                            onClick={() => !isGuest && setActiveTab("saved")}
                            className={`p-3 rounded-xl transition cursor-pointer ${isGuest ? 'opacity-50 cursor-not-allowed' : activeTab === 'saved' ? 'bg-[#5CB144] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            Saved Jobs
                        </li>
                        <li
                            onClick={() => !isGuest && setActiveTab("applied")}
                            className={`p-3 rounded-xl transition cursor-pointer ${isGuest ? 'opacity-50 cursor-not-allowed' : activeTab === 'applied' ? 'bg-[#5CB144] text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`}
                        >
                            Applied Jobs
                        </li>
                    </ul>
                </div>

                {/* Job Listings Area */}
                <div className="md:col-span-3">

                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            {activeTab === 'nearby' ? "Available Part-Time Jobs" : activeTab === 'saved' ? "Your Saved Jobs" : "Your Applications"}
                        </h2>
                        {activeTab === 'nearby' && userLocation && !isGuest && (
                            <span className="bg-white/10 text-gray-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-white/10 flex items-center gap-2">
                                <MapPinHouse className="w-4 h-4 text-[#5CB144]" /> Near {userLocation}
                            </span>
                        )}
                    </div>

                    <div className="space-y-4">
                        {renderJobs()}
                    </div>
                </div>

            </div>
        </div>
    );
}

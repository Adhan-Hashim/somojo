import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPinHouse } from 'lucide-react';

import api from '../api';
import LocationInput from '../components/LocationInput';

// For fallback UI if API is empty
const generateMockJobs = (query, location, category) => {
    // keeping the fallback intact just in case the db is totally empty for presentation
    return [];
};

export default function Jobs() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Check authentication state
    const userStr = localStorage.getItem("user");
    const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;

    // Controlled inputs for the search bar
    const [queryInput, setQueryInput] = useState(searchParams.get('q') || '');
    const [locationInput, setLocationInput] = useState(searchParams.get('loc') || '');
    const [userCoords, setUserCoords] = useState(null); // { lng, lat }
    const categoryParam = searchParams.get('category');
    const [isLocating, setIsLocating] = useState(false);

    const handleLocateMe = () => {
        if ("geolocation" in navigator) {
            setIsLocating(true);
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        setUserCoords({ lat: latitude, lng: longitude });
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.suburb || "Local Area";
                        setLocationInput(city);
                    } catch (error) {
                        console.error("Error finding location name:", error);
                        setLocationInput("My Location");
                    } finally {
                        setIsLocating(false);
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setIsLocating(false);
                    alert("Could not access your location. Please check browser permissions.");
                }
            );
        } else {
            alert("Location features are not supported by your browser.");
        }
    };

    const [jobs, setJobs] = useState([]);
    const [relatedJobs, setRelatedJobs] = useState([]);
    const [isSearching, setIsSearching] = useState(true);
    const [isFetchingRelated, setIsFetchingRelated] = useState(false);
    const aiDebounceTimer = useRef(null);

    // Filter states
    const [activeFilters, setActiveFilters] = useState({
        type: new Set(),
        distance: 'Within 15 miles'
    });
    const [sortBy, setSortBy] = useState('relevance');

    useEffect(() => {
        const fetchJobs = async () => {
            setIsSearching(true);
            setRelatedJobs([]);
            try {
                let res;
                // If we have distance filter AND (coordinates OR location string)
                const locParam = searchParams.get('loc');
                if (activeFilters.distance && (userCoords || locParam)) {
                    let km = 0;
                    if (activeFilters.distance === 'Exact location') {
                        km = 3; // Strict 3-km radius for "Exact"
                    } else {
                        const match = activeFilters.distance.match(/\d+/);
                        km = match ? parseInt(match[0], 10) : 0;
                    }
                    
                    const meters = km * 1000;
                    const paramsObj = {
                        maxDistance: meters,
                        q: searchParams.get('q'),
                        category: categoryParam
                    };

                    if (userCoords) {
                        paramsObj.lng = userCoords.lng;
                        paramsObj.lat = userCoords.lat;
                    } else {
                        paramsObj.location = locParam;
                    }

                    res = await api.get('/api/jobs/nearby', { params: paramsObj });
                } else if (user && user.role === 'job-seeker' && !searchParams.get('q') && !categoryParam && !searchParams.get('loc')) {
                    res = await api.get('/api/jobs/recommended');
                } else {
                    res = await api.get('/api/jobs', {
                        params: {
                            q: searchParams.get('q'),
                            loc: searchParams.get('loc'),
                            category: categoryParam
                        }
                    });
                }

                let results = res.data;

                // Frontend Filters Text Match
                if (searchParams.get('q')) {
                    const q = searchParams.get('q').toLowerCase();
                    results = results.filter(j => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q));
                }
                if (categoryParam) {
                    const c = categoryParam.toLowerCase();
                    results = results.filter(j => j.type?.toLowerCase() === c || j.category?.toLowerCase() === c);
                }
                if (activeFilters.type.size > 0) {
                    results = results.filter(j => activeFilters.type.has(j.type));
                }

                setJobs(results);

                // AI Suggestions if no results
                if (results.length === 0 && (searchParams.get('q') || categoryParam)) {
                    console.log(`[JOBS] No results found. Triggering AI suggest debounce... (q=${searchParams.get('q')})`);
                    // Debounce the AI fetch to prevent rapid calls hitting quotas
                    if (aiDebounceTimer.current) {
                        clearTimeout(aiDebounceTimer.current);
                        console.log(`[JOBS] Previous AI debounce cleared.`);
                    }
                    
                    aiDebounceTimer.current = setTimeout(async () => {
                        console.log(`[JOBS] Executing AI suggestion fetch...`);
                        setIsFetchingRelated(true);
                        try {
                            const relRes = await api.get('/api/jobs/related', {
                                params: {
                                    q: searchParams.get('q'),
                                    category: categoryParam
                                }
                            });
                            console.log(`[JOBS] AI Suggested RESPONSE:`, relRes.data);
                            setRelatedJobs(relRes.data);
                        } catch (relErr) {
                            console.error("[JOBS] Failed to fetch related jobs:", relErr);
                        } finally {
                            setIsFetchingRelated(false);
                        }
                    }, 1000); // 1.0s debounce
                }
            } catch (err) {
                console.error("Failed to fetch jobs:", err);
            } finally {
                setIsSearching(false);
            }
        };

        fetchJobs();
    }, [searchParams, categoryParam, activeFilters, userCoords, user?.role]);

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (queryInput) params.set('q', queryInput);
        if (locationInput) params.set('loc', locationInput);
        if (categoryParam) params.set('category', categoryParam);
        setSearchParams(params);
    };

    const clearFilters = () => {
        setQueryInput('');
        setLocationInput('');
        setActiveFilters({ type: new Set(), distance: 'Within 15 miles' });
        setSearchParams(new URLSearchParams());
    };

    const toggleTypeFilter = (type) => {
        const newSet = new Set(activeFilters.type);
        if (newSet.has(type)) newSet.delete(type);
        else newSet.add(type);
        setActiveFilters({ ...activeFilters, type: newSet });
    };

    const extractPay = (str) => {
        if (!str) return 0;
        let num = 0;
        const match = str.match(/[\d,]+/);
        if (match) num = parseInt(match[0].replace(/,/g, ''), 10);
        const lower = str.toLowerCase();
        if (lower.includes('hr') || lower.includes('hour')) num *= 2080;
        if (lower.includes('month') || lower.includes('mo')) num *= 12;
        return num;
    };

    const sortedJobs = [...jobs].sort((a, b) => {
        if (sortBy === 'relevance') {
            return (b.aiMatchScore || 0) - (a.aiMatchScore || 0);
        } else if (sortBy === 'date_newest') {
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        } else if (sortBy === 'date_oldest') {
            return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        } else if (sortBy === 'pay_highest') {
            return extractPay(b.pay || b.salary) - extractPay(a.pay || a.salary);
        } else if (sortBy === 'pay_lowest') {
            return extractPay(a.pay || a.salary) - extractPay(b.pay || b.salary);
        } else if (sortBy === 'name_asc') {
            return (a.title || '').localeCompare(b.title || '');
        } else if (sortBy === 'name_desc') {
            return (b.title || '').localeCompare(a.title || '');
        }
        return 0;
    });

    return (
        <div className="min-h-screen text-white pb-32 pt-24 relative overflow-hidden">

            {/* Ambient Background Globs */}
            <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-[#CF9EFF] opacity-[0.06] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>
            <div className="absolute top-[40%] left-[-10%] w-[500px] h-[500px] bg-[#5CB144] opacity-[0.04] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Header Area */}
            <div className="max-w-7xl mx-auto px-6 mb-16 relative z-20">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    {categoryParam ? (
                        <>Opportunities in <span className="text-[#CF9EFF]">{categoryParam}</span></>
                    ) : (
                        <>Find your next <span className="text-[#CF9EFF]">great role.</span></>
                    )}
                </h1>
                <p className="text-xl text-gray-400 mb-10 max-w-2xl">
                    Discover thousands of local opportunities offering instant hiring and competitive pay in your area.
                </p>

                {/* Premium Search Bar */}
                <form onSubmit={handleSearch} className="w-full bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[30px] p-2 md:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 relative z-20 hover:border-white/20 transition-colors duration-500">

                    <div className="flex-1 flex items-center bg-black/60 rounded-[22px] px-5 py-4 md:py-0 border border-transparent focus-within:border-[#CF9EFF]/40 focus-within:shadow-[0_0_20px_rgba(207,158,255,0.1)] transition-all duration-300">
                        <span className="text-[#CF9EFF] mr-4 text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" /></svg>
                        </span>
                        <div className="flex-1 text-left">
                            <label className="block text-[10px] font-bold text-[#CF9EFF]/70 uppercase tracking-widest mb-0.5">What are you looking for?</label>
                            <input
                                type="text"
                                value={queryInput}
                                onChange={(e) => setQueryInput(e.target.value)}
                                placeholder="Job title, keywords, or company..."
                                className="w-full bg-transparent text-white focus:outline-none text-base md:text-lg placeholder-gray-500 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex items-center bg-black/60 rounded-[22px] px-5 py-4 md:py-0 border border-transparent focus-within:border-[#5CB144]/40 focus-within:shadow-[0_0_20px_rgba(92,177,68,0.1)] transition-all duration-300">
                        <span className="text-[#5CB144] mr-4 text-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" /></svg>
                        </span>
                        <div className="flex-1 text-left">
                            <label className="block text-[10px] font-bold text-[#5CB144]/70 uppercase tracking-widest mb-0.5">Where do you want to work?</label>
                            <LocationInput
                                value={locationInput}
                                onChange={setLocationInput}
                                onLocationSelect={({ lat, lng, address }) => {
                                    setLocationInput(address);
                                    setUserCoords({ lat, lng });
                                }}
                                placeholder="Your city or neighborhood"
                                className="w-full bg-transparent text-white focus:outline-none text-base md:text-lg placeholder-gray-500 font-medium"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleLocateMe}
                            disabled={isLocating}
                            className="ml-2 px-3 py-1.5 text-[#5CB144] hover:text-white bg-[#5CB144]/10 hover:bg-[#5CB144]/20 rounded-xl transition border border-[#5CB144]/20 flex items-center justify-center cursor-pointer whitespace-nowrap text-sm font-bold shadow-md shrink-0"
                            title="Detect my location"
                        >
                            {isLocating ? (
                                <span className="animate-pulse">Locating...</span>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                                    </svg>
                                    Locate
                                </div>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-extrabold py-5 md:py-0 px-10 rounded-[22px] transition-all shadow-lg shadow-[#CF9EFF]/20 md:w-auto w-full text-lg hover:shadow-[#CF9EFF]/40 hover:scale-[1.02]"
                    >
                        Search Jobs
                    </button>
                </form>

                {/* Active Applied Filters Indicators */}
                {(searchParams.get('q') || searchParams.get('loc') || categoryParam || activeFilters.type.size > 0) && (
                    <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-400 bg-white/5 backdrop-blur-md inline-flex px-4 py-2 rounded-2xl border border-white/10">
                        <span className="font-semibold mr-1">Active Filters:</span>
                        {searchParams.get('q') && <span className="bg-white/10 px-3 py-1 rounded-full text-white font-medium border border-white/5">{searchParams.get('q')}</span>}
                        {searchParams.get('loc') && <span className="bg-white/10 px-3 py-1 rounded-full text-white font-medium border border-white/5">{searchParams.get('loc')}</span>}
                        {categoryParam && <span className="bg-[#CF9EFF]/20 text-[#CF9EFF] border border-[#CF9EFF]/30 px-3 py-1 rounded-full font-medium">{categoryParam}</span>}
                        {Array.from(activeFilters.type).map(t => (
                            <span key={t} className="bg-white/10 px-3 py-1 rounded-full text-white font-medium border border-white/5">{t}</span>
                        ))}
                        <button onClick={clearFilters} className="text-[#CF9EFF] hover:text-white transition font-semibold ml-2 hover:underline">
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Main Content Layout */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-10 relative z-10">

                {/* Sidebar Filters - Glass Cards */}
                <div className="hidden lg:block space-y-6">
                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-7 rounded-[30px] hover:border-white/20 transition-colors">
                        <h3 className="font-bold text-lg mb-5 text-white flex items-center justify-between">
                            Job Type
                            <span className="text-gray-500 text-xs font-normal">Optional</span>
                        </h3>
                        <div className="space-y-4">
                            {['Full-time', 'Part-time', 'Contract', 'Temporary'].map(type => (
                                <label key={type} className="flex items-center gap-4 cursor-pointer group">
                                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${activeFilters.type.has(type) ? 'border-[#CF9EFF] bg-[#CF9EFF]/10' : 'border-white/20 group-hover:border-[#CF9EFF]/50'}`}>
                                        <div className={`w-3 h-3 rounded-[3px] bg-[#CF9EFF] transition-transform duration-300 ${activeFilters.type.has(type) ? 'scale-100' : 'scale-0'}`}></div>
                                    </div>
                                    <span className={`transition-colors ${activeFilters.type.has(type) ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-7 rounded-[30px] hover:border-white/20 transition-colors">
                        <h3 className="font-bold text-lg mb-5 text-white">Distance</h3>
                        <div className="space-y-4">
                            {['Exact location', 'Within 5 km', 'Within 15 km', 'Within 25 km'].map((dist) => {
                                const isActive = activeFilters.distance === dist;
                                return (
                                    <label 
                                        key={dist} 
                                        onClick={() => {
                                            setActiveFilters({ ...activeFilters, distance: dist });
                                            if (!userCoords && !searchParams.get('loc')) {
                                                handleLocateMe();
                                            }
                                        }} 
                                        className="flex items-center gap-4 cursor-pointer group"
                                    >
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isActive ? 'border-[#5CB144]' : 'border-white/20 group-hover:border-[#5CB144]/50'}`}>
                                            <div className={`w-3 h-3 rounded-full bg-[#5CB144] transition-transform duration-300 ${isActive ? 'scale-100' : 'scale-0'}`}></div>
                                        </div>
                                        <span className={`transition-colors ${isActive ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>{dist}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Job Listings Column */}
                <div className="lg:col-span-3">

                    {/* Header Controls */}
                    <div className="flex justify-between items-end mb-6 border-b border-white/10 pb-4">
                        <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500">
                            {isSearching ? 'Scanning network...' : `${jobs.length} Matches Found`}
                        </p>
                        {!isSearching && jobs.length > 0 && (
                            <select 
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="bg-white/5 border border-white/10 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#CF9EFF]/50 cursor-pointer"
                            >
                                <option value="relevance" className="bg-[#111]">Sort by Relevance</option>
                                <option value="date_newest" className="bg-[#111]">Date (Newest)</option>
                                <option value="date_oldest" className="bg-[#111]">Date (Oldest)</option>
                                <option value="pay_highest" className="bg-[#111]">Pay (Highest)</option>
                                <option value="pay_lowest" className="bg-[#111]">Pay (Lowest)</option>
                                <option value="name_asc" className="bg-[#111]">Name (A-Z)</option>
                                <option value="name_desc" className="bg-[#111]">Name (Z-A)</option>
                            </select>
                        )}
                    </div>

                    {/* Listings */}
                    <div className="space-y-5">
                        {isSearching ? (
                            // Skeleton Loading State
                            Array(4).fill(0).map((_, i) => (
                                <div key={i} className="bg-white/5 border border-white/5 rounded-[30px] p-6 h-40 animate-pulse flex items-center">
                                    <div className="w-16 h-16 bg-white/10 rounded-2xl mr-6"></div>
                                    <div className="flex-1 space-y-4">
                                        <div className="h-6 bg-white/10 rounded w-1/3"></div>
                                        <div className="h-4 bg-white/10 rounded w-1/4"></div>
                                        <div className="h-4 bg-white/10 rounded w-1/2"></div>
                                    </div>
                                </div>
                            ))
                        ) : jobs.length > 0 ? (
                            sortedJobs.map((job) => (
                                <div
                                    key={job._id || job.id}
                                    className="group relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[30px] p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#CF9EFF]/40 hover:shadow-[0_20px_50px_-10px_rgba(207,158,255,0.15)]"
                                >
                                    {/* Subtly glowing backplate visible on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#CF9EFF]/0 via-[#CF9EFF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                                        {/* Logo / Company Avatar */}
                                        <div className="w-16 h-16 shrink-0 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner group-hover:border-white/20 transition-colors">
                                            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                                        </div>

                                        {/* Main Details */}
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-white group-hover:text-[#CF9EFF] transition-colors duration-300">{job.title}</h3>
                                                    <p className="text-gray-400 font-medium text-lg mt-1">{job.company}</p>
                                                </div>

                                                {/* Badges */}
                                                <div className="flex gap-2 shrink-0">
                                                    {job.new && (
                                                        <span className="bg-[#CF9EFF]/10 text-[#CF9EFF] text-xs font-bold px-3 py-1.5 rounded-full border border-[#CF9EFF]/20 uppercase tracking-wide">
                                                            New
                                                        </span>
                                                    )}
                                                    {job.urgent && (
                                                        <span className="bg-[#5CB144]/10 text-[#5CB144] text-xs font-bold px-3 py-1.5 rounded-full border border-[#5CB144]/20 uppercase tracking-wide flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#5CB144] animate-pulse"></span> Urgent
                                                        </span>
                                                    )}
                                                    {job.aiMatchScore > 0 && (
                                                        <span className="bg-gradient-to-r from-[#CF9EFF] to-[#A374FF] text-black text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-[#CF9EFF]/30 flex items-center gap-1.5 whitespace-nowrap">
                                                            ✨ AI Match {job.aiMatchScore}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Attributes list */}
                                            <div className="flex flex-wrap gap-2 mt-5 mb-6">
                                                <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-sm text-gray-300 flex items-center gap-2 group-hover:bg-white/10 transition-colors">
                                                    <MapPinHouse className="w-4 h-4 text-gray-500" /> {job.location}
                                                </div>
                                                <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl text-sm text-gray-300 flex items-center gap-2 group-hover:bg-white/10 transition-colors">
                                                    <span className="text-gray-500">💼</span> {job.type}
                                                </div>
                                                <div className="bg-white/5 border border-white/5 px-3 py-1.5 rounded-xl font-bold text-[#5CB144] flex items-center gap-2 group-hover:bg-[#5CB144]/10 transition-colors">
                                                    {job.pay}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                <div className="text-sm text-gray-500 font-medium flex gap-4">
                                                    <span>⏱ Posted {job.posted}</span>
                                                    <span className="hidden sm:inline">👥 {job.applicants} applicants</span>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    {/* View Details / Apply Button */}
                                                    <button
                                                        onClick={() => navigate(`/apply/${job._id || job.id}`)}
                                                        className="text-[#CF9EFF] font-bold text-sm bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 px-5 py-2 rounded-xl hover:bg-[#CF9EFF] hover:text-black transition-all duration-300 shadow-md"
                                                    >
                                                        {(!user || user.role === 'job-seeker') ? "View & Apply →" : "View Details →"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="space-y-10">
                                <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] p-16 text-center shadow-2xl">
                                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10">
                                        <span className="text-4xl filter grayscale opacity-50">🧭</span>
                                    </div>
                                    <h3 className="text-3xl font-bold mb-4">No exact matches found</h3>
                                    <p className="text-gray-400 mb-8 max-w-md mx-auto text-lg">
                                        We couldn't find any opportunities matching your exact criteria right now. Try adjusting your search keywords or location.
                                    </p>
                                    <button onClick={clearFilters} className="bg-white hover:bg-gray-200 text-black font-bold py-4 px-10 rounded-2xl transition-all shadow-xl text-lg hover:scale-105">
                                        Clear Search Filters
                                    </button>
                                </div>

                                {isFetchingRelated ? (
                                    <div className="text-center py-10">
                                        <div className="inline-block w-8 h-8 border-4 border-[#CF9EFF]/30 border-t-[#CF9EFF] rounded-full animate-spin mb-4"></div>
                                        <p className="text-[#CF9EFF] font-medium animate-pulse">AI is finding related opportunities for you...</p>
                                    </div>
                                ) : relatedJobs.length > 0 ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-4 px-2">
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#CF9EFF]/30 to-transparent"></div>
                                            <h2 className="text-xl font-bold text-[#CF9EFF] flex items-center gap-2">
                                                <span className="text-2xl">✨</span> AI Suggested Related Jobs
                                            </h2>
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-[#CF9EFF]/30 to-transparent"></div>
                                        </div>
                                        
                                        <div className="space-y-5">
                                            {relatedJobs.map((job) => (
                                                <div
                                                    key={`rel-${job._id || job.id}`}
                                                    className="group relative bg-[#0a0a0a]/40 backdrop-blur-xl border border-[#CF9EFF]/20 rounded-[30px] p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:border-[#CF9EFF]/40 hover:shadow-[0_20px_50px_-10px_rgba(207,158,255,0.1)]"
                                                >
                                                    <div className="absolute top-0 right-0 px-4 py-1 bg-[#CF9EFF] text-black text-[10px] font-black uppercase tracking-widest rounded-bl-2xl">
                                                        AI Recommended
                                                    </div>
                                                    
                                                    <div className="relative z-10 flex flex-col sm:flex-row gap-6">
                                                        <div className="w-16 h-16 shrink-0 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center overflow-hidden">
                                                            <img src={`https://api.dicebear.com/9.x/initials/svg?seed=${job.logoSeed || job.company}&backgroundColor=111111&textColor=ffffff`} alt={job.company} className="w-full h-full object-cover" />
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-4">
                                                                <div>
                                                                    <h3 className="text-2xl font-bold text-white group-hover:text-[#CF9EFF] transition-colors">{job.title}</h3>
                                                                    <p className="text-gray-400 font-medium text-lg mt-1">{job.company}</p>
                                                                </div>
                                                            </div>

                                                            <div className="flex flex-wrap gap-2 mt-4 mb-6">
                                                                <div className="bg-white/5 px-3 py-1 rounded-xl text-sm text-gray-300 flex items-center gap-2">
                                                                    <MapPinHouse className="w-4 h-4 text-gray-500" /> {job.location}
                                                                </div>
                                                                <div className="bg-[#CF9EFF]/10 border border-[#CF9EFF]/20 px-3 py-1 rounded-xl text-sm text-[#CF9EFF] font-bold">
                                                                    {job.category}
                                                                </div>
                                                            </div>

                                                            <div className="flex justify-between items-center pt-4 border-t border-white/5">
                                                                <span className="text-[#5CB144] font-bold">{job.pay || job.salary}</span>
                                                                <button
                                                                    onClick={() => navigate(`/apply/${job._id || job.id}`)}
                                                                    className="text-white font-bold text-sm bg-white/10 px-6 py-2 rounded-xl hover:bg-[#CF9EFF] hover:text-black transition-all"
                                                                >
                                                                    View Details →
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

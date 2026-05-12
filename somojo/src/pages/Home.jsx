import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPinHouse, Search } from "lucide-react";
import api from "../api";
import LocationInput from "../components/LocationInput";

import imgRetail from "../assets/retail.jpg";
import imgFood from "../assets/food.jpg";
import imgWarehouse from "../assets/warehouse.jpg";
import imgSupport from "../assets/support.jpg";
import imgDelivery from "../assets/delivery.jpg";
import imgFacilities from "../assets/facilities.jpg";
import imgEvents from "../assets/events.jpg";
import imgHealth from "../assets/health.jpg";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [counts, setCounts] = useState({});
  const [suggestedJobs, setSuggestedJobs] = useState([]);

  const categories = [
    { icon: "🛍️", name: "Retail & Sales", desc: "Customer-facing roles in vibrant local shops and malls.", bg: imgRetail },
    { icon: "🍔", name: "Restaurant & Food", desc: "Fast-paced opportunities in kitchens, cafes, and dining.", bg: imgFood },
    { icon: "📦", name: "Warehouse", desc: "Active roles in packing, sorting, and inventory supply.", bg: imgWarehouse },
    { icon: "💻", name: "Customer Support", desc: "Help users succeed with excellent communication skills.", bg: imgSupport },
    { icon: "🚗", name: "Delivery & Driver", desc: "Hit the road and deliver goods with flexible hours.", bg: imgDelivery },
    { icon: "🧹", name: "Facilities", desc: "Maintain pristine environments in offices and homes.", bg: imgFacilities },
    { icon: "🎉", name: "Events", desc: "Be part of the excitement at concerts and festivals.", bg: imgEvents },
    { icon: "🏥", name: "Healthcare", desc: "Support communities through essential caregiving roles.", bg: imgHealth }
  ];

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await api.get("/api/jobs/categories/counts");
        setCounts(res.data);
      } catch (err) {
        console.error("Error fetching category counts:", err);
      }
    };
    fetchCounts();
  }, []);

  const [userLocation, setUserLocation] = useState(user?.location || "");

  useEffect(() => {
    let isMounted = true;
    const initLocationAndFetch = async () => {
      let loc = user?.location;
      
      // If user is logged in but location isn't stored locally, fetch it from backend
      if (user && !loc) {
        try {
          const res = await api.get("/api/auth/me");
          if (res.data?.location) {
            loc = res.data.location;
            const updatedUser = { ...user, location: loc };
            localStorage.setItem("user", JSON.stringify(updatedUser)); // Update for future
          }
        } catch (err) {
          console.error("Could not fetch user location", err);
        }
      }

      if (loc) {
        setUserLocation(loc);
        try {
          const res = await api.get(`/api/jobs?location=${encodeURIComponent(loc)}`);
          if (isMounted) {
            setSuggestedJobs(res.data.slice(0, 4));
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
        }
      }
    };
    initLocationAndFetch();
    return () => { isMounted = false; };
  }, []);

  const handleLocateMe = () => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            const city = data.address.city || data.address.town || data.address.village || data.address.county || data.address.suburb || "Local Area";
            setLocation(city);
          } catch (error) {
            console.error("Error finding location name:", error);
            setLocation("My Location"); // fallback
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

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (location) params.set("loc", location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <div className="min-h-screen text-white pb-20">

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Find the right fit, <span className="text-[#5CB144]">right now.</span>
        </h1>
        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl">
          Discover local part-time jobs and urgent shifts near you. Real opportunities matching your schedule.
        </p>

        {/* Big Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-4xl border border-white/10 rounded-3xl p-2 md:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col md:flex-row gap-3 relative z-20">

          <div className="flex-1 flex items-center rounded-2xl px-4 py-3 md:py-0 border border-transparent focus-within:border-gray-600 transition">
            <Search className="text-gray-400 mr-3 w-5 h-5" />
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">What</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Job title, keywords, or company"
                  className="w-full bg-transparent text-white focus:outline-none text-sm md:text-base placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={() => navigate('/jobs')}
                  className="ml-2 px-2 py-1 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition border border-white/5 flex items-center justify-center cursor-pointer"
                  title="Advanced Filters"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden md:block w-[1px] bg-white/10 my-2"></div>

          <div className="flex-1 flex items-center rounded-2xl px-4 py-3 md:py-0 border border-transparent focus-within:border-gray-600 transition">
            <MapPinHouse className="text-gray-400 mr-3 w-5 h-5" />
            <div className="flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Where</label>
              <div className="flex items-center">
                <LocationInput
                  value={location}
                  onChange={setLocation}
                  placeholder="Your city or neighborhood"
                  className="w-full bg-transparent text-white focus:outline-none text-sm md:text-base placeholder-gray-600"
                />
                <button
                  type="button"
                  onClick={handleLocateMe}
                  disabled={isLocating}
                  className="ml-2 px-2 py-1 text-[#5CB144] hover:text-white bg-[#5CB144]/10 hover:bg-[#5CB144]/20 rounded-lg transition border border-[#5CB144]/20 flex items-center justify-center cursor-pointer whitespace-nowrap text-xs font-bold"
                  title="Detect my location"
                >
                  {isLocating ? (
                    <span className="animate-pulse">Locating...</span>
                  ) : (
                    <div className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10zm0-7a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
                      </svg>
                      Locate
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="bg-[#5CB144] hover:bg-[#4a8f37] text-white font-bold py-4 md:py-0 px-8 rounded-2xl transition shadow-lg shadow-[#5CB144]/20 md:w-auto w-full"
          >
            Find Jobs
          </button>
        </form>

        {/* Quick Search Chips */}
        <div className="mt-8 flex flex-wrap justify-center gap-3 relative z-20">
          <span className="text-sm text-gray-400 font-medium py-2 px-1">Popular:</span>
          {["Retail", "Food Service", "Warehouse", "Delivery", "Remote", "Weekend"].map((tag) => (
            <button key={tag} onClick={() => navigate(`/jobs?q=${encodeURIComponent(tag)}`)} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-sm text-gray-300 transition backdrop-blur-md">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Jobs */}
      {user && (
        <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold">Suggested Jobs</h2>
              <p className="text-gray-400 mt-1">Based on your location: {userLocation || "Loading location..."}</p>
            </div>
            {userLocation && (
              <button onClick={() => navigate(`/jobs?loc=${encodeURIComponent(userLocation)}`)} className="text-[#5CB144] hover:text-white transition font-medium text-sm">
                View all →
              </button>
            )}
          </div>
          
          {suggestedJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {suggestedJobs.map(job => (
                <div key={job._id} onClick={() => navigate(`/jobs/${job._id}`)} className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/5 hover:border-[#5CB144]/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-[#5CB144]/10 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <h3 className="font-bold text-lg mb-1 line-clamp-2 text-white">{job.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{job.company}</p>
                  </div>
                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                    <span className="text-sm font-medium text-[#5CB144] truncate pr-2">{job.salary || "Competitive"}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{job.type}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0a0a0a] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
               <MapPinHouse className="w-12 h-12 text-[#5CB144]/50 mb-4" />
               <h3 className="text-xl font-bold text-white mb-2">No local jobs right now</h3>
               <p className="text-gray-400 max-w-md">We couldn't find any active jobs in {userLocation || "your area"} at the moment. Keep an eye out or explore other categories!</p>
               <button onClick={() => navigate('/jobs')} className="mt-6 px-6 py-2 bg-white/5 hover:bg-[#5CB144]/10 text-white hover:text-[#5CB144] rounded-full transition border border-white/10 hover:border-[#5CB144]/30 text-sm font-medium">
                 Browse all jobs
               </button>
            </div>
          )}
        </div>
      )}

      {/* Featured Categories */}
      <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10">
        <h2 className="text-2xl font-bold mb-8">Browse Categories</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <div key={idx} onClick={() => navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)} className="group relative rounded-3xl p-[1px] overflow-hidden cursor-pointer transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(92,177,68,0.3)]">

              {/* Animated Gradient Border (visible on hover) */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#5CB144] via-[#5CB144] to-[#5CB144] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"></div>

              {/* Inner Dark Card */}
              <div className="relative z-10 h-full min-h-[300px] bg-[#0a0a0a] rounded-[23px] flex flex-col justify-between border border-white/5 group-hover:border-white/10 transition-all duration-500 overflow-hidden">
                
                {/* Background Image Layer */}
                <div 
                  className="absolute inset-0 transition-all duration-700 group-hover:scale-105 opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100"
                  style={{ backgroundImage: `url(${cat.bg})`, backgroundSize: "cover", backgroundPosition: "center" }}
                ></div>

                {/* Dark Gradient Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent z-0 pointer-events-none"></div>

                {/* Top Content */}
                <div className="relative z-20 p-6 pb-0 flex-1 flex flex-col justify-end">
                  <h3 className="font-bold text-2xl mb-2 text-white group-hover:text-[#5CB144] transition-colors duration-300 drop-shadow-md">
                    {cat.name}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6 group-hover:text-white transition-colors duration-300 drop-shadow-md">
                    {cat.desc}
                  </p>
                </div>

                {/* Bottom Content / Count */}
                <div className="relative z-20 mt-auto pt-5 pb-6 px-6 border-t border-white/10 flex justify-between items-center group-hover:border-white/20 transition-colors duration-300 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-sm font-bold text-gray-400 group-hover:text-[#5CB144] transition-colors duration-300">
                    {counts[cat.name] || 0} jobs
                  </span>
                  <span className="text-[#5CB144] text-lg font-bold opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-75 drop-shadow-[0_0_10px_rgba(92,177,68,0.8)]">
                    →
                  </span>
                </div>

                {/* Hover Glow Effect Inside */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#5CB144]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Section / Prompt */}
      {!user && (
        <div className="max-w-4xl mx-auto px-6 mt-32 text-center relative z-10">
          <div className="bg-gradient-to-r from-[#5CB144]/20 via-[#5CB144]/20 to-[#5CB144]/20 rounded-3xl p-10 border border-white/10 backdrop-blur-xl">
            <h2 className="text-3xl font-bold mb-4">
              Hire instantly with Somojo <span className="text-[#5CB144]">for Employers</span>.
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Find the perfect candidates for your open roles today. Post jobs, browse resumes, and connect directly with ready-to-work professionals.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <button onClick={() => navigate("/register?role=employer")} className="bg-transparent border border-[#5CB144] hover:bg-[#5CB144]/10 text-[#5CB144] font-bold py-3 px-8 rounded-2xl transition w-full sm:w-auto">
                Post a Job - It&apos;s Free
              </button>
              <button onClick={() => navigate("/employer")} className="text-gray-400 hover:text-white font-medium py-3 px-8 rounded-2xl transition w-full sm:w-auto">
                Learn More →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
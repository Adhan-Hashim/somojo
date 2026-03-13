import { Link, useNavigate, useLocation } from "react-router-dom";
import { useThemeColor } from '../hooks/useThemeColor';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const userStr = localStorage.getItem("user");
  const user = userStr && userStr !== "undefined" ? JSON.parse(userStr) : null;
  const isEmployerContext = ["/employer", "/find-cvs", "/products", "/resources"].includes(location.pathname);
  const { themeText } = useThemeColor();
  const isEmployer = user?.role === "employer";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-10">
        <Link to={user ? (isEmployer ? "/employer" : "/home") : "/"} className={`text-2xl font-bold ${themeText} transition-colors duration-500`}>
          Somojo
        </Link>

        {isEmployerContext && isEmployer && (
          <div className="hidden lg:flex items-center space-x-6 text-sm font-semibold text-gray-400">
            <Link to="/employer" className="hover:text-white transition">Post a job</Link>
            <Link to="/find-cvs" className="hover:text-white transition">Find CVs</Link>
            <Link to="/products" className="hover:text-white transition">Products</Link>
            <Link to="/resources" className="hover:text-white transition">Resources</Link>
          </div>
        )}
      </div>

      <div className="space-x-6 font-medium text-gray-300 flex items-center">
        {user ? (
          <>
            {/* job-seeker links */}
            {!isEmployer && <Link to="/home" className="hover:text-white transition">Home</Link>}
            {!isEmployer && <Link to="/my-jobs" className="hover:text-white transition">My Jobs</Link>}
            {/* employer-specific links */}
            {isEmployer && <Link to="/employer" className={`${themeText} hover:text-white transition font-bold`}>Dashboard</Link>}

            <Link to="/profile" className="hover:text-white transition">Profile</Link>
            <div className="flex items-center gap-4 ml-6 pl-6 border-l border-white/10">
              <span className="text-sm text-gray-400 font-semibold">{user.name || user.email}</span>
              <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition text-sm bg-red-400/10 px-3 py-1.5 rounded-lg border border-red-400/20 font-bold">
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="bg-[#5CB144] hover:bg-[#4a8f37] text-white px-4 py-2 rounded-xl transition font-bold">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
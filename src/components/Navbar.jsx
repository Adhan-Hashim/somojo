import { Link, useNavigate, useLocation } from "react-router-dom";
import { useThemeColor } from '../hooks/useThemeColor';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("user");
  const isEmployerContext = ["/employer", "/find-cvs", "/products", "/resources"].includes(location.pathname);
  const { themeText } = useThemeColor();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="sticky top-0 z-50 bg-white/5 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex justify-between items-center transition-all duration-300">
      <div className="flex items-center gap-10">
        <Link to="/" className={`text-2xl font-bold ${themeText} transition-colors duration-500`}>
          Somojo
        </Link>

        {isEmployerContext && (
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
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to={user?.role === "employer" ? "/post-job" : "/employer"} className={`${themeText} hover:text-white transition font-bold`}>Employers / Post Job</Link>
            <Link to="/profile" className="hover:text-white transition">Profile</Link>
            <Link to="/my-jobs" className="hover:text-white transition">My Jobs</Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-red-300 transition">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/" className="hover:text-white transition">Home</Link>
            <Link to="/about" className="hover:text-white transition">About</Link>
            <Link to="/employer" className={`${themeText} hover:text-white transition font-bold`}>Employers / Post Job</Link>
            <Link to="/login" className="hover:text-white transition">Login</Link>
            <Link to="/register" className="hover:text-white transition">Register</Link>
          </>
        )}
      </div>
    </div>
  );
}
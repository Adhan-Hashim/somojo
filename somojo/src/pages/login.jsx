import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";
import api from "../api";

export default function Login() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "job-seeker";
  const [role, setRole] = useState(initialRole);
  const navigate = useNavigate();

  // Update the URL search param when switching roles to trigger global theme changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSearchParams(newRole === "employer" ? { role: "employer" } : {});
  };

  const { themeBg, themeText, themeBorder } = useThemeColor();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (email && password) {
      try {
        const res = await api.post('/api/auth/login', { email, password });

        if (res.data.requiresOTP) {
          setShowOTP(true);
          setIsAdminLogin(res.data.isAdmin || false);
          return;
        }

        // Store the token and user info
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (res.data.user.role === "admin") {
          navigate("/admin");
        } else if (res.data.user.role === "employer") {
          navigate("/employer");
        } else {
          navigate("/home");
        }
      } catch (err) {
        const errorMessage = err.response?.data?.message
          || (err.message === "Network Error" ? "Network error: Is the backend server running?" : "Login failed. Please check credentials.");
        alert(errorMessage);
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isAdminLogin ? '/api/auth/verify-admin-otp' : '/api/auth/verify-otp';
      const res = await api.post(endpoint, { email, otp });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else if (res.data.user.role === "employer") {
        navigate("/employer");
      } else {
        navigate("/home");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem("user", JSON.stringify({ email: "Guest User", role: "guest" }));
    navigate("/home");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Transparent Background */}

      {/* Login Card */}
      <div className="relative z-20 w-full max-w-md 
        bg-black/40 
        backdrop-blur-2xl 
        border border-white/10 
        rounded-3xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.6)] 
        p-10">

        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-center mb-8 text-white relative z-10">
          Welcome back to <span className={`${themeText} transition-colors duration-300`}>Somojo</span>
        </h2>

        <form onSubmit={handleLogin} className="space-y-6 relative z-10">

          {!showOTP ? (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              {/* Role Switcher */}
              <div className="flex bg-black/50 p-1.5 rounded-2xl mb-8 relative border border-white/5">
                <button
                  type="button"
                  onClick={() => handleRoleChange("job-seeker")}
                  className={`flex-1 py-3 px-6 text-center rounded-xl font-bold transition-all z-10 ${role === "job-seeker" ? "text-black shadow-lg" : "text-gray-400 hover:text-white"
                    }`}
                >
                  Job Seeker
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("employer")}
                  className={`flex-1 py-3 px-6 text-center rounded-xl font-bold transition-all z-10 ${role === "employer" ? "text-black shadow-lg" : "text-gray-400 hover:text-white"
                    }`}
                >
                  Employer
                </button>
                {/* Sliding Highlight Background */}
                <div
                  className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] ${themeBg} rounded-xl transition-all duration-300 ease-out`}
                  style={{ left: role === "job-seeker" ? "6px" : "calc(50% + 0px)" }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full ${themeBg} hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-lg ${themeBorder}/30 disabled:opacity-50`}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <p className="text-gray-300 text-sm">A 6-digit OTP has been sent to <span className="text-white font-bold">{email}</span></p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white text-center text-2xl tracking-widest focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                />
              </div>

              <button
                type="button"
                onClick={handleVerifyOTP}
                disabled={isLoading || otp.length < 6}
                className={`w-full ${themeBg} hover:opacity-90 text-white font-bold py-3 rounded-xl transition shadow-lg ${themeBorder}/30 disabled:opacity-50`}
              >
                {isLoading ? "Verifying..." : "Verify & Login"}
              </button>

              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="w-full bg-transparent text-gray-400 hover:text-white text-sm font-semibold transition"
              >
                ← Back to Login
              </button>
            </>
          )}

          {/* Guest Login */}
          {!showOTP && (
            <button
              type="button"
              onClick={handleGuestLogin}
              className="w-full bg-transparent hover:bg-white/5 border border-white/20 text-gray-300 font-semibold py-3 rounded-xl transition mt-4"
            >
              Continue as Guest
            </button>
          )}
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#5CB144] font-semibold hover:underline">
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}


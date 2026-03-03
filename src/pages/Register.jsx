import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";
import RolePerksTicker from "../components/RolePerksTicker";

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "student";
  const [role, setRole] = useState(initialRole);

  // Update the URL search param when switching roles to trigger global theme changes
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setSearchParams(newRole === "employer" ? { role: "employer" } : {});
  };

  const { themeBg, themeText, themeBorder } = useThemeColor();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [location, setLocation] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    if (contact && contact.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    if (email && password) {
      localStorage.setItem(
        "user",
        JSON.stringify({
          email,
          contact,
          location,
          role
        })
      );
      if (role === "employer") {
        navigate("/employer");
      } else {
        navigate("/my-jobs");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Transparent Background */}

      {/* Register Card */}
      <div className="relative z-20 w-full max-w-2xl 
        bg-black/40 
        backdrop-blur-2xl 
        border border-white/10 
        rounded-3xl 
        shadow-[0_8px_32px_rgba(0,0,0,0.6)] 
        p-10 my-10">

        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none"></div>

        <h2 className="text-3xl font-bold text-center mb-8 text-white relative z-10">
          Create your <span className={`${themeText} transition-colors duration-300`}>Somojo</span> account
        </h2>

        <form onSubmit={handleRegister} className="space-y-6 relative z-10">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Column 1 */}
            <div className="space-y-6">
              {/* Email */}
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
                />
              </div>

              {/* Password */}
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
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Register As
                </label>
                <div className="flex bg-black/50 p-1.5 rounded-2xl mb-8 relative border border-white/5">
                  <button
                    type="button"
                    onClick={() => handleRoleChange("student")}
                    className={`flex-1 py-3 px-6 text-center rounded-xl font-bold transition-all z-10 ${role === "student" ? "text-black shadow-lg" : "text-gray-400 hover:text-white"
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
                    style={{ left: role === "student" ? "6px" : "calc(50% + 0px)" }}
                  />
                </div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-6">
              {/* Contact Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Contact Number
                </label>
                <input
                  type="tel"
                  className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
                  value={contact}
                  onChange={(e) => {
                    const onlyNums = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setContact(onlyNums);
                  }}
                  pattern="\d{10}"
                  maxLength="10"
                  required
                  placeholder="e.g. 9876543210"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, India"
                />
              </div>

              {/* Role Perks Animation Container */}
              <div>
                <label className={`block text-sm font-semibold mb-2 select-none ${themeText} opacity-80 transition-colors duration-300`}>
                  What to expect
                </label>
                <div className="w-full h-[50px]">
                  <RolePerksTicker role={role} />
                </div>
              </div>
            </div>

          </div>

          {/* Dynamic Submit Button */}
          <button
            type="submit"
            className={`w-full ${themeBg} text-black font-extrabold py-4 px-8 rounded-2xl transition hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-6 text-lg relative group overflow-hidden`}
          >         Register
          </button>
        </form>

        <p className="text-gray-500 text-center mt-8 text-sm">
          Already have an account?{" "}
          <Link to={`/login${role === 'employer' ? '?role=employer' : ''}`} className={`${themeText} font-bold hover:underline`}>
            Sign in here
          </Link>
        </p>

      </div>
    </div>
  );
}
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";
import RolePerksTicker from "../components/RolePerksTicker";
import api from "../api";
import LocationInput from "../components/LocationInput";

export default function Register() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialRole = searchParams.get("role") === "employer" ? "employer" : "job-seeker";
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

  // OTP Verification State
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (requiresOTP && otpRefs.current[0]) {
      otpRefs.current[0].focus();
      setResendCooldown(30);
    }
  }, [requiresOTP]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0 && requiresOTP) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown, requiresOTP]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpArray];
    // Pasting logic
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      for (let i = 0; i < pasted.length; i++) {
        if (index + i < 6) newOtp[index + i] = pasted[i];
      }
      setOtpArray(newOtp);
      const focusIndex = Math.min(index + pasted.length, 5);
      otpRefs.current[focusIndex].focus();
      return;
    }

    newOtp[index] = value;
    setOtpArray(newOtp);

    // Auto-focus next
    if (value && index < 5) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    try {
      await api.post('/api/auth/resend-otp', { name: email.split('@')[0], email });
      setResendCooldown(30);
      alert("A new 6-digit code has been sent to your email. If you don't receive it, check the server console/logs for the OTP code.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resend OTP.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (contact && contact.length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    if (email && password) {
      try {
        const payload = {
          name: email.split('@')[0], // Generate a placeholder name from email
          email,
          password,
          role: role === "job-seeker" ? "job-seeker" : "employer",
          contact,
          location
        };

        const res = await api.post('/api/auth/register', payload);

        if (res.data.requiresOTP) {
          // Show the OTP verification screen
          setRequiresOTP(true);
        } else {
          // Legacy fallback just in case
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          if (role === "employer") navigate("/employer");
          else navigate("/home");
        }
      } catch (err) {
        console.error('Registration failed:', err);
        alert(err.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    try {
      const payload = {
        name: email.split('@')[0], // Generate a placeholder name from email
        email,
        password,
        role: role === "job-seeker" ? "job-seeker" : "employer",
        contact,
        location,
        otp: otpArray.join('')
      };

      const res = await api.post('/api/auth/verify-otp', payload);

      // Verification successful, login the user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Email verified successfully! Welcome to Somojo.");

      if (role === "employer") {
        navigate("/employer");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error('OTP Verification failed:', err);
      alert(err.response?.data?.message || 'Invalid code. Please try again.');
    } finally {
      setIsVerifying(false);
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

        {requiresOTP ? (
          <form onSubmit={handleVerifyOTP} className="space-y-6 relative z-10 text-center">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-[#5CB144]/20 rounded-full flex items-center justify-center mb-4">
                <span className="text-[#5CB144] text-3xl">✉️</span>
              </div>
              <p className="text-gray-300 text-lg mb-2">We've sent a 6-digit code to</p>
              <p className="text-white font-bold text-xl">{email}</p>
            </div>

            <div className="flex justify-center gap-3 md:gap-4 mb-6">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  ref={el => otpRefs.current[index] = el}
                  type="text"
                  maxLength="6" // To allow pasting
                  className={`w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold bg-black/40 border ${digit ? themeBorder : 'border-gray-700'} rounded-xl text-white focus:outline-none focus:ring-2 ${themeBorder} transition-all duration-300`}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otpArray.join('').length !== 6}
              className={`w-full max-w-xs mx-auto block ${themeBg} text-black font-extrabold py-4 rounded-2xl transition hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-6 text-lg disabled:opacity-50`}
            >
              {isVerifying ? "Verifying..." : "Verify & Continue"}
            </button>

            <div className="mt-8 text-sm">
              <p className="text-gray-400">
                Didn't receive the code?{" "}
                {resendCooldown > 0 ? (
                  <span className="text-gray-500">Resend in {resendCooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    className={`${themeText} font-bold hover:underline`}
                  >
                    Resend OTP
                  </button>
                )}
              </p>
            </div>
          </form>
        ) : (
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
                  <LocationInput
                    value={location}
                    onChange={setLocation}
                    className={`w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 ${themeBorder} transition-shadow duration-300`}
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
        )}

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
import { Link } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";

export default function Landing() {
    const { themeText, themeBg } = useThemeColor();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-white px-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vh] ${themeBg} opacity-[0.05] blur-[150px] rounded-full pointer-events-none`}></div>

            {/* Hero Content */}
            <div className="relative z-10 text-center max-w-4xl">
                <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter">
                    Welcome to <span className={`${themeText}`}>Somojo</span>.
                </h1>
                <p className="text-xl md:text-3xl text-gray-400 mb-12 font-medium">
                    The fastest way to find local shifts, part-time work, and hire top talent instantly.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link
                        to="/register"
                        className={`w-full md:w-auto ${themeBg} text-black font-extrabold text-xl py-5 px-12 rounded-2xl transition hover:scale-[1.05] active:scale-[0.98] shadow-[0_0_40px_rgba(92,177,68,0.4)]`}
                    >
                        Create an Account
                    </Link>
                    <Link
                        to="/login"
                        className="w-full md:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xl py-5 px-12 rounded-2xl transition hover:scale-[1.05] active:scale-[0.98] backdrop-blur-md"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </div>
    );
}

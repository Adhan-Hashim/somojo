export default function SearchingAnimation() {
    return (
        <div className="w-full h-full bg-black/40 border border-gray-700 rounded-xl overflow-hidden relative flex items-center shadow-inner">

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none z-0"></div>

            {/* Decorative Text */}
            <div className="absolute top-2 left-4 text-[10px] font-semibold text-gray-500 uppercase tracking-widest z-10">
                Searching...
            </div>

            {/* Animation Container */}
            <div className="relative w-full h-[35px] mt-3 flex items-end overflow-hidden z-10">

                {/* Ground Line */}
                <div className="absolute bottom-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#5CB144]/50 to-transparent"></div>

                {/* The "Walker" (User/Dino equivalent) */}
                <div className="absolute left-6 bottom-0 animate-bounce-slow">
                    <div className="relative text-xl">
                        🚶‍♂️
                        <div className="absolute -bottom-1 -right-1 text-[#5CB144] animate-pulse text-sm">
                            🔍
                        </div>
                    </div>
                </div>

                {/* Scrolling Environment (Obstacles/Items) */}
                <div className="absolute bottom-0 w-[200%] h-full flex items-end animate-scroll-left">

                    {/* Group 1 */}
                    <div className="flex-1 flex justify-around items-end w-full">
                        <div className="text-lg mb-1 opacity-70">🏢</div>
                        <div className="text-base mb-1 opacity-50">💼</div>
                        <div className="text-lg mb-1 opacity-80">📄</div>
                        <div className="text-xl mb-1 opacity-60">🏭</div>
                    </div>

                    {/* Group 2 (Duplicate for seamless loop) */}
                    <div className="flex-1 flex justify-around items-end w-full">
                        <div className="text-lg mb-1 opacity-70">🏢</div>
                        <div className="text-base mb-1 opacity-50">💼</div>
                        <div className="text-lg mb-1 opacity-80">📄</div>
                        <div className="text-xl mb-1 opacity-60">🏭</div>
                    </div>

                </div>

            </div>
        </div>
    );
}

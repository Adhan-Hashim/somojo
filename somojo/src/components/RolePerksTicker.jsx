import { useState, useEffect } from "react";

export default function RolePerksTicker({ role }) {
    const isEmployer = role === "employer";
    const accentColor = isEmployer ? "text-[#CF9EFF]" : "text-[#5CB144]";
    const borderColor = isEmployer ? "border-[#CF9EFF]/30" : "border-[#5CB144]/30";
    const highlightBg = isEmployer ? "bg-[#CF9EFF]/10" : "bg-[#5CB144]/10";

    const studentPerks = [
        "🎓 Flexible work schedules",
        "💸 Instant, reliable payouts",
        "🏢 Top local opportunities",
        "⚡ Fast tracked applications"
    ];

    const employerPerks = [
        "🚀 Hire talent in 24 hours",
        "✅ Verified candidate profiles",
        "📊 AI-driven smart matching",
        "⏱️ Reduce time-to-hire"
    ];

    const perks = isEmployer ? employerPerks : studentPerks;
    const [index, setIndex] = useState(0);

    // Reset ticker on role switch
    useEffect(() => {
        setIndex(0);
    }, [role]);

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % perks.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [perks.length, role]);

    return (
        <div className={`w-full h-full bg-black/40 backdrop-blur-md ${borderColor} ${highlightBg} border rounded-xl overflow-hidden relative flex items-center justify-center shadow-inner`}>
            {perks.map((perk, i) => (
                <div
                    key={perk}
                    className={`absolute w-full px-4 text-center transition-all duration-700 ease-in-out flex items-center justify-center ${i === index
                            ? "opacity-100 translate-y-0 scale-100"
                            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
                        } ${accentColor} font-semibold text-sm tracking-wide`}
                >
                    {perk}
                </div>
            ))}
        </div>
    );
}

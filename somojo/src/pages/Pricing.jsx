import { useState } from "react";
import { Link } from "react-router-dom";

export default function Pricing() {
    const [isAnnual, setIsAnnual] = useState(false);

    return (
        <div className="min-h-screen text-white pb-32 overflow-hidden relative">
            <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#5CB144] opacity-[0.05] blur-[150px] rounded-full mix-blend-screen pointer-events-none"></div>

            {/* Header */}
            <div className="pt-32 pb-16 px-6 max-w-3xl mx-auto text-center relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                    Simple pricing for <span className="text-[#5CB144]">any scale.</span>
                </h1>
                <p className="text-xl text-gray-400 mb-10">
                    Transparent pricing tailored to fit local businesses of all sizes. No hidden fees.
                </p>

                {/* Toggle */}
                <div className="inline-flex items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-full p-1 mx-auto relative cursor-pointer">
                    <div
                        className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-[#5CB144] rounded-full transition-transform duration-300 ${isAnnual ? 'translate-x-full' : ''}`}
                    ></div>
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={`relative z-10 px-8 py-2 text-sm font-semibold rounded-full transition-colors ${!isAnnual ? 'text-black' : 'text-gray-400'}`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={`relative z-10 px-8 py-2 text-sm font-semibold rounded-full transition-colors flex items-center gap-2 ${isAnnual ? 'text-black' : 'text-gray-400'}`}
                    >
                        Annually <span className={`${isAnnual ? 'text-black/60' : 'text-[#5CB144]'} text-[10px] uppercase font-bold tracking-wider`}>Save 20%</span>
                    </button>
                </div>
            </div>

            {/* Plans */}
            <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Pay Per Job */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] flex flex-col hover:border-white/20 transition-colors">
                    <h3 className="text-2xl font-bold mb-2">Pay Per Job</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Perfect for businesses making a single hire occasionally.</p>
                    <div className="mb-8">
                        <span className="text-5xl font-black">${isAnnual ? '39' : '49'}</span>
                        <span className="text-gray-500 font-medium">/post</span>
                    </div>
                    <button className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-3 rounded-full transition-colors mb-8">
                        Get Started
                    </button>
                    <ul className="space-y-4 text-sm text-gray-300 flex-1">
                        <li className="flex items-center gap-3">✓ <span>30-day active listing</span></li>
                        <li className="flex items-center gap-3">✓ <span>Basic candidate matching</span></li>
                        <li className="flex items-center gap-3">✓ <span>Email support</span></li>
                    </ul>
                </div>

                {/* Pro (Popular) */}
                <div className="bg-white/5 backdrop-blur-xl border border-[#5CB144] p-8 rounded-[32px] flex flex-col relative transform md:-translate-y-4 shadow-[0_0_40px_rgba(92,177,68,0.1)]">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#5CB144] text-black text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                        Most Popular
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Pro Subsciption</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">For growing teams constantly looking for reliable local talent.</p>
                    <div className="mb-8">
                        <span className="text-5xl font-black">${isAnnual ? '159' : '199'}</span>
                        <span className="text-gray-500 font-medium">/month</span>
                    </div>
                    <button className="w-full bg-[#5CB144] hover:bg-[#4a8f37] text-black font-bold py-3 rounded-full transition-colors mb-8 shadow-lg shadow-[#5CB144]/30">
                        Subscribe Now
                    </button>
                    <ul className="space-y-4 text-sm text-gray-200 flex-1">
                        <li className="flex items-center gap-3">✓ <span>Unlimited active listings</span></li>
                        <li className="flex items-center gap-3">✓ <span>AI-driven premium matching</span></li>
                        <li className="flex items-center gap-3">✓ <span>Sponsored job boost included</span></li>
                        <li className="flex items-center gap-3">✓ <span>Priority 24/7 support</span></li>
                    </ul>
                </div>

                {/* Enterprise */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] flex flex-col hover:border-white/20 transition-colors">
                    <h3 className="text-2xl font-bold mb-2">Enterprise</h3>
                    <p className="text-gray-400 text-sm mb-6 h-10">Custom solutions for heavy volume agencies or franchises.</p>
                    <div className="mb-8">
                        <span className="text-5xl font-black">Custom</span>
                    </div>
                    <button className="w-full bg-transparent hover:bg-white/5 border border-gray-600 text-white font-bold py-3 rounded-full transition-colors mb-8">
                        Contact Sales
                    </button>
                    <ul className="space-y-4 text-sm text-gray-300 flex-1">
                        <li className="flex items-center gap-3">✓ <span>Everything in Pro</span></li>
                        <li className="flex items-center gap-3">✓ <span>Dedicated Account Manager</span></li>
                        <li className="flex items-center gap-3">✓ <span>Custom integrations & API</span></li>
                        <li className="flex items-center gap-3">✓ <span>Volume pricing</span></li>
                    </ul>
                </div>
            </div>

            <div className="mt-20 text-center relative z-10">
                <Link to="/" className="text-gray-500 hover:text-white transition-colors">← Back to home</Link>
            </div>
        </div>
    );
}

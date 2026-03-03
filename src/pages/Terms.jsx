import { Link } from "react-router-dom";

export default function Terms() {
    return (
        <div className="min-h-screen text-white pb-32">
            <div className="max-w-7xl mx-auto px-6 pt-32 flex flex-col lg:flex-row gap-16 relative z-10">

                {/* Legal Sidebar */}
                <div className="lg:w-1/4 flex-shrink-0">
                    <div className="sticky top-32">
                        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">Legal Center</h2>
                        <nav className="flex flex-col space-y-2">
                            <Link to="/privacy" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="px-6 py-3 rounded-xl bg-[#CF9EFF]/10 text-[#CF9EFF] font-bold border border-[#CF9EFF]/30 transition-colors">Terms of Service</Link>
                            <Link to="/cookies" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Cookie Policy</Link>
                        </nav>
                        <div className="mt-12">
                            <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Home</Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:w-3/4 max-w-3xl pt-2">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Terms of <span className="text-[#CF9EFF]">Service</span></h1>
                    <p className="text-gray-400 mb-12 border-b border-white/10 pb-8">
                        Effective Date: January 1, 2026<br />
                        Last Updated: February 28, 2026
                    </p>

                    <div className="space-y-12 text-gray-300 leading-relaxed text-lg">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                            <p className="mb-4">
                                By accessing or using the Somojo website, mobile application, or any related services, you agree
                                to be bound by these Terms of Service. If you do not agree to all the terms and conditions,
                                you may not access or use our platform.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
                            <p className="mb-4">
                                Somojo is a digital marketplace connecting local talent (Candidates) with businesses seeking
                                part-time, full-time, or hourly shift workers (Employers). We do not act as an employer or
                                employment agency for Candidates.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. User Obligations</h2>
                            <h3 className="text-xl font-bold text-[#CF9EFF] mb-2 mt-6">A. Candidates</h3>
                            <p className="mb-4 text-gray-400">
                                Candidates must provide accurate, current, and complete information regarding their skills,
                                experience, and availability. Plagiarism or falsification of resumes is strictly prohibited.
                            </p>

                            <h3 className="text-xl font-bold text-[#CF9EFF] mb-2 mt-6">B. Employers</h3>
                            <p className="mb-4 text-gray-400">
                                Employers must post legitimate, verifiable job opportunities. Discriminatory, offensive, or
                                illegal job postings will result in immediate account termination. Employers agree to comply with
                                all applicable local, regional, and national labor laws.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Platform Fees</h2>
                            <p className="mb-4">
                                Access for Candidates is free. Employers are subject to fees as outlined in our Pricing page.
                                Subscription fees are billed in advance and are non-refundable unless legally required.
                            </p>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}

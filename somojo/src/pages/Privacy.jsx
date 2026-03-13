import { Link } from "react-router-dom";

export default function Privacy() {
    return (
        <div className="min-h-screen text-white pb-32">
            <div className="max-w-7xl mx-auto px-6 pt-32 flex flex-col lg:flex-row gap-16 relative z-10">

                {/* Legal Sidebar */}
                <div className="lg:w-1/4 flex-shrink-0">
                    <div className="sticky top-32">
                        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">Legal Center</h2>
                        <nav className="flex flex-col space-y-2">
                            <Link to="/privacy" className="px-6 py-3 rounded-xl bg-[#5CB144]/10 text-[#5CB144] font-bold border border-[#5CB144]/30 transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Terms of Service</Link>
                            <Link to="/cookies" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Cookie Policy</Link>
                        </nav>
                        <div className="mt-12">
                            <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Home</Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:w-3/4 max-w-3xl pt-2">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Privacy <span className="text-[#5CB144]">Policy</span></h1>
                    <p className="text-gray-400 mb-12 border-b border-white/10 pb-8">
                        Effective Date: January 1, 2026<br />
                        Last Updated: February 28, 2026
                    </p>

                    <div className="space-y-12 text-gray-300 leading-relaxed text-lg">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
                            <p className="mb-4">
                                At Somojo Inc. ("Somojo", "we", "us", or "our"), privacy is a cornerstone of the trust you place in us.
                                We are committed to protecting the privacy of our candidates and employers. This Privacy Policy describes
                                our practices regarding the information we collect through our platform, application, and related services.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
                            <h3 className="text-xl font-bold text-[#5CB144] mb-2 mt-6">A. Information you provide to us</h3>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Account data (Name, Email, Phone, Passwords)</li>
                                <li>Profile data (Resumes, Job History, Skills, Location)</li>
                                <li>Employer data (Company details, Tax ID, Payment info)</li>
                            </ul>

                            <h3 className="text-xl font-bold text-[#5CB144] mb-2 mt-6">B. Information collected automatically</h3>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Device and usage information (IP address, Browser type, OS)</li>
                                <li>Location data (If granted permission for localized job matching)</li>
                                <li>Interaction data (Jobs clicked, search queries, session duration)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Data</h2>
                            <p className="mb-4">We do not sell your personal data. We use the information we collect to:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400">
                                <li>Provide, maintain, and improve the Somojo platform.</li>
                                <li>Match candidates with highly relevant local jobs using our AI systems.</li>
                                <li>Process payments for employer subscriptions and job boosting.</li>
                                <li>Ensure platform security, prevent fraud, and enforce our Terms of Service.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">4. Contact Us</h2>
                            <p>
                                If you have any questions about this Privacy Policy, please contact our Data Protection Officer at
                                <a href="mailto:privacy@somojo.com" className="text-[#5CB144] hover:underline ml-2">privacy@somojo.com</a>.
                            </p>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}

import { Link } from "react-router-dom";

export default function Cookies() {
    return (
        <div className="min-h-screen text-white pb-32">
            <div className="max-w-7xl mx-auto px-6 pt-32 flex flex-col lg:flex-row gap-16 relative z-10">

                {/* Legal Sidebar */}
                <div className="lg:w-1/4 flex-shrink-0">
                    <div className="sticky top-32">
                        <h2 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-6">Legal Center</h2>
                        <nav className="flex flex-col space-y-2">
                            <Link to="/privacy" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Privacy Policy</Link>
                            <Link to="/terms" className="px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors">Terms of Service</Link>
                            <Link to="/cookies" className="px-6 py-3 rounded-xl bg-orange-500/10 text-orange-400 font-bold border border-orange-500/30 transition-colors">Cookie Policy</Link>
                        </nav>
                        <div className="mt-12">
                            <Link to="/" className="text-gray-500 hover:text-white text-sm transition-colors">← Back to Home</Link>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:w-3/4 max-w-3xl pt-2">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Cookie <span className="text-orange-400">Policy</span></h1>
                    <p className="text-gray-400 mb-12 border-b border-white/10 pb-8">
                        Effective Date: January 1, 2026<br />
                        Last Updated: February 28, 2026
                    </p>

                    <div className="space-y-12 text-gray-300 leading-relaxed text-lg">
                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">1. What Are Cookies?</h2>
                            <p className="mb-4">
                                Cookies are small pieces of text sent to your web browser by a website you visit. A cookie file is stored
                                in your web browser and allows the Service or a third party to recognize you, making your next visit easier
                                and the Service more useful to you.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">2. How Somojo Uses Cookies</h2>
                            <p className="mb-4">When you access or use Somojo, we place a minimal number of cookies files in your browser. We use them for:</p>
                            <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-4">
                                <li><strong>Essential Functions:</strong> Preserving your login session securely (e.g., local storage tokens).</li>
                                <li><strong>Preferences:</strong> Remembering your theme choices (dark mode) and role selection (Student vs Employer).</li>
                                <li><strong>Analytics:</strong> Tracking general, aggregated usage trends to improve our AI matching algorithms.</li>
                            </ul>
                            <div className="bg-orange-500/10 border border-orange-500/30 p-6 rounded-2xl text-orange-300 mt-6 md:text-base text-sm">
                                <strong>Note:</strong> Somojo actively chooses <em>not</em> to deploy invasive, cross-site tracking cookies commonly used by advertising networks. Your data stays with us.
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold text-white mb-4">3. Your Choices Regarding Cookies</h2>
                            <p className="mb-4 text-gray-400">
                                If you'd like to delete cookies or instruct your browser to delete or refuse cookies, please visit the help
                                pages of your web browser. Note that if you delete cookies or refuse to accept them, you might not be able to
                                use all of the features we offer, such as staying logged in automatically.
                            </p>
                        </section>
                    </div>
                </div>

            </div>
        </div>
    );
}

import { useState } from "react";

export default function EmployerResources() {
    const [activeCategory, setActiveCategory] = useState("What's New");

    const navStructure = [
        {
            title: "Using Somojo",
            links: ["What's New", "Using Somojo"]
        },
        {
            title: "Finding employees",
            links: ["Finding employees", "Recruitment", "Job descriptions"]
        },
        {
            title: "Hiring process",
            links: ["Hiring process", "Candidate screening & vetting", "Employee onboarding", "How to hire employees", "Interview process", "Job interview questions"]
        },
        {
            title: "Workforce management",
            links: ["Workforce management", "Employee benefits & perks", "Employee compensation", "HR policies", "Leadership & team management", "Company culture"]
        },
        {
            title: "Managing your business",
            links: ["Managing your business", "Business regulations", "Business terms", "Growing your business"]
        }
    ];

    const articles = [
        // Using Somojo
        { cat: "What's New", title: "Somojo unveils new Smart Interview tooling for Q3", img: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Using Somojo", title: "How to maximize your employer page visibility", img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },

        // Finding employees
        { cat: "Finding employees", title: "Where are the retail workers hiding in 2026?", img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Recruitment", title: "Strategies for high-volume recruitment", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Job descriptions", title: "How to write a Job Description that actually converts", img: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },

        // Hiring process
        { cat: "Job interview questions", title: "15 Interview Questions to assess reliability", img: "https://images.unsplash.com/photo-1573167246146-512c1b52a65d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Employee onboarding", title: "First Day Checklist for Shift Workers", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Candidate screening & vetting", title: "Background checks: What you need to know locally", img: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },

        // Workforce management
        { cat: "Company culture", title: "Building a culture of trust with part-time staff", img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Employee benefits & perks", title: "Which perks do Gen Z shift workers actually care about?", img: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "HR policies", title: "Drafting an attendance policy that is fair and strict", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },

        // Managing your business
        { cat: "Business regulations", title: "Understanding the new 2026 local wage mandates", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
        { cat: "Growing your business", title: "How to safely scale from 1 to 5 retail locations", img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" }
    ];

    const visibleArticles = articles.filter(a => a.cat === activeCategory);

    return (
        <div className="min-h-screen text-white pb-20">
            {/* Header Hero */}
            <div className="bg-white/5 border-b border-[#5CB144]/20 pt-24 pb-20 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-[#5CB144]/5 to-transparent pointer-events-none"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10 pt-10">
                    <p className="text-[#CF9EFF] font-bold tracking-widest uppercase mb-4">Resource Center</p>
                    <h1 className="text-5xl md:text-6xl font-bold mb-6">
                        Expert insights to build your team
                    </h1>
                    <p className="text-xl text-gray-400">
                        Guides, articles, and templates completely free for Somojo Employers.
                    </p>
                </div>
            </div>

            {/* Sub Navbar with Nested Dropdowns */}
            <div className="border-b border-white/10 sticky top-[73px] bg-[#0a0a0a]/90 backdrop-blur-xl z-30">
                <div className="max-w-7xl mx-auto px-6 flex flex-wrap gap-x-2">
                    {navStructure.map((category) => {
                        const isCategoryActive = category.links.includes(activeCategory);
                        return (
                            <div key={category.title} className="group relative">
                                <button className={`font-semibold py-5 px-6 transition-colors duration-300 flex items-center gap-2 border-b-2 ${isCategoryActive ? 'border-[#5CB144] text-[#5CB144]' : 'border-transparent text-gray-400 hover:text-white'}`}>
                                    {category.title}
                                    {/* Chevron icon */}
                                    <svg className={`w-4 h-4 transition-transform duration-300 group-hover:rotate-180 ${isCategoryActive ? 'text-[#5CB144]' : 'text-gray-500 group-hover:text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </button>

                                {/* Absolute Nav Dropdown overlay */}
                                <div className="absolute top-full left-0 hidden group-hover:block pt-2 w-72 z-40">
                                    <div className="bg-[#111] border border-white/10 rounded-2xl shadow-xl overflow-hidden py-3 backdrop-blur-3xl transform opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {category.links.map(link => (
                                            <button
                                                key={link}
                                                onClick={() => setActiveCategory(link)}
                                                className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors ${activeCategory === link ? 'bg-[#5CB144]/10 text-[#5CB144]' : 'text-gray-300 hover:bg-white/5 hover:text-white'}`}
                                            >
                                                {link}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content Display */}
            <div className="max-w-6xl mx-auto px-6 mt-16 relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[400px]">

                {/* Section Title Heading */}
                <div className="col-span-full border-b border-white/10 pb-4 mb-4">
                    <h2 className="text-3xl font-bold">{activeCategory}</h2>
                </div>

                {/* Article Cards */}
                {visibleArticles.length > 0 ? (
                    visibleArticles.map((article, idx) => (
                        <div key={idx} className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:border-[#CF9EFF]/50 transition-colors group cursor-pointer flex flex-col">
                            <div className="h-48 overflow-hidden">
                                <img src={article.img} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <p className="text-xs font-bold text-[#CF9EFF] uppercase tracking-widest mb-3">{article.cat}</p>
                                <h3 className="text-xl font-bold mb-4 flex-1">{article.title}</h3>
                                <p className="text-gray-400 text-sm font-semibold group-hover:text-[#CF9EFF] transition-colors">Read Article →</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 bg-white/5 rounded-3xl border border-white/5 text-center text-gray-500">
                        <div className="text-6xl mb-4">📚</div>
                        <p className="text-2xl font-bold text-white mb-2">No articles found</p>
                        <p className="text-lg">We are currently writing more resources for <strong>"{activeCategory}"</strong>. Check back soon!</p>
                    </div>
                )}

            </div>
        </div>
    );
}

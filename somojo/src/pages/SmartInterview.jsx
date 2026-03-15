import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";

export default function SmartInterview() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Using default or URL params for company and role
    const company = searchParams.get('company') || "Somojo Tech";
    const jobRole = searchParams.get('role') || "Software Engineer";

    const [messages, setMessages] = useState([
        { role: 'model', parts: [{ text: `Hi there! I'm the AI Recruiter for ${company}. We're excited to learn more about you for the ${jobRole} position. To start off, could you tell me a little bit about your background?` }] }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', parts: [{ text: input }] };
        const newMessages = [...messages, userMsg];

        setMessages(newMessages);
        setInput("");
        setIsLoading(true);

        try {
            const res = await api.post('/api/interview/chat', {
                messages: newMessages,
                company,
                jobRole
            });

            setMessages([...newMessages, { role: 'model', parts: [{ text: res.data.reply }] }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages([...newMessages, { role: 'model', parts: [{ text: "I'm sorry, I'm having trouble connecting to the server. Please try again." }] }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/90 text-white flex flex-col pt-24 px-4 md:px-0">
            <div className="max-w-3xl w-full mx-auto flex-grow flex flex-col bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl mb-8 backdrop-blur-xl">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#CF9EFF]/20 to-transparent p-6 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-[#CF9EFF]">Smart Interview</h1>
                        <p className="text-sm text-gray-400">Position: {jobRole} at {company}</p>
                    </div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-gray-400 hover:text-white transition"
                    >
                        Exit
                    </button>
                </div>

                {/* Chat Area */}
                <div className="flex-grow p-6 overflow-y-auto space-y-6" style={{ maxHeight: '60vh' }}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user'
                                    ? 'bg-[#CF9EFF] text-black rounded-tr-sm shadow-lg shadow-[#CF9EFF]/20'
                                    : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm'
                                    }`}
                            >
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 text-gray-400 border border-white/5 rounded-2xl rounded-tl-sm p-4 flex gap-2 items-center">
                                <div className="w-2 h-2 bg-[#CF9EFF] rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-[#CF9EFF] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-2 h-2 bg-[#CF9EFF] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-black/40 border-t border-white/10">
                    <form onSubmit={handleSend} className="flex gap-4">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            placeholder="Type your response..."
                            className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#CF9EFF] disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="bg-[#CF9EFF] hover:bg-[#b880f0] text-black font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-[#CF9EFF]/20 disabled:opacity-50"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

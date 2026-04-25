import React, { useState, useRef, useEffect } from 'react';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const SYSTEM_PROMPT = `You are CHETAK_CORE, an advanced AI disaster management assistant for the CHETAK emergency response system in India. Your role is to:

1. Provide real-time disaster preparedness guidance and safety protocols
2. Offer emergency response instructions for earthquakes, floods, cyclones, heatwaves, landslides, and other natural disasters
3. Share survival tips, evacuation procedures, and first-aid information
4. Help users understand disaster alerts and their severity levels
5. Provide information about emergency helpline numbers in India (NDRF, SDRF, 112, 108, 1070, etc.)
6. Assist with disaster risk assessment for different Indian states and regions

IMPORTANT FORMATTING RULES:
- Keep responses concise and use clear formatting
- Use short, punchy sentences appropriate for an emergency system
- Structure responses with clear sections when providing multi-part information
- Always prioritize life-safety information
- If asked about non-disaster topics, briefly answer but redirect to your core mission
- End critical responses with relevant emergency numbers

You speak in a direct, authoritative, yet helpful style.`;

export default function AITerminal({ onHome, onProfile }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'System ready. I am the intelligence core for CHETAK protocols. Data archives are currently synchronized. State your directive or request analysis of recent disaster data.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: 'user', content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const apiMessages = [
        { role: 'system', content: SYSTEM_PROMPT },
        ...updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      ];

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'HTTP-Referer': window.location.href, // Optional but recommended by OpenRouter
          'X-Title': 'CHETAK Disaster Alert System', // Optional but recommended
        },
        body: JSON.stringify({
          // Switching to gpt-oss-120b:free for requested model
          model: 'openai/gpt-oss-120b:free', 
          messages: apiMessages,
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage = data.choices?.[0]?.message?.content || 'ERROR: NO RESPONSE FROM CORE.';

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('OpenAI API error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠ SYSTEM ERROR: ${error.message}\n\nConnection interrupted. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="absolute inset-0 w-screen min-h-screen z-0 bg-[#010e06] text-[#f0fdf4] font-body selection:bg-[#4ade80] selection:text-[#010e06] overflow-hidden flex flex-col relative">
      {/* Immersive Organic Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#134529] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-[#0a2916] rounded-full mix-blend-screen filter blur-[250px] opacity-30 pointer-events-none z-0"></div>

      {/* Top Header */}
      <header className="relative z-50 w-full bg-white/[0.02] backdrop-blur-3xl border-b border-white/5 flex justify-between items-center px-8 md:px-12 py-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center border border-[#4ade80]/20">
            <span className="material-symbols-outlined text-[#4ade80]">smart_toy</span>
          </div>
          <h1 className="text-white font-headline text-xl font-bold tracking-[0.1em] uppercase">Intelligence Core</h1>
        </div>
        <div className="flex items-center gap-3 bg-white/5 rounded-full px-4 py-2 border border-white/10">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-[#ffb4ab]' : 'bg-[#4ade80]'} animate-pulse shadow-[0_0_10px_currentColor]`}></div>
          <span className="font-headline text-[10px] tracking-[0.2em] text-white/70 uppercase hidden md:inline">
            {isLoading ? 'Processing' : 'Secure Uplink'}
          </span>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="relative z-10 flex-1 w-full max-w-4xl mx-auto overflow-y-auto custom-scrollbar px-6 md:px-12 pt-8 pb-48">
        
        {/* Intro Message */}
        <div className="flex justify-center mb-12">
          <div className="text-center space-y-3 bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-3xl py-6 px-10">
            <span className="material-symbols-outlined text-[#4ade80]/50 text-4xl mb-2">park</span>
            <p className="font-headline text-sm tracking-[0.3em] text-[#a7f3d0]/70 uppercase">Global Monitoring Active</p>
            <p className="font-body text-xs text-white/40">Powered by CHETAK Environmental AI</p>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-8">
          {messages.map((msg, index) =>
            msg.role === 'assistant' ? (
              /* AI Message */
              <div key={index} className="flex items-start gap-4 md:gap-6 animate-fade-in-up">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#051f11] to-[#134529] flex items-center justify-center shrink-0 border border-[#4ade80]/20 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                  <span className="material-symbols-outlined text-[#4ade80] text-lg md:text-xl">eco</span>
                </div>
                <div className="flex flex-col gap-2 max-w-[85%] md:max-w-[75%]">
                  <span className="font-headline text-[10px] tracking-[0.2em] text-[#a7f3d0]/60 uppercase ml-2">CHETAK Core</span>
                  <div className="bg-white/[0.03] backdrop-blur-2xl p-6 md:p-8 rounded-3xl rounded-tl-sm border border-white/10 shadow-lg relative overflow-hidden group">
                    {/* Decorative glow */}
                    <div className="absolute top-0 left-0 w-32 h-32 bg-[#4ade80]/5 rounded-full filter blur-3xl transform -translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-[#4ade80]/10 transition-colors duration-700"></div>
                    <div className="font-body text-sm md:text-base leading-relaxed text-white/90 whitespace-pre-wrap relative z-10 font-light">
                      {msg.content}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* User Message */
              <div key={index} className="flex justify-end animate-fade-in-up">
                <div className="flex flex-col items-end gap-2 max-w-[85%] md:max-w-[75%]">
                  <span className="font-headline text-[10px] tracking-[0.2em] text-white/40 uppercase mr-2">User Query</span>
                  <div className="bg-[#4ade80] text-[#010e06] px-6 md:px-8 py-4 md:py-5 rounded-3xl rounded-tr-sm shadow-[0_0_30px_rgba(74,222,128,0.15)]">
                    <p className="font-body text-sm md:text-base font-medium leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-4 md:gap-6 animate-fade-in-up">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-[#051f11] to-[#134529] flex items-center justify-center shrink-0 border border-[#4ade80]/20">
                <span className="material-symbols-outlined text-[#4ade80] text-lg md:text-xl">eco</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="font-headline text-[10px] tracking-[0.2em] text-[#a7f3d0]/60 uppercase ml-2">CHETAK Core</span>
                <div className="bg-white/[0.03] backdrop-blur-2xl px-8 py-6 rounded-3xl rounded-tl-sm border border-white/10 shadow-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#4ade80]/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[#4ade80]/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[#4ade80]/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-24 left-0 w-full px-6 md:px-12 z-40 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative bg-[#021209]/80 backdrop-blur-3xl border border-white/10 rounded-full shadow-2xl p-2 flex items-center transition-all duration-300 focus-within:bg-[#021209]/90 focus-within:border-[#4ade80]/30 focus-within:shadow-[0_0_40px_rgba(74,222,128,0.1)]">
            <span className="material-symbols-outlined text-white/30 ml-4">chevron_right</span>
            <input 
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              className="bg-transparent border-none focus:ring-0 text-white font-body text-base w-full px-4 py-3 placeholder:text-white/30 focus:outline-none disabled:opacity-50" 
              placeholder={isLoading ? "Analyzing data streams..." : "Ask about disaster readiness, protocols, or evacuation..."} 
              type="text"
            />
            <button 
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="flex items-center justify-center bg-[#4ade80] text-[#010e06] w-12 h-12 rounded-full hover:bg-white hover:scale-105 transition-all disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-[#4ade80] shrink-0 ml-2"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modern Floating Pill Navigation */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#021209]/80 backdrop-blur-3xl border border-white/20 rounded-full px-4 py-3 flex items-center gap-2 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50">
        <button 
          className="flex items-center justify-center bg-[#a7f3d0] text-[#021209] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(167,243,208,0.3)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-[24px]">smart_toy</span>
        </button>
        
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        
        <button 
          onClick={onHome}
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
          title="Home"
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
        </button>
        
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        
        <button 
          onClick={onProfile} 
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
          title="Profile"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
        </button>
      </nav>

      {/* Global Style additions */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}

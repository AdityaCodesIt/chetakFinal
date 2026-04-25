import React from 'react';

export default function ChetakAccountProfileFixed({ onHome, onAI, onSignOut, formData, authUser }) {
  
  return (
    <div className="absolute inset-0 w-screen min-h-screen z-0 bg-[#010e06] text-[#f0fdf4] font-body selection:bg-[#4ade80] selection:text-[#010e06] overflow-x-hidden flex flex-col relative">
      {/* Immersive Organic Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#134529] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-[#0a2916] rounded-full mix-blend-screen filter blur-[250px] opacity-30 pointer-events-none z-0"></div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full h-screen overflow-y-auto custom-scrollbar pb-40 px-6 md:px-12 pt-12 md:pt-20">
        
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-16">
            <button 
              onClick={onHome} 
              className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </div>
              <span className="font-headline tracking-[0.2em] uppercase text-sm">BACK TO FEED</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold tracking-[0.2em] font-headline uppercase text-[#4ade80]">CHETAK</span>
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#4ade80]/5 rounded-full filter blur-[100px] transform translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

            <div className="p-8 md:p-16 relative z-10">
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 border-b border-white/10 pb-12">
                <div className="flex items-center gap-6 md:gap-8">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-[#134529] to-[#051f11] border border-[#4ade80]/20 flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.15)] shrink-0">
                    <span className="material-symbols-outlined text-5xl md:text-6xl text-[#4ade80]">account_circle</span>
                  </div>
                  <div>
                    <h1 className="font-headline text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-3 leading-none">
                      {formData?.full_name || 'USER_UNKNOWN'}
                    </h1>
                    <span className="bg-[#4ade80]/10 text-[#a7f3d0] border border-[#4ade80]/20 px-4 py-1.5 rounded-full font-headline text-[10px] tracking-widest uppercase inline-block shadow-sm">
                      Registered Citizen
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
                
                {/* Email */}
                <div className="bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2 text-white/40">
                    <span className="material-symbols-outlined text-lg">mail</span>
                    <span className="font-headline text-[10px] uppercase tracking-widest">Primary Email</span>
                  </div>
                  <span className="font-body text-lg md:text-xl text-white font-medium truncate">
                    {formData?.email || authUser?.email || 'N/A'}
                  </span>
                </div>

                {/* Contact */}
                <div className="bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col gap-2 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3 mb-2 text-white/40">
                    <span className="material-symbols-outlined text-lg">call</span>
                    <span className="font-headline text-[10px] uppercase tracking-widest">Contact Number</span>
                  </div>
                  <span className="font-body text-lg md:text-xl text-white font-medium">
                    {formData?.phone_number || 'N/A'}
                  </span>
                </div>

                {/* Location */}
                <div className="md:col-span-2 bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col gap-2 hover:bg-white/5 transition-colors relative overflow-hidden">
                  <span className="material-symbols-outlined absolute right-[-5%] top-[-10%] text-9xl text-white/5 pointer-events-none">my_location</span>
                  <div className="flex items-center gap-3 mb-2 text-[#4ade80]/70">
                    <span className="material-symbols-outlined text-lg">location_on</span>
                    <span className="font-headline text-[10px] uppercase tracking-widest">Registered Location</span>
                  </div>
                  <span className="font-headline text-2xl md:text-3xl text-white font-bold tracking-tight mt-2">
                    {formData?.region ? `${formData.region}, ` : ''}{formData?.state || 'UNKNOWN STATE'}, {formData?.country || 'INDIA'} {formData?.pin ? `[${formData.pin}]` : ''}
                  </span>
                </div>

                {/* System Locale */}
                <div className="md:col-span-2 bg-black/20 rounded-3xl p-6 md:p-8 border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center gap-3 mb-2 text-white/40">
                      <span className="material-symbols-outlined text-lg">translate</span>
                      <span className="font-headline text-[10px] uppercase tracking-widest">Preferred Language</span>
                    </div>
                    <span className="font-body text-xl text-white font-medium uppercase">
                      {formData?.detected_locale || 'AUTO-DETECT'}
                    </span>
                    {formData?.emergency_override_english && (
                      <span className="block mt-2 text-xs text-yellow-500/80 font-body uppercase tracking-widest flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">warning</span>
                        English Override Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Sign Out Section */}
              <div className="pt-12 border-t border-white/10 flex justify-center md:justify-start">
                <button 
                  onClick={onSignOut}
                  className="bg-transparent border border-[#ff4444]/30 text-[#ff4444] hover:bg-[#ff4444] hover:text-white rounded-full px-8 py-4 font-headline text-sm font-bold tracking-[0.2em] uppercase transition-all duration-300 flex items-center gap-3 shadow-sm"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Sign Out Securely
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Modern Floating Pill Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#021209]/80 backdrop-blur-3xl border border-white/20 rounded-full px-4 py-3 flex items-center gap-2 shadow-2xl z-50">
        <button 
          onClick={onAI}
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
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
          className="flex items-center justify-center bg-[#a7f3d0] text-[#021209] w-14 h-14 rounded-full shadow-[0_0_20px_rgba(167,243,208,0.3)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          title="Profile"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
        </button>
      </nav>

      {/* Custom Scrollbar Styles */}
      <style>{`
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

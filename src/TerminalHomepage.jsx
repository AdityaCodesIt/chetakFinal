import React, { useEffect, useState } from 'react';
import { fetchDisasterAlerts } from './disasterService.js';

export default function TerminalHomepage({ onAlertClick, onAIClick, onProfileClick, userCountry, userState, userRegion, userLocale }) {
  const [alerts, setAlerts] = useState([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);

  // --- TRANSLATION SYSTEM ---
  const [activeLang, setActiveLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedAlerts, setTranslatedAlerts] = useState({});

  async function translateText(text, targetLangCode) {
    if (!text) return '';
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      return data[0].map(x => x[0]).join('');
    } catch (e) {
      console.error('Translation failed', e);
      return text;
    }
  }

  const handleTranslate = async () => {
    if (activeLang !== 'en') return;
    
    const userLangCodeMatch = userLocale ? userLocale.match(/\(([A-Z]{2,3})\)/i) : null;
    const targetLangCode = userLangCodeMatch ? userLangCodeMatch[1].toLowerCase() : 'hi';
    
    setIsTranslating(true);
    
    const newTranslations = { ...translatedAlerts };
    for (const alert of alerts) {
      if (!newTranslations[alert.id]) {
        const tTitle = await translateText(alert.title, targetLangCode);
        const tDesc = await translateText(alert.description, targetLangCode);
        newTranslations[alert.id] = { title: tTitle, description: tDesc };
      }
    }
    
    setTranslatedAlerts(newTranslations);
    setActiveLang(targetLangCode);
    setIsTranslating(false);
  };

  const handleRevert = () => {
    setActiveLang('en');
  };

  // --- FETCH DISASTER ALERTS ---
  useEffect(() => {
    async function loadAlerts() {
      setLoadingAlerts(true);
      try {
        const data = await fetchDisasterAlerts(userCountry, userState, userRegion);
        setAlerts(data);
      } catch (err) {
        console.error('Failed to load alerts:', err);
      }
      setLoadingAlerts(false);
    }
    loadAlerts();
  }, [userCountry, userState, userRegion]);

  return (
    <div className="bg-[#010e06] text-[#f0fdf4] font-body selection:bg-[#4ade80] selection:text-[#010e06] overflow-hidden min-h-screen w-screen flex flex-col lg:flex-row relative">
      {/* Immersive Organic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#134529] rounded-full mix-blend-screen filter blur-[150px] opacity-30 pointer-events-none z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-[#0a2916] rounded-full mix-blend-screen filter blur-[200px] opacity-40 pointer-events-none z-0"></div>

      {/* Left Panel - Sticky/Fixed Info & Typography */}
      <div className="relative z-10 w-full lg:w-[40%] xl:w-[35%] h-auto lg:h-screen p-8 md:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-white/5 bg-black/20 backdrop-blur-3xl overflow-y-auto custom-scrollbar shadow-2xl">
        
        <div>
          {/* Header row */}
          <div className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#4ade80] text-3xl">eco</span>
              <span className="text-xl font-bold tracking-[0.2em] font-headline uppercase">CHETAK</span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleTranslate}
                disabled={isTranslating}
                className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 ${activeLang !== 'en' ? 'bg-white text-[#021209] font-bold shadow-lg shadow-white/20' : 'border border-white/20 text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                {isTranslating ? '...' : (userLocale ? `TR: ${userLocale.split(' ')[0]}` : 'TRANSLATE')}
              </button>
              <button 
                onClick={handleRevert}
                className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full transition-all duration-300 ${activeLang === 'en' ? 'bg-white text-[#021209] font-bold shadow-lg shadow-white/20' : 'border border-white/20 text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                EN
              </button>
            </div>
          </div>

          {/* Huge Hero Typography */}
          <div className="mb-16 relative">
            <h1 className="font-headline text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.9] text-white tracking-tighter mix-blend-plus-lighter">
              REAL-TIME
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ade80] to-[#a7f3d0] italic font-normal">ALERTS</span>
            </h1>
            <p className="mt-8 text-white/50 text-sm md:text-base max-w-sm font-light leading-relaxed">
              Global monitoring active. Status: OPERATIONAL. Data-streams: 0x228, 0x441, 0x992. Continuous feed tailored for your region.
            </p>
          </div>
        </div>

        {/* System Status Footer incorporated into the side panel */}
        <div className="flex flex-col gap-6 mt-12 lg:mt-0">
          <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full filter blur-2xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-[#4ade80]/10 transition-colors duration-700 pointer-events-none"></div>
            <div className="relative z-10">
              <span className="text-[10px] text-[#4ade80] tracking-widest uppercase mb-2 block font-semibold">Sensory Network</span>
              <h2 className="font-headline text-2xl font-medium text-white mb-3">Global Canopy Synced</h2>
              <p className="font-body text-white/60 text-xs leading-relaxed mb-6">
                Atmospheric and terrestrial sensors are continuously gathering ecological shifts. Select any disturbance below for deep-analysis and regional translation.
              </p>
              <div className="flex gap-2 flex-wrap">
                {['SEISMIC: GREEN', 'ATMOSPHERIC: GREEN', 'HYDROLOGY: GREEN'].map(src => (
                  <span key={src} className="text-[9px] tracking-wider text-[#a7f3d0] bg-[#4ade80]/10 px-3 py-1.5 rounded-full backdrop-blur-sm border border-[#4ade80]/20">
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-[#051f11] to-[#021209] rounded-3xl p-8 border border-[#4ade80]/20 shadow-xl relative overflow-hidden flex flex-col justify-between items-start">
             <span className="bg-[#ff4444] text-white text-[9px] font-bold tracking-widest px-3 py-1 rounded-full mb-4 uppercase shadow-[0_0_15px_rgba(255,68,68,0.4)]">SAFE_HAVEN</span>
             <h3 className="font-headline text-xl text-white mb-2">Evacuation Corridors Open</h3>
             <p className="text-xs text-[#a7f3d0]/60 mb-6 font-light">Safe passage routes have been mapped. Local authorities are guiding citizens to secure zones.</p>
             <button className="w-full bg-white text-[#021209] rounded-full py-4 px-6 text-xs font-bold tracking-widest flex justify-between items-center hover:bg-[#a7f3d0] transition-colors duration-300">
                VIEW SAFE ZONES
                <span className="material-symbols-outlined">chevron_right</span>
             </button>
          </div>
        </div>

      </div>

      {/* Right Panel - Scrollable Feed */}
      <div className="relative z-10 flex-1 h-screen overflow-y-auto custom-scrollbar p-6 md:p-12 lg:p-16 lg:pr-32 lg:pl-20 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/10">
            <span className="material-symbols-outlined text-white/40">subject</span>
            <h3 className="text-white/40 text-sm tracking-[0.3em] uppercase">Latest Occurrences</h3>
          </div>

          {loadingAlerts && (
            <div className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] p-12 border border-white/5 flex flex-col items-center justify-center min-h-[40vh] animate-pulse">
              <span className="material-symbols-outlined text-[#4ade80] text-5xl mb-6 animate-spin">eco</span>
              <h2 className="font-headline text-2xl text-white mb-2">Scanning Data Streams...</h2>
              <p className="text-white/40 text-sm tracking-widest uppercase">Querying ReliefWeb // Region: {userState || 'Global'}</p>
            </div>
          )}

          {!loadingAlerts && alerts.length === 0 && (
            <div className="bg-gradient-to-b from-[#134529]/20 to-transparent backdrop-blur-xl rounded-[2.5rem] p-12 border border-white/10 flex flex-col items-center justify-center min-h-[40vh] text-center">
              <span className="material-symbols-outlined text-[#4ade80] text-5xl mb-6">verified_user</span>
              <h2 className="font-headline text-3xl text-white mb-3">No Active Threats Detected</h2>
              <p className="text-white/60 text-sm max-w-md mx-auto leading-relaxed">
                All disaster monitoring streams are nominal for {userState || 'your region'}. Stay prepared. STATUS: ALL_CLEAR.
              </p>
            </div>
          )}

          {alerts.map((alert, index) => {
            const isHigh = alert.severity === 'high';
            const isMed = alert.severity === 'medium';
            
            const badgeBg = isHigh ? 'bg-[#ff4444]' : isMed ? 'bg-yellow-500' : 'bg-[#4ade80]';
            const badgeText = isHigh ? 'text-white' : 'text-[#021209]';
            const badgeLabel = isHigh ? 'CRITICAL_EVENT' : isMed ? 'ELEVATED_RISK' : 'INFO_LOG';
            const glowClass = isHigh ? 'hover:shadow-[0_0_40px_rgba(255,68,68,0.15)] hover:border-[#ff4444]/30' : 'hover:shadow-[0_0_40px_rgba(74,222,128,0.1)] hover:border-white/20';

            const displayTitle = activeLang !== 'en' && translatedAlerts[alert.id] ? translatedAlerts[alert.id].title : alert.title;
            const displayDesc = activeLang !== 'en' && translatedAlerts[alert.id] ? translatedAlerts[alert.id].description : alert.description;

            return (
              <div 
                key={alert.id}
                onClick={() => onAlertClick(alert)}
                className={`group cursor-pointer bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 transition-all duration-500 ${glowClass} relative overflow-hidden`}
              >
                {/* Decorative background blur on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-white/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-full"></div>
                
                <div className="relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-3">
                      <span className={`${badgeBg} ${badgeText} text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase`}>
                        {badgeLabel}
                      </span>
                      <span className="text-white/40 text-[10px] tracking-widest uppercase">
                        STAMP: {alert.timestamp}
                      </span>
                    </div>
                    <span className="text-white/30 text-[10px] tracking-widest uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">my_location</span>
                      LOC_ID: {alert.location}
                    </span>
                  </div>
                  
                  <h2 className="font-headline text-3xl md:text-4xl text-white mb-6 leading-tight group-hover:text-[#a7f3d0] transition-colors duration-300">
                    {displayTitle}
                  </h2>
                  
                  <p className="text-white/60 text-sm md:text-base leading-loose max-w-2xl font-light mb-8 group-hover:text-white/80 transition-colors duration-300">
                    {displayDesc}
                  </p>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-white/10">
                    <span className="text-[#a7f3d0]/50 text-[10px] tracking-widest uppercase">
                      SRC: {alert.source}
                    </span>
                    <span className="material-symbols-outlined text-white/30 group-hover:text-white group-hover:translate-x-2 transition-all duration-300">
                      arrow_forward
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modern Floating Pill Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#021209]/80 backdrop-blur-3xl border border-white/20 rounded-full px-4 py-3 flex items-center gap-2 shadow-2xl z-50">
        <button 
          onClick={onAIClick} 
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
          title="AI Assistant"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
        </button>
        
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        
        <a 
          href="#"
          className="flex items-center justify-center bg-[#a7f3d0] text-[#021209] hover:bg-white w-14 h-14 rounded-full shadow-[0_0_20px_rgba(167,243,208,0.3)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          title="Home"
        >
          <span className="material-symbols-outlined text-[24px]">home</span>
        </a>
        
        <div className="w-px h-6 bg-white/20 mx-2"></div>
        
        <button 
          onClick={onProfileClick} 
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
          title="Profile"
        >
          <span className="material-symbols-outlined text-[22px]">person</span>
        </button>
      </nav>
      
      {/* Global Style additions for scrollbars to make them invisible or sleek */}
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

import React, { useState, useEffect } from 'react';
import { translateText, extractLangCode, LANGUAGE_OPTIONS } from './translateService.js';

export default function AlertDetails({ alert, userLocale, onBack, onHome, onAI, onProfile }) {
  // Translation states
  const [localeTranslation, setLocaleTranslation] = useState(null);
  const [customTranslation, setCustomTranslation] = useState(null);
  const [customLang, setCustomLang] = useState('');
  const [isTranslatingLocale, setIsTranslatingLocale] = useState(true);
  const [isTranslatingCustom, setIsTranslatingCustom] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  // AI Summarizer states
  const [aiSummary, setAiSummary] = useState('');
  const [isSummarizing, setIsSummarizing] = useState(true);
  const [summaryError, setSummaryError] = useState(null);

  // Fallback if no alert was passed
  const data = alert || {
    title: 'NO ALERT DATA',
    description: 'No alert was selected. Return to the home screen.',
    severity: 'low',
    timestamp: 'N/A',
    source: 'SYSTEM',
    location: 'UNKNOWN',
    alertLevel: 'Green',
    eventType: 'SYSTEM',
    guidelines: [],
    emergency: '',
  };

  const localeLangCode = extractLangCode(userLocale);
  const localeLangName = LANGUAGE_OPTIONS.find(l => l.code === localeLangCode)?.label || userLocale || 'Regional';

  // Severity config
  const severityConfig = {
    high: { color: '#ff3b3b', label: 'CRITICAL', borderColor: 'border-[#ff3b3b]', badgeBg: 'bg-[#ff3b3b]', badgeText: 'text-white' },
    medium: { color: '#eab308', label: 'ELEVATED', borderColor: 'border-yellow-500', badgeBg: 'bg-yellow-500', badgeText: 'text-black' },
    low: { color: '#4ade80', label: 'ADVISORY', borderColor: 'border-[#4ade80]', badgeBg: 'bg-[#4ade80]', badgeText: 'text-[#021209]' },
  };
  const sev = severityConfig[data.severity] || severityConfig.low;

  // Auto-translate to detected locale on mount
  useEffect(() => {
    if (localeLangCode === 'en') {
      setLocaleTranslation({ title: data.title, description: data.description, guidelines: data.guidelines, emergency: data.emergency });
      setIsTranslatingLocale(false);
      return;
    }

    let cancelled = false;
    async function doTranslate() {
      setIsTranslatingLocale(true);
      try {
        const tTitle = await translateText(data.title, localeLangCode);
        const tDesc = await translateText(data.description, localeLangCode);
        const tGuidelines = [];
        if (data.guidelines) {
          for (const g of data.guidelines) {
            tGuidelines.push(await translateText(g, localeLangCode));
          }
        }
        const tEmergency = data.emergency ? await translateText(data.emergency, localeLangCode) : '';
        if (!cancelled) {
          setLocaleTranslation({ title: tTitle, description: tDesc, guidelines: tGuidelines, emergency: tEmergency });
        }
      } catch (e) {
        console.error('Locale translation failed:', e);
        if (!cancelled) {
          setLocaleTranslation({ title: data.title, description: data.description, guidelines: data.guidelines || [], emergency: data.emergency || '' });
        }
      }
      if (!cancelled) setIsTranslatingLocale(false);
    }
    doTranslate();
    return () => { cancelled = true; };
  }, [data.id, localeLangCode]);

  // AI Summarizer Effect
  useEffect(() => {
    let cancelled = false;
    async function fetchSummary() {
      if (!data.title || data.title === 'NO ALERT DATA') {
        setIsSummarizing(false);
        return;
      }
      setIsSummarizing(true);
      setSummaryError(null);
      
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
            'HTTP-Referer': window.location.href,
            'X-Title': 'CHETAK Alert System',
          },
          body: JSON.stringify({
            model: 'openai/gpt-oss-120b:free',
            messages: [
              { role: 'system', content: 'You are a helpful disaster alert summarizer. Your job is to take complex disaster alerts and explain them in very simple, easy-to-understand language for the general public. Keep it short, actionable, and calm. Do not use complex jargon. Maximum 3 sentences.' },
              { role: 'user', content: `Please summarize this alert simply:\nTitle: ${data.title}\nDescription: ${data.description}\nGuidelines: ${(data.guidelines || []).join(', ')}\nEmergency: ${data.emergency || ''}` }
            ],
            max_tokens: 300,
            temperature: 0.5,
          }),
        });

        if (!response.ok) {
            throw new Error('API Error');
        }

        const resData = await response.json();
        const text = resData.choices?.[0]?.message?.content;
        
        if (!cancelled) {
          setAiSummary(text || 'Could not generate summary.');
        }
      } catch (err) {
        console.error('AI Summary error:', err);
        if (!cancelled) {
          setSummaryError('Failed to generate simple explanation.');
        }
      } finally {
        if (!cancelled) {
          setIsSummarizing(false);
        }
      }
    }

    fetchSummary();
    return () => { cancelled = true; };
  }, [data.title, data.description, data.guidelines, data.emergency]);

  // Translate to custom language
  const handleCustomTranslate = async (langCode) => {
    setCustomLang(langCode);
    setShowLangPicker(false);
    setIsTranslatingCustom(true);
    try {
      const tTitle = await translateText(data.title, langCode);
      const tDesc = await translateText(data.description, langCode);
      const tGuidelines = [];
      if (data.guidelines) {
        for (const g of data.guidelines) {
          tGuidelines.push(await translateText(g, langCode));
        }
      }
      const tEmergency = data.emergency ? await translateText(data.emergency, langCode) : '';
      setCustomTranslation({ title: tTitle, description: tDesc, guidelines: tGuidelines, emergency: tEmergency });
    } catch (e) {
      console.error('Custom translation failed:', e);
    }
    setIsTranslatingCustom(false);
  };

  const customLangLabel = LANGUAGE_OPTIONS.find(l => l.code === customLang)?.label || customLang.toUpperCase();
  const customLangNative = LANGUAGE_OPTIONS.find(l => l.code === customLang)?.native || '';

  const filteredLangs = LANGUAGE_OPTIONS.filter(l =>
    l.label.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.native.toLowerCase().includes(langSearch.toLowerCase()) ||
    l.code.includes(langSearch.toLowerCase())
  );

  return (
    <div className="bg-[#010e06] text-[#f0fdf4] font-body selection:bg-[#4ade80] selection:text-[#010e06] overflow-hidden min-h-screen w-screen flex flex-col relative">
      {/* Immersive Organic Background Elements */}
      <div className="fixed top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#134529] rounded-full mix-blend-screen filter blur-[200px] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-[#0a2916] rounded-full mix-blend-screen filter blur-[250px] opacity-30 pointer-events-none z-0"></div>

      {/* Main Scrollable Content */}
      <div className="relative z-10 w-full h-screen overflow-y-auto custom-scrollbar pb-40">
        
        {/* Header / Hero Section */}
        <div className="w-full max-w-6xl mx-auto px-6 md:px-12 pt-12 pb-16">
          <div className="flex justify-between items-start mb-12">
            <button 
              onClick={onBack} 
              className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                <span className="material-symbols-outlined text-xl">arrow_back</span>
              </div>
              <span className="font-headline tracking-[0.2em] uppercase text-sm">BACK TO FEED</span>
            </button>
            <div className="flex flex-col items-end gap-3">
              <span className="text-xl font-bold tracking-[0.2em] font-headline uppercase text-[#4ade80]">CHETAK</span>
              <span className={`${sev.badgeBg} ${sev.badgeText} text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full uppercase shadow-lg`}>
                {sev.label}
              </span>
            </div>
          </div>

          <div className="max-w-4xl">
            <div className="flex items-center gap-4 flex-wrap mb-6">
              <span className="text-white/40 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">schedule</span>
                {data.timestamp}
              </span>
              <span className="text-white/40 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">my_location</span>
                {data.location}
              </span>
              <span className="text-white/40 text-xs tracking-widest uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">category</span>
                {data.eventType}
              </span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-7xl font-black text-white leading-[1.05] tracking-tighter uppercase mb-8">
              {data.title}
            </h1>
          </div>
        </div>

        {/* Translation Split View */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          
          {/* Left: Regional Translation */}
          <div className="bg-white/[0.02] backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-white/5 relative overflow-hidden group hover:border-[#4ade80]/20 transition-colors duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4ade80]/10 flex items-center justify-center border border-[#4ade80]/20">
                  <span className="material-symbols-outlined text-[#4ade80] text-[20px]">translate</span>
                </div>
                <span className="font-headline text-sm tracking-[0.2em] uppercase text-white/70">
                  {localeLangName}
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]"></div>
            </div>

            {isTranslatingLocale ? (
              <div className="space-y-6 animate-pulse">
                <div className="h-10 bg-white/5 rounded-xl w-3/4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-white/5 rounded w-full"></div>
                  <div className="h-4 bg-white/5 rounded w-5/6"></div>
                  <div className="h-4 bg-white/5 rounded w-4/6"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-8 relative z-10">
                <h2 className="font-headline text-3xl font-bold text-white leading-tight">
                  {localeTranslation?.title}
                </h2>
                <p className="font-body text-white/70 text-lg leading-relaxed font-light">
                  {localeTranslation?.description}
                </p>
                {localeTranslation?.guidelines?.length > 0 && (
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <ul className="space-y-3">
                      {localeTranslation.guidelines.map((g, i) => (
                        <li key={i} className="flex gap-4 text-white/60 font-body text-sm leading-relaxed">
                          <span className="material-symbols-outlined text-[#4ade80] text-[18px] shrink-0">check_circle</span>
                          {g}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: English Standard */}
          <div className="bg-white/[0.01] backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-white/5">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-white/40 text-[20px]">language</span>
                </div>
                <span className="font-headline text-sm tracking-[0.2em] uppercase text-white/40">
                  Global (English)
                </span>
              </div>
              <div className="w-2 h-2 rounded-full bg-white/20"></div>
            </div>

            <div className="space-y-8">
              <h2 className="font-headline text-3xl font-bold text-white/80 leading-tight">
                {data.title}
              </h2>
              <p className="font-body text-white/50 text-lg leading-relaxed font-light">
                {data.description}
              </p>
              {data.guidelines?.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
                  <ul className="space-y-3">
                    {data.guidelines.map((g, i) => (
                      <li key={i} className="flex gap-4 text-white/40 font-body text-sm leading-relaxed">
                        <span className="material-symbols-outlined text-white/20 text-[18px] shrink-0">info</span>
                        {g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* AI Summarizer Section */}
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-16">
          <div className="bg-gradient-to-r from-[#021209] to-[#051f11] backdrop-blur-3xl rounded-[3rem] p-8 md:p-12 border border-[#4ade80]/20 relative overflow-hidden shadow-2xl group">
            {/* Decorative Glow */}
            <div className="absolute top-1/2 left-0 w-64 h-64 bg-[#4ade80]/5 rounded-full filter blur-[100px] transform -translate-y-1/2 pointer-events-none group-hover:bg-[#4ade80]/10 transition-colors duration-700"></div>
            
            <div className="flex flex-col md:flex-row gap-8 relative z-10">
              <div className="shrink-0 flex flex-col items-center justify-center md:border-r border-white/10 md:pr-8">
                <div className="w-16 h-16 rounded-full bg-[#4ade80]/10 flex items-center justify-center border border-[#4ade80]/30 mb-4 shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                  <span className="material-symbols-outlined text-[#4ade80] text-3xl">psychology</span>
                </div>
                <span className="font-headline tracking-[0.2em] uppercase text-[#4ade80] text-sm font-bold">AI Analysis</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="text-white font-headline text-xl mb-4">Simple Explanation</h3>
                {isSummarizing ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-full"></div>
                    <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    <div className="h-4 bg-white/10 rounded w-4/6"></div>
                  </div>
                ) : summaryError ? (
                  <p className="text-[#ff4444] font-body text-sm bg-[#ff4444]/10 p-4 rounded-xl border border-[#ff4444]/20">
                    {summaryError}
                  </p>
                ) : (
                  <div className="font-body text-white/80 text-lg leading-relaxed font-light">
                    {aiSummary}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Translation & Stats Row */ }
        <div className="w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          
          {/* Custom Translation Block */}
          <div className={`lg:col-span-2 bg-gradient-to-br from-[#051f11] to-[#021209] backdrop-blur-xl rounded-[3rem] p-8 md:p-12 border border-[#4ade80]/10 shadow-2xl relative ${showLangPicker ? 'z-50' : 'z-10'}`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#4ade80] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                  <span className="material-symbols-outlined text-[#021209]">g_translate</span>
                </div>
                <div>
                  <h3 className="font-headline text-xl text-white">Need another language?</h3>
                  <p className="text-[#a7f3d0]/60 text-sm font-light">Translate this alert instantly.</p>
                </div>
              </div>
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="bg-white text-[#021209] rounded-full py-3 px-6 text-xs font-bold tracking-widest uppercase hover:bg-[#a7f3d0] transition-colors shadow-xl"
              >
                {customTranslation ? 'Change Language' : 'Select Language'}
              </button>
            </div>

            {/* Language Picker Dropdown */}
            {showLangPicker && (
              <div className="absolute top-24 right-12 z-50 w-80 max-h-96 overflow-hidden bg-[#0a2916] border border-[#4ade80]/20 rounded-2xl flex flex-col shadow-2xl backdrop-blur-2xl">
                <div className="p-4 border-b border-white/10 bg-black/20">
                  <div className="flex items-center gap-2 bg-white/5 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-white/40 text-lg">search</span>
                    <input
                      type="text"
                      value={langSearch}
                      onChange={(e) => setLangSearch(e.target.value)}
                      placeholder="Search language..."
                      className="bg-transparent text-white font-body text-sm w-full outline-none placeholder:text-white/30"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {filteredLangs.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => { setLangSearch(''); handleCustomTranslate(lang.code); }}
                      className={`w-full text-left px-6 py-4 flex items-center justify-between hover:bg-white/10 transition-colors border-b border-white/5 ${customLang === lang.code ? 'bg-[#4ade80]/10 text-[#4ade80]' : 'text-white'}`}
                    >
                      <div>
                        <span className="font-bold text-sm block">{lang.label}</span>
                        <span className="text-white/40 text-xs mt-1">{lang.native}</span>
                      </div>
                      <span className="font-mono text-[10px] uppercase opacity-50">{lang.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Translation Content */}
            {isTranslatingCustom ? (
              <div className="space-y-6 pt-6 border-t border-white/10 animate-pulse">
                <div className="h-8 bg-white/5 rounded-xl w-3/4"></div>
                <div className="h-4 bg-white/5 rounded w-full"></div>
                <div className="h-4 bg-white/5 rounded w-5/6"></div>
              </div>
            ) : customTranslation ? (
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <span className="font-headline text-sm text-[#4ade80] uppercase tracking-[0.2em]">{customLangLabel}</span>
                  {customLangNative && <span className="text-white/40 text-lg">· {customLangNative}</span>}
                </div>
                <h2 className="font-headline text-2xl md:text-3xl font-bold text-white leading-tight">
                  {customTranslation.title}
                </h2>
                <p className="font-body text-white/80 text-base leading-relaxed">
                  {customTranslation.description}
                </p>
                {customTranslation.guidelines?.length > 0 && (
                  <ul className="text-[#a7f3d0]/60 font-body text-sm list-disc pl-5 space-y-2">
                    {customTranslation.guidelines.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                )}
              </div>
            ) : null}
          </div>

          {/* Stats Column */}
          <div className="grid grid-rows-3 gap-6">
            <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
              <span className="text-white/40 text-[10px] tracking-widest uppercase mb-2">Threat Level</span>
              <span className="font-headline text-2xl font-black uppercase" style={{ color: sev.color }}>{sev.label}</span>
            </div>
            <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
              <span className="text-white/40 text-[10px] tracking-widest uppercase mb-2">Alert Code</span>
              <span className="font-headline text-2xl font-black uppercase text-white">{data.alertLevel || 'N/A'}</span>
            </div>
            <div className="bg-white/[0.02] rounded-3xl p-6 border border-white/5 flex flex-col justify-center items-center text-center">
              <span className="text-white/40 text-[10px] tracking-widest uppercase mb-2">Source</span>
              <span className="font-headline text-xl font-bold uppercase text-white/80">{data.source}</span>
            </div>
          </div>
        </div>

        {/* Emergency Banner */}
        {data.emergency && (
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-20">
            <div className="bg-[#ff4444] rounded-[3rem] p-8 md:p-12 shadow-[0_0_50px_rgba(255,68,68,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-white text-3xl">emergency</span>
                </div>
                <div>
                  <h3 className="font-headline text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-2">Emergency Protocol</h3>
                  <p className="text-white/90 text-sm md:text-base font-medium">{data.emergency}</p>
                </div>
              </div>
              <a href="tel:112" className="w-full md:w-auto bg-white text-[#ff4444] rounded-full py-5 px-10 text-sm font-black tracking-[0.2em] uppercase hover:bg-red-50 hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 relative z-10">
                <span className="material-symbols-outlined">call</span>
                CALL 112
              </a>
            </div>
          </div>
        )}

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
          onClick={onProfile} 
          className="flex items-center justify-center text-[#a7f3d0]/70 hover:text-white hover:bg-white/10 w-12 h-12 rounded-full transition-all duration-300"
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

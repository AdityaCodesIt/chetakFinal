import React, { useState, useEffect } from 'react';

import Registration from './Registration.jsx';
import ContactVerification from './ContactVerification.jsx';
import LanguageSettings from './LanguageSettings.jsx';
import TerminalHomepage from './TerminalHomepage.jsx';
import AlertDetails from './AlertDetails.jsx';
import AITerminal from './AITerminal.jsx';
import ChetakAccountProfileFixed from './ChetakAccountProfileFixed.jsx';
import { supabase } from './supabaseClient.js';

// Indian state → regional language mapping
const stateLanguageMap = {
  'andhra pradesh': 'Telugu (TE)',
  'arunachal pradesh': 'Hindi (HI)',
  'assam': 'Assamese (AS)',
  'bihar': 'Hindi (HI)',
  'chhattisgarh': 'Hindi (HI)',
  'goa': 'Konkani (KK)',
  'gujarat': 'Gujarati (GU)',
  'haryana': 'Hindi (HI)',
  'himachal pradesh': 'Hindi (HI)',
  'jharkhand': 'Hindi (HI)',
  'karnataka': 'Kannada (KN)',
  'kerala': 'Malayalam (ML)',
  'madhya pradesh': 'Hindi (HI)',
  'maharashtra': 'Marathi (MR)',
  'manipur': 'Meitei (MNI)',
  'meghalaya': 'English (EN)',
  'mizoram': 'Mizo (LUS)',
  'nagaland': 'English (EN)',
  'odisha': 'Odia (OR)',
  'punjab': 'Punjabi (PA)',
  'rajasthan': 'Hindi (HI)',
  'sikkim': 'Nepali (NE)',
  'tamil nadu': 'Tamil (TA)',
  'telangana': 'Telugu (TE)',
  'tripura': 'Bengali (BN)',
  'uttar pradesh': 'Hindi (HI)',
  'uttarakhand': 'Hindi (HI)',
  'west bengal': 'Bengali (BN)',
  'delhi': 'Hindi (HI)',
  'national capital territory of delhi': 'Hindi (HI)',
  'chandigarh': 'Hindi (HI)',
  'jammu and kashmir': 'Urdu (UR)',
  'ladakh': 'Hindi (HI)',
  'puducherry': 'Tamil (TA)',
  'lakshadweep': 'Malayalam (ML)',
  'andaman and nicobar islands': 'Hindi (HI)',
  'dadra and nagar haveli and daman and diu': 'Gujarati (GU)',
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('splash');
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // --- Shared form data ---
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    country: '',
    state: '',
    region: '',
    pin: '',
    email: '',
    verification_phone: '',
    preferred_language: '',
    detected_locale: 'AUTO-DETECT',
    emergency_override_english: false,
  });

  const updateFormData = (fields) => {
    setFormData(prev => ({ ...prev, ...fields }));
  };

  // --- Google Sign In ---
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error('Google sign-in error:', error.message);
      alert('AUTH_ERROR: ' + error.message);
    }
  };

  // --- Check for existing session & listen for auth changes ---
  useEffect(() => {
    // Timeout fallback: if auth check takes too long, proceed to splash
    const authTimeout = setTimeout(() => {
      setAuthLoading(false);
      console.warn('Auth check timed out — proceeding to splash screen.');
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(authTimeout);
      if (session?.user) {
        setAuthUser(session.user);
        checkExistingUser(session.user);
      } else {
        setAuthLoading(false);
      }
    }).catch((err) => {
      clearTimeout(authTimeout);
      console.error('Auth session check failed:', err);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setAuthUser(session.user);
          await checkExistingUser(session.user);
        } else if (event === 'SIGNED_OUT') {
          setAuthUser(null);
          setCurrentScreen('splash');
          setAuthLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // --- Check if user already has a profile in our DB ---
  const checkExistingUser = async (user) => {
    try {
      // First: try matching by auth_id (returning Google user)
      let { data } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', user.id)
        .maybeSingle();

      // Fallback: try matching by email (for users registered before Google Auth)
      if (!data && user.email) {
        const { data: emailMatch } = await supabase
          .from('users')
          .select('*')
          .eq('email', user.email)
          .maybeSingle();

        if (emailMatch) {
          // Link their auth_id for future logins
          await supabase
            .from('users')
            .update({ auth_id: user.id })
            .eq('id', emailMatch.id);
          data = emailMatch;
        }
      }

      if (data) {
        // RETURNING USER → load saved data, skip straight to terminal
        console.log('Returning user detected, skipping registration');
        setFormData({
          full_name: data.full_name || '',
          phone_number: data.phone_number || '',
          country: data.country || '',
          state: data.state || '',
          region: data.region || '',
          pin: data.pin || '',
          email: data.email || user.email || '',
          verification_phone: data.verification_phone || '',
          preferred_language: data.preferred_language || '',
          detected_locale: data.detected_locale || 'AUTO-DETECT',
          emergency_override_english: data.emergency_override_english || false,
        });
        setCurrentScreen('terminal');
      } else {
        // NEW USER → pre-fill from Google profile, go to registration
        console.log('New user, starting registration flow');
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        }));
        setCurrentScreen('registration');
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setFormData(prev => ({ ...prev, email: user.email || '' }));
      setCurrentScreen('registration');
    }
    setAuthLoading(false);
  };

  // --- Geolocation ---
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );
          const data = await res.json();
          const detectedState = data.principalSubdivision || '';
          const detectedCountry = data.countryName || '';
          const stateKey = detectedState.toLowerCase().trim();
          const regionalLang = stateLanguageMap[stateKey] || `${detectedState.toUpperCase()} (${data.countryCode || 'XX'})`;
          setFormData(prev => ({
            ...prev,
            detected_locale: regionalLang,
            country: prev.country || detectedCountry.toUpperCase(),
            state: prev.state || detectedState.toUpperCase(),
          }));
        } catch (err) {
          console.error('Reverse geocode failed:', err);
        }
      },
      (err) => console.warn('Geolocation denied:', err.message)
    );
  }, []);

  // --- Submit all collected data to Supabase ---
  const handleFinalSubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .upsert([{
          auth_id: authUser?.id || null,
          full_name: formData.full_name,
          phone_number: formData.phone_number,
          country: formData.country,
          state: formData.state,
          region: formData.region,
          pin: formData.pin,
          email: formData.email,
          verification_phone: formData.verification_phone,
          preferred_language: formData.preferred_language,
          detected_locale: formData.detected_locale,
          emergency_override_english: formData.emergency_override_english,
        }], { onConflict: 'auth_id' })
        .select();

      if (error) {
        console.error('Supabase upsert error:', error.message, error);
        alert(`Database Save Error: ${error.message}. Please try again.`);
        return; // Don't proceed to terminal if save fails
      } else {
        console.log('User data saved successfully:', data);
      }
    } catch (err) {
      console.error('Data save failed:', err.message);
      alert(`Network Error: ${err.message}. Please check your connection.`);
      return; // Don't proceed to terminal if network fails
    }
    // ALWAYS navigate to terminal
    setCurrentScreen('terminal');
  };

  // --- Sign Out ---
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error signing out of Supabase:', err);
    } finally {
      setAuthUser(null);
      setFormData({
        full_name: '', phone_number: '', country: '', state: '', region: '', pin: '',
        email: '', verification_phone: '', preferred_language: '', detected_locale: 'AUTO-DETECT',
        emergency_override_english: false,
      });
      setCurrentScreen('splash');
      setTimeout(() => {
        window.location.assign('/');
      }, 100);
    }
  };

  // === SCREEN RENDERING ===

  // Loading screen while checking auth
  if (authLoading && currentScreen === 'splash') {
    return (
      <div className="absolute inset-0 w-screen h-screen bg-[#021209] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-extrabold tracking-tight text-white uppercase mb-6 drop-shadow-sm">CHETAK</h1>
          <div className="flex items-center justify-center gap-3">
            <span className="material-symbols-outlined text-[#4ade80] text-2xl animate-spin">sync</span>
            <p className="font-medium text-sm text-[#a7f3d0] uppercase tracking-widest">Authenticating Session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentScreen === 'alert_details') {
    return (
      <AlertDetails 
        alert={selectedAlert}
        userLocale={formData.detected_locale}
        onBack={() => setCurrentScreen('terminal')}
        onHome={() => setCurrentScreen('terminal')}
        onAI={() => setCurrentScreen('ai_terminal')}
        onProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'ai_terminal') {
    return (
      <AITerminal 
        onHome={() => setCurrentScreen('terminal')}
        onProfile={() => setCurrentScreen('profile')}
      />
    );
  }

  if (currentScreen === 'profile') {
    return (
      <ChetakAccountProfileFixed 
        onHome={() => setCurrentScreen('terminal')}
        onAI={() => setCurrentScreen('ai_terminal')}
        onSignOut={handleSignOut}
        authUser={authUser}
        formData={formData}
      />
    );
  }

  if (currentScreen === 'terminal') {
    return (
      <TerminalHomepage 
        onAlertClick={(alert) => { setSelectedAlert(alert); setCurrentScreen('alert_details'); }} 
        onAIClick={() => setCurrentScreen('ai_terminal')}
        onProfileClick={() => setCurrentScreen('profile')}
        userCountry={formData.country}
        userState={formData.state}
        userRegion={formData.region}
        userLocale={formData.detected_locale}
      />
    );
  }

  if (currentScreen === 'language') {
    return (
      <LanguageSettings 
        formData={formData}
        updateFormData={updateFormData}
        onInitialize={handleFinalSubmit}
      />
    );
  }

  if (currentScreen === 'verification') {
    return (
      <ContactVerification 
        formData={formData}
        updateFormData={updateFormData}
        onVerify={() => setCurrentScreen('language')} 
      />
    );
  }

  if (currentScreen === 'registration') {
    return (
      <Registration 
        formData={formData}
        updateFormData={updateFormData}
        onNext={() => setCurrentScreen('verification')} 
      />
    );
  }

  // --- Splash Screen with Google Sign In ---
  return (
    <div className="absolute inset-0 w-screen min-h-screen bg-[#021209] overflow-hidden z-0 font-sans">
      <div className="absolute inset-0 bg-gradient-to-br from-[#021209] to-[#051f11] opacity-90 pointer-events-none"></div>
      
      {/* Decorative elements for premium look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#4ade80] mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#10b981] mix-blend-screen filter blur-[120px] opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <main className="flex-grow flex flex-col items-center justify-center w-full px-6 absolute inset-0 fade-in-up">
        <div className="flex flex-col items-center justify-center text-center space-y-16 z-10 backdrop-blur-md bg-[#0d3820]/60 p-12 rounded-[2rem] shadow-[0_8px_32px_0_rgba(10,30,20,0.5)] border border-[#4ade80]/30">
          <div>
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight text-white uppercase drop-shadow-sm">
              CHETAK
            </h1>
            <p className="text-sm md:text-base font-semibold tracking-[0.3em] text-[#a7f3d0] uppercase mt-4">
              Rapid Emergency Response Network
            </p>
          </div>
          <div className="w-full max-w-sm px-6">
            <button 
              onClick={handleGoogleSignIn}
              className="group relative w-full bg-[#4ade80] text-[#002611] px-8 py-4 rounded-2xl font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(74,222,128,0.3)] hover:shadow-[0_0_25px_rgba(74,222,128,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-4 border border-[#4ade80]/50"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#002611"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#002611"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#002611"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#002611"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

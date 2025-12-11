
import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { UserProfile, Message, AnalysisData, AppView, RelationshipData } from './types';
import { storage } from './services/storage';
import { sendMessageToLia, analyzeMoment, analyzeRelationship } from './services/geminiService';
import { auth } from './src/firebase';
import { authApi, cloudDb } from './services/firebaseClient';
import ProfileSettings from './components/ProfileSettings';
import ChatInterface from './components/ChatInterface';
import AnalysisView from './components/AnalysisView';
import RelationshipTool from './components/RelationshipTool';
import LandingPage from './components/LandingPage';
import LoginView from './components/LoginView';
import LegalView from './components/LegalView';
import { User, Activity, Heart } from 'lucide-react';
import { APP_NAME, PLAN_LIMITS } from './constants';

const App: React.FC = () => {
  const PREMIUM_WHITELIST = new Set([
    'leandro@zeithco.com',
    'scheilafribeiro@hotmail.com',
    'clarinha@zeithco.com',
    'adm@zeithco.com',
    'bllart@gmail.com'
  ]);

  const applyWhitelist = (profile: UserProfile): UserProfile => {
    if (profile.email && PREMIUM_WHITELIST.has(profile.email.toLowerCase())) {
      return { ...profile, subscriptionStatus: 'PREMIUM' };
    }
    return profile;
  };

  const startTrialIfNeeded = () => {
    if (profile.subscriptionStatus === 'PREMIUM') return;
    if (!trialStartMs) {
      const now = Date.now();
      setTrialStartMs(now);
      localStorage.setItem('lia_trial_start', now.toString());
    }
  };

  const [profile, setProfile] = useState<UserProfile>(
    applyWhitelist(storage.getProfile() || { 
      name: '', 
      sign: '', 
      ascendant: '', 
      hasOnboarded: false,
      subscriptionStatus: 'FREE' 
    })
  );
  
  // Decide initial view: if not onboarded, show LANDING, otherwise CHAT
  const getInitialView = (): AppView => {
    if (!profile.hasOnboarded) return AppView.LANDING;
    return AppView.CHAT;
  };

  const [messages, setMessages] = useState<Message[]>(storage.getMessages());
  const [analysis, setAnalysis] = useState<AnalysisData | null>(storage.getAnalysis());
  const [view, setView] = useState<AppView>(getInitialView());
  const [isTyping, setIsTyping] = useState(false);
  const [dailyCount, setDailyCount] = useState(storage.getUsage());
  const [authUid, setAuthUid] = useState<string | null>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const TRIAL_DURATION_MS = 5 * 60 * 1000;
  const [trialStartMs, setTrialStartMs] = useState<number | null>(() => {
    if (typeof window === 'undefined') return null;
    const v = localStorage.getItem('lia_trial_start');
    return v ? parseInt(v, 10) : null;
  });
  const [trialExpired, setTrialExpired] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('lia_trial_expired') === '1';
  });
  const [showTrialModal, setShowTrialModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<'monthly' | 'annual' | null>(null);
  
  const currentLimit = profile.subscriptionStatus === 'PREMIUM' 
    ? PLAN_LIMITS.PREMIUM 
    : PLAN_LIMITS.FREE;

  const hydrateFromCloud = useCallback(async (uid: string) => {
    setIsSyncingCloud(true);
    try {
      const data = await cloudDb.fetchUserData(uid);
      if (data.profile) {
        setProfile(prev => {
          const merged = applyWhitelist({ ...prev, ...data.profile, hasOnboarded: true });
          storage.saveProfile(merged);
          return merged;
        });
        setView(AppView.CHAT);
      }
      if (data.messages?.length) {
        setMessages(data.messages);
        storage.saveMessages(data.messages);
      }
      if (data.analysis) {
        setAnalysis(data.analysis);
        storage.saveAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Cloud sync error:", error);
    } finally {
      setIsSyncingCloud(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUid(user.uid);
        hydrateFromCloud(user.uid);
      } else {
        setAuthUid(null);
      }
    });
    return () => unsubscribe();
  }, [hydrateFromCloud]);

  const applySubscriptionStatus = useCallback(async (email?: string) => {
    if (!email) return;
    const lower = email.toLowerCase();
    if (PREMIUM_WHITELIST.has(lower)) {
      setProfile((prev) => {
        const updated = { ...prev, subscriptionStatus: 'PREMIUM' };
        storage.saveProfile(updated);
        return updated;
      });
      return;
    }
    setCheckingSubscription(true);
    try {
      const res = await fetch(`/api/subscription-status?email=${encodeURIComponent(lower)}`);
      const data = await res.json();
      if (data?.status === 'ACTIVE') {
        setProfile((prev) => {
          const updated = { ...prev, subscriptionStatus: 'PREMIUM' };
          storage.saveProfile(updated);
          return updated;
        });
      }
    } catch (error) {
      console.error('Erro ao checar assinatura:', error);
    } finally {
      setCheckingSubscription(false);
    }
  }, [PREMIUM_WHITELIST, profile]);

  useEffect(() => {
    if (profile.email) {
      applySubscriptionStatus(profile.email);
    }
  }, [profile.email, applySubscriptionStatus]);

  useEffect(() => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (profile.hasOnboarded && messages.length >= 5 && (!analysis || now - analysis.lastAnalyzed > tenMinutes)) {
        runAnalysis(messages);
    }
  }, []);

  useEffect(() => {
    if (profile.subscriptionStatus === 'PREMIUM') {
      setTrialExpired(false);
      setShowTrialModal(false);
      return;
    }
    if (!trialStartMs || trialExpired) return;
    const id = setInterval(() => {
      if (trialStartMs && Date.now() - trialStartMs >= TRIAL_DURATION_MS) {
        setTrialExpired(true);
        setShowTrialModal(true);
        localStorage.setItem('lia_trial_expired', '1');
      }
    }, 5000);
    return () => clearInterval(id);
  }, [trialStartMs, trialExpired, profile.subscriptionStatus]);

  const runAnalysis = useCallback(async (msgs: Message[]) => {
    const result = await analyzeMoment(msgs);
    if (result) {
      setAnalysis(result);
      storage.saveAnalysis(result);
      if (authUid) {
        cloudDb.saveAnalysis(authUid, result).catch((error) => {
          console.error("Erro ao salvar anÇ­lise na nuvem:", error);
        });
      }
    }
  }, [authUid]);

  const handleSendMessage = async (text: string, image?: string) => {
    if (profile.subscriptionStatus !== 'PREMIUM') {
      if (trialExpired) {
        setShowTrialModal(true);
        return;
      }
      startTrialIfNeeded();
    }
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now(),
      image
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    storage.saveMessages(updatedMessages);
    storage.incrementUsage();
    setDailyCount(prev => prev + 1);

    setIsTyping(true);

    const responseText = await sendMessageToLia(messages, text, profile, image);

    const replyMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    const finalMessages = [...updatedMessages, replyMessage];
    setMessages(finalMessages);
    storage.saveMessages(finalMessages);
    if (authUid) {
      cloudDb.saveMessages(authUid, finalMessages).catch((error) => {
        console.error("Erro ao salvar mensagens na nuvem:", error);
      });
    }
    setIsTyping(false);

    if (finalMessages.length % 5 === 0) {
        runAnalysis(finalMessages);
    }
  };

  const handleRelationshipAnalysis = async (userStats: UserProfile, relData: RelationshipData) => {
    setIsTyping(true);
    setView(AppView.CHAT);
    
    const responseText = await analyzeRelationship(userStats, relData);

    const replyMessage: Message = {
        id: Date.now().toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
    };

    const finalMessages = [...messages, replyMessage];
    setMessages(finalMessages);
    storage.saveMessages(finalMessages);
    if (authUid) {
      cloudDb.saveMessages(authUid, finalMessages).catch((error) => {
        console.error("Erro ao salvar mensagens na nuvem:", error);
      });
      cloudDb.saveRelationship(authUid, relData).catch((error) => {
        console.error("Erro ao salvar relaÇõÇœo na nuvem:", error);
      });
    }
    setIsTyping(false);
  };

  const handleSaveProfile = async (newProfile: UserProfile) => {
    const finalProfile = applyWhitelist({ ...newProfile, hasOnboarded: true });
    const profileToStore = { ...finalProfile };
    delete (profileToStore as any).password;

    setProfile(profileToStore);
    storage.saveProfile(profileToStore);

    try {
      let uid = authUid;
      if (!uid && finalProfile.email && finalProfile.password) {
        const cred = await authApi.signUp(finalProfile.email, finalProfile.password);
        uid = cred.user.uid;
        setAuthUid(uid);
      }
      if (uid) {
        await cloudDb.saveProfile(uid, profileToStore);
        if (messages.length) {
          cloudDb.saveMessages(uid, messages).catch((error) => {
            console.error("Erro ao sincronizar mensagens:", error);
          });
        }
        if (analysis) {
          cloudDb.saveAnalysis(uid, analysis).catch((error) => {
            console.error("Erro ao sincronizar analise:", error);
          });
        }
      }
    } catch (error: any) {
      console.error("Erro ao salvar perfil na nuvem:", error);
      alert(error?.message || "NÇœo foi possÇ­vel salvar seu perfil na nuvem.");
    }

    if (view === AppView.PROFILE) setView(AppView.CHAT);
  };

  const handleNavigate = (target: AppView) => {
    if (target === AppView.ANALYSIS) {
        const now = Date.now();
        const tenMinutes = 10 * 60 * 1000;
        if (!analysis || (now - analysis.lastAnalyzed > tenMinutes && messages.length >= 5)) {
            runAnalysis(messages);
        }
    }
    setView(target);
  };

  // Logic to start from Landing Page
  const handleStartJourney = () => {
    setView(AppView.PROFILE);
  };

  // Logic for Login Success
  const handleLogin = async (email: string, password: string) => {
    try {
      const cred = await authApi.signIn(email, password);
      setAuthUid(cred.user.uid);
      await hydrateFromCloud(cred.user.uid);
      setView(AppView.CHAT);
    } catch (error: any) {
      console.error("Erro ao autenticar:", error);
      throw error;
    }
  };

  const startCheckout = async (plan: 'monthly' | 'annual') => {
    setCheckoutLoading(plan);
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Erro ao iniciar checkout');
      }
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout indisponível');
      }
    } catch (err: any) {
      alert(err?.message || 'Não foi possível iniciar o checkout.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  // Logic for Back button in Profile/Legal
  const handleBack = () => {
    if (profile.hasOnboarded) {
      setView(AppView.CHAT);
    } else {
      setView(AppView.LANDING);
    }
  };

  const renderHeader = () => (
    <header className="bg-lia-bg px-4 py-3 flex items-center justify-between border-b border-lia-accent sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 flex items-center justify-center overflow-hidden">
          <img src="/logo.png" alt="LIA" className="w-14 h-14 object-contain opacity-80" />
        </div>
        <div>
          <h1 className="font-serif text-lia-primary font-bold leading-tight">{APP_NAME}</h1>
          <p className="text-[10px] text-lia-secondary tracking-widest uppercase">Inteligência Estratégica Feminina</p>
        </div>
      </div>
      
      {profile.hasOnboarded && (
        <div className="flex items-center gap-4">
          <button onClick={() => handleNavigate(AppView.RELATIONSHIPS)} className={`text-lia-secondary hover:text-lia-primary transition ${view === AppView.RELATIONSHIPS ? 'text-lia-primary' : ''}`} title="Astrologia Relacional">
             <Heart size={22} />
          </button>
          <button onClick={() => handleNavigate(AppView.ANALYSIS)} className={`text-lia-secondary hover:text-lia-primary transition ${view === AppView.ANALYSIS ? 'text-lia-primary' : ''}`} title="Seu Momento">
             <Activity size={22} />
          </button>
          <button onClick={() => handleNavigate(AppView.PROFILE)} className={`text-lia-secondary hover:text-lia-primary transition ${view === AppView.PROFILE ? 'text-lia-primary' : ''}`} title="Perfil">
             <User size={22} />
          </button>
        </div>
      )}
    </header>
  );

  return (
    <div className="flex justify-center bg-gray-100 min-h-[100svh] font-sans overflow-hidden">
      <div className="w-full max-w-md bg-white shadow-2xl min-h-[100svh] flex flex-col relative overflow-hidden">
        
        {/* Header is shown on CHAT, RELATIONSHIPS, ANALYSIS, but NOT on LANDING, LOGIN, TERMS, PRIVACY or initial PROFILE */}
        {view !== AppView.LANDING && view !== AppView.PROFILE && view !== AppView.LOGIN && view !== AppView.TERMS && view !== AppView.PRIVACY && renderHeader()}
        
        <main className="flex-1 overflow-hidden relative">
          
          {showTrialModal && profile.subscriptionStatus !== 'PREMIUM' && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
                <h3 className="text-xl font-serif text-lia-primary">Tempo de cortesia encerrado</h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  Para continuar conversando com a LIA, escolha um plano Premium.
                  Acesso completo, análises profundas e seu histórico salvo.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => startCheckout('monthly')}
                    disabled={checkoutLoading === 'monthly'}
                    className="w-full bg-lia-primary text-white py-3 rounded-xl shadow-md hover:bg-stone-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading === 'monthly' ? 'Abrindo...' : 'Mensal • R$ 24,90'}
                  </button>
                  <button
                    onClick={() => startCheckout('annual')}
                    disabled={checkoutLoading === 'annual'}
                    className="w-full bg-amber-500 text-white py-3 rounded-xl shadow-md hover:bg-amber-400 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading === 'annual' ? 'Abrindo...' : 'Anual • R$ 97,00'}
                  </button>
                  <button
                    onClick={() => setShowTrialModal(false)}
                    className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-700 transition"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          )}

          {view === AppView.LANDING && (
            <LandingPage 
              onStart={handleStartJourney} 
              onLogin={() => setView(AppView.LOGIN)}
              onOpenTerms={() => setView(AppView.TERMS)}
              onOpenPrivacy={() => setView(AppView.PRIVACY)}
            />
          )}

          {view === AppView.LOGIN && (
            <LoginView 
              onLogin={handleLogin}
              onBack={() => setView(AppView.LANDING)}
              onGoToSignup={() => setView(AppView.PROFILE)}
            />
          )}

          {view === AppView.CHAT && (
            <ChatInterface 
              messages={messages} 
              onSendMessage={handleSendMessage} 
              isTyping={isTyping}
              dailyCount={dailyCount}
              messageLimit={currentLimit}
            />
          )}

          {view === AppView.PROFILE && (
            <ProfileSettings 
              profile={profile} 
              onSave={handleSaveProfile} 
              onClose={handleBack}
              onClearChat={storage.clearChat}
              onFullReset={storage.clearAll}
            />
          )}

          {view === AppView.ANALYSIS && (
            <AnalysisView 
              data={analysis} 
              onClose={() => setView(AppView.CHAT)}
              messagesCount={messages.length}
            />
          )}

          {view === AppView.RELATIONSHIPS && (
            <RelationshipTool 
                userProfile={profile}
                onAnalyze={handleRelationshipAnalysis}
                onClose={() => setView(AppView.CHAT)}
                isLoading={isTyping}
            />
          )}

          {(view === AppView.TERMS || view === AppView.PRIVACY) && (
             <LegalView 
               type={view} 
               onBack={handleBack} 
             />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;

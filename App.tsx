
import React, { useState, useEffect, useCallback } from 'react';
import { UserProfile, Message, AnalysisData, AppView, RelationshipData } from './types';
import { storage } from './services/storage';
import { sendMessageToLia, analyzeMoment, analyzeRelationship } from './services/geminiService';
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
  const [profile, setProfile] = useState<UserProfile>(
    storage.getProfile() || { 
      name: '', 
      sign: '', 
      ascendant: '', 
      hasOnboarded: false,
      subscriptionStatus: 'FREE' 
    }
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
  
  const currentLimit = profile.subscriptionStatus === 'PREMIUM' 
    ? PLAN_LIMITS.PREMIUM 
    : PLAN_LIMITS.FREE;

  useEffect(() => {
    const now = Date.now();
    const tenMinutes = 10 * 60 * 1000;
    if (profile.hasOnboarded && messages.length >= 5 && (!analysis || now - analysis.lastAnalyzed > tenMinutes)) {
        runAnalysis(messages);
    }
  }, []);

  const runAnalysis = useCallback(async (msgs: Message[]) => {
    const result = await analyzeMoment(msgs);
    if (result) {
      setAnalysis(result);
      storage.saveAnalysis(result);
    }
  }, []);

  const handleSendMessage = async (text: string, image?: string) => {
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
    setIsTyping(false);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    storage.saveProfile(newProfile);
    // After saving profile (finishing onboarding), go to CHAT
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
  const handleLoginSuccess = () => {
    // Mock recovering profile
    const updatedProfile = { ...profile, hasOnboarded: true };
    setProfile(updatedProfile);
    storage.saveProfile(updatedProfile);
    setView(AppView.CHAT);
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
        <div className="w-10 h-10 rounded-full bg-lia-primary flex items-center justify-center text-white font-serif text-lg shadow-sm">
          L
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
    <div className="flex justify-center bg-gray-100 min-h-screen font-sans">
      <div className="w-full max-w-md bg-white shadow-2xl h-[100dvh] flex flex-col relative overflow-hidden">
        
        {/* Header is shown on CHAT, RELATIONSHIPS, ANALYSIS, but NOT on LANDING, LOGIN, TERMS, PRIVACY or initial PROFILE */}
        {view !== AppView.LANDING && view !== AppView.PROFILE && view !== AppView.LOGIN && view !== AppView.TERMS && view !== AppView.PRIVACY && renderHeader()}
        
        <main className="flex-1 overflow-hidden relative">
          
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
              onLoginSuccess={handleLoginSuccess}
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

import { Message, UserProfile, AnalysisData } from '../types';

const KEYS = {
  MESSAGES: 'lia_messages',
  PROFILE: 'lia_profile',
  ANALYSIS: 'lia_analysis',
  USAGE: 'lia_usage_date',
  COUNT: 'lia_usage_count'
};

export const storage = {
  saveMessages: (messages: Message[]) => {
    try {
      localStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
    } catch (e) {
      console.error("Storage full or error", e);
    }
  },

  getMessages: (): Message[] => {
    const data = localStorage.getItem(KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  },

  saveProfile: (profile: UserProfile) => {
    localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  getProfile: (): UserProfile | null => {
    const data = localStorage.getItem(KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  saveAnalysis: (data: AnalysisData) => {
    localStorage.setItem(KEYS.ANALYSIS, JSON.stringify(data));
  },

  getAnalysis: (): AnalysisData | null => {
    const data = localStorage.getItem(KEYS.ANALYSIS);
    return data ? JSON.parse(data) : null;
  },

  getUsage: (): number => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem(KEYS.USAGE);
    
    if (storedDate !== today) {
      localStorage.setItem(KEYS.USAGE, today);
      localStorage.setItem(KEYS.COUNT, '0');
      return 0;
    }
    
    return parseInt(localStorage.getItem(KEYS.COUNT) || '0', 10);
  },

  incrementUsage: () => {
    const current = storage.getUsage();
    localStorage.setItem(KEYS.COUNT, (current + 1).toString());
  },

  clearAll: () => {
    localStorage.clear();
    window.location.reload();
  },

  clearChat: () => {
    localStorage.removeItem(KEYS.MESSAGES);
    window.location.reload();
  }
};
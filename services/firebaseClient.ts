import { ref, get, set } from 'firebase/database';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, UserCredential } from 'firebase/auth';
import { db, auth } from '../src/firebase';
import { UserProfile, Message, AnalysisData, RelationshipData } from '../types';

const messagesToObject = (messages: Message[]) =>
  messages.reduce<Record<string, Message>>((acc, msg) => {
    acc[msg.id] = msg;
    return acc;
  }, {});

const objectToMessages = (val: any): Message[] => {
  if (!val || typeof val !== 'object') return [];
  return Object.values(val)
    .filter((m: any) => m && m.id && m.timestamp)
    .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0)) as Message[];
};

export const authApi = {
  signUp: (email: string, password: string): Promise<UserCredential> =>
    createUserWithEmailAndPassword(auth, email, password),
  signIn: (email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password),
};

export const cloudDb = {
  fetchUserData: async (uid: string): Promise<{
    profile: UserProfile | null;
    messages: Message[];
    analysis: AnalysisData | null;
    relationships: Record<string, RelationshipData> | null;
  }> => {
    const snap = await get(ref(db, `users/${uid}`));
    if (!snap.exists()) {
      return { profile: null, messages: [], analysis: null, relationships: null };
    }
    const val = snap.val() || {};
    return {
      profile: val.profile || null,
      messages: objectToMessages(val.messages),
      analysis: val.analysis || null,
      relationships: val.relationships || null,
    };
  },

  saveProfile: async (uid: string, profile: UserProfile) => {
    const { password, ...rest } = profile; // nunca salvar senha no DB
    await set(ref(db, `users/${uid}/profile`), rest);
  },

  saveMessages: async (uid: string, messages: Message[]) => {
    await set(ref(db, `users/${uid}/messages`), messagesToObject(messages));
  },

  saveAnalysis: async (uid: string, analysis: AnalysisData) => {
    await set(ref(db, `users/${uid}/analysis`), analysis);
  },

  saveRelationship: async (uid: string, rel: RelationshipData) => {
    const id = `${Date.now()}`;
    await set(ref(db, `users/${uid}/relationships/${id}`), rel);
    return id;
  },
};

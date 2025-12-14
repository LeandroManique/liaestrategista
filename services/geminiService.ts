import { Message, UserProfile, AnalysisData, RelationshipData } from '../types';
import { auth } from '../src/firebase';

const ensureIdToken = async (): Promise<string> => {
  const user = auth.currentUser;
  if (!user || !user.email) {
    throw new Error('login-required');
  }
  return user.getIdToken(true);
};

const callChatApi = async <T>(body: any): Promise<T> => {
  const token = await ensureIdToken();

  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    if (res.status === 402) {
      throw new Error('payment-required');
    }
    throw new Error(txt || 'AI request failed');
  }

  return res.json() as Promise<T>;
};

export const sendMessageToLia = async (
  history: Message[],
  newMessage: string,
  profile: UserProfile,
  image?: string
): Promise<string> => {
  try {
    const recentHistory = history.slice(-50);
    const data = await callChatApi<{ text: string }>({
      mode: 'chat',
      history: recentHistory,
      newMessage,
      image,
      profile,
    });
    return data.text || 'Nao consegui ler essa conexao agora.';
  } catch (error: any) {
    console.error('Gemini Error:', error);
    if (error?.message === 'login-required') {
      return 'Para continuar, faca login ou crie sua conta.';
    }
    if (error?.message === 'payment-required') {
      return 'Seu acesso gratuito terminou. Assine o Premium para continuar.';
    }
    return 'Desculpe, estou reorganizando meus pensamentos. Tente novamente em instantes.';
  }
};

export const analyzeMoment = async (history: Message[]): Promise<AnalysisData | null> => {
  if (history.length < 5) return null;
  try {
    const data = await callChatApi<{ analysis: AnalysisData | null }>({
      mode: 'analysis',
      history: history.slice(-40),
    });
    return data.analysis || null;
  } catch (error) {
    console.error('Analysis Error:', error);
    return null;
  }
};

export const analyzeRelationship = async (
  userProfile: UserProfile,
  relationship: RelationshipData
): Promise<string> => {
  try {
    const data = await callChatApi<{ text: string }>({
      mode: 'relationship',
      userProfile,
      relationship,
    });
    return data.text || 'Nao consegui ler essa conexao agora.';
  } catch (error: any) {
    console.error('Relationship Error:', error);
    if (error?.message === 'login-required') {
      return 'Para continuar, faca login ou crie sua conta.';
    }
    if (error?.message === 'payment-required') {
      return 'Seu acesso gratuito terminou. Assine o Premium para continuar.';
    }
    return 'Tive um problema ao ler as estrelas dessa relacao. Tente de novo?';
  }
};

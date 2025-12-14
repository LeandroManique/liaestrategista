import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import {
  LIA_SYSTEM_INSTRUCTION,
  ANALYSIS_SYSTEM_INSTRUCTION,
  TEXT_MODEL,
  ANALYSIS_MODEL,
} from '../constants';
import { RelationshipData, Message, UserProfile } from '../types';

const geminiKey = process.env.GEMINI_API_KEY || '';
const ai = geminiKey ? new GoogleGenAI({ apiKey: geminiKey }) : null;

const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;
const firebaseDbUrl = process.env.FIREBASE_DATABASE_URL;

const PREMIUM_WHITELIST = new Set([
  'leandro@zeithco.com',
  'scheilafribeiro@hotmail.com',
  'clarinha@zeithco.com',
  'adm@zeithco.com',
  'bllart@gmail.com'
].map((e) => e.toLowerCase()));

const getAdminApp = () => {
  if (!firebaseServiceAccount) return null;
  if (!getApps().length) {
    initializeApp({
      credential: cert(firebaseServiceAccount),
      databaseURL: firebaseDbUrl,
    });
  }
  return getApps()[0];
};

const getAdminAuth = () => {
  const app = getAdminApp();
  if (!app) return null;
  return getAuth(app);
};

const getAdminDb = () => {
  const app = getAdminApp();
  if (!app || !firebaseDbUrl) return null;
  try {
    return getDatabase(app);
  } catch {
    return null;
  }
};

const parseImageData = (dataUrl: string) => {
  const matches = dataUrl?.match(/^data:(.+);base64,(.+)$/);
  if (matches) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl?.split(',')[1] || dataUrl };
};

const buildPersonalContext = (profile?: UserProfile) => {
  if (!profile) return '';
  let personal = '';
  if (profile.name) personal += `Usuária: ${profile.name}. `;
  if (profile.sign) personal += `Signo: ${profile.sign}. `;
  if (profile.ascendant) personal += `Ascendente: ${profile.ascendant}. `;
  if ((profile as any).numerology?.destination) {
    personal += `Numerologia (Destino): ${(profile as any).numerology.destination}. `;
  }
  return personal;
};

const ensureAuthorized = async (req: VercelRequest) => {
  const adminAuth = getAdminAuth();
  if (!adminAuth) return null;
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token) return null;
  return adminAuth.verifyIdToken(token).catch(() => null);
};

const isPremiumEmail = async (email?: string | null) => {
  if (!email) return false;
  const lower = email.toLowerCase();
  if (PREMIUM_WHITELIST.has(lower)) return true;
  const db = getAdminDb();
  if (!db) return false;
  const key = lower.replace(/\./g, ',');
  try {
    const snap = await db.ref(`emailIndex/${key}/premium`).get();
    return snap.val() === 1;
  } catch (err) {
    console.error('Premium lookup error:', err);
    return false;
  }
};

const handleChat = async (
  history: Message[],
  newMessage: string,
  image: string | undefined,
  profile: UserProfile | undefined
) => {
  const recentHistory = Array.isArray(history) ? history.slice(-50) : [];

  const contents = recentHistory.map((msg) => {
    const parts: any[] = [];
    if (msg.text) parts.push({ text: msg.text });
    if (msg.image) {
      const { mimeType, data } = parseImageData(msg.image);
      parts.push({ inlineData: { mimeType, data } });
    }
    if (parts.length === 0) parts.push({ text: '' });
    return { role: msg.role, parts };
  });

  const newParts: any[] = [];
  if (newMessage) newParts.push({ text: newMessage });
  if (image) {
    const { mimeType, data } = parseImageData(image);
    newParts.push({ inlineData: { mimeType, data } });
  }
  if (!newParts.length) newParts.push({ text: '...' });

  const personalContext = buildPersonalContext(profile);
  const systemInstruction = `${LIA_SYSTEM_INSTRUCTION}\n\nDADOS DA USUÁRIA:\n${personalContext}`;

  const response = await ai!.models.generateContent({
    model: TEXT_MODEL,
    config: {
      systemInstruction,
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
    contents: [
      ...contents,
      { role: 'user', parts: newParts },
    ],
  });

  return response.text || '...';
};

const handleAnalysis = async (history: Message[]) => {
  if (!Array.isArray(history) || history.length < 5) return null;
  const recentHistory = history.slice(-40).map((m) => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

  const response = await ai!.models.generateContent({
    model: ANALYSIS_MODEL,
    config: {
      systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      maxOutputTokens: 8192,
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          confidence: { type: Type.NUMBER, nullable: true },
          confidenceText: { type: Type.STRING },
          wheel: {
            type: Type.OBJECT,
            nullable: true,
            properties: {
              careerPurpose: { type: Type.NUMBER, nullable: true },
              relationships: { type: Type.NUMBER, nullable: true },
              love: { type: Type.NUMBER, nullable: true },
              sexualEnergy: { type: Type.NUMBER, nullable: true },
              healthBody: { type: Type.NUMBER, nullable: true },
              routineEnergy: { type: Type.NUMBER, nullable: true },
              emotionalWellbeing: { type: Type.NUMBER, nullable: true },
              stressOverload: { type: Type.NUMBER, nullable: true },
            },
          },
          focusAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
          dilemmas: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
      },
    },
    contents: [
      { role: 'user', parts: [{ text: `Gere o retrato estratégico deste histórico:\n\n${recentHistory}` }] },
    ],
  });

  const jsonText = response.text;
  if (!jsonText) return null;

  const data = JSON.parse(jsonText);
  return {
    lastAnalyzed: Date.now(),
    confidence: data.confidence ?? null,
    confidenceText: data.confidenceText || 'Sem dados',
    wheel: data.wheel ?? null,
    focusAreas: data.focusAreas || [],
    dilemmas: data.dilemmas || [],
  };
};

const handleRelationship = async (userProfile: UserProfile, relationship: RelationshipData) => {
  const userAstrology = `Sol em ${userProfile.sign}, Ascendente em ${userProfile.ascendant}` +
    (userProfile.moon ? `, Lua em ${userProfile.moon}` : '') +
    (userProfile.venus ? `, Vênus em ${userProfile.venus}` : '') +
    (userProfile.mars ? `, Marte em ${userProfile.mars}` : '');

  const otherAstrology = `Sol em ${relationship.sign}` +
    (relationship.ascendant ? `, Ascendente em ${relationship.ascendant}` : '') +
    (relationship.moon ? `, Lua em ${relationship.moon}` : '') +
    (relationship.venus ? `, Vênus em ${relationship.venus}` : '') +
    (relationship.mars ? `, Marte em ${relationship.mars}` : '');

  const prompt = `
    Analise a dinâmica relacional entre:
    USUÁRIA: ${userProfile.name} (${userAstrology})
    CONEXÃO: ${relationship.name} (${otherAstrology})
    TIPO DE RELAÇÃO: ${relationship.type}

    DIRETRIZES:
    - Atue como LIA (Inteligência Estratégica Feminina).
    - Não faça mapa astral técnico. Fale da dinâmica, da energia e do comportamento.
    - Use o estilo de mensagem curta de WhatsApp.
    - Comece com algo como "Amiga, essa conexão..." ou "Olha, essa combinação...".
    - Destaque a "Parte boa" e o "Ponto de atenção".
    - Não diga "vocês combinam" ou "não combinam". Fale de como FUNCIONA.
    - Finalize com uma pergunta de aprofundamento sobre a realidade deles hoje.
    - Seja elegante, leve e perspicaz.
    - Certifique-se de completar seu pensamento e não cortar a frase no final.
    `;

  const response = await ai!.models.generateContent({
    model: TEXT_MODEL,
    config: {
      systemInstruction: LIA_SYSTEM_INSTRUCTION,
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
    contents: [
      { role: 'user', parts: [{ text: prompt }] },
    ],
  });

  return response.text || 'Não consegui ler essa conexão agora.';
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  if (!ai || !geminiKey) {
    return res.status(500).send('AI not configured');
  }

  const decoded = await ensureAuthorized(req);
  if (!decoded) {
    return res.status(401).send('Unauthorized');
  }

  const premium = await isPremiumEmail(decoded.email);
  if (!premium) {
    return res.status(402).send('Payment required');
  }

  const body = typeof req.body === 'object' ? req.body : {};
  const mode = body.mode || 'chat';

  try {
    if (mode === 'analysis') {
      const analysis = await handleAnalysis(body.history || []);
      return res.status(200).json({ analysis });
    }

    if (mode === 'relationship') {
      const text = await handleRelationship(body.userProfile, body.relationship);
      return res.status(200).json({ text });
    }

    const text = await handleChat(body.history || [], body.newMessage || '', body.image, body.profile);
    return res.status(200).json({ text });
  } catch (err: any) {
    console.error('Chat handler error', err);
    return res.status(500).send(err?.message || 'AI request failed');
  }
}

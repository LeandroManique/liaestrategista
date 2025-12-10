
import { GoogleGenAI, Type } from "@google/genai";
import { Message, UserProfile, AnalysisData, RelationshipData } from '../types';
import { LIA_SYSTEM_INSTRUCTION, ANALYSIS_SYSTEM_INSTRUCTION, TEXT_MODEL, ANALYSIS_MODEL } from '../constants';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to extract base64 data and mimeType from Data URL
const parseImageData = (dataUrl: string) => {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (matches) {
    return { mimeType: matches[1], data: matches[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl.split(',')[1] || dataUrl };
};

export const sendMessageToLia = async (
  history: Message[],
  newMessage: string,
  profile: UserProfile,
  image?: string
): Promise<string> => {
  if (!apiKey) throw new Error("API Key missing");

  let personalContext = "";
  if (profile.name) personalContext += `Usuária: ${profile.name}. `;
  if (profile.sign) personalContext += `Signo: ${profile.sign}. `;
  if (profile.ascendant) personalContext += `Ascendente: ${profile.ascendant}. `;
  if (profile.numerology) {
     personalContext += `Numerologia (Destino): ${profile.numerology.destination}. `;
  }

  const systemInstruction = `${LIA_SYSTEM_INSTRUCTION}\n\nDADOS DA USUÁRIA:\n${personalContext}`;

  // OPTIMIZATION: Slice history to last 50 messages
  const recentHistory = history.slice(-50);

  const contents = recentHistory.map(msg => {
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
  if (newParts.length === 0) newParts.push({ text: '...' });

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
        maxOutputTokens: 8192, 
      },
      contents: [
        ...contents,
        { role: 'user', parts: newParts }
      ]
    });

    return response.text || "...";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Desculpe, estou reorganizando meus pensamentos. Tente novamente em instantes.";
  }
};

export const analyzeMoment = async (history: Message[]): Promise<AnalysisData | null> => {
  if (!apiKey || history.length < 5) return null;

  const recentHistory = history.slice(-40).map(m => `${m.role.toUpperCase()}: ${m.text}`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      config: {
        systemInstruction: ANALYSIS_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
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
                    }
                },
                focusAreas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                dilemmas: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        }
      },
      contents: [
        { role: 'user', parts: [{ text: `Gere o retrato estratégico deste histórico:\n\n${recentHistory}` }] }
      ]
    });

    const jsonText = response.text;
    if (!jsonText) return null;

    const data = JSON.parse(jsonText);
    
    return {
      lastAnalyzed: Date.now(),
      confidence: data.confidence ?? null,
      confidenceText: data.confidenceText || "Sem dados",
      wheel: data.wheel ?? null,
      focusAreas: data.focusAreas || [],
      dilemmas: data.dilemmas || []
    };

  } catch (error) {
    console.error("Analysis Error:", error);
    return null;
  }
};

export const analyzeRelationship = async (
  userProfile: UserProfile, 
  relationship: RelationshipData
): Promise<string> => {
    if (!apiKey) return "Erro de configuração da API.";

    // Construct detailed astrology string for the user
    const userAstrology = `Sol em ${userProfile.sign}, Ascendente em ${userProfile.ascendant}` +
                          (userProfile.moon ? `, Lua em ${userProfile.moon}` : '') +
                          (userProfile.venus ? `, Vênus em ${userProfile.venus}` : '') +
                          (userProfile.mars ? `, Marte em ${userProfile.mars}` : '');

    // Construct detailed astrology string for the partner
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
    - Destaque a "Parte boa" e o "Ponto de atenção" (pode usar esses termos ou variações fluidas).
    - Não diga "vocês combinam" ou "não combinam". Fale de como FUNCIONA.
    - Finalize com uma pergunta de aprofundamento sobre a realidade deles hoje.
    - Seja elegante, leve e perspicaz.
    - Certifique-se de completar seu pensamento e não cortar a frase no final.
    `;

    try {
        const response = await ai.models.generateContent({
            model: TEXT_MODEL,
            config: {
                systemInstruction: LIA_SYSTEM_INSTRUCTION, 
                temperature: 0.7,
                maxOutputTokens: 8192, // Aumentado para 8192 para evitar cortes
            },
            contents: [
                { role: 'user', parts: [{ text: prompt }] }
            ]
        });
        return response.text || "Não consegui ler essa conexão agora.";
    } catch (e) {
        console.error(e);
        return "Tive um problema ao ler as estrelas dessa relação. Tente de novo?";
    }
};


export interface NumerologyData {
  destination: number; // Destino
  expression: number;  // Expressão
  personality: number; // Personalidade
  personalYear: number; // Ano Pessoal
}

export type SubscriptionStatus = 'FREE' | 'PREMIUM';

export interface UserProfile {
  name: string;
  birthDate?: string; // YYYY-MM-DD
  sign: string;
  ascendant: string;
  moon?: string;
  venus?: string;
  mars?: string;
  hasOnboarded: boolean;
  numerology?: NumerologyData;
  subscriptionStatus: SubscriptionStatus;
  email?: string; // Para futuro login
  password?: string; // Para futuro login (simulação)
  uid?: string;   // Para futuro Firebase ID
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  image?: string; // Base64
}

export interface WheelOfLife {
  careerPurpose: number | null;      // Carreira e Propósito
  relationships: number | null;      // Relacionamentos (não românticos)
  love: number | null;               // Amor / Vínculos Afetivos
  sexualEnergy: number | null;       // Energia Sexual e Intimidade
  healthBody: number | null;         // Saúde e Corpo
  routineEnergy: number | null;      // Rotina e Energia Física
  emotionalWellbeing: number | null; // Bem-estar emocional
  stressOverload: number | null;     // Estresse / Sobrecarga
}

export interface AnalysisData {
  lastAnalyzed: number; // Timestamp
  confidence: number | null; // 0-100
  confidenceText: string; // Ex: "Estável", "Oscilando"
  wheel: WheelOfLife | null;
  focusAreas: string[];
  dilemmas: string[];
}

export interface RelationshipData {
  name: string;
  type: 'Amoroso' | 'Amizade' | 'Família' | 'Trabalho';
  sign: string;
  ascendant?: string;
  moon?: string;
  venus?: string;
  mars?: string;
}

export enum AppView {
  LANDING = 'LANDING',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  ANALYSIS = 'ANALYSIS',
  RELATIONSHIPS = 'RELATIONSHIPS',
  LOGIN = 'LOGIN',
  TERMS = 'TERMS',
  PRIVACY = 'PRIVACY'
}


import { NumerologyData } from '../types';

const sumDigits = (n: number): number => {
  let sum = 0;
  while (n > 0 || sum > 9) {
    if (n === 0) {
      n = sum;
      sum = 0;
    }
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
};

// Mapeamento simples de letras para números (Tabela Pitagórica)
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8
};

const normalizeStr = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const calculateWordValue = (word: string): number => {
  let sum = 0;
  const clean = normalizeStr(word);
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (LETTER_VALUES[char]) {
      sum += LETTER_VALUES[char];
    }
  }
  return sumDigits(sum);
};

// Consoantes apenas
const calculateConsonants = (word: string): number => {
  let sum = 0;
  const clean = normalizeStr(word);
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (LETTER_VALUES[char] && !vowels.includes(char)) {
      sum += LETTER_VALUES[char];
    }
  }
  return sumDigits(sum);
};

export const calculateNumerology = (name: string, birthDateStr: string): NumerologyData => {
  // Destino: Soma da data de nascimento
  const [year, month, day] = birthDateStr.split('-').map(Number);
  // Soma linear de todos os dígitos da data
  let fullDateStr = `${day}${month}${year}`;
  let destSum = 0;
  for(let char of fullDateStr) destSum += parseInt(char);
  const destination = sumDigits(destSum);

  // Expressão: Soma de todas as letras do nome
  const expression = calculateWordValue(name);

  // Personalidade: Soma das consoantes
  const personality = calculateConsonants(name);

  // Ano Pessoal: Dia Nasc + Mês Nasc + Ano Atual
  const currentYear = new Date().getFullYear();
  let personalYearStr = `${day}${month}${currentYear}`;
  let pySum = 0;
  for(let char of personalYearStr) pySum += parseInt(char);
  const personalYear = sumDigits(pySum);

  return {
    destination,
    expression,
    personality,
    personalYear
  };
};

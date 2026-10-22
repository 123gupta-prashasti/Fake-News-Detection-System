export interface LinguisticIndicators {
  sensationalismScore: number; // 0 - 100
  excessiveCapsScore: number;  // 0 - 100
  punctuationScore: number;    // 0 - 100
  clickbaitScore: number;      // 0 - 100
  fearOutrageScore: number;    // 0 - 100
  unsupportedCertaintyScore: number; // 0 - 100
  compositeManipulationScore: number; // 0 - 100
  capsRatio: number;           // percentage
  exclamationCount: number;
  detectedClickbaitPhrases: string[];
  detectedSensationalWords: string[];
  detectedFearWords: string[];
  detectedCertaintyWords: string[];
  summary: string;
  disclaimer: string;
}

const SENSATIONAL_WORDS = [
  'shocking', 'bombshell', 'miracle', 'mind-blowing', 'unbelievable',
  'astounding', 'insane', 'horrifying', 'epic', 'monumental',
  'shattering', 'mind-boggling', 'staggering', 'sensational',
  'explosive', 'jaw-dropping', 'furious', 'banned'
];

const CLICKBAIT_PATTERNS = [
  /you won'?t believe/i,
  /what happens next/i,
  /doctors hate (this|him|her)/i,
  /they don'?t want you to know/i,
  /this one weird trick/i,
  /will blow your mind/i,
  /the secret they hide/i,
  /the truth about/i,
  /before it gets deleted/i,
  /watch before it'?s banned/i,
  /number \d+ will shock you/i,
  /everyone is talking about/i,
  /change everything/i
];

const FEAR_OUTRAGE_WORDS = [
  'deadly', 'fatal', 'catastrophe', 'panic', 'doomed', 'apocalyptic',
  'poison', 'exterminate', 'toxic', 'bioweapon', 'slaughter', 'massacre',
  'terror', 'ruined', 'destroyed', 'annihilation', 'traitor', 'treason',
  'evil', 'nightmare'
];

const UNSUPPORTED_CERTAINTY = [
  '100% proven', 'indisputable', 'undeniably', 'absolutely certain',
  'zero doubt', 'without question', 'irrefutable proof', 'guaranteed',
  'everyone knows', 'fact that cannot be denied', 'conclusively proven'
];

export function analyzeLinguisticManipulation(text: string): LinguisticIndicators {
  if (!text || text.trim().length === 0) {
    return {
      sensationalismScore: 0,
      excessiveCapsScore: 0,
      punctuationScore: 0,
      clickbaitScore: 0,
      fearOutrageScore: 0,
      unsupportedCertaintyScore: 0,
      compositeManipulationScore: 0,
      capsRatio: 0,
      exclamationCount: 0,
      detectedClickbaitPhrases: [],
      detectedSensationalWords: [],
      detectedFearWords: [],
      detectedCertaintyWords: [],
      summary: 'Insufficient text for linguistic analysis.',
      disclaimer: 'This is a linguistic manipulation indicator, not proof of fake news.'
    };
  }

  const words = text.split(/\s+/).filter(w => w.length > 0);
  const totalWords = words.length || 1;

  // 1. Excessive Capitalization
  // Words with length >= 2 in ALL CAPS (excluding common acronyms like NASA, WHO, USA, UK, EU, FBI, CDC, MIT)
  const knownAcronyms = new Set(['NASA', 'WHO', 'USA', 'UK', 'EU', 'FBI', 'CDC', 'MIT', 'UN', 'FDA', 'IMF', 'CIA', 'EPA', 'DNA', 'RNA', 'AI', 'CEO', 'CFO']);
  const allCapsWords = words.filter(w => {
    const cleanW = w.replace(/[^A-Za-z]/g, '');
    return cleanW.length >= 2 && cleanW === cleanW.toUpperCase() && !knownAcronyms.has(cleanW);
  });
  const capsRatio = Math.min(100, Math.round((allCapsWords.length / totalWords) * 100));
  // Score: 0 to 100
  const excessiveCapsScore = Math.min(100, Math.round(capsRatio * 3.5));

  // 2. Repeated and Excessive Exclamation / Question marks
  const exclamationMatches = text.match(/!{1,}/g) || [];
  const multipleExclamationMatches = text.match(/(!{2,}|\?{2,}|!\?|\?!)/g) || [];
  const exclamationCount = exclamationMatches.reduce((acc, curr) => acc + curr.length, 0);
  let punctuationScore = 0;
  if (multipleExclamationMatches.length > 0) {
    punctuationScore += Math.min(60, multipleExclamationMatches.length * 20);
  }
  punctuationScore += Math.min(40, (exclamationCount / (totalWords / 20 || 1)) * 30);
  punctuationScore = Math.min(100, Math.round(punctuationScore));

  // 3. Sensational Words
  const lowerText = text.toLowerCase();
  const detectedSensationalWords: string[] = [];
  for (const sw of SENSATIONAL_WORDS) {
    const reg = new RegExp(`\\b${sw}\\b`, 'gi');
    if (reg.test(lowerText)) {
      detectedSensationalWords.push(sw);
    }
  }
  const sensationalismScore = Math.min(100, Math.round((detectedSensationalWords.length / (totalWords / 50 || 1)) * 35));

  // 4. Clickbait patterns
  const detectedClickbaitPhrases: string[] = [];
  for (const pattern of CLICKBAIT_PATTERNS) {
    const m = text.match(pattern);
    if (m) {
      detectedClickbaitPhrases.push(m[0]);
    }
  }
  const clickbaitScore = Math.min(100, detectedClickbaitPhrases.length * 30);

  // 5. Fear and Outrage Language
  const detectedFearWords: string[] = [];
  for (const fw of FEAR_OUTRAGE_WORDS) {
    const reg = new RegExp(`\\b${fw}\\b`, 'gi');
    if (reg.test(lowerText)) {
      detectedFearWords.push(fw);
    }
  }
  const fearOutrageScore = Math.min(100, Math.round((detectedFearWords.length / (totalWords / 40 || 1)) * 30));

  // 6. Unsupported Certainty
  const detectedCertaintyWords: string[] = [];
  for (const cw of UNSUPPORTED_CERTAINTY) {
    if (lowerText.includes(cw)) {
      detectedCertaintyWords.push(cw);
    }
  }
  const unsupportedCertaintyScore = Math.min(100, detectedCertaintyWords.length * 25);

  // Composite manipulation score (weighted average)
  const compositeManipulationScore = Math.min(100, Math.round(
    sensationalismScore * 0.25 +
    clickbaitScore * 0.25 +
    excessiveCapsScore * 0.15 +
    punctuationScore * 0.15 +
    fearOutrageScore * 0.10 +
    unsupportedCertaintyScore * 0.10
  ));

  let summary = '';
  if (compositeManipulationScore >= 60) {
    summary = `High degree of rhetorical manipulation detected (${compositeManipulationScore}/100), including heavy clickbait phrasing, sensationalized vocabulary, and emotional triggers.`;
  } else if (compositeManipulationScore >= 30) {
    summary = `Moderate stylistic styling detected (${compositeManipulationScore}/100) with occasional emotive or dramatic framing.`;
  } else {
    summary = `Low linguistic manipulation detected (${compositeManipulationScore}/100). The prose maintains standard editorial and objective tone.`;
  }

  return {
    sensationalismScore,
    excessiveCapsScore,
    punctuationScore,
    clickbaitScore,
    fearOutrageScore,
    unsupportedCertaintyScore,
    compositeManipulationScore,
    capsRatio,
    exclamationCount,
    detectedClickbaitPhrases,
    detectedSensationalWords,
    detectedFearWords,
    detectedCertaintyWords,
    summary,
    disclaimer: 'This is a linguistic manipulation indicator, not proof of fake news.'
  };
}

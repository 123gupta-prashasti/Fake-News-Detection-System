export interface ExtractedClaim {
  id: string;
  claimText: string;
  factualityConfidence: number; // 0 - 100
  keyEntities: string[];
  verificationStatus: 'Supported' | 'Contradicted' | 'Insufficient Evidence';
  evidence?: {
    source: string;
    url: string;
    snippet: string;
    credibilityRating?: string;
  };
  explanation: string;
}

const ASSERTION_SIGNALS = [
  /\b(reported|confirmed|announced|stated|declared|signed|passed|voted|ruled)\b/i,
  /\b(\d+(?:\.\d+)?%|\bpercent\b|\bmillion\b|\bbillion\b|\btrillion\b|\$\d+)/i,
  /\b(approved|banned|discovered|developed|launched|arrested|tested|proved)\b/i,
  /\b(according to|evidence shows|data reveals|study finds|researchers at)\b/i,
  /\b(cure|causes|treats|infects|kills|destroys|suppresses|leaked)\b/i
];

export function extractFactualClaims(articleText: string, maxClaims = 5): ExtractedClaim[] {
  if (!articleText || articleText.trim().length === 0) {
    return [];
  }

  // Sentence segmentation
  const rawSentences = articleText
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 300);

  const scoredClaims: { text: string; score: number; entities: string[] }[] = [];

  for (const sentence of rawSentences) {
    let score = 30; // base score

    // Check assertion markers
    for (const pattern of ASSERTION_SIGNALS) {
      if (pattern.test(sentence)) {
        score += 15;
      }
    }

    // Numbers & statistics strongly indicate factual claims
    if (/\d+/.test(sentence)) score += 15;

    // Proper nouns / Capitalized terms (rough named entity recognition)
    const capitalizedTokens = sentence.match(/\b[A-Z][a-z]{2,}\b/g) || [];
    const nonInitialCaps = capitalizedTokens.slice(1);
    const entities = Array.from(new Set(nonInitialCaps)).slice(0, 4);

    if (entities.length > 0) {
      score += Math.min(25, entities.length * 8);
    }

    // Penalize questions or conversational fillers
    if (sentence.endsWith('?')) score -= 30;
    if (/^(what|why|how|who|can|should|would|is it true)\b/i.test(sentence)) score -= 20;

    if (score >= 45) {
      scoredClaims.push({
        text: sentence,
        score: Math.min(95, score),
        entities
      });
    }
  }

  // Sort by factuality score
  scoredClaims.sort((a, b) => b.score - a.score);

  // Return formatted claims
  return scoredClaims.slice(0, maxClaims).map((sc, index) => ({
    id: `claim_${index + 1}`,
    claimText: sc.text,
    factualityConfidence: sc.score,
    keyEntities: sc.entities,
    verificationStatus: 'Insufficient Evidence',
    explanation: 'Claim identified for factual verification. Pending evidence cross-referencing.'
  }));
}

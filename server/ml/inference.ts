import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractTokens } from './preprocessor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface ModelThresholds {
  likely_real_max: number; // default 0.35
  suspicious_max: number;  // default 0.65
  likely_fake_min: number; // default 0.65
}

export interface FeatureContribution {
  token: string;
  weight: number;
  direction: 'fake' | 'real';
  impact: 'high' | 'medium' | 'low';
}

export interface PredictionResult {
  probabilityFake: number;
  probabilityReal: number;
  prediction: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake';
  rawPredictionClass: 0 | 1;
  modelConfidence: number; // 0 - 100%
  logit: number;
  matchedTokensCount: number;
  totalTokensCount: number;
  featureContributions: FeatureContribution[];
  topFakeTokens: FeatureContribution[];
  topRealTokens: FeatureContribution[];
  explanation: string;
}

let modelData: {
  vocabulary: Record<string, number>;
  idf: number[];
  coef: number[];
  intercept: number;
  thresholds: ModelThresholds;
  metadata?: any;
} | null = null;

function loadModel() {
  if (modelData) return modelData;
  const modelPath = path.join(__dirname, 'model_export.json');
  if (!fs.existsSync(modelPath)) {
    throw new Error('Model export file not found at ' + modelPath);
  }
  const raw = fs.readFileSync(modelPath, 'utf-8');
  modelData = JSON.parse(raw);
  return modelData!;
}

export function getModelConfig() {
  return loadModel();
}

export function updateModelThresholds(newThresholds: Partial<ModelThresholds>) {
  const model = loadModel();
  if (newThresholds.likely_real_max !== undefined) {
    model.thresholds.likely_real_max = newThresholds.likely_real_max;
  }
  if (newThresholds.likely_fake_min !== undefined) {
    model.thresholds.likely_fake_min = newThresholds.likely_fake_min;
    model.thresholds.suspicious_max = newThresholds.likely_fake_min;
  }
  return model.thresholds;
}

export function predictNews(rawText: string): PredictionResult {
  const model = loadModel();
  const tokens = extractTokens(rawText);

  // Term frequency counts
  const termCounts: Record<string, number> = {};
  for (const t of tokens) {
    termCounts[t] = (termCounts[t] || 0) + 1;
  }

  // Compute TF-IDF vector for vocabulary tokens
  const activeFeatures: { index: number; token: string; tfidf: number }[] = [];
  let sumSquares = 0;

  for (const [token, count] of Object.entries(termCounts)) {
    const vocabIdx = model.vocabulary[token];
    if (vocabIdx !== undefined && vocabIdx < model.idf.length) {
      // Sublinear TF: 1 + ln(count)
      const tf = 1 + Math.log(count);
      const idf = model.idf[vocabIdx];
      const val = tf * idf;
      activeFeatures.push({ index: vocabIdx, token, tfidf: val });
      sumSquares += val * val;
    }
  }

  // L2 Normalization
  const l2Norm = Math.sqrt(sumSquares) || 1.0;
  const normalizedVector: Record<number, number> = {};
  for (const feat of activeFeatures) {
    normalizedVector[feat.index] = feat.tfidf / l2Norm;
  }

  // Dot product with coefficients + intercept
  let logit = model.intercept;
  const contributions: FeatureContribution[] = [];

  for (const feat of activeFeatures) {
    const normX = normalizedVector[feat.index];
    const weight = model.coef[feat.index];
    const contribution = normX * weight;
    logit += contribution;

    const absWeight = Math.abs(contribution);
    const impact = absWeight > 0.4 ? 'high' : absWeight > 0.15 ? 'medium' : 'low';

    contributions.push({
      token: feat.token,
      weight: parseFloat(contribution.toFixed(4)),
      direction: contribution >= 0 ? 'fake' : 'real',
      impact
    });
  }

  // Sigmoid activation: 1 / (1 + exp(-z))
  const probFake = 1 / (1 + Math.exp(-logit));
  const probReal = 1 - probFake;

  // Outcome based on thresholds
  let prediction: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake';
  let modelConfidence: number;

  const realThreshold = model.thresholds.likely_real_max ?? 0.35;
  const fakeThreshold = model.thresholds.likely_fake_min ?? 0.65;

  if (probFake < realThreshold) {
    prediction = 'Likely Real';
    // Confidence in real prediction
    modelConfidence = Math.round(probReal * 100);
  } else if (probFake > fakeThreshold) {
    prediction = 'Likely Fake';
    // Confidence in fake prediction
    modelConfidence = Math.round(probFake * 100);
  } else {
    prediction = 'Suspicious / Needs Verification';
    // Uncertainty / borderline confidence
    modelConfidence = Math.round((1 - Math.abs(probFake - 0.5) * 2) * 100);
  }

  // Sort contributions
  const topFakeTokens = contributions
    .filter(c => c.direction === 'fake')
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8);

  const topRealTokens = contributions
    .filter(c => c.direction === 'real')
    .sort((a, b) => a.weight - b.weight)
    .slice(0, 8);

  let explanation = '';
  if (prediction === 'Likely Fake') {
    explanation = `The machine learning model predicted high misinformation risk (P(Fake) = ${(probFake * 100).toFixed(1)}%). Dominant lexical features driving this decision include: ${topFakeTokens.map(t => `"${t.token}"`).join(', ')}.`;
  } else if (prediction === 'Likely Real') {
    explanation = `The machine learning model identified strong markers of journalistic and verified reporting (P(Real) = ${(probReal * 100).toFixed(1)}%). Credible feature signals include: ${topRealTokens.map(t => `"${t.token}"`).join(', ')}.`;
  } else {
    explanation = `The model determined this content is borderline or ambiguous (P(Fake) = ${(probFake * 100).toFixed(1)}%), neither strongly matching confirmed factual wire reports nor typical sensational disinformation patterns. Manual or claim-level verification is strongly advised.`;
  }

  return {
    probabilityFake: parseFloat(probFake.toFixed(4)),
    probabilityReal: parseFloat(probReal.toFixed(4)),
    prediction,
    rawPredictionClass: probFake >= 0.5 ? 1 : 0,
    modelConfidence,
    logit: parseFloat(logit.toFixed(4)),
    matchedTokensCount: activeFeatures.length,
    totalTokensCount: tokens.length,
    featureContributions: contributions,
    topFakeTokens,
    topRealTokens,
    explanation
  };
}

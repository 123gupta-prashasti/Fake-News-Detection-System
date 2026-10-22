export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface FeatureContribution {
  token: string;
  weight: number;
  direction: 'fake' | 'real';
  impact: 'high' | 'medium' | 'low';
}

export interface LinguisticIndicators {
  sensationalismScore: number;
  excessiveCapsScore: number;
  punctuationScore: number;
  clickbaitScore: number;
  fearOutrageScore: number;
  unsupportedCertaintyScore: number;
  compositeManipulationScore: number;
  capsRatio: number;
  exclamationCount: number;
  detectedClickbaitPhrases: string[];
  detectedSensationalWords: string[];
  detectedFearWords: string[];
  summary: string;
  disclaimer: string;
}

export interface SourceAssessment {
  domain: string | null;
  publisher: string | null;
  author: string | null;
  publishDate: string | null;
  citationsFound: number;
  hasByline: boolean;
  hasTimestamp: boolean;
  domainCategory: string;
  credibilityScore: number;
  verdict: 'High Credibility' | 'Moderate Credibility' | 'Unverified / Unknown' | 'Low Credibility' | string;
  summary: string;
  factors: Array<{
    factor: string;
    status: 'positive' | 'negative' | 'neutral' | 'unverified' | string;
    impact: string;
  }>;
}

export interface Claim {
  id: string;
  claimText: string;
  factualityConfidence: number;
  keyEntities: string[];
  verificationStatus: 'Supported' | 'Contradicted' | 'Insufficient Evidence' | 'Unverified';
  evidence?: {
    source: string;
    url: string;
    snippet: string;
    publisher?: string;
    credibilityRating?: string;
  };
  explanation: string;
  conflictingDetails?: string;
}

export interface StandaloneClaimVerification {
  claimText: string;
  verdict: 'Supported' | 'Contradicted' | 'Insufficient Evidence';
  confidence: number;
  evidence?: {
    source: string;
    url: string;
    snippet: string;
    publisher?: string;
    credibilityRating?: string;
  };
  explanation: string;
  conflictingDetails?: string;
}

export interface NewsAnalysis {
  _id: string;
  userId: string;
  userEmail?: string;
  inputHeadline?: string;
  rawInputText: string;
  extractedText: string;
  inputType: 'text' | 'url';
  sourceUrl?: string;
  sourceDomain?: string;
  prediction: 'Likely Real' | 'Suspicious / Needs Verification' | 'Likely Fake';
  overallRiskScore: number;
  modelConfidence: number;
  mlProbabilityFake: number;
  category?: string;
  featureContributions: FeatureContribution[];
  linguisticIndicators: LinguisticIndicators;
  sourceAssessment: SourceAssessment;
  claims: Claim[];
  reasons: string[];
  createdAt: string;
}

export interface DashboardStats {
  totalAnalyses: number;
  likelyFakeCount: number;
  suspiciousCount: number;
  likelyRealCount: number;
  averageRiskScore: number;
  riskDistribution: Array<{ bucket: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  recentAnalyses: NewsAnalysis[];
}

export interface ModelMetrics {
  model_type: string;
  dataset: string;
  total_samples: number;
  train_samples: number;
  test_samples: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: number[][];
  confusion_matrix_labels: {
    true_negative: number;
    false_positive: number;
    false_negative: number;
    true_positive: number;
  };
  classification_report: Record<string, {
    precision: number;
    recall: number;
    f1_score: number;
    support: number;
  }>;
  top_fake_indicators: Array<{ word: string; weight: number }>;
  top_real_indicators: Array<{ word: string; weight: number }>;
}

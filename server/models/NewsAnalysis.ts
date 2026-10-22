import mongoose, { Schema } from 'mongoose';

export interface INewsAnalysis {
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
  featureContributions: Array<{
    token: string;
    weight: number;
    direction: 'fake' | 'real';
    impact: 'high' | 'medium' | 'low';
  }>;
  linguisticIndicators: {
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
  };
  sourceAssessment: {
    domain: string | null;
    publisher: string | null;
    author: string | null;
    publishDate: string | null;
    citationsFound: number;
    hasByline: boolean;
    hasTimestamp: boolean;
    domainCategory: string;
    credibilityScore: number;
    verdict: string;
    summary: string;
    factors: Array<{
      factor: string;
      status: string;
      impact: string;
    }>;
  };
  claims: Array<{
    id: string;
    claimText: string;
    factualityConfidence: number;
    keyEntities: string[];
    verificationStatus: 'Supported' | 'Contradicted' | 'Insufficient Evidence' | 'Unverified';
    evidence?: {
      source: string;
      url: string;
      snippet: string;
      credibilityRating?: string;
    };
    explanation: string;
  }>;
  reasons: string[];
  createdAt: Date;
}

const NewsAnalysisSchema = new Schema<INewsAnalysis>({
  _id: { type: String, required: true },
  userId: { type: String, required: true, index: true },
  userEmail: { type: String },
  inputHeadline: { type: String },
  rawInputText: { type: String, required: true },
  extractedText: { type: String, required: true },
  inputType: { type: String, enum: ['text', 'url'], default: 'text' },
  sourceUrl: { type: String },
  sourceDomain: { type: String },
  prediction: {
    type: String,
    enum: ['Likely Real', 'Suspicious / Needs Verification', 'Likely Fake'],
    required: true,
    index: true
  },
  overallRiskScore: { type: Number, required: true },
  modelConfidence: { type: Number, required: true },
  mlProbabilityFake: { type: Number, required: true },
  category: { type: String, default: 'general' },
  featureContributions: [{
    token: String,
    weight: Number,
    direction: { type: String, enum: ['fake', 'real'] },
    impact: { type: String, enum: ['high', 'medium', 'low'] }
  }],
  linguisticIndicators: {
    sensationalismScore: Number,
    excessiveCapsScore: Number,
    punctuationScore: Number,
    clickbaitScore: Number,
    fearOutrageScore: Number,
    unsupportedCertaintyScore: Number,
    compositeManipulationScore: Number,
    capsRatio: Number,
    exclamationCount: Number,
    detectedClickbaitPhrases: [String],
    detectedSensationalWords: [String],
    detectedFearWords: [String],
    summary: String,
    disclaimer: String
  },
  sourceAssessment: {
    domain: String,
    publisher: String,
    author: String,
    publishDate: String,
    citationsFound: Number,
    hasByline: Boolean,
    hasTimestamp: Boolean,
    domainCategory: String,
    credibilityScore: Number,
    verdict: String,
    summary: String,
    factors: [{
      factor: String,
      status: String,
      impact: String
    }]
  },
  claims: [{
    id: String,
    claimText: String,
    factualityConfidence: Number,
    keyEntities: [String],
    verificationStatus: { type: String, enum: ['Supported', 'Contradicted', 'Insufficient Evidence', 'Unverified'] },
    evidence: {
      source: String,
      url: String,
      snippet: String,
      credibilityRating: String
    },
    explanation: String
  }],
  reasons: [String],
  createdAt: { type: Date, default: Date.now, index: true }
});

export const NewsAnalysisModel = mongoose.models.NewsAnalysis || mongoose.model<INewsAnalysis>('NewsAnalysis', NewsAnalysisSchema);

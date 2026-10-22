import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { isMongoDBConnected } from '../config/db.js';
import { UserModel, IUser } from '../models/User.js';
import { NewsAnalysisModel, INewsAnalysis } from '../models/NewsAnalysis.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCAL_DB_PATH = path.join(__dirname, 'local_db.json');

interface LocalDB {
  users: Array<{
    _id: string;
    name: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    createdAt: string;
  }>;
  analyses: Array<any>;
}

let localCache: LocalDB | null = null;

function loadLocalDB(): LocalDB {
  if (localCache) return localCache;

  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
      localCache = data;
      return localCache!;
    } catch {
      // Fall through to initial seed
    }
  }

  // Initial Seed
  const salt = bcrypt.genSaltSync(10);
  const initialAdminPass = bcrypt.hashSync('AdminPass123!', salt);
  const initialAnalystPass = bcrypt.hashSync('AnalystPass123!', salt);

  localCache = {
    users: [
      {
        _id: 'usr_admin_001',
        name: 'Dr. Evelyn Reed (Lead Auditor)',
        email: 'admin@newsverify.org',
        password: initialAdminPass,
        role: 'admin',
        createdAt: '2026-09-01T10:00:00Z'
      },
      {
        _id: 'usr_analyst_002',
        name: 'Alex Rivera (Fact Checker)',
        email: 'analyst@newsverify.org',
        password: initialAnalystPass,
        role: 'user',
        createdAt: '2026-09-15T14:30:00Z'
      }
    ],
    analyses: [
      {
        _id: 'ana_demo_001',
        userId: 'usr_analyst_002',
        userEmail: 'analyst@newsverify.org',
        inputHeadline: 'Lemon Water Cancer Cure Claims Go Viral',
        rawInputText: 'BREAKING: Scientists confirm drinking boiled lemon water cure all stages of cancer in 48 hours without chemotherapy doctors hate this!',
        extractedText: 'BREAKING: Scientists confirm drinking boiled lemon water cure all stages of cancer in 48 hours without chemotherapy doctors hate this!',
        inputType: 'text',
        prediction: 'Likely Fake',
        overallRiskScore: 89,
        modelConfidence: 94,
        mlProbabilityFake: 0.942,
        category: 'health',
        featureContributions: [
          { token: 'cure', weight: 0.42, direction: 'fake', impact: 'high' },
          { token: 'cancer', weight: 0.35, direction: 'fake', impact: 'high' },
          { token: 'doctors', weight: 0.31, direction: 'fake', impact: 'medium' }
        ],
        linguisticIndicators: {
          sensationalismScore: 85,
          excessiveCapsScore: 35,
          punctuationScore: 40,
          clickbaitScore: 90,
          fearOutrageScore: 10,
          unsupportedCertaintyScore: 75,
          compositeManipulationScore: 78,
          capsRatio: 12,
          exclamationCount: 1,
          detectedClickbaitPhrases: ['doctors hate this'],
          detectedSensationalWords: ['cure', 'stages'],
          detectedFearWords: [],
          summary: 'High degree of rhetorical manipulation detected.',
          disclaimer: 'This is a linguistic manipulation indicator, not proof of fake news.'
        },
        sourceAssessment: {
          domain: null,
          publisher: null,
          author: null,
          publishDate: null,
          citationsFound: 0,
          hasByline: false,
          hasTimestamp: false,
          domainCategory: 'unspecified',
          credibilityScore: 25,
          verdict: 'Unverified / Unknown',
          summary: 'Direct text input with zero institutional source attribution.',
          factors: [{ factor: 'Author Attribution', status: 'unverified', impact: 'No byline found.' }]
        },
        claims: [
          {
            id: 'claim_1',
            claimText: 'Drinking boiled lemon water cures all stages of cancer in 48 hours without chemotherapy.',
            factualityConfidence: 85,
            keyEntities: ['Lemon Water', 'Cancer', 'Chemotherapy'],
            verificationStatus: 'Contradicted',
            evidence: {
              source: 'National Cancer Institute / Peer-Reviewed Oncology Consensus',
              url: 'https://en.wikipedia.org/wiki/Alternative_cancer_treatments',
              snippet: 'There is no scientific or clinical evidence that lemon juice or boiling water cures neoplastic malignancies.'
            },
            explanation: 'Directly contradicted by medical consensus.'
          }
        ],
        reasons: [
          'High machine learning probability of misinformation (94.2%).',
          'Intense clickbait rhetorical formulation ("doctors hate this").',
          'Medical assertion contradicted by oncology literature.'
        ],
        createdAt: '2026-10-18T11:20:00Z'
      },
      {
        _id: 'ana_demo_002',
        userId: 'usr_analyst_002',
        userEmail: 'analyst@newsverify.org',
        inputHeadline: 'Department of Labor Releases December Employment Numbers',
        rawInputText: 'The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December, with unemployment holding steady at 3.7 percent according to official statistics.',
        extractedText: 'The Department of Labor reported that nonfarm payroll employment rose by 216,000 in December, with unemployment holding steady at 3.7 percent according to official statistics.',
        inputType: 'text',
        prediction: 'Likely Real',
        overallRiskScore: 12,
        modelConfidence: 96,
        mlProbabilityFake: 0.048,
        category: 'economy',
        featureContributions: [
          { token: 'department', weight: -0.48, direction: 'real', impact: 'high' },
          { token: 'reported', weight: -0.42, direction: 'real', impact: 'high' },
          { token: 'official', weight: -0.38, direction: 'real', impact: 'high' },
          { token: 'statistics', weight: -0.35, direction: 'real', impact: 'high' }
        ],
        linguisticIndicators: {
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
          summary: 'Low linguistic manipulation detected (0/100). The prose maintains standard editorial tone.',
          disclaimer: 'This is a linguistic manipulation indicator, not proof of fake news.'
        },
        sourceAssessment: {
          domain: 'bls.gov',
          publisher: 'Bureau of Labor Statistics',
          author: null,
          publishDate: '2026-01-05',
          citationsFound: 2,
          hasByline: false,
          hasTimestamp: true,
          domainCategory: 'academic_or_gov',
          credibilityScore: 90,
          verdict: 'High Credibility',
          summary: 'Institutional government statistical agency publication.',
          factors: [{ factor: 'Domain Governance', status: 'positive', impact: 'Official .gov agency release.' }]
        },
        claims: [
          {
            id: 'claim_1',
            claimText: 'Nonfarm payroll employment rose by 216,000 in December, with unemployment at 3.7 percent.',
            factualityConfidence: 92,
            keyEntities: ['Department of Labor', 'December', '3.7 percent'],
            verificationStatus: 'Supported',
            evidence: {
              source: 'Bureau of Labor Statistics Historical Economic Data',
              url: 'https://en.wikipedia.org/wiki/Bureau_of_Labor_Statistics',
              snippet: 'The Bureau of Labor Statistics is the principal fact-finding agency for the US government in labor economics.'
            },
            explanation: 'Supported by official labor economics release.'
          }
        ],
        reasons: [
          'Strong journalistic/statistical lexical indicators (P(Real) = 95.2%).',
          'Zero sensational language or clickbait markers detected.',
          'Attributed to official labor statistics agency.'
        ],
        createdAt: '2026-10-19T09:15:00Z'
      },
      {
        _id: 'ana_demo_003',
        userId: 'usr_analyst_002',
        userEmail: 'analyst@newsverify.org',
        inputHeadline: 'Solar Powered Desalination System Developed at MIT',
        rawInputText: 'Researchers at MIT developed a desalinization system that uses solar energy to produce clean drinking water at lower cost than conventional tap water.',
        extractedText: 'Researchers at MIT developed a desalinization system that uses solar energy to produce clean drinking water at lower cost than conventional tap water.',
        inputType: 'text',
        prediction: 'Likely Real',
        overallRiskScore: 18,
        modelConfidence: 91,
        mlProbabilityFake: 0.092,
        category: 'science',
        featureContributions: [
          { token: 'researchers', weight: -0.45, direction: 'real', impact: 'high' },
          { token: 'mit', weight: -0.39, direction: 'real', impact: 'high' },
          { token: 'solar', weight: -0.32, direction: 'real', impact: 'medium' }
        ],
        linguisticIndicators: {
          sensationalismScore: 5,
          excessiveCapsScore: 0,
          punctuationScore: 0,
          clickbaitScore: 0,
          fearOutrageScore: 0,
          unsupportedCertaintyScore: 0,
          compositeManipulationScore: 2,
          capsRatio: 2,
          exclamationCount: 0,
          detectedClickbaitPhrases: [],
          detectedSensationalWords: [],
          detectedFearWords: [],
          summary: 'Objective scientific reporting tone.',
          disclaimer: 'This is a linguistic manipulation indicator, not proof of fake news.'
        },
        sourceAssessment: {
          domain: 'mit.edu',
          publisher: 'MIT News Office',
          author: 'David L. Chandler',
          publishDate: '2026-09-27',
          citationsFound: 1,
          hasByline: true,
          hasTimestamp: true,
          domainCategory: 'academic_or_gov',
          credibilityScore: 92,
          verdict: 'High Credibility',
          summary: 'Reputable academic research institution source.',
          factors: [{ factor: 'Author Attribution', status: 'positive', impact: 'Named science writer.' }]
        },
        claims: [
          {
            id: 'claim_1',
            claimText: 'Solar desalination system produces drinking water cheaper than tap water.',
            factualityConfidence: 88,
            keyEntities: ['MIT', 'Desalination', 'Solar Energy'],
            verificationStatus: 'Supported',
            evidence: {
              source: 'MIT Energy Initiative Publications',
              url: 'https://en.wikipedia.org/wiki/Solar_desalination',
              snippet: 'Solar desalination uses solar thermal energy to separate pure water from salts and contaminants.'
            },
            explanation: 'Consistent with published MIT peer-reviewed engineering papers.'
          }
        ],
        reasons: [
          'High probability of factual scientific reporting (90.8%).',
          'Documented institution and academic research attribution.'
        ],
        createdAt: '2026-10-20T16:45:00Z'
      }
    ]
  };

  saveLocalDB();
  return localCache;
}

function saveLocalDB() {
  if (!localCache) return;
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(localCache, null, 2), 'utf-8');
  } catch (err: any) {
    console.error('Failed to write local database file:', err.message);
  }
}

// User Repository
export const UserRepo = {
  async findByEmail(email: string) {
    if (isMongoDBConnected()) {
      return UserModel.findOne({ email: email.toLowerCase() });
    }
    const db = loadLocalDB();
    const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return null;
    return {
      ...found,
      comparePassword: async (cand: string) => bcrypt.compare(cand, found.password)
    };
  },

  async findById(id: string) {
    if (isMongoDBConnected()) {
      return UserModel.findById(id).select('-password');
    }
    const db = loadLocalDB();
    const found = db.users.find(u => u._id === id);
    if (!found) return null;
    const { password, ...safe } = found;
    return safe;
  },

  async create(userData: { name: string; email: string; password: string; role?: 'user' | 'admin' }) {
    if (isMongoDBConnected()) {
      const user = new UserModel(userData);
      await user.save();
      return user;
    }
    const db = loadLocalDB();
    const existing = db.users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(userData.password, salt);
    const newUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    saveLocalDB();
    const { password, ...safe } = newUser;
    return safe;
  },

  async getAllUsers() {
    if (isMongoDBConnected()) {
      return UserModel.find().select('-password').sort({ createdAt: -1 });
    }
    const db = loadLocalDB();
    return db.users.map(({ password, ...u }) => u);
  }
};

// NewsAnalysis Repository
export const AnalysisRepo = {
  async create(data: any) {
    if (isMongoDBConnected()) {
      const analysis = new NewsAnalysisModel(data);
      await analysis.save();
      return analysis;
    }
    const db = loadLocalDB();
    const newEntry = {
      _id: `ana_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...data,
      createdAt: new Date().toISOString()
    };
    db.analyses.unshift(newEntry);
    saveLocalDB();
    return newEntry;
  },

  async findByUserId(userId: string) {
    if (isMongoDBConnected()) {
      return NewsAnalysisModel.find({ userId }).sort({ createdAt: -1 });
    }
    const db = loadLocalDB();
    return db.analyses.filter(a => a.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async findById(id: string) {
    if (isMongoDBConnected()) {
      return NewsAnalysisModel.findById(id);
    }
    const db = loadLocalDB();
    return db.analyses.find(a => a._id === id) || null;
  },

  async deleteById(id: string, userId: string, isAdmin = false) {
    if (isMongoDBConnected()) {
      if (isAdmin) {
        return NewsAnalysisModel.findByIdAndDelete(id);
      }
      return NewsAnalysisModel.findOneAndDelete({ _id: id, userId });
    }
    const db = loadLocalDB();
    const index = db.analyses.findIndex(a => a._id === id && (isAdmin || a.userId === userId));
    if (index === -1) return false;
    db.analyses.splice(index, 1);
    saveLocalDB();
    return true;
  },

  async clearAll(userId: string, isAdmin = false) {
    if (isMongoDBConnected()) {
      if (isAdmin) {
        const res = await NewsAnalysisModel.deleteMany({});
        return res.deletedCount;
      }
      const res = await NewsAnalysisModel.deleteMany({ userId });
      return res.deletedCount;
    }
    const db = loadLocalDB();
    const beforeCount = db.analyses.length;
    if (isAdmin) {
      db.analyses = [];
    } else {
      db.analyses = db.analyses.filter(a => a.userId !== userId);
    }
    saveLocalDB();
    return beforeCount - db.analyses.length;
  },

  async getAllAnalyses() {
    if (isMongoDBConnected()) {
      return NewsAnalysisModel.find().sort({ createdAt: -1 });
    }
    const db = loadLocalDB();
    return [...db.analyses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getStats(userId?: string) {
    let items: any[] = [];
    if (isMongoDBConnected()) {
      items = userId ? await NewsAnalysisModel.find({ userId }) : await NewsAnalysisModel.find();
    } else {
      const db = loadLocalDB();
      items = userId ? db.analyses.filter(a => a.userId === userId) : db.analyses;
    }

    const total = items.length;
    let likelyFake = 0;
    let suspicious = 0;
    let likelyReal = 0;
    let totalRiskSum = 0;

    const riskBuckets: Record<string, number> = {
      '0-20': 0,
      '21-40': 0,
      '41-60': 0,
      '61-80': 0,
      '81-100': 0
    };

    const categories: Record<string, number> = {};

    for (const item of items) {
      if (item.prediction === 'Likely Fake') likelyFake++;
      else if (item.prediction === 'Likely Real') likelyReal++;
      else suspicious++;

      const risk = item.overallRiskScore || 0;
      totalRiskSum += risk;

      if (risk <= 20) riskBuckets['0-20']++;
      else if (risk <= 40) riskBuckets['21-40']++;
      else if (risk <= 60) riskBuckets['41-60']++;
      else if (risk <= 80) riskBuckets['61-80']++;
      else riskBuckets['81-100']++;

      const cat = item.category || 'general';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    const avgRisk = total > 0 ? Math.round(totalRiskSum / total) : 0;

    return {
      totalAnalyses: total,
      likelyFakeCount: likelyFake,
      suspiciousCount: suspicious,
      likelyRealCount: likelyReal,
      averageRiskScore: avgRisk,
      riskDistribution: Object.entries(riskBuckets).map(([bucket, count]) => ({ bucket, count })),
      categoryDistribution: Object.entries(categories).map(([category, count]) => ({ category, count })),
      recentAnalyses: items.slice(0, 5)
    };
  }
};

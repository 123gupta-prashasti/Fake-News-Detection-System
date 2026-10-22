import { NewsAnalysis, DashboardStats, ModelMetrics, User, StandaloneClaimVerification } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('newsverify_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned HTTP ${res.status}: Failed to parse JSON response`);
  }

  if (!res.ok || data.success === false) {
    const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(name: string, email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<{ token: string; user: User }>(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ user: User }>(res);
  },

  // News Analysis
  async analyzeText(data: { text: string; headline?: string; category?: string; sourceUrl?: string }): Promise<{ analysis: NewsAnalysis }> {
    const res = await fetch(`${API_BASE}/news/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    return handleResponse<{ analysis: NewsAnalysis }>(res);
  },

  async extractAndPreviewUrl(url: string): Promise<{ extractedArticle: any }> {
    const res = await fetch(`${API_BASE}/news/analyze-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ url, extractOnly: true }),
    });
    return handleResponse<{ extractedArticle: any }>(res);
  },

  async analyzeUrl(url: string): Promise<{ analysis: NewsAnalysis; extractedArticle: any }> {
    const res = await fetch(`${API_BASE}/news/analyze-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ url, extractOnly: false }),
    });
    return handleResponse<{ analysis: NewsAnalysis; extractedArticle: any }>(res);
  },

  async getHistory(): Promise<{ count: number; history: NewsAnalysis[] }> {
    const res = await fetch(`${API_BASE}/news/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ count: number; history: NewsAnalysis[] }>(res);
  },

  async getAnalysisById(id: string): Promise<{ analysis: NewsAnalysis }> {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ analysis: NewsAnalysis }>(res);
  },

  async verifyClaim(claim: string): Promise<{ result: StandaloneClaimVerification }> {
    const res = await fetch(`${API_BASE}/news/verify-claim`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ claim }),
    });
    return handleResponse<{ result: StandaloneClaimVerification }>(res);
  },

  async deleteAnalysis(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/news/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async clearAllHistory(): Promise<{ message: string; count: number }> {
    const res = await fetch(`${API_BASE}/news/history/clear`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string; count: number }>(res);
  },

  // Dashboard Stats
  async getDashboardStats(scope: 'user' | 'global' = 'user'): Promise<{ stats: DashboardStats; systemInfo?: any }> {
    const res = await fetch(`${API_BASE}/dashboard/stats?scope=${scope}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ stats: DashboardStats; systemInfo?: any }>(res);
  },

  // Model & Metrics
  async getModelMetrics(): Promise<{ metrics: ModelMetrics; thresholds: any; metadata: any }> {
    const res = await fetch(`${API_BASE}/model/metrics`);
    return handleResponse<{ metrics: ModelMetrics; thresholds: any; metadata: any }>(res);
  },

  async updateThresholds(thresholds: { likely_real_max?: number; likely_fake_min?: number }): Promise<any> {
    const res = await fetch(`${API_BASE}/model/thresholds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(thresholds),
    });
    return handleResponse<any>(res);
  },

  // System Health
  async getHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<any>(res);
  }
};

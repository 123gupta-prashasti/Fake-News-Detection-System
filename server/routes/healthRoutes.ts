import { Router, Request, Response } from 'express';
import { isMongoDBConnected } from '../config/db.js';
import { getModelConfig } from '../ml/inference.js';

const router = Router();

router.get('/health', (_req: Request, res: Response): void => {
  let mlReady = false;
  let vocabCount = 0;
  try {
    const config = getModelConfig();
    mlReady = Boolean(config && config.vocabulary);
    vocabCount = Object.keys(config.vocabulary || {}).length;
  } catch {
    mlReady = false;
  }

  const mongoActive = isMongoDBConnected();

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NewsVerify-Core-API',
    version: '1.0.0',
    database: {
      driver: mongoActive ? 'MongoDB-Mongoose' : 'Built-in-JSON-Store',
      connected: true,
      mode: mongoActive ? 'production' : 'fallback-development'
    },
    machineLearning: {
      pipeline: 'TF-IDF + Logistic Regression',
      loaded: mlReady,
      vocabularySize: vocabCount,
      decisionModel: 'Three-Level Bayesian Thresholding'
    },
    uptimeSeconds: Math.round(process.uptime())
  });
});

export default router;

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken, requireAdmin, AuthRequest } from '../middleware/auth.js';
import { getModelConfig, updateModelThresholds } from '../ml/inference.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// GET /api/model/metrics
router.get('/metrics', async (_req: Request, res: Response): Promise<void> => {
  try {
    const metricsPath = path.join(__dirname, '..', 'ml', 'metrics.json');
    if (!fs.existsSync(metricsPath)) {
      res.status(404).json({
        success: false,
        error: 'Model evaluation metrics not found. Please run ml/train_model.py to generate metrics.'
      });
      return;
    }

    const metricsData = JSON.parse(fs.readFileSync(metricsPath, 'utf-8'));
    const config = getModelConfig();

    res.json({
      success: true,
      metrics: metricsData,
      thresholds: config.thresholds,
      metadata: config.metadata
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to retrieve model metrics.' });
  }
});

// POST /api/model/thresholds (Admin only)
router.post('/thresholds', authenticateToken, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { likely_real_max, likely_fake_min } = req.body;

    if (likely_real_max !== undefined && (typeof likely_real_max !== 'number' || likely_real_max <= 0 || likely_real_max >= 1)) {
      res.status(400).json({ success: false, error: 'likely_real_max must be a float between 0 and 1.' });
      return;
    }

    if (likely_fake_min !== undefined && (typeof likely_fake_min !== 'number' || likely_fake_min <= 0 || likely_fake_min >= 1)) {
      res.status(400).json({ success: false, error: 'likely_fake_min must be a float between 0 and 1.' });
      return;
    }

    if (likely_real_max !== undefined && likely_fake_min !== undefined && likely_real_max >= likely_fake_min) {
      res.status(400).json({ success: false, error: 'likely_real_max must be strictly less than likely_fake_min.' });
      return;
    }

    const updated = updateModelThresholds({ likely_real_max, likely_fake_min });

    res.json({
      success: true,
      message: 'Decision classification thresholds updated successfully.',
      thresholds: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update thresholds.' });
  }
});

export default router;

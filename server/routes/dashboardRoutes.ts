import { Router, Response } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { AnalysisRepo, UserRepo } from '../db/store.js';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const isAdmin = req.user!.role === 'admin';
    const userScope = req.query.scope === 'global' && isAdmin ? undefined : req.user!.id;

    const stats = await AnalysisRepo.getStats(userScope);

    let systemInfo: any = null;
    if (isAdmin) {
      const allUsers = await UserRepo.getAllUsers();
      systemInfo = {
        totalUsers: allUsers.length,
        adminUsers: allUsers.filter(u => u.role === 'admin').length,
        usersList: allUsers
      };
    }

    res.json({
      success: true,
      scope: userScope ? 'user' : 'global',
      stats,
      systemInfo
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to retrieve dashboard statistics.' });
  }
});

export default router;

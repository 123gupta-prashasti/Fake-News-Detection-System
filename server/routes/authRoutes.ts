import { Router, Request, Response } from 'express';
import { UserRepo } from '../db/store.js';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ success: false, error: 'Name must be at least 2 characters long.' });
      return;
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
      res.status(400).json({ success: false, error: 'A valid email address is required.' });
      return;
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      res.status(400).json({ success: false, error: 'Password must be at least 6 characters long.' });
      return;
    }

    const existing = await UserRepo.findByEmail(email);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email address already exists.' });
      return;
    }

    const user = await UserRepo.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'user'
    });

    const token = generateToken({
      id: (user as any)._id?.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: (user as any)._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: 'Email and password are required.' });
      return;
    }

    const user = await UserRepo.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid credentials. Password incorrect.' });
      return;
    }

    const token = generateToken({
      id: (user as any)._id?.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      success: true,
      message: 'Authentication successful.',
      token,
      user: {
        id: (user as any)._id?.toString(),
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Authentication failed.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch current user profile.' });
  }
});

export default router;

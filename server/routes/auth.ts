import express, { type Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbStore } from '../db.ts';
import { protect, generateToken, sanitizeUser, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a candidate or founder
 * @access  Public
 */
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role = 'candidate',
      phone = '+923001234567',
      city = 'Lahore',
      university = 'UMT Lahore',
      gpa,
      skills = [],
      startupName,
      area,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required fields.',
      });
    }

    const existingUser = await dbStore.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists on WorkNest.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await dbStore.createUser({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      phone,
      city,
      university,
      gpa: gpa ? Number(gpa) : undefined,
      hideGpa: true, // WorkNest Low-GPA Shield default
      verifiedPortfolioScore: 85, // Initial baseline score
      skills: Array.isArray(skills) ? skills : [skills],
      startupName,
      area,
      wallet: {
        pkrBalance: 0,
        usdBalance: 0,
      },
    });

    const token = generateToken(String(newUser._id), newUser.role);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully with WorkNest Low-GPA Shield enabled.',
      token,
      user: sanitizeUser(newUser, newUser),
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & return JWT token
 * @access  Public
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await dbStore.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    // Verify password
    let isMatch = false;
    if (typeof user.comparePassword === 'function') {
      isMatch = await user.comparePassword(password);
    } else {
      isMatch = await bcrypt.compare(password, user.password);
    }

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Incorrect password.',
      });
    }

    const token = generateToken(String(user._id), user.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user, user),
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get logged in user profile
 * @access  Private
 */
router.get('/me', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      user: sanitizeUser(user, req.user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current user profile.',
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/auth/toggle-gpa-shield
 * @desc    Toggle candidate's hideGpa shield setting
 * @access  Private (Candidate only)
 */
router.put('/toggle-gpa-shield', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // If explicit boolean provided in body, use it; otherwise toggle current value
    const newHideGpa = req.body.hideGpa !== undefined ? Boolean(req.body.hideGpa) : !user.hideGpa;

    const updatedUser = await dbStore.updateUserById(String(user._id), {
      hideGpa: newHideGpa,
    });

    return res.status(200).json({
      success: true,
      message: newHideGpa
        ? 'WorkNest Low-GPA Shield ACTIVATED: Your academic grades are hidden from recruiters, replaced with AST Verified Portfolio Reliability Score.'
        : 'WorkNest Low-GPA Shield DEACTIVATED: Your academic CGPA is now visible to recruiters alongside your code audit scores.',
      hideGpa: newHideGpa,
      user: sanitizeUser(updatedUser, req.user),
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update Low-GPA Shield setting.',
      error: error.message,
    });
  }
});

export default router;

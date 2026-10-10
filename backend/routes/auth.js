const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, JWT_SECRET } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'candidate', phone, city, university, gpa, skills } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      phone,
      city,
      university,
      gpa,
      hideGpa: true,
      verifiedPortfolioScore: 85,
      skills,
      wallet: { pkrBalance: 0, usdBalance: 0 },
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({ success: true, token, user: userObj });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

// PUT /api/auth/toggle-gpa-shield
router.put('/toggle-gpa-shield', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    user.hideGpa = req.body.hideGpa !== undefined ? req.body.hideGpa : !user.hideGpa;
    await user.save();
    res.status(200).json({
      success: true,
      hideGpa: user.hideGpa,
      message: `GPA Shield is now ${user.hideGpa ? 'Active' : 'Inactive'}`,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

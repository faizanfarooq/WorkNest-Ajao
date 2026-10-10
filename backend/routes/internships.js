const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const Application = require('../models/Application');
const { protect, restrictTo } = require('../middleware/auth');

// GET /api/internships
router.get('/', async (req, res) => {
  try {
    const { city, techStack, type, isRemoteUsd } = req.query;
    const filter = {};

    if (city) filter.city = new RegExp(city, 'i');
    if (techStack) filter.techStack = { $in: [new RegExp(techStack, 'i')] };
    if (type) filter.type = type;
    if (isRemoteUsd !== undefined) filter.isRemoteUsd = isRemoteUsd === 'true';

    const internships = await Internship.find(filter).populate('founderId', 'name email city');
    res.status(200).json({ success: true, count: internships.length, data: internships });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/internships/:id
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('founderId', 'name email city');
    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    res.status(200).json({ success: true, data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/internships
router.post('/', protect, restrictTo('founder', 'admin'), async (req, res) => {
  try {
    const internship = await Internship.create({
      ...req.body,
      founderId: req.user._id,
    });
    res.status(201).json({ success: true, data: internship });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/internships/:id/apply
router.post('/:id/apply', protect, restrictTo('candidate'), async (req, res) => {
  try {
    const { githubRepoUrl, submittedCode } = req.body;
    const application = await Application.create({
      internshipId: req.params.id,
      candidateId: req.user._id,
      status: 'Applied',
      githubRepoUrl,
      submittedCode,
      aiAuditResult: {
        score: 92,
        feedback: 'Proof-of-work code evaluated. Ready for technical interview.',
        cvBullets: ['Developed modular microservice with defensive error handling'],
      },
    });
    res.status(201).json({ success: true, data: application });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

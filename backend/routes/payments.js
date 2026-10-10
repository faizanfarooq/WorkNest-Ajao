const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const User = require('../models/User');
const { protect, restrictTo } = require('../middleware/auth');

// POST /api/payments/release-milestone
router.post('/release-milestone', protect, restrictTo('founder', 'admin'), async (req, res) => {
  try {
    const { internshipId, milestoneIndex, candidateId } = req.body;
    const internship = await Internship.findById(internshipId);
    if (!internship) return res.status(404).json({ success: false, message: 'Internship not found' });

    const milestone = internship.milestones[milestoneIndex];
    if (!milestone) return res.status(400).json({ success: false, message: 'Milestone not found' });

    if (milestone.status === 'Released') {
      return res.status(400).json({ success: false, message: 'Milestone already released' });
    }

    milestone.status = 'Released';
    milestone.completedAt = new Date();
    await internship.save();

    // Calculate Pakistani withholding tax (2.5% local vs 0.25% PSEB export)
    const taxRate = internship.isRemoteUsd ? 0.0025 : 0.025;
    const taxWithheldPkr = Math.round((milestone.amountPkr || 0) * taxRate);
    const netPkr = (milestone.amountPkr || 0) - taxWithheldPkr;

    const candidate = await User.findById(candidateId);
    if (candidate) {
      candidate.wallet.pkrBalance = (candidate.wallet.pkrBalance || 0) + netPkr;
      candidate.wallet.usdBalance = (candidate.wallet.usdBalance || 0) + (milestone.amountUsd || 0);
      await candidate.save();
    }

    res.status(200).json({
      success: true,
      message: 'Milestone released successfully',
      releasedMilestone: milestone,
      taxMetadata: {
        taxWithheldPkr,
        netPkr,
        receiptNumber: `WN-PK-TX-${Date.now().toString().slice(-6)}`,
      },
      candidateWallet: candidate ? candidate.wallet : null,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

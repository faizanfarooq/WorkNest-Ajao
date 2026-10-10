import express, { type Response } from 'express';
import { dbStore, generateObjectId } from '../db.ts';
import { protect, restrictTo, type AuthenticatedRequest } from '../middleware/auth.ts';

const router = express.Router();

/**
 * @route   POST /api/payments/release-milestone
 * @desc    Founder approves a milestone and releases escrow funds into candidate's wallet
 * @access  Private (Founder only)
 */
router.post('/release-milestone', protect, restrictTo('founder', 'admin'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { internshipId, milestoneIndex, candidateId, paymentMethod = 'JazzCash / HBL Direct' } = req.body;

    if (!internshipId || milestoneIndex === undefined || !candidateId) {
      return res.status(400).json({
        success: false,
        message: 'internshipId, milestoneIndex, and candidateId are required.',
      });
    }

    const internship = await dbStore.findInternshipById(String(internshipId));
    if (!internship) {
      return res.status(404).json({
        success: false,
        message: 'Internship not found.',
      });
    }

    // Verify milestone exists
    const idx = Number(milestoneIndex);
    if (!internship.milestones || !internship.milestones[idx]) {
      return res.status(400).json({
        success: false,
        message: `Milestone at index ${idx} does not exist.`,
      });
    }

    const milestone = internship.milestones[idx];

    if (milestone.status === 'Released') {
      return res.status(400).json({
        success: false,
        message: 'This milestone has already been released and paid out from escrow.',
      });
    }

    const candidate = await dbStore.findUserById(String(candidateId));
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: 'Target candidate user not found.',
      });
    }

    // Calculate Pakistani tax & net take-home
    // For IT software exports registered with PSEB: 0.25% - 1% withholding tax
    // For local software tasks: 2% - 5% advance withholding tax
    const isExportUsd = internship.isRemoteUsd || milestone.amountUsd > 0;
    const taxRatePercent = isExportUsd ? 0.25 : 2.5; // PSEB export IT concession rate vs local rate
    const grossPkr = milestone.amountPkr || 0;
    const grossUsd = milestone.amountUsd || 0;
    
    const taxWithheldPkr = Math.round(grossPkr * (taxRatePercent / 100));
    const taxWithheldUsd = Number((grossUsd * (taxRatePercent / 100)).toFixed(2));
    
    const netPkr = grossPkr - taxWithheldPkr;
    const netUsd = grossUsd - taxWithheldUsd;

    // Generate unique Pakistani tax & transaction receipt reference
    const receiptRef = isExportUsd
      ? `WN-PSEB-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`
      : `WN-FBR-PK-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    // Update milestone status
    const updatedMilestones = [...internship.milestones];
    updatedMilestones[idx] = {
      ...updatedMilestones[idx],
      status: 'Released',
      completedAt: new Date(),
      receiptRef,
    };

    await dbStore.updateInternshipById(String(internship._id), {
      milestones: updatedMilestones,
    });

    // Credit candidate wallet
    const currentPkr = candidate.wallet?.pkrBalance || 0;
    const currentUsd = candidate.wallet?.usdBalance || 0;

    const newWallet = {
      pkrBalance: currentPkr + netPkr,
      usdBalance: currentUsd + netUsd,
    };

    await dbStore.updateUserById(String(candidate._id), {
      wallet: newWallet,
    });

    const receipt = {
      receiptNumber: receiptRef,
      transactionDate: new Date(),
      internshipTitle: internship.title,
      startupName: internship.startupName,
      candidateName: candidate.name,
      candidateEmail: candidate.email,
      milestoneTitle: milestone.title,
      grossAmountPkr: grossPkr,
      grossAmountUsd: grossUsd,
      taxAllowanceRate: `${taxRatePercent}% (${isExportUsd ? 'PSEB IT Export Concession Clause' : 'FBR Local IT Services Rate'})`,
      taxWithheldPkr,
      taxWithheldUsd,
      netAmountCreditedPkr: netPkr,
      netAmountCreditedUsd: netUsd,
      escrowReleaseStatus: 'SUCCESS_SETTLED',
      disbursementMethod: paymentMethod,
      pakistanEscrowVault: 'WorkNest Automated Escrow Node (Arfa Software Tech Park)',
    };

    return res.status(200).json({
      success: true,
      message: `Milestone funds released successfully! Net PKR ${netPkr.toLocaleString()} credited to ${candidate.name}'s wallet.`,
      releasedMilestone: updatedMilestones[idx],
      candidateWallet: newWallet,
      receipt,
    });
  } catch (error: any) {
    console.error('Milestone release error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to release escrow funds.',
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/payments/wallet
 * @desc    Get current user's wallet balance
 * @access  Private
 */
router.get('/wallet', protect, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await dbStore.findUserById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      wallet: user.wallet || { pkrBalance: 0, usdBalance: 0 },
      currencyRates: {
        USD_TO_PKR: 280.5,
        EUR_TO_PKR: 304.2,
      },
      withdrawalOptions: [
        { id: 'jazzcash', name: 'JazzCash Instant', fee: '0%', minPkr: 500 },
        { id: 'easypaisa', name: 'EasyPaisa Wallet', fee: '0%', minPkr: 500 },
        { id: 'nayapay', name: 'NayaPay / SadaPay', fee: '0%', minPkr: 1000 },
        { id: 'hbl', name: 'Direct Bank Transfer (HBL, Meezan, Alfalah)', fee: '0%', minPkr: 5000 },
        { id: 'wise', name: 'Wise USD / Payoneer (Foreign Remittance)', fee: '0.25% PSEB Tax', minUsd: 50 },
      ],
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet information.',
      error: error.message,
    });
  }
});

export default router;

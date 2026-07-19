import express, { Router } from 'express';
import { protect } from '../middleware/authorized.middleware';
import { mfaService } from '../services/mfa.service';

const router: Router = express.Router();

// ===================== MFA ROUTES =====================
// These require authentication and are accessed by users to manage their MFA settings

// Get MFA setup (generates secret + QR code)
router.get('/setup', protect, async (req: any, res: any) => {
  try {
    const userId = req.user._id.toString();
    const userEmail = req.user.email;
    const result = await mfaService.setupMFA(userId, userEmail);
    return res.status(200).json({
      success: true,
      message: 'MFA setup initiated',
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to setup MFA',
    });
  }
});

// Verify and enable MFA (user scans QR and enters code)
router.post('/verify', protect, async (req: any, res: any) => {
  try {
    const userId = req.user._id.toString();
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }
    const result = await mfaService.verifyAndEnableMFA(userId, token);
    return res.status(200).json({
      success: true,
      message: 'MFA enabled successfully',
      data: result,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to verify MFA',
    });
  }
});

// Disable MFA
router.post('/disable', protect, async (req: any, res: any) => {
  try {
    const userId = req.user._id.toString();
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required to disable MFA' });
    }
    // Verify token before disabling
    const isValid = await mfaService.verifyMFAToken(userId, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid MFA token' });
    }
    await mfaService.disableMFA(userId);
    return res.status(200).json({
      success: true,
      message: 'MFA disabled successfully',
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to disable MFA',
    });
  }
});

// Check MFA status
router.get('/status', protect, async (req: any, res: any) => {
  try {
    const userId = req.user._id.toString();
    const enabled = await mfaService.isMFAEnabled(userId);
    return res.status(200).json({
      success: true,
      data: { enabled },
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to check MFA status',
    });
  }
});

// Verify MFA token during login (separate endpoint for login flow)
router.post('/verify-login', async (req: any, res: any) => {
  try {
    const { userId, token } = req.body;
    if (!userId || !token) {
      return res.status(400).json({ success: false, message: 'User ID and token are required' });
    }
    const isValid = await mfaService.verifyMFAToken(userId, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid MFA token' });
    }
    return res.status(200).json({
      success: true,
      message: 'MFA token verified',
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'MFA verification failed',
    });
  }
});

export default router;

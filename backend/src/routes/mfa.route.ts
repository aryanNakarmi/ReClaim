import express, { Router } from 'express';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/authorized.middleware';
import { mfaService } from '../services/mfa.service';
import { JWT_SECRET } from '../config';
import { UserRepository } from '../repositories/user.repository';

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

// Verify MFA token during login — issues JWT + user data after successful verification
router.post('/verify-login', async (req: any, res: any) => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      return res.status(400).json({ success: false, message: 'Temp token and MFA token are required' });
    }

    // Verify the temporary JWT (issued during login with purpose: 'mfa')
    let decoded: any;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Temporary token expired or invalid' });
    }

    if (decoded.purpose !== 'mfa') {
      return res.status(401).json({ success: false, message: 'Invalid token purpose' });
    }

    const userId = decoded.id;
    const isValid = await mfaService.verifyMFAToken(userId, token);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid MFA token' });
    }

    // Fetch the user to build the final JWT
    const userRepository = new UserRepository();
    const user = await userRepository.getUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Issue the real JWT
    const payload = {
      id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
    const jwtToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        profilePicture: user.profilePicture,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: jwtToken,
    });
  } catch (error: any) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'MFA verification failed',
    });
  }
});

export default router;

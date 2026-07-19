import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';

/**
 * MFA Service
 * 
 * Implements Time-based One-Time Password (TOTP) authentication
 * as an additional security layer. Uses speakeasy for TOTP generation
 * and verification, and qrcode for setup QR generation.
 * 
 * Requirements alignment:
 * - Multi-Factor Authentication support (Section 2)
 * - Custom authentication logic aligned with zero-trust principles (Section 2)
 */

const userRepository = new UserRepository();

export class MFAService {
  /**
   * Generate a new TOTP secret for a user and return a QR code URL
   * that can be scanned by authenticator apps (Google Authenticator, Authy, etc.)
   */
  async setupMFA(userId: string, userEmail: string) {
    const secret = speakeasy.generateSecret({
      name: `ReClaim:${userEmail}`,
      issuer: 'ReClaim',
    });

    // Store the base32 secret (not the full object)
    await userRepository.updateUser(userId, {
      mfaSecret: secret.base32,
      mfaEnabled: false, // Not yet verified
    } as any);

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
    };
  }

  /**
   * Verify a TOTP token against the user's stored secret.
   * If successful, enables MFA for the user.
   */
  async verifyAndEnableMFA(userId: string, token: string) {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, 'User not found');
    if (!user.mfaSecret) throw new HttpError(400, 'MFA not set up yet');

    const isValid = speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1, // Allow 30s clock drift
    });

    if (!isValid) throw new HttpError(400, 'Invalid TOTP token');

    await userRepository.updateUser(userId, { mfaEnabled: true } as any);
    return { success: true };
  }

  /**
   * Verify a TOTP token during login (if MFA is enabled).
   */
  async verifyMFAToken(userId: string, token: string): Promise<boolean> {
    const user = await userRepository.getUserById(userId);
    if (!user) throw new HttpError(404, 'User not found');
    if (!user.mfaSecret || !user.mfaEnabled) {
      throw new HttpError(400, 'MFA is not enabled for this user');
    }

    return speakeasy.totp.verify({
      secret: user.mfaSecret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  /**
   * Disable MFA for a user.
   */
  async disableMFA(userId: string) {
    await userRepository.updateUser(userId, {
      mfaSecret: undefined,
      mfaEnabled: false,
    } as any);
    return { success: true };
  }

  /**
   * Check if user has MFA enabled.
   */
  async isMFAEnabled(userId: string): Promise<boolean> {
    const user = await userRepository.getUserById(userId);
    return user?.mfaEnabled === true;
  }
}

export const mfaService = new MFAService();

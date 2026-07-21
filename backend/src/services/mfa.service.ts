import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { UserRepository } from '../repositories/user.repository';
import { HttpError } from '../errors/http-error';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Check if a stored MFA secret is encrypted (new format) or plain text (legacy).
 * Encrypted secrets follow the format: "hexIV:hexCiphertext"
 */
function isEncrypted(value: string): boolean {
  return /^[0-9a-f]+:[0-9a-f]+$/i.test(value);
}

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

    // Store encrypted base32 secret
    const encryptedSecret = encrypt(secret.base32);
    await userRepository.updateUser(userId, {
      mfaSecret: encryptedSecret,
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

    // Decrypt the secret (or use legacy plain text format)
    const decryptedSecret = isEncrypted(user.mfaSecret) ? decrypt(user.mfaSecret) : user.mfaSecret;

    const isValid = speakeasy.totp.verify({
      secret: decryptedSecret,
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

    // Decrypt the secret (or use legacy plain text format)
    const decryptedSecret = isEncrypted(user.mfaSecret) ? decrypt(user.mfaSecret) : user.mfaSecret;

    return speakeasy.totp.verify({
      secret: decryptedSecret,
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

import crypto from 'crypto';

/**
 * Encryption Utility
 * 
 * Provides AES-256-CBC encryption for sensitive data stored in the database.
 * Used to encrypt MFA secrets and any other sensitive fields.
 * 
 * The encryption key is derived from the JWT_SECRET (for development)
 * or from a dedicated ENCRYPTION_KEY environment variable.
 */

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // 16 bytes for AES

/**
 * Get or derive the encryption key.
 * Priority: ENCRYPTION_KEY env var > SHA-256 hash of JWT_SECRET
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET || 'reclaim-default-dev-key';
  // AES-256 requires a 32-byte key — hash the key material to get exactly 32 bytes
  return crypto.createHash('sha256').update(key).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns a base64-encoded string containing IV + ciphertext.
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Prepend IV to the ciphertext so we can decrypt later
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt a previously encrypted string.
 * Expects the format returned by encrypt(): "iv:ciphertext"
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const parts = encryptedText.split(':');
  
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

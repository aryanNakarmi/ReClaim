import axios from 'axios';

/**
 * CAPTCHA Service
 * 
 * Uses Cloudflare Turnstile for bot detection.
 * Turnstile is privacy-focused (no data tracking) and free.
 * 
 * Requirements alignment:
 * - Brute-force protection including rate limiting and CAPTCHA (Section 2)
 */

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY || '';

export class CaptchaService {
  /**
   * Verify a Turnstile token from the client-side widget.
   * Called server-side after form submission.
   */
  async verifyToken(token: string): Promise<boolean> {
    if (!TURNSTILE_SECRET_KEY) {
      // If no secret key configured, allow through (development mode)
      console.warn('TURNSTILE_SECRET_KEY not configured — skipping CAPTCHA verification');
      return true;
    }

    try {
      const response = await axios.post(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          secret: TURNSTILE_SECRET_KEY,
          response: token,
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      return response.data.success === true;
    } catch (error) {
      console.error('CAPTCHA verification failed:', error);
      return false;
    }
  }
}

export const captchaService = new CaptchaService();

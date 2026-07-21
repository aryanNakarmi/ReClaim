import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { IPBlocklistModel } from '../models/ipblocklist.model';

/**
 * Rate Limiting Middleware
 * 
 * Protects against brute-force attacks by limiting the number of
 * requests a client can make within a time window.
 * Also checks the IP blocklist to reject blocked IPs.
 * 
 * Applied to:
 * - Auth routes (login, register) — strict limits
 * - Password reset — strict limits
 * - General API — moderate limits
 */

// ── Shared helper: get client IP ──
function getClientIP(req: any): string {
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

// ── Middleware to check IP blocklist ──
export const ipBlockMiddleware = async (req: any, res: any, next: any) => {
  try {
    const ip = getClientIP(req);
    const blocked = await IPBlocklistModel.findOne({ ip });
    if (blocked) {
      return res.status(403).json({
        success: false,
        message: 'Your IP address has been blocked. Contact an administrator for assistance.',
      });
    }
    next();
  } catch {
    next(); // Don't block requests if the DB check fails
  }
};

// ── Auth endpoints: 10 requests per 15 minutes ──
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // 10 attempts per window
  message: {
    success: false,
    message: 'Too many attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,    // Return rate limit info in headers
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Use the helper for proper IPv4/IPv6 handling, then append email
    const ip = ipKeyGenerator(getClientIP(req));
    const email = req.body?.email || '';
    return `${ip}-${email}`;
  },
});

// ── Password reset: 3 requests per hour ──
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: {
    success: false,
    message: 'Too many password reset requests. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── General API: 100 requests per minute ──
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: {
    success: false,
    message: 'Too many requests. Please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

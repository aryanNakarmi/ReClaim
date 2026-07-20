import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

/**
 * Rate Limiting Middleware
 * 
 * Protects against brute-force attacks by limiting the number of
 * requests a client can make within a time window.
 * 
 * Applied to:
 * - Auth routes (login, register) — strict limits
 * - Password reset — strict limits
 * - General API — moderate limits
 */

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
    const ip = ipKeyGenerator(req.ip || req.socket.remoteAddress || 'unknown');
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

import { Request } from 'express';
import { ActivityModel } from '../models/activity.model';

/**
 * Activity Logger
 * 
 * Logs meaningful user actions for audit trail and security monitoring.
 * 
 * Usage:
 *   await logActivity(req, 'LOGIN', 'User', userId, 'User logged in', true);
 */

interface ActivityParams {
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  success: boolean;
}

/**
 * Log an activity entry. Call this from controllers/services after
 * an action is performed.
 */
export const logActivity = async (
  req: Request,
  params: ActivityParams
): Promise<void> => {
  try {
    const { action, resource, resourceId, details, success } = params;
    
    await ActivityModel.create({
      userId: (req as any).user?._id || undefined,
      userRole: (req as any).user?.role || undefined,
      action,
      resource,
      resourceId: resourceId || undefined,
      details: details || undefined,
      ip: req.ip || req.socket.remoteAddress || 'unknown',
      userAgent: (req.headers['user-agent'] as string) || undefined,
      success,
    });
  } catch (error) {
    // Logging should never break the application
    console.error('Failed to log activity:', error);
  }
};

/**
 * Convenience wrapper that captures common Express request context.
 * Use inside route handlers after a successful action.
 */
export const logSuccess = (req: Request, action: string, resource: string, resourceId?: string, details?: string) =>
  logActivity(req, { action, resource, resourceId, details, success: true });

/**
 * Convenience wrapper for failed actions.
 */
export const logFailure = (req: Request, action: string, resource: string, details?: string) =>
  logActivity(req, { action, resource, details, success: false });

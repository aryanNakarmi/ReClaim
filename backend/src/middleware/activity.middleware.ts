import { Request } from 'express';
import { ActivityModel } from '../models/activity.model';
import { getIO } from '../socket/socket';

/**
 * Activity Logger
 * 
 * Logs meaningful user actions for audit trail and security monitoring.
 * Also emits real-time socket events for the admin monitoring dashboard.
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
 * Determine severity level for an activity event based on action & success.
 */
function getSeverity(action: string, success: boolean): 'info' | 'warning' | 'critical' {
  if (!success) {
    const criticalActions = ['LOGIN', 'PASSWORD_RESET', 'REGISTER'];
    if (criticalActions.includes(action)) return 'critical';
    return 'warning';
  }
  if (['LOGIN', 'REGISTER', 'MFA_SETUP', 'MFA_VERIFY'].includes(action)) return 'info';
  return 'info';
}

/**
 * Log an activity entry. Call this from controllers/services after
 * an action is performed. Also emits real-time socket event.
 */
export const logActivity = async (
  req: Request,
  params: ActivityParams
): Promise<void> => {
  try {
    const { action, resource, resourceId, details, success } = params;
    
    const activity = await ActivityModel.create({
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

    // Emit real-time event for admin monitoring
    try {
      const io = getIO();
      const severity = getSeverity(action, success);
      const user = (req as any).user;
      io.emit('activity:new', {
        _id: activity._id,
        action,
        resource,
        resourceId,
        details,
        success,
        severity,
        userRole: user?.role,
        userName: user?.fullName || undefined,
        userEmail: user?.email || undefined,
        ip: req.ip || req.socket.remoteAddress || 'unknown',
        createdAt: activity.createdAt,
      });
    } catch {
      // Socket might not be initialized yet — that's fine
    }
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

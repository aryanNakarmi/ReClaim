import mongoose, { Document, Schema } from 'mongoose';

/**
 * Activity Log Model
 * 
 * Records meaningful user activities for auditing, incident response,
 * and security review purposes.
 * 
 * Requirements alignment:
 * - Activity logging and monitoring (Section 2)
 * - Support for auditing and incident response
 * - Avoidance of sensitive data exposure in logs
 * - Real-time monitoring capability
 */

export interface IActivity extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;   // Who performed the action (null for anonymous)
  userRole?: string;                   // Role at time of action
  action: string;                      // Action type (e.g., 'LOGIN', 'CREATE_REPORT')
  resource: string;                    // What was acted upon (e.g., 'LostItem', 'User')
  resourceId?: string;                 // ID of the resource
  details?: string;                    // Non-sensitive contextual details
  ip: string;                          // Source IP
  userAgent?: string;                  // Browser/client info
  success: boolean;                    // Whether the action succeeded
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userRole: { type: String, default: null },
    action: { type: String, required: true, index: true },
    resource: { type: String, required: true, index: true },
    resourceId: { type: String, default: null },
    details: { type: String, default: null },
    ip: { type: String, required: true },
    userAgent: { type: String, default: null },
    success: { type: Boolean, required: true, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Index for efficient querying
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ action: 1, createdAt: -1 });

export const ActivityModel = mongoose.model<IActivity>('Activity', ActivitySchema);

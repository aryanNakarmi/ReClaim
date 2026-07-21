import mongoose, { Document, Schema } from 'mongoose';

export interface IIPBlocklist extends Document {
  ip: string;
  reason: string;
  blockedBy: mongoose.Types.ObjectId;
  blockedAt: Date;
}

const IPBlocklistSchema = new Schema<IIPBlocklist>(
  {
    ip: { type: String, required: true, unique: true, index: true },
    reason: { type: String, default: 'No reason provided' },
    blockedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    blockedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export const IPBlocklistModel = mongoose.model<IIPBlocklist>(
  'IPBlocklist',
  IPBlocklistSchema
);

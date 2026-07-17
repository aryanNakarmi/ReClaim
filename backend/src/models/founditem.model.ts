import mongoose, { Schema, Document } from "mongoose";

// ── Claim Request sub-document ──
export interface IClaimRequest {
  userId: mongoose.Types.ObjectId;
  fullName: string;
  email: string;
  profilePicture?: string;
  proofDescription: string;
  requestedAt: Date;
}
 
export interface IFoundItem extends Document {
  itemCategory: string;
  condition: "New" | "Like New" | "Good" | "Fair" | "Damaged";
  brandColor: string;
  estimatedValue: number;
  location: string;
  description: string;
  photos: string[];
  status: "Unclaimed" | "Claimed";
  claimedBy?: mongoose.Types.ObjectId;
  claimedDate?: Date;
  claimRequests: IClaimRequest[];
  createdAt: Date;
  updatedAt: Date;
}

const ClaimRequestSchema = new Schema<IClaimRequest>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    profilePicture: { type: String, default: null },
    proofDescription: { type: String, required: true },
    requestedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const FoundItemSchema = new Schema<IFoundItem>(
  {
    itemCategory: { type: String, required: true },
    condition: {
      type: String,
      required: true,
      enum: ["New", "Like New", "Good", "Fair", "Damaged"],
    },
    brandColor: { type: String, required: true },
    estimatedValue: { type: Number, required: true },
    location: { type: String, required: true },
    description: { type: String, required: true },
    photos: { type: [String], required: true },
    status: {
      type: String,
      enum: ["Unclaimed", "Claimed"],
      default: "Unclaimed",
    },
    claimedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    claimedDate: { type: Date, default: null },
    claimRequests: { type: [ClaimRequestSchema], default: [] },
  },
  { timestamps: true },
);

export const FoundItemModel = mongoose.model<IFoundItem>(
  "FoundItem",
  FoundItemSchema,
);

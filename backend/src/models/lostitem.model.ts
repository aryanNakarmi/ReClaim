import mongoose, { Document, Schema } from "mongoose";

const LostItemSchema: Schema = new Schema(
  {
    itemCategory: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: null },
    imageUrl: { type: String, required: true },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  },
  { timestamps: true }
); 

export interface ILostItem extends Document {
  _id: mongoose.Types.ObjectId;
  itemCategory: string;
  location: string;
  description?: string | null;
  imageUrl: string;
  reportedBy: mongoose.Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

export const LostItemModel = mongoose.model<ILostItem>(
  "LostItem",
  LostItemSchema
);

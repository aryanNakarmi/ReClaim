import mongoose, { Document, Schema } from "mongoose";
import { UserType } from "../types/user.type";

const UserSchema: Schema = new Schema<UserType>(
    {
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        fullName: { type: String , required: true},
        phoneNumber: { type: String, default: null },
        profilePicture: { type: String, default: null }, 
        role: { type: String, enum: ['user', 'admin'], default: 'user' },
        // ── Account lockout ──
        loginAttempts: { type: Number, default: 0 },
        lockUntil: { type: Date, default: null },
        // ── MFA ──
        mfaSecret: { type: String, default: null },
        mfaEnabled: { type: Boolean, default: false },
        // ── Password policy ──
        passwordHistory: { type: [String], default: [] },
        passwordChangedAt: { type: Date, default: null },
    },
    { timestamps: true }
);

export interface IUser extends UserType, Document { 
    _id: mongoose.Types.ObjectId; 
    createdAt: Date;
    updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>('User', UserSchema);
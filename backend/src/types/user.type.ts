import z from "zod";

export const UserSchema = z.object({
    email: z.string().email(),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
        .regex(/[0-9]/, "Password must contain at least one number (0-9)"),
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    phoneNumber: z.string().optional(),
    profilePicture: z.string().optional(),
    role: z.enum(["user", "admin"]).optional().default("user"),
    // ── Account lockout fields ──
    loginAttempts: z.number().optional().default(0),
    lockUntil: z.date().optional(),
    // ── MFA fields ──
    mfaSecret: z.string().optional(),
    mfaEnabled: z.boolean().optional().default(false),
    // ── Password history (prevent reuse) ──
    passwordHistory: z.array(z.string()).optional().default([]),
    passwordChangedAt: z.date().optional(),
}); 

export type UserType = z.infer<typeof UserSchema>; 
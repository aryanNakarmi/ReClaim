import z from "zod";

export const loginSchema = z.object({
    email: z.email({message:"Enter a valid email"}),
    password: z.string().min(6,{message:"Minimum 6 characters"}),
});

export type LoginData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
    fullName: z.string().min(2,{message:"Enter you name"}),
    email: z.email({message: "Enter a valid email"}),
     password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter (A-Z)")
        .regex(/[0-9]/, "Password must contain at least one number (0-9)"),
    phoneNumber: z.string().min(10,{message: "Invalid Number"}),
    confirmPassword: z.string().min(6, { message: "Minimum 6 characters" }),
}).refine((v)=> v.password === v.confirmPassword,{
    path: ["confirmPassword"],
    message: "Passwords do not match",
});

export type RegisterData = z.infer<typeof registerSchema>;
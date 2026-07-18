"use client";

import { useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { handleResetPassword } from "@/lib/actions/auth-action"; 
import { toast } from "react-toastify"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HiCheckCircle, HiEye, HiEyeOff } from "react-icons/hi";

export const ResetPasswordSchema = z.object({
    password: z.string()
        .min(6, "Password must be at least 6 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string().min(6, "Confirm Password must be at least 6 characters long")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

export type ResetPasswordDTO = z.infer<typeof ResetPasswordSchema>;

export default function ResetPasswordForm({
    token,
}: {
    token: string;
}) {
    const [submitted, setSubmitted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isInvalidToken, setIsInvalidToken] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordDTO>({
        resolver: zodResolver(ResetPasswordSchema)
    });
    
    const router = useRouter();

    if (!token) {
        return (
            <div className="space-y-6 w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Invalid Reset Link</h1>
                    <p className="text-gray-600 text-sm">
                        The password reset link is missing or invalid.
                    </p>
                </div>

                <div className="bg-[#F0EDE6] border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-[#E85D4A]">
                        <strong>What went wrong?</strong> The link may have expired or is no longer valid. Please request a new password reset.
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <Link
                        href="/request-password-reset"
                        className="w-full h-12 rounded-full text-white text-base font-bold hover:opacity-90 transition-colors shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: '#1B2A4F' }}
                    >
                        Request New Reset Link
                    </Link>

                    <Link
                        href="/login"
                        className="w-full h-12 rounded-full border-2 border-gray-300 text-gray-900 text-base font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    const onSubmit = async (data: ResetPasswordDTO) => {
        try {
            const response = await handleResetPassword(token, data.password);
            if (response.success) {
                setSubmitted(true);
                toast.success("Password reset successfully");
                // Redirect to login after delay
                setTimeout(() => {
                    router.replace('/login');
                }, 2000);
            } else {
                if ((response.message || "").includes("Invalid or expired")) {
                    setIsInvalidToken(true);
                }
                toast.error(response.message || "Failed to reset password");
            }
        } catch (error) {
            const errorMsg = (error as Error).message;
            if (errorMsg.includes("Invalid or expired")) {
                setIsInvalidToken(true);
            }
            toast.error("An unexpected error occurred");
        }
    }

    // Success Message
    if (submitted) {
        return (
            <div className="space-y-6 w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <HiCheckCircle size={64} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Password Reset Successful!</h1>
                    <p className="text-gray-600 text-sm mt-2">
                        Your password has been reset successfully. Redirecting to login...
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-800">
                        <strong>You're all set!</strong> Your account is secure with your new password.
                    </p>
                </div>
            </div>
        );
    }

    // Invalid Token Message
    if (isInvalidToken) {
        return (
            <div className="space-y-6 w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Link Expired</h1>
                    <p className="text-gray-600 text-sm">
                        Your password reset link has expired or is invalid.
                    </p>
                </div>

                <div className="bg-[#F0EDE6] border border-gray-200 rounded-lg p-4">
                    <p className="text-sm text-[#E85D4A]">
                        <strong>Why?</strong> Password reset links expire after 1 hour for security reasons. Please request a new one.
                    </p>
                </div>

                <div className="space-y-3 pt-4">
                    <Link
                        href="/request-password-reset"
                        className="w-full h-12 rounded-full text-white text-base font-bold hover:opacity-90 transition-colors shadow-lg flex items-center justify-center"
                        style={{ backgroundColor: '#1B2A4F' }}
                    >
                        Request New Reset Link
                    </Link>

                    <Link
                        href="/login"
                        className="w-full h-12 rounded-full border-2 border-gray-300 text-gray-900 text-base font-bold hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
                <p className="text-gray-600 text-sm">
                    Enter a new password for your account. Make sure it's strong and unique.
                </p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* New Password Field */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="password">
                        New Password
                    </label>
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Create a strong password"
                            className="w-full px-4 h-12 rounded-full 
                            border-2 border-gray-300
                            text-gray-900
                            text-sm
                            placeholder:text-gray-500
                            focus:border-[#E85D4A]
                            focus:outline-none
                            transition-colors
                            pr-12"
                            {...register("password")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                        </button>
                    </div>
                    <div className="h-3">
                        {errors.password && (
                            <p className="text-xs text-[#E85D4A]">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-900" htmlFor="confirmPassword">
                        Confirm Password
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Re-enter your password"
                            className="w-full px-4 h-12 rounded-full 
                            border-2 border-gray-300
                            text-gray-900
                            text-sm
                            placeholder:text-gray-500
                            focus:border-[#E85D4A]
                            focus:outline-none
                            transition-colors
                            pr-12"
                            {...register("confirmPassword")}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                        </button>
                    </div>
                    <div className="h-3">
                        {errors.confirmPassword && (
                            <p className="text-xs text-[#E85D4A]">{errors.confirmPassword.message}</p>
                        )}
                    </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-[#F0EDE6] rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-[#1B2A4F]">Password requirements:</p>
                    <ul className="text-xs text-blue-800 space-y-0.5 list-disc list-inside">
                        <li>At least 6 characters</li>
                        <li>One uppercase letter (A-Z)</li>
                        <li>One number (0-9)</li>
                    </ul>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="h-12 w-full rounded-full text-white text-base font-bold hover:opacity-90 disabled:opacity-60 transition-colors mt-6 shadow-lg"
                    style={{ backgroundColor: '#1B2A4F' }}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Resetting..." : "Reset Password"}
                </button>
            </form>

            {/* Links */}
            <div className="flex flex-col gap-2 text-center">
                <Link 
                    href="/login" 
                    className="text-sm text-[#E85D4A] hover:text-[#D94A37] font-semibold"
                >
                    Back to Login
                </Link>
                <Link 
                    href="/request-password-reset" 
                    className="text-sm text-[#E85D4A] hover:text-[#D94A37] font-semibold"
                >
                    Request another reset email
                </Link>
            </div>
        </div>
    )
}
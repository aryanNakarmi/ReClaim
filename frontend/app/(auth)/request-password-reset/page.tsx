"use client";

import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { requestPasswordReset } from "@/lib/api/auth";
import { toast } from "react-toastify";
import Link from "next/link";
import { useState } from "react";
import { HiArrowLeft, HiCheckCircle } from "react-icons/hi";

const RequestPasswordResetSchema = z.object({
    email: z.email("Please enter a valid email address"),
});

type RequestPasswordResetDTO = z.infer<typeof RequestPasswordResetSchema>;

export default function RequestPasswordResetPage() {
    const [submitted, setSubmitted] = useState(false);
    const [submittedEmail, setSubmittedEmail] = useState("");

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting },
        reset 
    } = useForm<RequestPasswordResetDTO>({
        resolver: zodResolver(RequestPasswordResetSchema),
    });

    const onSubmit = async (data: RequestPasswordResetDTO) => {
        try {
            const response = await requestPasswordReset(data.email);
            if (response.success) {
                setSubmittedEmail(data.email);
                setSubmitted(true);
                toast.success("Password reset link sent to your email!");
                reset();
            } else {
                toast.error(response.message || "Failed to request password reset.");
            }
        } catch (error) {
            toast.error((error as Error).message || "Failed to request password reset.");
        }
    };

    // Success Message
    if (submitted) {
        return (
            <div className="space-y-6 w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <HiCheckCircle size={64} className="text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Check Your Email</h1>
                    <p className="text-gray-600 text-sm mt-2">
                        We've sent a password reset link to <span className="font-semibold">{submittedEmail}</span>
                    </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                    <p className="text-sm text-blue-900">
                        <strong>Next steps:</strong>
                    </p>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                        <li>Check your email inbox (and spam folder)</li>
                        <li>Click the password reset link</li>
                        <li>Create a new password</li>
                        <li>Log in with your new password</li>
                    </ul>
                </div>

                <p className="text-center text-sm text-gray-600">
                    Didn't receive the email? Check your spam folder or try with a different email address.
                </p>

                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => setSubmitted(false)}
                        className="w-full h-12 rounded-full text-white text-base font-bold hover:opacity-90 transition-colors shadow-lg"
                        style={{ backgroundColor: '#FF8C69' }}
                    >
                        Try Another Email
                    </button>

                    <Link
                        href="/login"
                        className="w-full h-12 rounded-full border-2 border-gray-300 text-gray-900 text-base font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <HiArrowLeft size={20} />
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Request Password Reset Form
    return (
        <div className="space-y-6 w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
                <p className="text-gray-600 text-sm">
                    Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900">
                        Email Address
                    </label>
                    <input
                        type="email"
                        id="email"
                        placeholder="yourname@example.com"
                        autoComplete="email"
                        className="w-full px-4 h-12 rounded-full 
                        border-2 border-gray-300
                        text-gray-900
                        text-sm
                        placeholder:text-gray-500
                        focus:border-orange-400
                        focus:outline-none
                        transition-colors"
                        {...register("email")}
                    />
                    <div className="h-3">
                        {errors.email?.message && (
                            <p className="text-xs text-red-600">{errors.email.message}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-12 w-full rounded-full text-white text-base font-bold hover:opacity-90 disabled:opacity-60 transition-colors mt-6 shadow-lg"
                    style={{ backgroundColor: '#FF8C69' }}
                >
                    {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>
            </form>

            {/* Back to Login Link */}
            <div className="text-center">
                <Link
                    href="/login"
                    className="text-orange-500 hover:text-orange-600 font-semibold text-sm flex items-center justify-center gap-1"
                >
                    <HiArrowLeft size={16} />
                    Back to Login
                </Link>
            </div>

          
        </div>
    );
}
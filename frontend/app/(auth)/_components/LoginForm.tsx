"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation"; 
import Image from "next/image";
import { LoginData, loginSchema } from "../schema";
import { handleLogin, handleMFALogin } from "@/lib/actions/auth-action";
import { useAuth } from "@/context/AuthContext";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginForm(){

    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting}
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
        mode: "onSubmit"
    });
    
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string>("");

    const [pending, setTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    // ── MFA challenge state ──
    const [mfaRequired, setMfaRequired] = useState(false);
    const [mfaTempToken, setMfaTempToken] = useState<string>("");
    const [mfaCode, setMfaCode] = useState<string>("");
    const [mfaError, setMfaError] = useState<string | null>(null);
    const [mfaLoading, setMfaLoading] = useState(false);

    const { setUser, setIsAuthenticated } = useAuth();

    const submit = async (values: LoginData) => {
        setError(null);
        const res = await handleLogin({ ...values, captchaToken });
        if (!res.success) return alert(res.message);

        // ── Password expired — redirect to reset ──
        if ((res as any).passwordExpired) {
            alert("Your password has expired. Please reset it.");
            router.push(`/request-password-reset?email=${encodeURIComponent(values.email)}`);
            return;
        }

        // ── MFA required — show TOTP challenge ──
        if ((res as any).requiresMFA) {
            setMfaTempToken((res as any).tempToken);
            setMfaRequired(true);
            return;
        }

        setUser(res.data!); 

        // redirect based on role
        const role = res.data!.role?.toLowerCase();
        if (role === "admin") router.replace("/admin");
        else if (role === "user") router.replace("/user/dashboard");
        else router.replace("/");
    };

    // ── Handle MFA TOTP submission ──
    const handleMfaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mfaCode.trim() || mfaCode.length !== 6) {
            setMfaError("Please enter a valid 6-digit code");
            return;
        }
        setMfaLoading(true);
        setMfaError(null);

        try {
            const res = await handleMFALogin(mfaTempToken, mfaCode);
            if (res.success) {
                setUser(res.data!);

                const role = res.data!.role?.toLowerCase();
                if (role === "admin") router.replace("/admin");
                else if (role === "user") router.replace("/user/dashboard");
                else router.replace("/");
            } else {
                setMfaError(res.message || "Invalid verification code");
            }
        } catch (err: any) {
            setMfaError(err.message || "MFA verification failed");
        } finally {
            setMfaLoading(false);
        }
    };

    // ── Back to login from MFA screen ──
    const handleBackToLogin = () => {
        setMfaRequired(false);
        setMfaCode("");
        setMfaError(null);
        setMfaTempToken("");
    };

    // ══════════════════════════════════════════════
    // MFA Challenge Screen
    // ══════════════════════════════════════════════
    if (mfaRequired) {
        return (
            <div className="w-full max-w-md mx-auto">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
                    {/* Lock Icon */}
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-[#1B2A4F]/10 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-[#1B2A4F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">
                        Two-Factor Authentication
                    </h2>
                    <p className="text-gray-500 text-sm text-center mb-6">
                        Enter the 6-digit code from your authenticator app
                    </p>

                    <form onSubmit={handleMfaSubmit} className="space-y-4">
                        {/* TOTP Input */}
                        <div>
                            <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={6}
                                placeholder="000000"
                                value={mfaCode}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                    setMfaCode(val);
                                    setMfaError(null);
                                }}
                                autoFocus
                                className="w-full text-center text-3xl tracking-[0.5em] font-mono h-16 rounded-xl border-2 border-gray-300 text-gray-900 focus:border-[#E85D4A] focus:outline-none transition-colors"
                            />
                            {mfaError && (
                                <p className="text-xs text-[#E85D4A] text-center mt-2">{mfaError}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={mfaLoading || mfaCode.length !== 6}
                            className="h-12 w-full rounded-full text-white text-base font-bold bg-[#1B2A4F] hover:opacity-90 disabled:opacity-60 transition-all mt-2 shadow-lg"
                        >
                            {mfaLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                "Verify & Login"
                            )}
                        </button>

                        {/* Back button */}
                        <button
                            type="button"
                            onClick={handleBackToLogin}
                            disabled={mfaLoading}
                            className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors mt-2"
                        >
                            ← Back to login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    // ══════════════════════════════════════════════
    // Login Form
    // ══════════════════════════════════════════════
    return(
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md">
            <div className="space-y-3 w-full">
           

                {/* Heading */}
                <div className="text-center mb-4">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
                    <p className="text-gray-600 text-sm">Log in to your account</p>
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900">Email</label>
                    <input type="email"
                    id="email"
                    placeholder="yourname@example.com"
                    autoComplete="email" 
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    text-sm
                    placeholder:text-gray-500
                    focus:border-[#E85D4A]
                    focus:outline-none
                    transition-colors"
                    {...register("email")}/>
                    <div className="h-3">
                    {errors.email?.message && (
                        <p className="text-xs text-[#E85D4A]">{errors.email.message}</p>
                    )}
                    </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                    <div className="flex justify-between items-center">
                        <label htmlFor="password" className="text-sm font-medium text-gray-900">
                            Password
                        </label>
                        <Link 
                            href="/request-password-reset"
                            className="text-xs text-[#E85D4A] hover:text-[#D94A37] font-semibold"
                        >
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <input 
                            type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="current-password"
                            {...register("password")}
                            className="w-full px-4 pr-12 h-12 rounded-full 
                            border-2 border-gray-300
                            text-gray-900
                            text-sm
                            placeholder:text-gray-500
                            focus:border-[#E85D4A]
                            focus:outline-none
                            transition-colors"
                            placeholder="Enter your password" 
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            {showPassword ? (
                                <HiEyeOff size={20} />
                            ) : (
                                <HiEye size={20} />
                            )}
                        </button>
                    </div>
                  
                    <div className="h-3">
                    {errors.password?.message && (
                        <p className="text-xs text-[#E85D4A]">{errors.password.message}</p>
                    )}
                    
                    </div>
                </div>

                {/* Login Button */}
                <button
                type="submit"
                disabled={isSubmitting || pending || !captchaToken}
                className="h-12 w-full rounded-full text-white text-base font-bold hover:opacity-90 disabled:opacity-60 transition-colors mt-3 shadow-lg"
                style={{backgroundColor: '#1B2A4F'}}>
                {isSubmitting || pending ? "Logging in..." : "Login"}
                </button>

                {/* CAPTCHA */}
                <div className="mt-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="flex justify-center">
                      <Turnstile
                        siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                        onSuccess={(token: string) => setCaptchaToken(token)}
                        options={{ theme: "light", size: "normal" }}
                      />
                    </div>
                    <p className="mt-1.5 text-center text-[10px] text-gray-400">
                      Protected by Cloudflare Turnstile
                    </p>
                  </div>
                </div>


                {/* Sign Up Link */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    Don't have an account? <Link href="/register" className="font-bold text-[#E85D4A] hover:underline">Sign Up</Link>
                </div>
            </div>
        </form>
    )
}
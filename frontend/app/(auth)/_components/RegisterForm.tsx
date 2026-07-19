"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { RegisterData, registerSchema } from "../schema"; 
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { handleRegister } from "@/lib/actions/auth-action";
import { HiEye, HiEyeOff } from "react-icons/hi";
import { Turnstile } from '@marsidev/react-turnstile'
import PasswordStrengthMeter from './PasswordStrengthMeter'

export default function RegisterForm(){
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string>("");

    const{
        register,
        handleSubmit,
        watch,
        formState: {errors, isSubmitting}
    } = useForm<RegisterData>({
        resolver: zodResolver(registerSchema),
        mode: "onSubmit",
    });
    const passwordValue = watch("password");
    const [pending, setTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

       const submit = async (values: RegisterData) => {
        setError(null);
        setTransition(async () => {
            try {

                const response = await handleRegister({ ...values, captchaToken });
                if (!response.success) {
                    throw new Error(response.message);
                }
                if (response.success) {
                    router.push("/login");
                } else {
                    setError('Registration failed');
                }

            } catch (err: Error | any) {
                setError(err.message || 'Registration failed');
            }
        });
        // GO TO LOGIN PAGE
        console.log("register", values);
    };
    
    return (
        <form onSubmit={handleSubmit(submit)} className="w-full max-w-md">
            { error && <div className="bg-[#F0EDE6] border border-gray-200 text-[#E85D4A] px-4 py-2 rounded-lg text-sm mb-4">{error}</div> } 
            <div className="space-y-2 w-full max-h-[700px] overflow-y-auto pr-2">
                {/* Logo */}
                <div className="flex items-center justify-center mb-4 lg:hidden">
                    
                </div>

                {/* Heading */}
                <div className="text-center mb-3">
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Create an Account</h1>
                    <p className="text-gray-600 text-sm">Join our family and find your new best friend</p>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                    <label htmlFor="name" className="text-sm font-medium text-gray-900">Full Name</label>
                    <input type="text"
                    id="name"
                    placeholder="John Doe"
                    autoComplete="name" 
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    placeholder:text-gray-500
                    focus:border-[#1B2A4F]
                    focus:outline-none
                    text-sm
                    transition-colors"
                    {...register("fullName")}/>
                    <div className="h-3">
                    {errors.fullName?.message && (
                        <p className="text-xs text-[#E85D4A]">{errors.fullName.message}</p>
                    )}
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                    <label htmlFor="email" className="text-sm font-medium text-gray-900">Email Address</label>
                    <input type="email"
                    id="email"
                    placeholder="hello@example.com"
                    autoComplete="email" 
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    text-sm
                    placeholder:text-gray-500
                    focus:border-[#1B2A4F]
                    focus:outline-none
                    transition-colors"
                    {...register("email")}/>
                    <div className="h-3">
                    {errors.email?.message && (
                        <p className="text-xs text-[#E85D4A]">{errors.email.message}</p>
                    )}
                    </div>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-medium text-gray-900">Phone Number</label>
                    <input type="tel"
                    id="phone"
                    placeholder="+977 "
                    className="w-full px-4 h-12 rounded-full 
                    border-2 border-gray-300
                    text-gray-900
                    placeholder:text-gray-500
                    focus:border-[#1B2A4F]
                    focus:outline-none
                    text-sm
                    transition-colors"
                    {...register("phoneNumber")}/>
                    <div className="h-3">
                    {errors.phoneNumber?.message && (
                        <p className="text-xs text-[#E85D4A]">{errors.phoneNumber.message}</p>
                    )}
                    </div>
                </div>

                {/* Password & Confirm Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {/* Password */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="text-sm font-medium text-gray-900">Password</label>
                        <div className="relative">
                            <input type={showPassword ? "text" : "password"}
                            id="password"
                            autoComplete="new-password"
                            {...register("password")}
                            className="w-full px-4 h-12 rounded-full 
                            border-2 border-gray-300
                            text-gray-900
                            placeholder:text-gray-500
                            focus:border-[#1B2A4F]
                            focus:outline-none
                            text-sm
                            transition-colors
                            pr-10"
                            placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                            </button>
                        </div>
                        <div className="h-3">
                        {errors.password?.message && (
                            <p className="text-xs text-[#E85D4A]">{errors.password.message}</p>
                        )}
                        </div>

                        {/* Password strength meter */}
                        <PasswordStrengthMeter password={passwordValue} />
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-900">Confirm Password</label>
                        <div className="relative">
                            <input type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            autoComplete="new-password"
                            {...register("confirmPassword")}
                            className="w-full px-4 h-12 rounded-full 
                            border-2 border-gray-300
                            text-gray-900
                            placeholder:text-gray-500
                            focus:border-[#1B2A4F]
                            focus:outline-none
                            text-sm
                            transition-colors
                            pr-10"
                            placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
                            </button>
                        </div>
                        <div className="h-3">
                        {errors.confirmPassword?.message && (
                            <p className="text-xs text-[#E85D4A]">{errors.confirmPassword.message}</p>
                        )}
                        </div>
                    </div>
                </div>

             

                {/* Register Button */}
                <button
                type="submit"
                disabled={isSubmitting || pending || !captchaToken}
                className="h-12 w-full rounded-full text-white text-base font-bold hover:opacity-90 disabled:opacity-60 transition-colors mt-2 shadow-lg"
                style={{backgroundColor: '#1B2A4F'}}>
                {isSubmitting || pending ? "Creating account..." : "Register"}
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

                {/* Login Link */}
                <div className="mt-3 text-center text-sm text-gray-600">
                    Already have an account? <Link href="/login" className="font-bold text-[#1B2A4F] hover:underline">Login</Link>
                </div>

                
            </div>
        </form>
    )
}
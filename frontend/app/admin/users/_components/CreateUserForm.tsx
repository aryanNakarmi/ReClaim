"use client";

import { Controller, useForm } from "react-hook-form";
import { UserData, UserSchema } from "@/app/admin/users/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-toastify";
import { handleCreateUser } from "@/lib/actions/admin/user-action";
import { HiEye, HiEyeOff } from "react-icons/hi";

export default function CreateUserForm() {
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<UserData>({
    resolver: zodResolver(UserSchema)
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (file: File | undefined, onChange: (file: File | undefined) => void) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
      setFileName(file.name);
    } else {
      setPreviewImage(null);
      setFileName(null);
    }
    onChange(file);
  };

  const handleDismissImage = (onChange?: (file: File | undefined) => void) => {
    setPreviewImage(null);
    setFileName(null);
    onChange?.(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const onSubmit = async (data: UserData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        data.fullName && formData.append('fullName', data.fullName);
        formData.append('email', data.email);
        formData.append('password', data.password);
        formData.append('confirmPassword', data.confirmPassword);
        data.phoneNumber && formData.append('phoneNumber', data.phoneNumber);
        data.profilePicture && formData.append('profilePicture', data.profilePicture);

        const response = await handleCreateUser(formData);
        if (!response.success) throw new Error(response.message || 'Create profile failed');

        reset();
        handleDismissImage();
        toast.success('Profile Created successfully');
      } catch (error: any) {
        toast.error(error.message || 'Create profile failed');
      }
    });
  };

  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200 space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center">Create New User</h1>

        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4">
          {previewImage ? (
            <div className="relative w-28 h-28">
              <img
                src={previewImage}
                alt="Profile Preview"
                className="w-28 h-28 rounded-full object-cover border-2 border-[#E85D4A]"
              />
              <Controller
                name="profilePicture"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => handleDismissImage(onChange)}
                    className="absolute -top-2 -right-2 bg-[#1B2A4F] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-[#233459] transition"
                  >
                    ✕
                  </button>
                )}
              />
            </div>
          ) : (
            <div className="w-28 h-28 bg-[#F0EDE6] rounded-full flex items-center justify-center border-2 border-[#E85D4A]">
              <span className="text-[#E85D4A] font-bold text-xl">U</span>
            </div>
          )}

          {/* Custom File Input */}
          <Controller
            name="profilePicture"
            control={control}
            render={({ field: { onChange } }) => (
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2 bg-[#1B2A4F] text-white rounded-lg hover:bg-[#233459] cursor-pointer shadow-md font-semibold transition"
                >
                  Choose File
                </button>
                <span className="text-black font-medium">{fileName || "No file chosen"}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleImageChange(e.target.files?.[0], onChange)}
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
              </div>
            )}
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            placeholder="Jane Doe"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
          />
          {errors.fullName && <p className="text-sm text-[#E85D4A] mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
          />
          {errors.email && <p className="text-sm text-[#E85D4A] mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
          <input
            type="text"
            {...register("phoneNumber")}
            placeholder="+977 98XXXXXXXX"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
          />
          {errors.phoneNumber && <p className="text-sm text-[#E85D4A] mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              {...register("password")}
              placeholder="••••••"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-[#E85D4A] mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="••••••"
              className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-[#E85D4A] mt-1">{errors.confirmPassword.message}</p>}
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
          disabled={isSubmitting || pending}
          className="w-full h-12 rounded-lg bg-[#1B2A4F] text-white font-bold hover:bg-[#233459] transition disabled:opacity-60 shadow-md"
        >
          {isSubmitting || pending ? "Creating account..." : "Create User"}
        </button>
      </form>
    </div>
  );
}
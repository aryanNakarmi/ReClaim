"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useState, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { handleUpdateProfile } from "@/lib/actions/auth-action";
import { z } from "zod";

// Email removed from schema — it cannot be changed
const updateUserSchema = z.object({
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  profilePicture: z.instanceof(File).optional(),
});

type UpdateUserData = z.infer<typeof updateUserSchema>;

export default function UpdateUserForm({ user }: { user: any }) {
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } =
    useForm<UpdateUserData>({
      resolver: zodResolver(updateUserSchema),
      values: {
        fullName: user?.fullName || '',
        phoneNumber: user?.phoneNumber || '',
      }
    });

  const [error, setError] = useState<string | null>(null);
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

  const onSubmit = async (data: UpdateUserData) => {
    setError(null);
    try {
      const formData = new FormData();
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.profilePicture) formData.append('profilePicture', data.profilePicture);
      // email intentionally NOT appended

      const response = await handleUpdateProfile(formData);
      if (!response.success) throw new Error(response.message || 'Update profile failed');

      handleDismissImage();
      toast.success('Profile updated successfully');

    } catch (error: Error | any) {
      toast.error(error.message || 'Profile update failed');
      setError(error.message || 'Profile update failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-black text-center">Update Profile</h1>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {error && <p className="text-sm text-[#E85D4A]">{error}</p>}

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
          ) : user?.profilePicture ? (
            <Image
              src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
              alt="Profile"
              width={112}
              height={112}
              className="w-28 h-28 rounded-full object-cover border-2 border-[#E85D4A]"
            />
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

        {/* Email — read only, matches Flutter's enabled: false */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full h-12 px-4 rounded-lg border border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
          />
          {errors.fullName && <p className="text-sm text-[#E85D4A] mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-medium mb-1 text-black">Phone Number</label>
          <input
            type="text"
            {...register("phoneNumber")}
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black"
          />
          {errors.phoneNumber && <p className="text-sm text-[#E85D4A] mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-lg bg-[#1B2A4F] text-white font-bold hover:bg-[#233459] transition disabled:opacity-60 shadow-md"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
}
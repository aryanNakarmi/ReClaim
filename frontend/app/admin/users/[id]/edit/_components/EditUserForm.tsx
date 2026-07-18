"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRef, useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { z } from "zod"; 
import Image from "next/image";
import { HiChevronDown } from "react-icons/hi";
import { getUserById, updateUser } from "@/lib/api/admin/user";

// Update schema (all fields optional)
const EditUserSchema = z.object({
  fullName: z.string().optional(),
  email: z.email().optional(),
  phoneNumber: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
  profilePicture: z
    .instanceof(File)
    .optional()
    .refine((file) => !file || file.size <= 5 * 1024 * 1024, {
      message: "Max file size is 5MB",
    })
    .refine((file) => !file || ["image/jpeg", "image/jpg", "image/png"].includes(file.type), {
      message: "Only .jpg, .jpeg, .png formats are supported",
    }),
});

type EditUserData = z.infer<typeof EditUserSchema>;

interface EditUserFormProps {
  userId: string;
}

export default function EditUserForm({ userId }: EditUserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    register, 
    handleSubmit, 
    control, 
    reset, 
    watch,
    setValue,
    formState: { errors, isSubmitting } 
  } = useForm<EditUserData>({
    resolver: zodResolver(EditUserSchema),
  });

  // Watch role field to keep dropdown in sync
  const selectedRole = watch("role");

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserById(userId);
        if (response.success && response.data) {
          reset({
            fullName: response.data.fullName,
            email: response.data.email,
            phoneNumber: response.data.phoneNumber,
            role: response.data.role as "user" | "admin",
          });
          if (response.data.profilePicture) {
            setCurrentImage(
              `${process.env.NEXT_PUBLIC_API_BASE_URL}${response.data.profilePicture}`
            );
          }
        } else {
          toast.error("Failed to load user data");
          router.push("/admin/users");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load user");
        router.push("/admin/users");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, reset, router]);

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

  const handleRoleSelect = (role: "user" | "admin") => {
    setValue("role", role); // ← Use setValue to update form state
    setRoleDropdownOpen(false);
  };

  const onSubmit = async (data: EditUserData) => {
    try {
      const formData = new FormData();
      
      // Only append fields that have values
      if (data.fullName) formData.append('fullName', data.fullName);
      if (data.email) formData.append('email', data.email);
      if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
      if (data.role) formData.append('role', data.role); // ← Use data.role from form
      if (data.profilePicture) formData.append('profilePicture', data.profilePicture);

      const response = await updateUser(userId, formData);
      
      if (response.success) {
        toast.success('User updated successfully');
        router.push("/admin/users");
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E85D4A]"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center mt-10">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-lg border border-gray-200 space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-800 text-center">Edit User</h1>

        {/* Profile Image */}
        <div className="flex flex-col items-center gap-4">
          {previewImage ? (
            <div className="relative w-28 h-28">
              <Image
                src={previewImage}
                alt="Profile Preview"
                width={112}
                height={112}
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
          ) : currentImage ? (
            <div className="relative w-28 h-28">
              <Image
                src={currentImage}
                alt="Current Profile"
                width={112}
                height={112}
                className="w-28 h-28 rounded-full object-cover border-2 border-[#E85D4A]"
              />
              <Controller
                name="profilePicture"
                control={control}
                render={({ field: { onChange } }) => (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentImage(null);
                      handleDismissImage(onChange);
                    }}
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
                  Change Photo
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
          <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
          <input
            type="text"
            {...register("fullName")}
            placeholder="Jane Doe"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black bg-white transition"
          />
          {errors.fullName && <p className="text-sm text-[#E85D4A] mt-1">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
          <input
            type="email"
            {...register("email")}
            placeholder="you@example.com"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black bg-white transition"
          />
          {errors.email && <p className="text-sm text-[#E85D4A] mt-1">{errors.email.message}</p>}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
          <input
            type="text"
            {...register("phoneNumber")}
            placeholder="+977 98XXXXXXXX"
            className="w-full h-12 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1B2A4F]/30 text-black bg-white transition"
          />
          {errors.phoneNumber && <p className="text-sm text-[#E85D4A] mt-1">{errors.phoneNumber.message}</p>}
        </div>

        {/* Role - Custom Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Role</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="w-full h-12 px-4 rounded-lg border-2 border-gray-300 hover:border-[#E85D4A] focus:outline-none focus:border-[#1B2A4F] focus:ring-2 focus:ring-[#1B2A4F]/10 text-black bg-white transition flex items-center justify-between"
            >
              <span className={selectedRole ? "text-black font-medium" : "text-gray-500"}>
                {selectedRole === "user" && "User"}
                {selectedRole === "admin" && "Admin"}
                {!selectedRole && "Select Role"}
              </span>
              <HiChevronDown 
                size={20} 
                className={`text-gray-400 transition-transform ${roleDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown Menu */}
            {roleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-gray-300 rounded-lg shadow-xl z-50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("user")}
                  className={`w-full px-4 py-3 text-left hover:bg-[#F0EDE6] transition flex items-center gap-3 ${
                    selectedRole === "user" ? "bg-[#1B2A4F]/5 border-l-4 border-[#E85D4A]" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">User</p>
                    <p className="text-xs text-gray-500">Regular user access</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("admin")}
                  className={`w-full px-4 py-3 text-left hover:bg-[#F0EDE6] transition flex items-center gap-3 border-t border-gray-200 ${
                    selectedRole === "admin" ? "bg-[#1B2A4F]/5 border-l-4 border-[#E85D4A]" : ""
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-xs text-gray-500">Full access & control</p>
                  </div>
                </button>
              </div>
            )}
          </div>
          {errors.role && <p className="text-sm text-[#E85D4A] mt-1">{errors.role.message}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-12 rounded-lg bg-[#1B2A4F] text-white font-bold hover:bg-[#233459] transition disabled:opacity-60 shadow-md"
        >
          {isSubmitting ? "Updating..." : "Update User"}
        </button>
      </form>
    </div>
  );
}
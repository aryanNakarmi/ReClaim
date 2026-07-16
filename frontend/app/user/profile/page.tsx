"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login"); // redirect if not logged in
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Profile Card */}
      <div className="mt-20 max-w-4xl mx-auto px-6">
        <div className="bg-white rounded-lg shadow-lg p-8 flex flex-col gap-6 relative">
          {/* Profile Picture */}
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
            {user.profilePicture ? (
              <Image
                src={process.env.NEXT_PUBLIC_API_BASE_URL + user.profilePicture}
                alt={user.fullName}
                width={128}
                height={128}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-100 shadow-lg"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center border-4 border-gray-100 shadow-lg">
                <span className="text-gray-600 font-bold text-4xl">
                  {user.fullName?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
          </div>

          {/* Name and Role */}
          <div className="mt-20 text-center">
            <h1 className="text-3xl font-bold text-gray-900">{user.fullName}</h1>
            <p className="text-gray-500">{user.role?.toUpperCase()}</p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-1">Email</h2>
              <p className="text-gray-900">{user.email}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-1">Phone Number</h2>
              <p className="text-gray-900">{user.phoneNumber || "-"}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-1">Account Created</h2>
              <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-1">Last Updated</h2>
              <p className="text-gray-900">{new Date(user.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-6">
            <Link
              href="/user/profile/edit-profile"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold shadow-md transition"
            >
              Edit Profile
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
}

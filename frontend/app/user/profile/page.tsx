"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";
import { HiDownload, HiUpload, HiShieldCheck, HiPencil } from "react-icons/hi";
import { exportUserData, importUserData } from "@/lib/api/data";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  const handleImport = async (file: File) => {
    if (!file.name.endsWith('.json')) {
      toast.error('Please select a .json file exported from ReClaim');
      return;
    }
    setImporting(true);
    try {
      const message = await importUserData(file);
      toast.success(message);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      toast.error(err.message || 'Failed to import data');
    } finally {
      setImporting(false);
    }
  };

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
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            <Link
              href="/user/profile/edit-profile"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-bold shadow-md transition flex items-center gap-2"
            >
              <HiPencil size={20} />
              Edit Profile
            </Link>
            <Link
              href="/user/profile/security"
              className="px-6 py-3 border-2 border-[#1B2A4F] text-[#1B2A4F] rounded-lg hover:bg-[#1B2A4F] hover:text-white font-bold shadow-md transition flex items-center gap-2"
            >
              <HiShieldCheck size={20} />
              Security
            </Link>
            <button
              onClick={async () => {
                setExporting(true);
                try {
                  await exportUserData();
                  toast.success("Data exported successfully!");
                } catch (err: any) {
                  toast.error(err.message || "Failed to export data");
                } finally {
                  setExporting(false);
                }
              }}
              disabled={exporting}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-bold shadow-md transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiDownload size={20} />
              {exporting ? "Exporting..." : "Export My Data"}
            </button>
          </div>
        </div>

        {/* ──────── Data Import Section ──────── */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-6 border-2 border-dashed border-gray-200">
          <div className="text-center">
            <div className="inline-block p-3 bg-blue-50 rounded-full mb-4">
              <HiUpload size={28} className="text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Import Your Data</h2>
            <p className="text-gray-500 text-sm mb-4">
              Restore your profile and lost reports from a previously exported JSON file
            </p>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImport(file);
              }}
            />

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleImport(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
              }`}
            >
              {importing ? (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <svg className="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Importing data...</span>
                </div>
              ) : (
                <div>
                  <HiUpload size={36} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 font-medium">
                    Drop your JSON file here or click to browse
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    Only .json files exported from ReClaim are supported
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
